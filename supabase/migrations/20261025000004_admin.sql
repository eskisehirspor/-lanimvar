-- İlanım Var — admin RPCs. Every admin write is audited. Admins never see PINs.

create or replace function public._require_admin() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_allowed'; end if;
end $$;

create or replace function public._audit(p_action text, p_type text, p_id text, p_data jsonb default '{}') returns void
language sql security definer set search_path = public as $$
  insert into public.audit_log (actor_id, action, target_type, target_id, data) values (auth.uid(), p_action, p_type, p_id, coalesce(p_data, '{}'));
$$;

create or replace function public.admin_set_tasker_verification(p_user uuid, p_status public.tasker_verification, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  update public.tasker_profiles set verification = p_status, is_online = case when p_status = 'approved' then is_online else false end where user_id = p_user;
  if not found then raise exception 'invalid_input'; end if;
  perform public._audit('tasker_verification', 'profile', p_user::text, jsonb_build_object('status', p_status, 'note', p_note));
end $$;

create or replace function public.admin_ban_user(p_user uuid, p_banned boolean, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_user = auth.uid() then raise exception 'invalid_input'; end if;
  update public.profiles set is_banned = p_banned, banned_reason = case when p_banned then p_reason end where id = p_user;
  if not found then raise exception 'invalid_input'; end if;
  if p_banned then
    update public.tasker_profiles set is_online = false where user_id = p_user;
    update public.task_dispatches set status = 'expired' where tasker_id = p_user and status = 'offered';
  end if;
  perform public._audit(case when p_banned then 'user_banned' else 'user_unbanned' end, 'profile', p_user::text, jsonb_build_object('reason', p_reason));
end $$;

create or replace function public.admin_set_role(p_user uuid, p_role public.app_role) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_user = auth.uid() then raise exception 'invalid_input'; end if;
  update public.profiles set role = p_role where id = p_user;
  if p_role = 'tasker' then insert into public.tasker_profiles (user_id) values (p_user) on conflict do nothing; end if;
  perform public._audit('role_changed', 'profile', p_user::text, jsonb_build_object('role', p_role));
end $$;

create or replace function public.admin_update_dispute(p_id uuid, p_status public.dispute_status, p_resolution text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  update public.disputes
     set status = p_status,
         resolution = coalesce(p_resolution, resolution),
         resolved_by = case when p_status in ('resolved', 'dismissed') then auth.uid() end,
         resolved_at = case when p_status in ('resolved', 'dismissed') then now() end
   where id = p_id;
  if not found then raise exception 'invalid_input'; end if;
  perform public._audit('dispute_updated', 'dispute', p_id::text, jsonb_build_object('status', p_status));
end $$;

-- Settle a disputed task one way or the other.
create or replace function public.admin_settle_task(p_task uuid, p_outcome public.task_status, p_note text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_outcome not in ('completed', 'cancelled') then raise exception 'invalid_input'; end if;
  update public.tasks set status = p_outcome,
         completed_at = case when p_outcome = 'completed' then coalesce(completed_at, now()) else completed_at end,
         cancelled_at = case when p_outcome = 'cancelled' then now() else cancelled_at end
   where id = p_task and status in ('disputed', 'no_show_customer', 'in_progress', 'proof_submitted');
  if not found then raise exception 'invalid_state'; end if;
  perform public._drop_pin(p_task);
  perform public._log(p_task, 'admin_settled', jsonb_build_object('outcome', p_outcome));
  perform public._audit('task_settled', 'task', p_task::text, jsonb_build_object('outcome', p_outcome, 'note', p_note));
end $$;

-- Exact address for a safety case: allowed, but always with a reason and an audit row.
create or replace function public.admin_task_address(p_task uuid, p_reason text)
returns table (exact_address text, exact_details text, exact_lat double precision, exact_lng double precision)
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if char_length(coalesce(p_reason, '')) < 5 then raise exception 'invalid_input'; end if;
  perform public._audit('address_viewed', 'task', p_task::text, jsonb_build_object('reason', p_reason));
  return query select t.exact_address, t.exact_details, t.exact_lat, t.exact_lng from public.tasks t where t.id = p_task;
end $$;

create or replace function public.admin_upsert_pricing_rule(p_category text, p_label text, p_recommended integer, p_min integer, p_max integer, p_active boolean)
returns public.pricing_rules
language plpgsql security definer set search_path = public as $$
declare v public.pricing_rules;
begin
  perform public._require_admin();
  insert into public.pricing_rules (category, label, recommended_price, min_price, max_price, active)
  values (p_category, p_label, p_recommended, p_min, p_max, p_active)
  on conflict (category) do update set label = excluded.label, recommended_price = excluded.recommended_price,
    min_price = excluded.min_price, max_price = excluded.max_price, active = excluded.active
  returning * into v;
  perform public._audit('pricing_rule_saved', 'pricing_rule', p_category, to_jsonb(v));
  return v;
end $$;

-- People list for the panel (profiles + tasker data), searchable.
create or replace function public.admin_people(p_query text default null, p_role public.app_role default null, p_limit integer default 100)
returns table (id uuid, full_name text, phone text, role public.app_role, is_banned boolean, deleted_at timestamptz, created_at timestamptz,
               verification public.tasker_verification, is_online boolean, rating_avg numeric, completed_count integer, open_reports bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return query
  select p.id, p.full_name, p.phone, p.role, p.is_banned, p.deleted_at, p.created_at, tp.verification, tp.is_online, tp.rating_avg, tp.completed_count,
         (select count(*) from public.disputes d where d.subject_id = p.id and d.status in ('open', 'reviewing'))
  from public.profiles p left join public.tasker_profiles tp on tp.user_id = p.id
  where (p_role is null or p.role = p_role)
    and (p_query is null or p.full_name ilike '%' || p_query || '%' or p.phone ilike '%' || p_query || '%')
  order by p.created_at desc
  limit least(greatest(p_limit, 1), 500);
end $$;

-- The north-star metric and the queue sizes, for the dashboard.
create or replace function public.admin_metrics(p_days integer default 7)
returns table (tasks_created bigint, tasks_accepted bigint, tasks_completed bigint, tasks_expired bigint,
               accept_p50_s numeric, accept_p90_s numeric, open_incidents bigint, open_disputes bigint, open_reports bigint,
               pending_taskers bigint, online_taskers bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return query
  with w as (select * from public.tasks where created_at > now() - make_interval(days => p_days))
  select
    (select count(*) from w),
    (select count(*) from w where first_accepted_at is not null),
    (select count(*) from w where status = 'completed'),
    (select count(*) from w where status = 'expired'),
    (select round(percentile_cont(0.5) within group (order by extract(epoch from first_accepted_at - created_at))::numeric, 0) from w where first_accepted_at is not null),
    (select round(percentile_cont(0.9) within group (order by extract(epoch from first_accepted_at - created_at))::numeric, 0) from w where first_accepted_at is not null),
    (select count(*) from public.disputes where kind = 'incident' and status in ('open', 'reviewing')),
    (select count(*) from public.disputes where kind in ('dispute', 'no_show') and status in ('open', 'reviewing')),
    (select count(*) from public.disputes where kind = 'report' and status in ('open', 'reviewing')),
    (select count(*) from public.tasker_profiles where verification = 'pending'),
    (select count(*) from public.tasker_profiles where is_online and last_seen_at > now() - interval '15 minutes');
end $$;
