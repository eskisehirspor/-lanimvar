-- İlanım Var — task lifecycle RPCs: onboarding, create, dispatch, accept, PIN,
-- exact address, arrival, proof, completion, cancellation.
--
-- Error contract: RAISE EXCEPTION '<code>' with codes the app maps to copy:
--   not_signed_in, not_onboarded, banned, not_allowed, invalid_state,
--   invalid_input, offer_expired, already_taken, pin_locked, too_early.

-- ─── Internal helpers (not callable by clients) ─────────────────────────────
create or replace function public._me() returns public.profiles
language plpgsql stable security definer set search_path = public as $$
declare v public.profiles;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select * into v from public.profiles where id = auth.uid();
  if not found or v.deleted_at is not null then raise exception 'not_signed_in'; end if;
  if v.is_banned then raise exception 'banned'; end if;
  if v.onboarded_at is null then raise exception 'not_onboarded'; end if;
  return v;
end $$;

create or replace function public._log(p_task uuid, p_type text, p_data jsonb default '{}') returns void
language sql security definer set search_path = public as $$
  insert into public.task_events (task_id, actor_id, type, data) values (p_task, auth.uid(), p_type, coalesce(p_data, '{}'));
$$;

create or replace function public._distance_m(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns integer language sql immutable as $$
  select round(6371000 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2))))::integer;
$$;

