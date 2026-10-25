-- Security & lifecycle checks. Each block acts as a real role (authenticated)
-- with a real auth.uid(); any failed expectation aborts the run.
\set ON_ERROR_STOP on
create schema if not exists checks;

create or replace function checks.act(p_uid uuid) returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), true);
  if p_uid is not null then perform set_config('role', 'authenticated', true); end if;
end $$;

create or replace function checks.expect_error(p_sql text, p_message text) returns void language plpgsql as $$
begin
  execute p_sql;
  raise exception 'expected error "%" from: %', p_message, p_sql;
exception when others then
  if sqlerrm not like '%' || p_message || '%' then raise exception 'expected "%" but got "%" from: %', p_message, sqlerrm, p_sql; end if;
end $$;

create or replace function checks.ok(p_cond boolean, p_what text) returns void language plpgsql as $$
begin
  if not coalesce(p_cond, false) then raise exception 'check failed: %', p_what; end if;
end $$;

grant usage on schema checks to authenticated, anon;
grant execute on all functions in schema checks to authenticated, anon;

-- A second approved Tasker, close by, for race and reassignment checks.
insert into auth.users (id, phone, raw_user_meta_data) values ('44444444-4444-4444-8444-444444444444', '905550000004', '{"full_name":"Selin Ak"}');
update public.profiles set onboarded_at = now(), role = 'tasker' where id = '44444444-4444-4444-8444-444444444444';
insert into public.tasker_profiles (user_id, verification) values ('44444444-4444-4444-8444-444444444444', 'approved');

\set customer '\'11111111-1111-4111-8111-111111111111\''
\set tasker '\'22222222-2222-4222-8222-222222222222\''
\set admin '\'33333333-3333-4333-8333-333333333333\''
\set tasker2 '\'44444444-4444-4444-8444-444444444444\''

begin;
-- ── Anonymous callers can do nothing ──
select checks.act(null);
set local role anon;
select checks.expect_error($$select public.tasker_offers()$$, 'permission denied');
select checks.expect_error($$select count(*) from public.tasks$$, 'permission denied');
reset role;

-- ── Nobody writes tables directly ──
select checks.act(:customer);
select checks.expect_error($$insert into public.tasks (customer_id, category, title, price, approx_label, approx_lat, approx_lng, exact_address) values (auth.uid(), 'heavy', 'test task', 500, 'x', 1, 1, 'street 12')$$, 'permission denied');
select checks.expect_error($$update public.profiles set role = 'admin' where id = auth.uid()$$, 'permission denied');
select checks.expect_error($$select public._set_pin(gen_random_uuid(), 'generated')$$, 'permission denied');
select checks.expect_error($$select public.admin_metrics()$$, 'not_allowed');
select checks.expect_error($$select public.complete_onboarding('Ayşe', 'Kaya', date '1990-01-01', 'admin', 'Tepebaşı', null, 'Bir adres 12', null, null, null, true, true, 'v1')$$, 'not_allowed');

-- ── Taskers go online; the customer creates a task; it is offered ──
select checks.act(:tasker);
select public.tasker_set_online(true, 39.7770, 30.5210);
select checks.act(:tasker2);
select public.tasker_set_online(true, 39.7800, 30.5150);

