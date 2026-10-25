-- İlanım Var — complete sign-up: verified phone AND email, legal age, home address,
-- and a Tasker application (national ID, ID photo, selfie, declarations).
-- Columns only; no new tables.

-- ─── Profile details ────────────────────────────────────────────────────────
alter table public.profiles
  add column first_name text check (char_length(first_name) between 2 and 40),
  add column last_name text check (char_length(last_name) between 2 and 40),
  add column birth_date date,
  add column email text,
  add column phone_verified_at timestamptz,
  add column email_verified_at timestamptz,
  -- Home address: prefills new tasks. Same privacy rule as tasks: only the owner (and admins) read it.
  add column home_district text,
  add column home_neighbourhood text,
  add column home_address text check (char_length(home_address) <= 300),
  add column home_details text check (char_length(home_details) <= 300),
  add column home_lat double precision,
  add column home_lng double precision;

-- ─── Tasker application ─────────────────────────────────────────────────────
alter table public.tasker_profiles
  add column national_id text check (national_id ~ '^[1-9][0-9]{10}$'),
  add column id_front_path text,
  add column selfie_path text,
  add column has_vehicle boolean not null default false,
  add column criminal_record_declared_at timestamptz,
  -- Açık rıza for processing ID images for identity verification (reviewed by a person).
  add column identity_consent_at timestamptz,
  add column application_submitted_at timestamptz;

comment on column public.tasker_profiles.national_id is 'T.C. kimlik no. Readable only by the Tasker and admins (RLS). Never shown to customers.';

-- T.C. kimlik numarası checksum (11 digits, first non-zero, digits 10 and 11 are check digits).
create or replace function public._valid_tckn(p text) returns boolean
language plpgsql immutable as $$
declare
  d int[];
  odd int;
  even int;
begin
  if p is null or p !~ '^[1-9][0-9]{10}$' then return false; end if;
  select array_agg(substr(p, i, 1)::int order by i) into d from generate_series(1, 11) i;
  odd := d[1] + d[3] + d[5] + d[7] + d[9];
  even := d[2] + d[4] + d[6] + d[8];
  return ((odd * 7 - even) % 10 + 10) % 10 = d[10]
     and (odd + even + d[10]) % 10 = d[11];
end $$;

-- ─── Onboarding (replaces the first version) ────────────────────────────────
drop function if exists public.complete_onboarding(text, public.app_role, boolean, boolean, text, boolean);

-- Everyone: verified phone, verified email, 18+, home address, legal consents.
-- Verification facts are read from auth.users, never trusted from the client.
create or replace function public.complete_onboarding(
  p_first_name text, p_last_name text, p_birth_date date, p_role public.app_role,
  p_district text, p_neighbourhood text, p_address text, p_details text, p_lat double precision, p_lng double precision,
  p_accept_terms boolean, p_accept_kvkk boolean, p_legal_version text, p_marketing boolean default false
) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  u record;
  v public.profiles;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  if p_role not in ('customer', 'tasker') then raise exception 'not_allowed'; end if;
  if not coalesce(p_accept_terms, false) or not coalesce(p_accept_kvkk, false) or p_legal_version is null then raise exception 'invalid_input'; end if;
  if char_length(trim(coalesce(p_first_name, ''))) < 2 or char_length(trim(coalesce(p_last_name, ''))) < 2 then raise exception 'invalid_input'; end if;
  if p_birth_date is null or p_birth_date > (current_date - interval '18 years')::date or p_birth_date < date '1920-01-01' then raise exception 'underage'; end if;
  if char_length(trim(coalesce(p_address, ''))) < 5 or char_length(trim(coalesce(p_district, ''))) < 2 then raise exception 'invalid_input'; end if;

  select phone, phone_confirmed_at, email, email_confirmed_at into u from auth.users where id = auth.uid();
  if u.phone is null or u.phone_confirmed_at is null then raise exception 'phone_unverified'; end if;
  if u.email is null or u.email_confirmed_at is null then raise exception 'email_unverified'; end if;

  update public.profiles
     set first_name = trim(p_first_name),
         last_name = trim(p_last_name),
         full_name = trim(p_first_name) || ' ' || trim(p_last_name),
         birth_date = p_birth_date,
         phone = u.phone,
         email = lower(u.email),
         phone_verified_at = u.phone_confirmed_at,
         email_verified_at = u.email_confirmed_at,
         home_district = trim(p_district),
         home_neighbourhood = nullif(trim(p_neighbourhood), ''),
         home_address = trim(p_address),
         home_details = nullif(trim(p_details), ''),
         home_lat = p_lat,
         home_lng = p_lng,
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

-- Taskers: the application the safety team reviews before approval.
create or replace function public.submit_tasker_application(
  p_national_id text, p_id_front_path text, p_selfie_path text, p_categories text[], p_has_vehicle boolean,
  p_bio text, p_criminal_record_declared boolean, p_identity_consent boolean
) returns public.tasker_profiles
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._me();
  v public.tasker_profiles;
begin
  if me.role <> 'tasker' then raise exception 'not_allowed'; end if;
  if not public._valid_tckn(p_national_id) then raise exception 'invalid_national_id'; end if;
  if not coalesce(p_criminal_record_declared, false) or not coalesce(p_identity_consent, false) then raise exception 'invalid_input'; end if;
  if p_id_front_path is null or p_id_front_path not like me.id || '/%' or p_selfie_path is null or p_selfie_path not like me.id || '/%' then raise exception 'invalid_input'; end if;
  if coalesce(array_length(p_categories, 1), 0) = 0 then raise exception 'invalid_input'; end if;
  if exists (select 1 from public.tasker_profiles where national_id = p_national_id and user_id <> me.id) then raise exception 'duplicate_national_id'; end if;
  update public.tasker_profiles
     set national_id = p_national_id,
         id_front_path = p_id_front_path,
         selfie_path = p_selfie_path,
         categories = p_categories,
         has_vehicle = coalesce(p_has_vehicle, false),
         bio = nullif(left(trim(coalesce(p_bio, '')), 280), ''),
         criminal_record_declared_at = now(),
         identity_consent_at = now(),
         application_submitted_at = now(),
         verification = case when verification in ('rejected') then 'pending' else verification end
   where user_id = me.id
  returning * into v;
  return v;
