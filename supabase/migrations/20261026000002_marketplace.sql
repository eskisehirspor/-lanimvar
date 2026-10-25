-- İlanım Var — wider marketplace and keeping work on the platform.
--  * Category sections, incl. social/sport/games where the price may be 0 ("maç parası bizden").
--  * A start time (“bugün 21:00 halısaha”) and Tasker category preferences in dispatch.
--  * Anti-disintermediation: no contact details in listings, rehire the same Tasker in-app,
--    late-cancel signals for the safety team.
--  * Guaranteed closure: proof not confirmed in 24 h completes automatically.
-- Columns only; no new tables.

-- ─── Pricing sections and free social tasks ─────────────────────────────────
alter table public.pricing_rules
  add column section text not null default 'daily' check (section in ('daily', 'social', 'wait', 'pets', 'extra')),
  add column sort integer not null default 100,
  add column max_people integer not null default 1 check (max_people between 1 and 6);

alter table public.pricing_rules drop constraint if exists pricing_rules_recommended_price_check;
alter table public.pricing_rules drop constraint if exists pricing_rules_min_price_check;
alter table public.pricing_rules add constraint pricing_rules_min_price_check check (min_price >= 0);
alter table public.pricing_rules add constraint pricing_rules_recommended_price_check check (recommended_price >= 0);
alter table public.tasks drop constraint if exists tasks_price_check;
alter table public.tasks add constraint tasks_price_check check (price >= 0);

alter table public.tasks
  add column preferred_tasker_id uuid references public.profiles (id);

-- Categories are product configuration, so they ship with the schema (admins edit them later).
insert into public.pricing_rules (category, label, section, sort, recommended_price, min_price, max_price, max_people) values
  ('heavy', 'Ağır eşya', 'daily', 10, 650, 300, 3000, 1),
  ('moving', 'Taşıma', 'daily', 20, 900, 400, 6000, 1),
  ('assembly', 'Montaj', 'daily', 30, 450, 200, 2500, 1),
  ('repair', 'Küçük tamir', 'daily', 40, 400, 200, 2500, 1),
  ('shopping', 'Alışveriş', 'daily', 50, 250, 150, 1500, 1),
  ('cleaning', 'Temizlik', 'daily', 60, 700, 300, 4000, 1),
  ('football', 'Halısahaya oyuncu', 'social', 10, 0, 0, 300, 4),
  ('okey', 'Okeye 4. kişi', 'social', 20, 0, 0, 200, 3),
  ('games', 'King, Batak, Play arkadaşı', 'social', 30, 0, 0, 200, 3),
  ('sport', 'Spor partneri', 'social', 40, 0, 0, 300, 2),
  ('queue', 'Sırada bekleme', 'wait', 10, 300, 150, 1500, 1),
  ('athome', 'Evde servis bekleme', 'wait', 20, 250, 150, 1500, 1),
  ('parcel', 'Kargo götür, teslim al', 'wait', 30, 150, 80, 600, 1),
  ('dogwalk', 'Köpek gezdirme', 'pets', 10, 150, 80, 500, 1),
  ('petsit', 'Evcil hayvan besleme', 'pets', 20, 200, 100, 800, 1),
  ('plants', 'Bitki sulama', 'pets', 30, 120, 60, 400, 1),
  ('snow', 'Kar küreme', 'pets', 40, 300, 150, 1500, 1),
  ('garden', 'Bahçe işleri', 'pets', 50, 400, 200, 2500, 1),
  ('carwash', 'Araç yıkama', 'pets', 60, 300, 150, 1000, 1),
  ('tech', 'Telefon, bilgisayar kurulumu', 'extra', 10, 300, 150, 1500, 1),
  ('event', 'Etkinlik hazırlığı', 'extra', 20, 500, 200, 3000, 1),
  ('photo', 'Fotoğraf çekimi', 'extra', 30, 500, 200, 3000, 1),
  ('tutor', 'Ders çalışma, özel ders', 'extra', 40, 300, 150, 1500, 1)
on conflict (category) do update set section = excluded.section, sort = excluded.sort, max_people = excluded.max_people;

