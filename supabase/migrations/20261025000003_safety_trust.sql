-- İlanım Var — safety (P0), no-show, release, reviews, reports, blocks, account deletion.

-- ─── Safety ─────────────────────────────────────────────────────────────────
-- Who is on this task (customer or active Tasker). Safety actions are open to both.
create or replace function public._is_participant(p_task uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tasks where id = p_task and customer_id = auth.uid())
      or exists (select 1 from public.task_assignments where task_id = p_task and tasker_id = auth.uid() and status = 'active');
$$;

-- "Güvendeyim": a check-in. Cheap to press, recorded.
create or replace function public.safety_checkin(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._me();
  if not public._is_participant(p_task) then raise exception 'not_allowed'; end if;
  perform public._log(p_task, 'safety_ok');
end $$;

-- "Sorun var" / "Acil durum": opens an incident for the safety team. The 112
-- call itself is placed by the phone; this records that it happened.
create or replace function public.raise_incident(p_task uuid, p_kind text, p_details text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  v uuid;
  other uuid;
begin
  if p_kind not in ('problem', 'emergency', 'unsafe_place', 'harassment', 'damage', 'other') then raise exception 'invalid_input'; end if;
  if not public._is_participant(p_task) then raise exception 'not_allowed'; end if;
  select case when t.customer_id = me.id then a.tasker_id else t.customer_id end into other
    from public.tasks t left join public.task_assignments a on a.task_id = t.id and a.status = 'active'
   where t.id = p_task limit 1;
  insert into public.disputes (task_id, reporter_id, subject_id, kind, reason, details)
  values (p_task, me.id, other, 'incident', p_kind, left(p_details, 2000)) returning id into v;
  perform public._log(p_task, case when p_kind = 'emergency' then 'emergency_called' else 'safety_issue' end, jsonb_build_object('kind', p_kind, 'dispute_id', v));
  return v;
end $$;

-- "Görevi bırak": the Tasker leaves (unsafe place, can't do it). The task goes
-- back to searching, the old PIN is destroyed and a new one is issued on the
-- next acceptance. An unsafe exit also opens an incident.
create or replace function public.release_task(p_task uuid, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare
  a public.task_assignments;
  t public.tasks;
begin
  perform public._me();
  if p_reason not in ('unsafe', 'cannot_do', 'customer_request', 'other') then raise exception 'invalid_input'; end if;
  a := public._my_assignment(p_task);
  if a.id is null then raise exception 'not_allowed'; end if;
  select * into t from public.tasks where id = p_task for update;
  if t.status not in ('assigned', 'en_route', 'arrived') then raise exception 'invalid_state'; end if;
  update public.task_assignments set status = 'released', released_at = now(), release_reason = p_reason where id = a.id;
  update public.tasks set status = 'searching', searching_since = now(), arrived_at = null where id = p_task;
  perform public._drop_pin(p_task);
  perform public._log(p_task, 'tasker_released', jsonb_build_object('reason', p_reason));
  if p_reason = 'unsafe' then
    insert into public.disputes (task_id, reporter_id, subject_id, kind, reason)
    values (p_task, auth.uid(), t.customer_id, 'incident', 'unsafe_place');
  end if;
  perform public._dispatch(p_task, true);
end $$;

-- Customer no-show: the Tasker is at the door (arrival recorded) and has waited
-- at least 10 minutes. The task closes as no_show_customer and goes to review.
create or replace function public.report_customer_no_show(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  a public.task_assignments;
  t public.tasks;
begin
  perform public._me();
  a := public._my_assignment(p_task);
  if a.id is null then raise exception 'not_allowed'; end if;
  select * into t from public.tasks where id = p_task for update;
  if t.status <> 'arrived' then raise exception 'invalid_state'; end if;
  if t.arrived_at > now() - interval '10 minutes' then raise exception 'too_early'; end if;
  update public.tasks set status = 'no_show_customer' where id = p_task;
  update public.task_assignments set status = 'completed' where id = a.id;
  perform public._drop_pin(p_task);
  perform public._log(p_task, 'no_show_customer', jsonb_build_object('waited_s', extract(epoch from now() - t.arrived_at)::integer));
  insert into public.disputes (task_id, reporter_id, subject_id, kind, reason) values (p_task, auth.uid(), t.customer_id, 'no_show', 'customer_no_show');
end $$;

-- Either side can contest a finished or proof-submitted task.
create or replace function public.open_dispute(p_task uuid, p_reason text, p_details text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  v uuid;
begin
  if not (public._is_participant(p_task) or exists (select 1 from public.task_assignments where task_id = p_task and tasker_id = me.id)) then raise exception 'not_allowed'; end if;
  update public.tasks set status = 'disputed' where id = p_task and status in ('proof_submitted', 'completed', 'no_show_customer');
  if not found then raise exception 'invalid_state'; end if;
  insert into public.disputes (task_id, reporter_id, kind, reason, details) values (p_task, me.id, 'dispute', left(p_reason, 200), left(p_details, 2000)) returning id into v;
  perform public._log(p_task, 'disputed', jsonb_build_object('dispute_id', v));
  return v;
end $$;

-- ─── Reviews ────────────────────────────────────────────────────────────────
create or replace function public.leave_review(p_task uuid, p_rating integer, p_comment text default null) returns void
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  t public.tasks;
  v_subject uuid;
begin
  select * into t from public.tasks where id = p_task;
  if not found or t.status <> 'completed' then raise exception 'invalid_state'; end if;
  select tasker_id into v_subject from public.task_assignments where task_id = p_task and status = 'completed' limit 1;
  if t.customer_id = me.id then
    null; -- customer reviews the Tasker
  elsif v_subject = me.id then
    v_subject := t.customer_id; -- Tasker reviews the customer
  else
    raise exception 'not_allowed';
  end if;
  if p_rating not between 1 and 5 then raise exception 'invalid_input'; end if;
  insert into public.reviews (task_id, author_id, subject_id, rating, comment) values (p_task, me.id, v_subject, p_rating, nullif(trim(p_comment), ''));
  update public.tasker_profiles tp
     set rating_count = s.n, rating_avg = s.avg
    from (select count(*)::integer n, round(avg(rating)::numeric, 2) avg from public.reviews where subject_id = v_subject) s
   where tp.user_id = v_subject;
  perform public._log(p_task, 'reviewed', jsonb_build_object('rating', p_rating));
end $$;

-- ─── Reports & blocks (App Store guideline 1.2) ─────────────────────────────
create or replace function public.report_user(p_subject uuid, p_reason text, p_details text default null, p_task uuid default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  v uuid;
begin
  if p_subject = me.id or p_subject is null then raise exception 'invalid_input'; end if;
  insert into public.disputes (task_id, reporter_id, subject_id, kind, reason, details)
  values (p_task, me.id, p_subject, 'report', left(p_reason, 200), left(p_details, 2000)) returning id into v;
  return v;
end $$;

create or replace function public.block_user(p_subject uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me();
begin
  if p_subject = me.id then raise exception 'invalid_input'; end if;
  insert into public.user_blocks (blocker_id, blocked_id) values (me.id, p_subject) on conflict do nothing;
end $$;

create or replace function public.unblock_user(p_subject uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._me();
  delete from public.user_blocks where blocker_id = auth.uid() and blocked_id = p_subject;
end $$;

-- ─── Account deletion (App Store guideline 5.1.1(v)) ────────────────────────
-- Personal data is erased; task records stay (anonymised) for safety and legal
-- retention. The auth user is soft-deleted by the delete-account Edge Function.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  r record;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if exists (select 1 from public.task_assignments a join public.tasks t on t.id = a.task_id
             where a.tasker_id = uid and a.status = 'active' and t.status in ('arrived', 'in_progress', 'proof_submitted')) then
    raise exception 'invalid_state';
  end if;
  if exists (select 1 from public.tasks where customer_id = uid and status in ('arrived', 'in_progress', 'proof_submitted')) then
    raise exception 'invalid_state';
  end if;
  -- Open customer tasks are cancelled; active Tasker jobs are released and re-dispatched.
  for r in select id from public.tasks where customer_id = uid and status in ('searching', 'assigned', 'en_route') loop
    update public.tasks set status = 'cancelled', cancelled_at = now(), cancel_reason = 'account_deleted' where id = r.id;
    update public.task_assignments set status = 'released', released_at = now(), release_reason = 'customer_deleted' where task_id = r.id and status = 'active';
    perform public._drop_pin(r.id);
  end loop;
  for r in select task_id from public.task_assignments where tasker_id = uid and status = 'active' loop
    update public.task_assignments set status = 'released', released_at = now(), release_reason = 'tasker_deleted' where task_id = r.task_id and tasker_id = uid and status = 'active';
    update public.tasks set status = 'searching', searching_since = now() where id = r.task_id and status in ('assigned', 'en_route');
    perform public._drop_pin(r.task_id);
    perform public._dispatch(r.task_id, true);
  end loop;
  update public.task_dispatches set status = 'expired' where tasker_id = uid and status = 'offered';
  update public.tasker_profiles set is_online = false, last_lat = null, last_lng = null, bio = null where user_id = uid;
  update public.profiles set full_name = null, phone = null, avatar_url = null, push_token = null, deleted_at = now() where id = uid;
  delete from public.user_blocks where blocker_id = uid;
  insert into public.audit_log (actor_id, action, target_type, target_id) values (uid, 'account_deleted', 'profile', uid::text);
end $$;