-- The PIN: 6 digits, a Vault secret named task_pin:<task_id>. Generated at
-- assignment, rotated on reassignment or after lockout, deleted at task end.
create or replace function public._set_pin(p_task uuid, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare v_pin text;
begin
  delete from vault.secrets where name = 'task_pin:' || p_task;
  v_pin := lpad(((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');
  perform vault.create_secret(v_pin, 'task_pin:' || p_task, 'Task PIN (never log, push or broadcast)');
  perform public._log(p_task, case when p_reason = 'generated' then 'pin_generated' else 'pin_rotated' end, jsonb_build_object('reason', p_reason));
end $$;

create or replace function public._drop_pin(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from vault.secrets where name = 'task_pin:' || p_task;
  if found then perform public._log(p_task, 'pin_deleted'); end if;
end $$;

-- The caller's active, non-standby assignment on this task, with the whole
-- task/team/slot/assignment chain checked. NULL when there is none.
create or replace function public._my_assignment(p_task uuid) returns public.task_assignments
language sql stable security definer set search_path = public as $$
  select a.* from public.task_assignments a
  join public.task_team_slots s on s.id = a.slot_id
  join public.task_teams tt on tt.id = s.team_id and tt.task_id = a.task_id
  where a.task_id = p_task and a.tasker_id = auth.uid() and a.status = 'active' and not a.is_standby
  limit 1;
$$;

-- Offer a task to nearby, approved, online Taskers who have not seen it yet.
-- p_reoffer (after a Tasker leaves): offers that were superseded by that
-- acceptance come back to life, so nearby people get a second chance.
create or replace function public._dispatch(p_task uuid, p_reoffer boolean default false) returns integer
language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
  n integer;
begin
  select * into t from public.tasks where id = p_task;
  if t.status <> 'searching' then return 0; end if;
  insert into public.task_dispatches (task_id, tasker_id, distance_m, expires_at)
  select t.id, tp.user_id, public._distance_m(t.approx_lat, t.approx_lng, tp.last_lat, tp.last_lng), now() + interval '90 seconds'
  from public.tasker_profiles tp
  join public.profiles p on p.id = tp.user_id
  where tp.verification = 'approved' and tp.is_online and tp.last_seen_at > now() - interval '15 minutes'
    and tp.last_lat is not null and not p.is_banned and p.deleted_at is null and p.id <> t.customer_id
    and public._distance_m(t.approx_lat, t.approx_lng, tp.last_lat, tp.last_lng) <= 8000
    and not exists (select 1 from public.task_dispatches d where d.task_id = t.id and d.tasker_id = tp.user_id
                    and not (p_reoffer and d.status = 'superseded'))
    and not exists (select 1 from public.task_assignments a where a.tasker_id = tp.user_id and a.status = 'active' and not a.is_standby)
    and not exists (select 1 from public.user_blocks b where (b.blocker_id = t.customer_id and b.blocked_id = tp.user_id) or (b.blocker_id = tp.user_id and b.blocked_id = t.customer_id))
  order by public._distance_m(t.approx_lat, t.approx_lng, tp.last_lat, tp.last_lng)
  limit 15
  on conflict (task_id, tasker_id) do update
    set status = 'offered', offered_at = now(), expires_at = excluded.expires_at, responded_at = null, distance_m = excluded.distance_m;
  get diagnostics n = row_count;
  insert into public.task_events (task_id, actor_id, type, data) values (t.id, null, 'dispatched', jsonb_build_object('offers', n));
  return n;
end $$;

-- ─── Onboarding & profile ───────────────────────────────────────────────────
create or replace function public.complete_onboarding(p_full_name text, p_role public.app_role, p_accept_terms boolean, p_accept_kvkk boolean, p_legal_version text, p_marketing boolean default false)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare v public.profiles;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  if p_role not in ('customer', 'tasker') then raise exception 'not_allowed'; end if;
  if not coalesce(p_accept_terms, false) or not coalesce(p_accept_kvkk, false) then raise exception 'invalid_input'; end if;
  if char_length(trim(coalesce(p_full_name, ''))) < 2 or p_legal_version is null then raise exception 'invalid_input'; end if;
  update public.profiles
     set full_name = trim(p_full_name),
         role = case when role = 'admin' then role else p_role end,
         onboarded_at = coalesce(onboarded_at, now()),
         terms_accepted_at = now(),
         kvkk_accepted_at = now(),
         legal_version = left(p_legal_version, 20),
         marketing_consent_at = case when p_marketing then now() end
   where id = auth.uid() and deleted_at is null and not is_banned
  returning * into v;
  if not found then raise exception 'not_allowed'; end if;
  if p_role = 'tasker' then
    insert into public.tasker_profiles (user_id) values (auth.uid()) on conflict do nothing;
  end if;
  return v;
end $$;

create or replace function public.update_profile(p_full_name text default null, p_push_token text default null)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare v public.profiles;
begin
  perform public._me();
  update public.profiles
     set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
         push_token = coalesce(p_push_token, push_token)
   where id = auth.uid()
  returning * into v;
  return v;
end $$;

-- ─── Customer: create & cancel ──────────────────────────────────────────────
create or replace function public.create_task(
  p_category text, p_title text, p_description text, p_price integer,
  p_approx_label text, p_lat double precision, p_lng double precision,
  p_exact_address text, p_exact_details text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  rule public.pricing_rules;
  v_task uuid;
  v_team uuid;
  open_count integer;
begin
  if me.role not in ('customer', 'admin') then raise exception 'not_allowed'; end if;
  select * into rule from public.pricing_rules where category = p_category and active;
  if not found then raise exception 'invalid_input'; end if;
  if p_price < rule.min_price or p_price > rule.max_price then raise exception 'invalid_input'; end if;
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'invalid_input'; end if;
  select count(*) into open_count from public.tasks
   where customer_id = me.id and status in ('searching', 'assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted');
  if open_count >= 3 then raise exception 'not_allowed'; end if;

  insert into public.tasks (customer_id, category, title, description, price, status, approx_label, approx_lat, approx_lng,
                            exact_address, exact_details, exact_lat, exact_lng, searching_since)
  values (me.id, p_category, trim(p_title), nullif(trim(p_description), ''), p_price, 'searching', trim(p_approx_label),
          round(p_lat::numeric, 3)::double precision, round(p_lng::numeric, 3)::double precision,
          trim(p_exact_address), nullif(trim(p_exact_details), ''), p_lat, p_lng, now())
  returning id into v_task;

  insert into public.task_teams (task_id, size) values (v_task, 1) returning id into v_team;
  insert into public.task_team_slots (team_id, slot_index) values (v_team, 0);
  perform public._log(v_task, 'created', jsonb_build_object('price', p_price, 'category', p_category));
  perform public._dispatch(v_task);
  return v_task;
end $$;

create or replace function public.cancel_task(p_task uuid, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  t public.tasks;
begin
  select * into t from public.tasks where id = p_task for update;
  if not found or t.customer_id <> me.id then raise exception 'not_allowed'; end if;
  if t.status not in ('searching', 'assigned', 'en_route', 'arrived') then raise exception 'invalid_state'; end if;
  update public.tasks set status = 'cancelled', cancelled_at = now(), cancel_reason = left(p_reason, 200) where id = p_task;
  update public.task_assignments set status = 'released', released_at = now(), release_reason = 'customer_cancelled' where task_id = p_task and status = 'active';
  update public.task_dispatches set status = 'superseded' where task_id = p_task and status = 'offered';
  perform public._drop_pin(p_task);
  perform public._log(p_task, 'cancelled', jsonb_build_object('by', 'customer', 'after_assignment', t.status <> 'searching'));
end $$;

-- ─── Tasker: availability & offers ──────────────────────────────────────────
create or replace function public.tasker_set_online(p_online boolean, p_lat double precision default null, p_lng double precision default null)
returns public.tasker_profiles
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  v public.tasker_profiles;
begin
  select * into v from public.tasker_profiles where user_id = me.id;
  if not found then raise exception 'not_allowed'; end if;
  if p_online and v.verification <> 'approved' then raise exception 'not_allowed'; end if;
  update public.tasker_profiles
     set is_online = p_online,
         last_lat = coalesce(p_lat, last_lat),
         last_lng = coalesce(p_lng, last_lng),
         last_seen_at = now()
   where user_id = me.id
  returning * into v;
  return v;
end $$;

create or replace function public.tasker_ping(p_lat double precision, p_lng double precision) returns void
language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me();
begin
  update public.tasker_profiles set last_lat = p_lat, last_lng = p_lng, last_seen_at = now() where user_id = me.id;
end $$;

-- Live offers for the calling Tasker: the safe card only (no exact address).
create or replace function public.tasker_offers()
returns table (task_id uuid, title text, description text, category text, price integer, approx_label text,
               approx_lat double precision, approx_lng double precision, distance_m integer, expires_at timestamptz,
               customer_first_name text, customer_tasks integer)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._me();
  return query
  select t.id, t.title, t.description, t.category, t.price, t.approx_label, t.approx_lat, t.approx_lng,
         d.distance_m, d.expires_at, split_part(coalesce(p.full_name, ''), ' ', 1),
         (select count(*)::integer from public.tasks x where x.customer_id = t.customer_id and x.status = 'completed')
  from public.task_dispatches d
  join public.tasks t on t.id = d.task_id
  join public.profiles p on p.id = t.customer_id
  where d.tasker_id = auth.uid() and d.status = 'offered' and d.expires_at > now() and t.status = 'searching'
  order by d.offered_at desc;
end $$;

create or replace function public.decline_offer(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._me();
  update public.task_dispatches set status = 'declined', responded_at = now()
   where task_id = p_task and tasker_id = auth.uid() and status = 'offered';
end $$;

-- Accept-first: the first valid acceptance wins; the row lock serialises racers.
create or replace function public.accept_task(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  t public.tasks;
  d public.task_dispatches;
  v_slot uuid;
begin
  if not exists (select 1 from public.tasker_profiles where user_id = me.id and verification = 'approved') then raise exception 'not_allowed'; end if;
  select * into t from public.tasks where id = p_task for update;
  if not found then raise exception 'not_allowed'; end if;
  select * into d from public.task_dispatches where task_id = p_task and tasker_id = me.id;
  if not found then raise exception 'not_allowed'; end if;
  if t.status <> 'searching' then raise exception 'already_taken'; end if;
  if d.status <> 'offered' or d.expires_at <= now() then raise exception 'offer_expired'; end if;
  if exists (select 1 from public.task_assignments where tasker_id = me.id and status = 'active' and not is_standby) then raise exception 'not_allowed'; end if;

  select s.id into v_slot from public.task_team_slots s join public.task_teams tt on tt.id = s.team_id
   where tt.task_id = p_task
     and not exists (select 1 from public.task_assignments a where a.slot_id = s.id and a.status = 'active' and not a.is_standby)
   order by s.slot_index limit 1;
  if v_slot is null then raise exception 'already_taken'; end if;

  insert into public.task_assignments (task_id, slot_id, tasker_id) values (p_task, v_slot, me.id);
  update public.task_dispatches set status = 'accepted', responded_at = now() where id = d.id;
  update public.task_dispatches set status = 'superseded' where task_id = p_task and id <> d.id and status = 'offered';
  update public.tasks set status = 'assigned', first_accepted_at = coalesce(first_accepted_at, now()) where id = p_task;
  perform public._log(p_task, 'accepted', jsonb_build_object('seconds_to_accept', extract(epoch from now() - t.searching_since)::integer));
  perform public._set_pin(p_task, case when t.first_accepted_at is null then 'generated' else 'reassigned' end);
end $$;

-- Tasker's own jobs (safe card + status). Exact address is NOT here.
create or replace function public.tasker_jobs()
returns table (task_id uuid, title text, category text, price integer, status public.task_status, approx_label text,
               approx_lat double precision, approx_lng double precision, customer_id uuid, customer_first_name text, accepted_at timestamptz, arrived_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._me();
  return query
  select t.id, t.title, t.category, t.price, t.status, t.approx_label, t.approx_lat, t.approx_lng,
         t.customer_id, split_part(coalesce(p.full_name, ''), ' ', 1), a.accepted_at, t.arrived_at
  from public.task_assignments a
  join public.tasks t on t.id = a.task_id
  join public.profiles p on p.id = t.customer_id
  where a.tasker_id = auth.uid() and (a.status in ('active', 'completed'))
  order by a.accepted_at desc
  limit 50;
end $$;

-- ─── The two secrets: exact address and PIN ─────────────────────────────────
create or replace function public.get_task_address(p_task uuid)
returns table (exact_address text, exact_details text, exact_lat double precision, exact_lng double precision)
language plpgsql security definer set search_path = public as $$
declare a public.task_assignments;
begin
  perform public._me();
  a := public._my_assignment(p_task);
  if a.id is null then raise exception 'not_allowed'; end if;
  if not exists (select 1 from public.tasks t where t.id = p_task and t.status in ('assigned', 'en_route', 'arrived', 'in_progress')) then
    raise exception 'invalid_state';
  end if;
  perform public._log(p_task, 'address_viewed');
  return query select t.exact_address, t.exact_details, t.exact_lat, t.exact_lng from public.tasks t where t.id = p_task;
end $$;

-- Customer reads the PIN to say it at the door. Only the customer, only while it matters.
create or replace function public.get_task_pin(p_task uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  v text;
begin
  if not exists (select 1 from public.tasks where id = p_task and customer_id = me.id and status in ('assigned', 'en_route', 'arrived')) then
    raise exception 'not_allowed';
  end if;
  select decrypted_secret into v from vault.decrypted_secrets where name = 'task_pin:' || p_task;
  return v;
end $$;

create or replace function public._pin_failures(p_task uuid) returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::integer from public.task_events
   where task_id = p_task and type = 'pin_failed'
     and id > coalesce((select max(id) from public.task_events where task_id = p_task and type in ('pin_generated', 'pin_rotated')), 0);
$$;

-- Tasker types the PIN; the server compares and answers yes/no. 5 misses lock it.
create or replace function public.verify_pin(p_task uuid, p_pin text) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  a public.task_assignments;
  t public.tasks;
  v text;
  fails integer;
begin
  perform public._me();
  a := public._my_assignment(p_task);
  if a.id is null then raise exception 'not_allowed'; end if;
  select * into t from public.tasks where id = p_task for update;
  if t.status <> 'arrived' then raise exception 'invalid_state'; end if;
  fails := public._pin_failures(p_task);
  if fails >= 5 then raise exception 'pin_locked'; end if;
  select decrypted_secret into v from vault.decrypted_secrets where name = 'task_pin:' || p_task;
  if v is null then raise exception 'invalid_state'; end if;
  if p_pin is not null and p_pin ~ '^[0-9]{6}$' and p_pin = v then
    update public.tasks set status = 'in_progress', started_at = now() where id = p_task;
    perform public._log(p_task, 'pin_verified');
    return true;
  end if;
  perform public._log(p_task, 'pin_failed', jsonb_build_object('attempt', fails + 1));
  if fails + 1 >= 5 then perform public._log(p_task, 'pin_locked'); end if;
  return false;
end $$;

-- After a lockout the customer issues a fresh PIN (and sees it in the app).
create or replace function public.rotate_pin(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me();
begin
  if not exists (select 1 from public.tasks where id = p_task and customer_id = me.id and status in ('assigned', 'en_route', 'arrived')) then
    raise exception 'not_allowed';
  end if;
  perform public._set_pin(p_task, 'customer_rotated');
end $$;

-- ─── Tasker: on the way → arrived → proof ───────────────────────────────────
create or replace function public.tasker_start_route(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
declare a public.task_assignments;
begin
  perform public._me();
  a := public._my_assignment(p_task);
  if a.id is null then raise exception 'not_allowed'; end if;
  update public.tasks set status = 'en_route' where id = p_task and status = 'assigned';
  if not found then raise exception 'invalid_state'; end if;
  perform public._log(p_task, 'en_route');
end $$;

-- Arrival evidence: where the Tasker was when they said "I'm here", and how far from the door.
create or replace function public.tasker_arrived(p_task uuid, p_lat double precision, p_lng double precision) returns void
language plpgsql security definer set search_path = public as $$
declare
  a public.task_assignments;
  t public.tasks;
begin
  perform public._me();
  a := public._my_assignment(p_task);
  if a.id is null then raise exception 'not_allowed'; end if;
  select * into t from public.tasks where id = p_task for update;
  if t.status not in ('assigned', 'en_route') then raise exception 'invalid_state'; end if;
  update public.tasks set status = 'arrived', arrived_at = now() where id = p_task;
  perform public._log(p_task, 'arrived', jsonb_build_object(
    'lat', round(p_lat::numeric, 5), 'lng', round(p_lng::numeric, 5),
    'distance_m', case when t.exact_lat is null or p_lat is null then null else public._distance_m(p_lat, p_lng, t.exact_lat, t.exact_lng) end));
end $$;

-- Media rows point at storage objects under <task_id>/<uploader_id>/...
create or replace function public.add_task_media(p_task uuid, p_kind public.media_kind, p_path text, p_lat double precision default null, p_lng double precision default null)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  a public.task_assignments := public._my_assignment(p_task);
  v uuid;
begin
  if not (a.id is not null or exists (select 1 from public.tasks where id = p_task and customer_id = me.id)) then
    raise exception 'not_allowed';
  end if;
  if p_path is null or p_path not like p_task || '/' || me.id || '/%' then raise exception 'invalid_input'; end if;
  insert into public.task_media (task_id, uploader_id, kind, storage_path, lat, lng) values (p_task, me.id, p_kind, p_path, p_lat, p_lng) returning id into v;
  perform public._log(p_task, 'media_added', jsonb_build_object('kind', p_kind));
  return v;
end $$;

create or replace function public.submit_proof(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
declare a public.task_assignments;
begin
  perform public._me();
  a := public._my_assignment(p_task);
  if a.id is null then raise exception 'not_allowed'; end if;
  if not exists (select 1 from public.task_media where task_id = p_task and kind = 'after' and uploader_id = auth.uid()) then raise exception 'invalid_input'; end if;
  update public.tasks set status = 'proof_submitted', proof_submitted_at = now() where id = p_task and status = 'in_progress';
  if not found then raise exception 'invalid_state'; end if;
  perform public._log(p_task, 'proof_submitted');
end $$;

-- Customer confirms. The PIN is gone; the Tasker's record grows.
create or replace function public.confirm_completion(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me();
begin
  update public.tasks set status = 'completed', completed_at = now() where id = p_task and customer_id = me.id and status = 'proof_submitted';
  if not found then raise exception 'invalid_state'; end if;
  update public.tasker_profiles tp set completed_count = completed_count + 1
    from public.task_assignments a where a.task_id = p_task and a.status = 'active' and a.tasker_id = tp.user_id;
  update public.task_assignments set status = 'completed' where task_id = p_task and status = 'active';
  perform public._drop_pin(p_task);
  perform public._log(p_task, 'completed');
end $$;

-- ─── What each side may see about the other ─────────────────────────────────
create or replace function public.task_tasker(p_task uuid)
returns table (tasker_id uuid, first_name text, initials text, rating_avg numeric, rating_count integer, completed_count integer,
               verified boolean, lat double precision, lng double precision, seen_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare me public.profiles := public._me();
begin
  if not exists (select 1 from public.tasks where id = p_task and (customer_id = me.id or public.is_admin())) then raise exception 'not_allowed'; end if;
  return query
  select p.id, split_part(coalesce(p.full_name, ''), ' ', 1),
         upper(left(split_part(coalesce(p.full_name, '?'), ' ', 1), 1) || left(split_part(coalesce(p.full_name, ''), ' ', 2), 1)),
         tp.rating_avg, tp.rating_count, tp.completed_count, tp.verification = 'approved',
         -- Location only while the Tasker is on the way or at the door.
         case when t.status in ('assigned', 'en_route', 'arrived') then tp.last_lat end,
         case when t.status in ('assigned', 'en_route', 'arrived') then tp.last_lng end,
         tp.last_seen_at
  from public.task_assignments a
  join public.tasks t on t.id = a.task_id
  join public.profiles p on p.id = a.tasker_id
  join public.tasker_profiles tp on tp.user_id = a.tasker_id
  where a.task_id = p_task and a.status in ('active', 'completed') and not a.is_standby
  order by a.accepted_at desc limit 1;
end $$;

-- ─── Housekeeping: expire offers, re-dispatch, expire stale searches ────────
create or replace function public.expire_and_redispatch() returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  update public.task_dispatches set status = 'expired' where status = 'offered' and expires_at <= now();
  for r in select id, searching_since from public.tasks where status = 'searching' loop
    if r.searching_since < now() - interval '20 minutes' then
      update public.tasks set status = 'expired' where id = r.id;
      insert into public.task_events (task_id, type) values (r.id, 'expired');
    elsif not exists (select 1 from public.task_dispatches where task_id = r.id and status = 'offered') then
      perform public._dispatch(r.id);
    end if;
  end loop;
end $$;