-- ─── Contact details stay inside the app ────────────────────────────────────
-- Phone numbers, e-mails, IBANs and social handles in a listing would let people
-- skip the platform (and its safety net). The server refuses them.
create or replace function public._has_contact_info(p text) returns boolean
language sql immutable as $$
  select coalesce(p, '') ~* '(\+?9?0?[\s.-]*5\d{2}[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2})'
      or coalesce(p, '') ~* '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}'
      or coalesce(p, '') ~* 'TR\s?\d{2}(\s?\d{4}){5}'
      or coalesce(p, '') ~* '(whatsapp|wp\s*:|instagram|insta\s*:|telegram|t\.me/|@[a-z0-9_.]{3,})';
$$;

-- ─── Dispatch: category preferences, preferred Tasker first ─────────────────
create or replace function public._dispatch(p_task uuid, p_reoffer boolean default false) returns integer
language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
  n integer;
begin
  select * into t from public.tasks where id = p_task;
  if t.status <> 'searching' then return 0; end if;

  -- Rehire: the first wave goes only to the Tasker the customer asked for (2 minutes).
  if t.preferred_tasker_id is not null and not exists (select 1 from public.task_dispatches where task_id = t.id) then
    insert into public.task_dispatches (task_id, tasker_id, distance_m, expires_at)
    select t.id, tp.user_id, public._distance_m(t.approx_lat, t.approx_lng, tp.last_lat, tp.last_lng), now() + interval '120 seconds'
    from public.tasker_profiles tp join public.profiles p on p.id = tp.user_id
    where tp.user_id = t.preferred_tasker_id and tp.verification = 'approved' and tp.is_online and not p.is_banned and p.deleted_at is null
      and not exists (select 1 from public.task_assignments a where a.tasker_id = tp.user_id and a.status = 'active' and not a.is_standby)
      and not exists (select 1 from public.user_blocks b where (b.blocker_id = t.customer_id and b.blocked_id = tp.user_id) or (b.blocker_id = tp.user_id and b.blocked_id = t.customer_id));
    get diagnostics n = row_count;
    if n > 0 then
      insert into public.task_events (task_id, actor_id, type, data) values (t.id, null, 'dispatched_preferred', '{}');
      return n;
    end if;
  end if;

  insert into public.task_dispatches (task_id, tasker_id, distance_m, expires_at)
  select t.id, tp.user_id, public._distance_m(t.approx_lat, t.approx_lng, tp.last_lat, tp.last_lng), now() + interval '90 seconds'
  from public.tasker_profiles tp
  join public.profiles p on p.id = tp.user_id
  where tp.verification = 'approved' and tp.is_online and tp.last_seen_at > now() - interval '15 minutes'
    and tp.last_lat is not null and not p.is_banned and p.deleted_at is null and p.id <> t.customer_id
    and (cardinality(tp.categories) = 0 or t.category = any (tp.categories))
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

