-- Marketplace rules: free social tasks, contact details blocked, rehire, auto-completion, category dispatch.
\set ON_ERROR_STOP on

\set customer '\'11111111-1111-4111-8111-111111111111\''
\set tasker '\'22222222-2222-4222-8222-222222222222\''
\set admin '\'33333333-3333-4333-8333-333333333333\''

begin;
select checks.act(:tasker);
select public.tasker_set_online(true, 39.7770, 30.5210);

select checks.act(:customer);
-- Contact details in a listing are refused
select checks.expect_error($$select public.create_task('heavy', 'Koltuk indirme', 'Beni ara 0532 123 45 67', 650, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No: 24')$$, 'contact_info_not_allowed');
select checks.expect_error($$select public.create_task('heavy', 'Koltuk indirme', 'mail: ayse@example.com', 650, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No: 24')$$, 'contact_info_not_allowed');
select checks.expect_error($$select public.create_task('heavy', 'Koltuk indirme instagram @ayse', null, 650, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No: 24')$$, 'contact_info_not_allowed');
-- Social tasks may be free and carry a start time
create temp table s1 as select public.create_task('football', 'Halısahaya 1 kişi eksik', 'Bu akşam 7v7, kaleci de olur', 0, 'Vişnelik', 39.77, 30.52, 'Vişnelik Halı Saha', null, now() + interval '3 hours') as task_id;
grant select on s1 to authenticated;
select checks.ok((select price = 0 and mode = 'planned' and scheduled_for is not null from public.tasks where id = (select task_id from s1)), 'free planned social task');
-- The seed Tasker only takes heavy/moving/assembly: no football offer
select checks.act(:tasker);
select checks.ok((select count(*) from public.tasker_offers() where task_id = (select task_id from s1)) = 0, 'category preferences respected in dispatch');

-- Rehire is allowed only with someone you completed a job with
select checks.act(:customer);
select checks.expect_error($$select public.create_task('heavy', 'Koltuk indirme', null, 650, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No: 24', null, null, '22222222-2222-4222-8222-222222222222')$$, 'not_allowed');
create temp table h1 as select public.create_task('heavy', 'Koltuk indirme', null, 650, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No: 24') as task_id;
grant select on h1 to authenticated;
select checks.act(:tasker);
select public.accept_task((select task_id from h1));
select public.tasker_arrived((select task_id from h1), 39.7767, 30.5206);
select checks.act(:customer);
create temp table hp as select public.get_task_pin((select task_id from h1)) as pin;
grant select on hp to authenticated;
select checks.act(:tasker);
select public.verify_pin((select task_id from h1), (select pin from hp));
select public.add_task_media((select task_id from h1), 'after', (select task_id from h1) || '/' || auth.uid() || '/a.jpg');
select public.submit_proof((select task_id from h1));
-- The customer never confirms: 24 h later the task closes on its own
select checks.act(null);
update public.tasks set proof_submitted_at = now() - interval '25 hours' where id = (select task_id from h1);
select public.expire_and_redispatch();
select checks.ok((select status = 'completed' from public.tasks where id = (select task_id from h1)), 'proof auto-completes after 24 h');
select checks.ok(exists (select 1 from public.task_events where task_id = (select task_id from h1) and type = 'auto_completed'), 'auto-completion logged');

-- Now the customer can rehire Mehmet: the first wave goes only to him
select checks.act(:customer);
create temp table h2 as select public.create_task('heavy', 'Yine koltuk', null, 650, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No: 24', null, null, '22222222-2222-4222-8222-222222222222') as task_id;
grant select on h2 to authenticated;
select checks.act(:tasker);
select checks.ok((select rehire from public.tasker_offers() where task_id = (select task_id from h2)), 'preferred Tasker gets the rehire offer');
select checks.act(null);
select checks.ok((select count(*) from public.task_dispatches where task_id = (select task_id from h2)) = 1, 'nobody else is offered during the rehire window');

-- Late cancellation is visible to the safety team
select checks.act(:tasker);
select public.accept_task((select task_id from h2));
select checks.act(:customer);
select public.cancel_task((select task_id from h2), 'vazgeçtim');
select checks.act(:admin);
select checks.ok((select late_cancels >= 1 from public.admin_people('Ayşe') limit 1), 'late cancel counted');
rollback;