select checks.act(:customer);
select checks.expect_error($$select public.create_task('heavy', 'Koltuk indirme', null, 100, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No 24')$$, 'invalid_input');
create temp table t_ctx as select public.create_task('heavy', 'İki kişilik koltuğu indirme', '3. kat, asansör yok', 650, 'Hoşnudiye', 39.77671, 30.52063, 'Ahmet Kanatlı Cad. No: 24', 'Kat 3 Daire 7') as task_id;
grant select on t_ctx to authenticated;
select checks.ok((select approx_lat from public.tasks where id = (select task_id from t_ctx)) = 39.777, 'approximate location is rounded');

-- ── Taskers never read raw task rows, but see the safe offer card ──
select checks.act(:tasker);
select checks.ok((select count(*) from public.tasks) = 0, 'tasker cannot select tasks');
select checks.ok((select count(*) from public.tasker_offers() o where o.task_id = (select task_id from t_ctx)) = 1, 'tasker sees the offer');
select checks.expect_error($$select * from public.get_task_address((select task_id from t_ctx))$$, 'not_allowed');
select checks.expect_error($$select public.get_task_pin((select task_id from t_ctx))$$, 'not_allowed');

-- ── Accept-first: one wins, the other is told it is taken ──
select public.accept_task((select task_id from t_ctx));
select checks.act(:tasker2);
select checks.expect_error($$select public.accept_task((select task_id from t_ctx))$$, 'already_taken');
select checks.expect_error($$select * from public.get_task_address((select task_id from t_ctx))$$, 'not_allowed');

-- ── The PIN: customer reads it, nobody else; it is a Vault secret, never in events ──
select checks.act(:customer);
create temp table pin_ctx as select public.get_task_pin((select task_id from t_ctx)) as pin;
grant select on pin_ctx to authenticated;
select checks.ok((select pin ~ '^[0-9]{6}$' from pin_ctx), 'PIN has 6 digits');
select checks.ok(not exists (select 1 from public.task_events where data::text like '%' || (select pin from pin_ctx) || '%'), 'PIN never appears in events');
select checks.ok(not exists (select 1 from public.tasks where to_jsonb(tasks)::text like '%' || (select pin from pin_ctx) || '%'), 'PIN never stored on the task row');

-- ── Exact address: only the assigned Tasker, only while active, and it is logged ──
select checks.act(:tasker);
select checks.ok((select exact_address from public.get_task_address((select task_id from t_ctx))) like 'Ahmet Kanatlı%', 'assigned tasker gets the address');
select checks.ok(exists (select 1 from public.task_events where task_id = (select task_id from t_ctx) and type = 'address_viewed'), 'address view logged');

-- PIN cannot be tried before arrival
select checks.expect_error($$select public.verify_pin((select task_id from t_ctx), '000000')$$, 'invalid_state');
select public.tasker_start_route((select task_id from t_ctx));
select public.tasker_arrived((select task_id from t_ctx), 39.77675, 30.52070);
select checks.ok((select (data->>'distance_m')::int < 50 from public.task_events where task_id = (select task_id from t_ctx) and type = 'arrived'), 'arrival evidence records distance to the door');

-- ── 5 wrong PINs lock it; the customer rotates; the right one starts the job ──
select checks.ok(not public.verify_pin((select task_id from t_ctx), '999999x'), 'malformed PIN is rejected');
select checks.ok(not public.verify_pin((select task_id from t_ctx), case when (select pin from pin_ctx) = '000001' then '000002' else '000001' end), 'wrong PIN 2');
select checks.ok(not public.verify_pin((select task_id from t_ctx), case when (select pin from pin_ctx) = '000003' then '000004' else '000003' end), 'wrong PIN 3');
select checks.ok(not public.verify_pin((select task_id from t_ctx), case when (select pin from pin_ctx) = '000005' then '000006' else '000005' end), 'wrong PIN 4');
select checks.ok(not public.verify_pin((select task_id from t_ctx), case when (select pin from pin_ctx) = '000007' then '000008' else '000007' end), 'wrong PIN 5');
select checks.expect_error($$select public.verify_pin((select task_id from t_ctx), (select pin from pin_ctx))$$, 'pin_locked');
select checks.act(:customer);
select public.rotate_pin((select task_id from t_ctx));
create temp table pin2 as select public.get_task_pin((select task_id from t_ctx)) as pin;
grant select on pin2 to authenticated;
select checks.act(:tasker);
select checks.ok(public.verify_pin((select task_id from t_ctx), (select pin from pin2)), 'right PIN after rotation starts the job');
select checks.ok((select count(*) from public.tasker_jobs() where status = 'in_progress') = 1, 'job is in progress');

-- ── Proof needs an "after" photo; completion deletes the PIN ──
select checks.expect_error($$select public.submit_proof((select task_id from t_ctx))$$, 'invalid_input');
select checks.expect_error($$select public.add_task_media((select task_id from t_ctx), 'after', 'someone-else/path.jpg')$$, 'invalid_input');
select public.add_task_media((select task_id from t_ctx), 'after', (select task_id from t_ctx) || '/' || auth.uid() || '/after-1.jpg');
select public.submit_proof((select task_id from t_ctx));
select checks.act(:customer);
select public.confirm_completion((select task_id from t_ctx));
select checks.act(null);
select checks.ok(not exists (select 1 from vault.secrets where name = 'task_pin:' || (select task_id from t_ctx)), 'PIN deleted at task end');
select checks.act(:tasker);
select checks.expect_error($$select * from public.get_task_address((select task_id from t_ctx))$$, 'not_allowed');

-- ── Reviews update the Tasker's rating ──
select checks.act(:customer);
select public.leave_review((select task_id from t_ctx), 5, 'Çok özenliydi');
select checks.expect_error($$select public.leave_review((select task_id from t_ctx), 4)$$, 'duplicate key');
select checks.act(null);
select checks.ok((select rating_avg = 5 and completed_count = 1 from public.tasker_profiles where user_id = :tasker), 'rating and count updated');

-- ── Admin sees the metric and the audit trail ──
select checks.act(:admin);
select checks.ok((select tasks_accepted >= 1 and accept_p50_s is not null from public.admin_metrics()), 'admin metrics');
select checks.ok((select count(*) from public.tasks) >= 1, 'admin reads tasks');
select checks.expect_error($$select * from public.admin_task_address((select task_id from t_ctx), 'x')$$, 'invalid_input');
select checks.ok((select count(*) from public.admin_task_address((select task_id from t_ctx), 'Güvenlik vakası incelemesi')) = 1, 'admin reads address with a reason');
select checks.ok(exists (select 1 from public.audit_log where action = 'address_viewed'), 'admin address read audited');
rollback;

begin;
-- ── Safety: unsafe exit re-dispatches, destroys the PIN, opens an incident ──
select checks.act(:tasker);
select public.tasker_set_online(true, 39.7770, 30.5210);
select checks.act(:tasker2);
select public.tasker_set_online(true, 39.7800, 30.5150);
select checks.act(:customer);
create temp table t2 as select public.create_task('assembly', 'Dolap montajı', null, 450, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No: 24') as task_id;
grant select on t2 to authenticated;
select checks.act(:tasker);
select public.accept_task((select task_id from t2));
select public.safety_checkin((select task_id from t2));
select public.release_task((select task_id from t2), 'unsafe');
select checks.act(:customer);
select checks.ok((select status = 'searching' from public.tasks where id = (select task_id from t2)), 'released task searches again');
select checks.expect_error($$select public.get_task_pin((select task_id from t2))$$, 'not_allowed');
select checks.act(:tasker2);
select checks.ok((select count(*) from public.tasker_offers() where task_id = (select task_id from t2)) = 1, 'second tasker still holds a live offer');
select public.accept_task((select task_id from t2));
select checks.act(:customer);
select checks.ok((select public.get_task_pin((select task_id from t2)) ~ '^[0-9]{6}$'), 'new PIN issued on reassignment');
select checks.act(null);
select checks.ok(exists (select 1 from public.disputes where task_id = (select task_id from t2) and kind = 'incident' and reason = 'unsafe_place'), 'unsafe exit opens an incident');
select checks.ok(exists (select 1 from public.task_events where task_id = (select task_id from t2) and type = 'pin_rotated'), 'reassignment rotates the PIN');

-- ── No-show only after 10 minutes at the door ──
select checks.act(:tasker2);
select public.tasker_arrived((select task_id from t2), 39.7767, 30.5206);
select checks.expect_error($$select public.report_customer_no_show((select task_id from t2))$$, 'too_early');
select checks.act(null);
update public.tasks set arrived_at = now() - interval '11 minutes' where id = (select task_id from t2);
select checks.act(:tasker2);
select public.report_customer_no_show((select task_id from t2));
select checks.act(null);
select checks.ok(exists (select 1 from public.disputes where task_id = (select task_id from t2) and kind = 'no_show'), 'no-show goes to review');

-- ── Blocks keep people apart in dispatch ──
select checks.act(:customer);
select public.block_user(:tasker2);
create temp table t3 as select public.create_task('shopping', 'Market alışverişi', null, 250, 'Hoşnudiye', 39.7767, 30.5206, 'Ahmet Kanatlı Cad. No: 24') as task_id;
grant select on t3 to authenticated;
select checks.act(:tasker2);
select checks.ok((select count(*) from public.tasker_offers() where task_id = (select task_id from t3)) = 0, 'blocked tasker gets no offer');

-- ── Account deletion erases personal data and cancels open tasks ──
select checks.act(:customer);
select public.delete_my_account();
select checks.act(null);
select checks.ok((select full_name is null and phone is null and deleted_at is not null from public.profiles where id = :customer), 'personal data erased');
select checks.ok((select status = 'cancelled' from public.tasks where id = (select task_id from t3)), 'open task cancelled on deletion');
select checks.act(:customer);
select checks.expect_error($$select public.create_task('heavy', 'Başka iş', null, 650, 'X', 39.7, 30.5, 'Bir adres 12')$$, 'not_signed_in');
rollback;
