-- Sign-up rules: verified phone and email, legal age, address, Tasker application.
\set ON_ERROR_STOP on

begin;
insert into auth.users (id, phone, phone_confirmed_at, email, email_confirmed_at) values
  ('55555555-5555-4555-8555-555555555555', '905550000005', now(), null, null),
  ('66666666-6666-4666-8666-666666666666', '905550000006', now(), 'kaan@example.com', now());

select checks.act('55555555-5555-4555-8555-555555555555');
-- Email not verified yet → refused
select checks.expect_error($$select public.complete_onboarding('Ece', 'Demir', date '1995-03-02', 'customer', 'Odunpazarı', 'Vişnelik', 'Atatürk Blv. No: 5', null, 39.77, 30.52, true, true, 'v')$$, 'email_unverified');
select checks.act(null);
update auth.users set email = 'ece@example.com', email_confirmed_at = now() where id = '55555555-5555-4555-8555-555555555555';
select checks.act('55555555-5555-4555-8555-555555555555');
-- Under 18 → refused
select checks.expect_error($$select public.complete_onboarding('Ece', 'Demir', (current_date - interval '17 years')::date, 'customer', 'Odunpazarı', 'Vişnelik', 'Atatürk Blv. No: 5', null, 39.77, 30.52, true, true, 'v')$$, 'underage');
-- Missing address → refused
select checks.expect_error($$select public.complete_onboarding('Ece', 'Demir', date '1995-03-02', 'customer', 'Odunpazarı', 'Vişnelik', '', null, 39.77, 30.52, true, true, 'v')$$, 'invalid_input');
select public.complete_onboarding('Ece', 'Demir', date '1995-03-02', 'customer', 'Odunpazarı', 'Vişnelik', 'Atatürk Blv. No: 5', 'Kat 2', 39.77, 30.52, true, true, 'v');
select checks.ok((select full_name = 'Ece Demir' and email = 'ece@example.com' and phone_verified_at is not null and email_verified_at is not null and home_district = 'Odunpazarı' from public.profiles where id = auth.uid()), 'profile completed with verified contacts');

-- Tasker application: valid T.C. kimlik no, own-folder images, declarations
select checks.act('66666666-6666-4666-8666-666666666666');
select public.complete_onboarding('Kaan', 'Öz', date '1992-07-21', 'tasker', 'Tepebaşı', 'Hoşnudiye', 'Ahmet Kanatlı Cad. No: 3', null, 39.77, 30.52, true, true, 'v');
select checks.expect_error($$select public.submit_tasker_application('12345678901', auth.uid() || '/id.jpg', auth.uid() || '/selfie.jpg', array['heavy'], true, null, true, true)$$, 'invalid_national_id');
select checks.expect_error($$select public.submit_tasker_application('10000000146', 'someone/id.jpg', auth.uid() || '/selfie.jpg', array['heavy'], true, null, true, true)$$, 'invalid_input');
select checks.expect_error($$select public.submit_tasker_application('10000000146', auth.uid() || '/id.jpg', auth.uid() || '/selfie.jpg', array['heavy'], true, null, false, true)$$, 'invalid_input');
-- The seed Tasker already uses 10000000146
select checks.expect_error($$select public.submit_tasker_application('10000000146', auth.uid() || '/id.jpg', auth.uid() || '/selfie.jpg', array['heavy'], true, null, true, true)$$, 'duplicate_national_id');
select public.submit_tasker_application('11111111110', auth.uid() || '/id.jpg', auth.uid() || '/selfie.jpg', array['heavy', 'moving'], true, 'Düzenli ve dikkatliyim.', true, true);
select checks.ok((select verification = 'pending' and application_submitted_at is not null from public.tasker_profiles where user_id = auth.uid()), 'application submitted, awaiting review');
select checks.expect_error($$select public.tasker_set_online(true, 39.77, 30.52)$$, 'not_allowed');

-- Customers cannot see a Tasker's national id; admins can, through the review list
select checks.act('11111111-1111-4111-8111-111111111111');
select checks.ok((select count(*) from public.tasker_profiles where user_id = '66666666-6666-4666-8666-666666666666') = 0, 'customer cannot read tasker profile');
select checks.act('33333333-3333-4333-8333-333333333333');
select checks.ok((select national_id = '11111111110' from public.admin_people('Kaan') limit 1), 'admin sees the application');
select public.admin_set_tasker_verification('66666666-6666-4666-8666-666666666666', 'approved');

-- Deleting the account erases the new personal fields too
select checks.act('66666666-6666-4666-8666-666666666666');
select public.delete_my_account();
select checks.act(null);
select checks.ok((select birth_date is null and email is null and home_address is null from public.profiles where id = '66666666-6666-4666-8666-666666666666'), 'details erased');
select checks.ok((select national_id is null and selfie_path is null from public.tasker_profiles where user_id = '66666666-6666-4666-8666-666666666666'), 'identity references erased');
rollback;
