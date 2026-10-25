-- Local development + App Store review data. Phone numbers match [auth.sms.test_otp]
-- in config.toml (code 123456). Never real people.

insert into public.pricing_rules (category, label, recommended_price, min_price, max_price) values
  ('heavy', 'Ağır eşya', 650, 300, 3000),
  ('moving', 'Taşıma', 900, 400, 6000),
  ('assembly', 'Montaj', 450, 200, 2500),
  ('shopping', 'Alışveriş', 250, 150, 1500),
  ('cleaning', 'Temizlik', 700, 300, 4000),
  ('repair', 'Küçük tamir', 400, 200, 2500)
on conflict (category) do nothing;

-- Demo accounts: customer, approved Tasker, admin.
insert into auth.users (instance_id, id, aud, role, phone, phone_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', '905550000001', now(), '{"provider":"phone","providers":["phone"]}', '{"full_name":"Ayşe Kaya"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', '905550000002', now(), '{"provider":"phone","providers":["phone"]}', '{"full_name":"Mehmet Koç"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', '905550000003', now(), '{"provider":"phone","providers":["phone"]}', '{"full_name":"Destek Ekibi"}', now(), now())
on conflict (id) do nothing;

update public.profiles set onboarded_at = now(), terms_accepted_at = now(), kvkk_accepted_at = now(), legal_version = '2026-10-25',
  role = case id when '22222222-2222-4222-8222-222222222222' then 'tasker'::public.app_role when '33333333-3333-4333-8333-333333333333' then 'admin'::public.app_role else 'customer'::public.app_role end
where id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333');

insert into public.tasker_profiles (user_id, verification, categories, last_lat, last_lng)
values ('22222222-2222-4222-8222-222222222222', 'approved', array['heavy', 'moving', 'assembly'], 39.7767, 30.5206)
on conflict (user_id) do nothing;
