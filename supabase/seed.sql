-- Local development + App Store review data. Phone numbers match [auth.sms.test_otp]
-- in config.toml (code 123456). Never real people.

-- Categories ship with the schema (migration 20261026000002_marketplace.sql).

-- Demo accounts: customer, approved Tasker, admin.
insert into auth.users (instance_id, id, aud, role, phone, phone_confirmed_at, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', '905550000001', now(), 'ayse@example.com', now(), '{"provider":"phone","providers":["phone"]}', '{"full_name":"Ayşe Kaya"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', '905550000002', now(), 'mehmet@example.com', now(), '{"provider":"phone","providers":["phone"]}', '{"full_name":"Mehmet Koç"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', '905550000003', now(), 'destek@example.com', now(), '{"provider":"phone","providers":["phone"]}', '{"full_name":"Destek Ekibi"}', now(), now())
on conflict (id) do nothing;

update public.profiles set onboarded_at = now(), terms_accepted_at = now(), kvkk_accepted_at = now(), legal_version = '2026-10-26',
  first_name = split_part(full_name, ' ', 1), last_name = split_part(full_name, ' ', 2), birth_date = date '1990-05-14',
  phone_verified_at = now(), email_verified_at = now(),
  email = case id when '11111111-1111-4111-8111-111111111111' then 'ayse@example.com' when '22222222-2222-4222-8222-222222222222' then 'mehmet@example.com' else 'destek@example.com' end,
  home_district = 'Tepebaşı', home_neighbourhood = 'Hoşnudiye', home_address = 'Ahmet Kanatlı Cad. No: 24', home_details = 'Kat 3 Daire 7', home_lat = 39.7767, home_lng = 30.5206,
  role = case id when '22222222-2222-4222-8222-222222222222' then 'tasker'::public.app_role when '33333333-3333-4333-8333-333333333333' then 'admin'::public.app_role else 'customer'::public.app_role end
where id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333');

insert into public.tasker_profiles (user_id, verification, categories, last_lat, last_lng, national_id, has_vehicle, criminal_record_declared_at, identity_consent_at, application_submitted_at)
values ('22222222-2222-4222-8222-222222222222', 'approved', array['heavy', 'moving', 'assembly'], 39.7767, 30.5206, '10000000146', true, now(), now(), now())
on conflict (user_id) do nothing;