-- ─── Create: start time, rehire, no contact details ─────────────────────────
drop function if exists public.create_task(text, text, text, integer, text, double precision, double precision, text, text);
create or replace function public.create_task(
  p_category text, p_title text, p_description text, p_price integer,
  p_approx_label text, p_lat double precision, p_lng double precision,
  p_exact_address text, p_exact_details text default null,
  p_scheduled_for timestamptz default null, p_preferred_tasker uuid default null
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
  if p_price is null or p_price < rule.min_price or p_price > rule.max_price then raise exception 'invalid_input'; end if;
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'invalid_input'; end if;
  if public._has_contact_info(p_title) or public._has_contact_info(p_description) or public._has_contact_info(p_exact_details) then
    raise exception 'contact_info_not_allowed';
  end if;
  if p_scheduled_for is not null and (p_scheduled_for < now() - interval '5 minutes' or p_scheduled_for > now() + interval '7 days') then raise exception 'invalid_input'; end if;
  -- Rehire only someone you actually worked with through the app.
  if p_preferred_tasker is not null and not exists (
    select 1 from public.task_assignments a join public.tasks x on x.id = a.task_id
     where a.tasker_id = p_preferred_tasker and x.customer_id = me.id and x.status = 'completed') then
    raise exception 'not_allowed';
  end if;
  select count(*) into open_count from public.tasks
   where customer_id = me.id and status in ('searching', 'assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted');
  if open_count >= 6 then raise exception 'not_allowed'; end if;

  insert into public.tasks (customer_id, category, title, description, price, status, approx_label, approx_lat, approx_lng,
                            exact_address, exact_details, exact_lat, exact_lng, searching_since, scheduled_for, preferred_tasker_id, mode)
  values (me.id, p_category, trim(p_title), nullif(trim(p_description), ''), p_price, 'searching', trim(p_approx_label),
          round(p_lat::numeric, 3)::double precision, round(p_lng::numeric, 3)::double precision,
          trim(p_exact_address), nullif(trim(p_exact_details), ''), p_lat, p_lng, now(), p_scheduled_for, p_preferred_tasker,
          case when p_scheduled_for is null then 'now' else 'planned' end::public.task_mode)
  returning id into v_task;

  insert into public.task_teams (task_id, size) values (v_task, 1) returning id into v_team;
  insert into public.task_team_slots (team_id, slot_index) values (v_team, 0);
  perform public._log(v_task, 'created', jsonb_build_object('price', p_price, 'category', p_category, 'rehire', p_preferred_tasker is not null));
  perform public._dispatch(v_task);
  return v_task;
end $$;

-- A declined preferred offer opens the task to everyone at once.
create or replace function public.decline_offer(p_task uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._me();
  update public.task_dispatches set status = 'declined', responded_at = now()
   where task_id = p_task and tasker_id = auth.uid() and status = 'offered';
  if not exists (select 1 from public.task_dispatches where task_id = p_task and status = 'offered') then
    perform public._dispatch(p_task);
  end if;
end $$;

-- Offers and jobs now carry the start time.
drop function if exists public.tasker_offers();
create or replace function public.tasker_offers()
returns table (task_id uuid, title text, description text, category text, price integer, approx_label text,
               approx_lat double precision, approx_lng double precision, distance_m integer, expires_at timestamptz,
               customer_first_name text, customer_tasks integer, scheduled_for timestamptz, rehire boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._me();
  return query
  select t.id, t.title, t.description, t.category, t.price, t.approx_label, t.approx_lat, t.approx_lng,
         d.distance_m, d.expires_at, split_part(coalesce(p.full_name, ''), ' ', 1),
         (select count(*)::integer from public.tasks x where x.customer_id = t.customer_id and x.status = 'completed'),
         t.scheduled_for, t.preferred_tasker_id = auth.uid()
  from public.task_dispatches d
  join public.tasks t on t.id = d.task_id
  join public.profiles p on p.id = t.customer_id
  where d.tasker_id = auth.uid() and d.status = 'offered' and d.expires_at > now() and t.status = 'searching'
  order by d.offered_at desc;
end $$;

-- ─── Guaranteed closure ─────────────────────────────────────────────────────
-- Proof waits at most 24 h for the customer; then the task completes on its own
-- (the customer can still open a dispute afterwards, as with a manual confirmation).
create or replace function public.expire_and_redispatch() returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  update public.task_dispatches set status = 'expired' where status = 'offered' and expires_at <= now();
  for r in select id, searching_since, scheduled_for from public.tasks where status = 'searching' loop
    if r.searching_since < now() - interval '20 minutes' and (r.scheduled_for is null or r.scheduled_for < now()) then
      update public.tasks set status = 'expired' where id = r.id;
      insert into public.task_events (task_id, type) values (r.id, 'expired');
    elsif not exists (select 1 from public.task_dispatches where task_id = r.id and status = 'offered') then
      perform public._dispatch(r.id);
    end if;
  end loop;
  for r in select id from public.tasks where status = 'proof_submitted' and proof_submitted_at < now() - interval '24 hours' loop
    update public.tasks set status = 'completed', completed_at = now() where id = r.id;
    update public.tasker_profiles tp set completed_count = completed_count + 1
      from public.task_assignments a where a.task_id = r.id and a.status = 'active' and a.tasker_id = tp.user_id;
    update public.task_assignments set status = 'completed' where task_id = r.id and status = 'active';
    perform public._drop_pin(r.id);
    insert into public.task_events (task_id, type) values (r.id, 'auto_completed');
  end loop;
end $$;

-- ─── Signals for the safety team: cancellations after someone was assigned ──
-- Repeated "assigned, then cancelled/left" between the same people is the classic
-- pattern of moving a job off the platform (and of unreliable users).
create or replace function public._late_cancels(p_user uuid) returns integer
language sql stable security definer set search_path = public as $$
  select (
    (select count(*) from public.tasks t where t.customer_id = p_user and t.status = 'cancelled' and t.first_accepted_at is not null
       and t.cancelled_at > now() - interval '60 days')
    + (select count(*) from public.task_assignments a where a.tasker_id = p_user and a.status = 'released'
       and a.release_reason in ('cannot_do', 'customer_request', 'other') and a.released_at > now() - interval '60 days')
  )::integer;
$$;

drop function if exists public.admin_people(text, public.app_role, integer);
create or replace function public.admin_people(p_query text default null, p_role public.app_role default null, p_limit integer default 100)
returns table (id uuid, full_name text, phone text, email text, birth_date date, role public.app_role, is_banned boolean, deleted_at timestamptz, created_at timestamptz,
               phone_verified boolean, email_verified boolean, home_district text,
               verification public.tasker_verification, is_online boolean, rating_avg numeric, completed_count integer,
               national_id text, id_front_path text, selfie_path text, categories text[], has_vehicle boolean, application_submitted_at timestamptz,
               open_reports bigint, late_cancels integer)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return query
  select p.id, p.full_name, p.phone, p.email, p.birth_date, p.role, p.is_banned, p.deleted_at, p.created_at,
         p.phone_verified_at is not null, p.email_verified_at is not null, p.home_district,
         tp.verification, tp.is_online, tp.rating_avg, tp.completed_count,
         tp.national_id, tp.id_front_path, tp.selfie_path, tp.categories, tp.has_vehicle, tp.application_submitted_at,
         (select count(*) from public.disputes d where d.subject_id = p.id and d.status in ('open', 'reviewing')),
         public._late_cancels(p.id)
  from public.profiles p left join public.tasker_profiles tp on tp.user_id = p.id
  where (p_role is null or p.role = p_role)
    and (p_query is null or p.full_name ilike '%' || p_query || '%' or p.phone ilike '%' || p_query || '%' or p.email ilike '%' || p_query || '%')
  order by tp.application_submitted_at desc nulls last, p.created_at desc
  limit least(greatest(p_limit, 1), 500);
end $$;

-- ─── Grants (new signatures) ────────────────────────────────────────────────
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.is_admin(),
  public._is_participant(uuid),
  public.complete_onboarding(text, text, date, public.app_role, text, text, text, text, double precision, double precision, boolean, boolean, text, boolean),
  public.submit_tasker_application(text, text, text, text[], boolean, text, boolean, boolean),
  public.update_home_address(text, text, text, text, double precision, double precision),
  public.sync_verification(),
  public.update_profile(text, text),
  public.create_task(text, text, text, integer, text, double precision, double precision, text, text, timestamptz, uuid),
  public.cancel_task(uuid, text),
  public.tasker_set_online(boolean, double precision, double precision),
  public.tasker_ping(double precision, double precision),
  public.tasker_offers(),
  public.decline_offer(uuid),
  public.accept_task(uuid),
  public.tasker_jobs(),
  public.get_task_address(uuid),
  public.get_task_pin(uuid),
  public.verify_pin(uuid, text),
  public.rotate_pin(uuid),
  public.tasker_start_route(uuid),
  public.tasker_arrived(uuid, double precision, double precision),
  public.add_task_media(uuid, public.media_kind, text, double precision, double precision),
  public.submit_proof(uuid),
  public.confirm_completion(uuid),
  public.task_tasker(uuid),
  public.safety_checkin(uuid),
  public.raise_incident(uuid, text, text),
  public.release_task(uuid, text),
  public.report_customer_no_show(uuid),
  public.open_dispute(uuid, text, text),
  public.leave_review(uuid, integer, text),
  public.report_user(uuid, text, text, uuid),
  public.block_user(uuid),
  public.unblock_user(uuid),
  public.delete_my_account(),
  public.admin_set_tasker_verification(uuid, public.tasker_verification, text),
  public.admin_ban_user(uuid, boolean, text),
  public.admin_set_role(uuid, public.app_role),
  public.admin_update_dispute(uuid, public.dispute_status, text),
  public.admin_settle_task(uuid, public.task_status, text),
  public.admin_task_address(uuid, text),
  public.admin_upsert_pricing_rule(text, text, integer, integer, integer, boolean),
  public.admin_people(text, public.app_role, integer),
  public.admin_metrics(integer)
to authenticated;