end $$;

create or replace function public.update_home_address(p_district text, p_neighbourhood text, p_address text, p_details text, p_lat double precision, p_lng double precision)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare v public.profiles;
begin
  perform public._me();
  if char_length(trim(coalesce(p_address, ''))) < 5 or char_length(trim(coalesce(p_district, ''))) < 2 then raise exception 'invalid_input'; end if;
  update public.profiles
     set home_district = trim(p_district), home_neighbourhood = nullif(trim(p_neighbourhood), ''), home_address = trim(p_address),
         home_details = nullif(trim(p_details), ''), home_lat = p_lat, home_lng = p_lng
   where id = auth.uid()
  returning * into v;
  return v;
end $$;

-- Keep email/phone verification on the profile in step with auth (e.g. after an email change).
create or replace function public.sync_verification() returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  u record;
  v public.profiles;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select phone, phone_confirmed_at, email, email_confirmed_at into u from auth.users where id = auth.uid();
  update public.profiles
     set phone = coalesce(u.phone, phone), phone_verified_at = u.phone_confirmed_at,
         email = coalesce(lower(u.email), email), email_verified_at = u.email_confirmed_at
   where id = auth.uid()
  returning * into v;
  return v;
end $$;

-- Account deletion also erases the new personal fields and the ID images' references.
create or replace function public._erase_details() returns trigger
language plpgsql as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    new.first_name := null; new.last_name := null; new.birth_date := null; new.email := null;
    new.home_district := null; new.home_neighbourhood := null; new.home_address := null; new.home_details := null;
    new.home_lat := null; new.home_lng := null;
    update public.tasker_profiles set national_id = null, id_front_path = null, selfie_path = null where user_id = new.id;
  end if;
  return new;
end $$;

create trigger profiles_erase_on_delete before update of deleted_at on public.profiles
  for each row execute function public._erase_details();

-- ─── Identity documents: private bucket, folder = <user_id>/ ────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('identity', 'identity', false, 8388608, array['image/jpeg', 'image/png', 'image/heic', 'image/webp'])
on conflict (id) do nothing;

create policy identity_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'identity' and (storage.foldername(name))[1] = auth.uid()::text);
create policy identity_read on storage.objects for select to authenticated
  using (bucket_id = 'identity' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ─── Admin: the application, for review ─────────────────────────────────────
drop function if exists public.admin_people(text, public.app_role, integer);
create or replace function public.admin_people(p_query text default null, p_role public.app_role default null, p_limit integer default 100)
returns table (id uuid, full_name text, phone text, email text, birth_date date, role public.app_role, is_banned boolean, deleted_at timestamptz, created_at timestamptz,
               phone_verified boolean, email_verified boolean, home_district text,
               verification public.tasker_verification, is_online boolean, rating_avg numeric, completed_count integer,
               national_id text, id_front_path text, selfie_path text, categories text[], has_vehicle boolean, application_submitted_at timestamptz,
               open_reports bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return query
  select p.id, p.full_name, p.phone, p.email, p.birth_date, p.role, p.is_banned, p.deleted_at, p.created_at,
         p.phone_verified_at is not null, p.email_verified_at is not null, p.home_district,
         tp.verification, tp.is_online, tp.rating_avg, tp.completed_count,
         tp.national_id, tp.id_front_path, tp.selfie_path, tp.categories, tp.has_vehicle, tp.application_submitted_at,
         (select count(*) from public.disputes d where d.subject_id = p.id and d.status in ('open', 'reviewing'))
  from public.profiles p left join public.tasker_profiles tp on tp.user_id = p.id
  where (p_role is null or p.role = p_role)
    and (p_query is null or p.full_name ilike '%' || p_query || '%' or p.phone ilike '%' || p_query || '%' or p.email ilike '%' || p_query || '%')
  order by tp.application_submitted_at desc nulls last, p.created_at desc
  limit least(greatest(p_limit, 1), 500);
end $$;

-- Approval requires a submitted application.
create or replace function public.admin_set_tasker_verification(p_user uuid, p_status public.tasker_verification, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_status = 'approved' and not exists (select 1 from public.tasker_profiles where user_id = p_user and application_submitted_at is not null) then
    raise exception 'invalid_state';
  end if;
  update public.tasker_profiles set verification = p_status, is_online = case when p_status = 'approved' then is_online else false end where user_id = p_user;
  if not found then raise exception 'invalid_input'; end if;
  perform public._audit('tasker_verification', 'profile', p_user::text, jsonb_build_object('status', p_status, 'note', p_note));
end $$;

-- ─── Grants ─────────────────────────────────────────────────────────────────
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.is_admin(),
  public._is_participant(uuid),
  public.complete_onboarding(text, text, date, public.app_role, text, text, text, text, double precision, double precision, boolean, boolean, text, boolean),
  public.submit_tasker_application(text, text, text, text[], boolean, text, boolean, boolean),
  public.update_home_address(text, text, text, text, double precision, double precision),
  public.sync_verification(),
  public.update_profile(text, text),
  public.create_task(text, text, text, integer, text, double precision, double precision, text, text),
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
