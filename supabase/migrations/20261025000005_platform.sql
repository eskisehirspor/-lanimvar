-- İlanım Var — storage, realtime, scheduled housekeeping and function grants.

-- ─── Storage: private bucket for task media, folder = <task_id>/<uploader_id>/ ─
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('task-media', 'task-media', false, 10485760, array['image/jpeg', 'image/png', 'image/heic', 'image/webp'])
on conflict (id) do nothing;

create policy task_media_upload on storage.objects for insert to authenticated
  with check (
    bucket_id = 'task-media'
    and (storage.foldername(name))[2] = auth.uid()::text
    and public._is_participant(((storage.foldername(name))[1])::uuid)
  );

create policy task_media_read on storage.objects for select to authenticated
  using (
    bucket_id = 'task-media'
    and (public.is_admin() or public._is_participant(((storage.foldername(name))[1])::uuid)
         or exists (select 1 from public.task_assignments a where a.task_id = ((storage.foldername(name))[1])::uuid and a.tasker_id = auth.uid()))
  );

-- ─── Realtime: status changes reach the app without polling ─────────────────
-- RLS applies to postgres_changes, so each person only receives their own rows.
-- None of these rows contains a PIN; tasks rows reach only their customer.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.tasks, public.task_dispatches, public.task_events, public.task_assignments;
  end if;
end $$;

-- ─── Housekeeping every minute (pg_cron on Supabase) ────────────────────────
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('expire-and-redispatch', '* * * * *', 'select public.expire_and_redispatch()');
  end if;
exception when others then
  raise notice 'pg_cron not available: %', sqlerrm;
end $$;

-- ─── Function grants ────────────────────────────────────────────────────────
-- Nothing is callable by default; then the client API is granted explicitly.
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function
  public.is_admin(),
  public.complete_onboarding(text, public.app_role, boolean, boolean, text, boolean),
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

-- RLS policies call these helpers as the querying user.
grant execute on function public._is_participant(uuid) to authenticated;

-- Future functions start closed too.
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
