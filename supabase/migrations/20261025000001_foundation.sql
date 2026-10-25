-- İlanım Var — foundation: identities, tasks and their satellites.
--
-- Principles
--  * Every table has RLS on. Clients get SELECT policies only; every write goes
--    through a SECURITY DEFINER RPC that checks who is asking and what state the
--    task is in. Nothing trusts the client.
--  * Taskers never SELECT raw task rows: exact_address lives in tasks and is
--    released only through get_task_address() to the active, assigned Tasker.
--  * The PIN is never stored here: it is a Vault secret named task_pin:<task_id>.

create extension if not exists pgcrypto with schema extensions;

-- ─── Enums ──────────────────────────────────────────────────────────────────
create type public.app_role as enum ('customer', 'tasker', 'admin');
create type public.task_mode as enum ('now', 'planned');
create type public.task_status as enum (
  'draft', 'searching', 'assigned', 'en_route', 'arrived', 'in_progress',
  'proof_submitted', 'completed', 'cancelled', 'expired', 'no_show_customer', 'disputed'
);
create type public.tasker_verification as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.assignment_status as enum ('active', 'released', 'completed');
create type public.dispatch_status as enum ('offered', 'accepted', 'declined', 'expired', 'superseded');
create type public.media_kind as enum ('task', 'before', 'after', 'arrival', 'incident');
create type public.dispute_kind as enum ('incident', 'dispute', 'report', 'no_show');
create type public.dispute_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- ─── Helpers ────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ─── People ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text check (char_length(full_name) between 2 and 60),
  phone text,
  avatar_url text,
  push_token text,
  onboarded_at timestamptz,
  terms_accepted_at timestamptz,
  kvkk_accepted_at timestamptz,
  -- Which version of the legal texts this person accepted (evidence of consent).
  legal_version text,
  -- Optional explicit consent (KVKK açık rıza) for marketing messages; never required to use the app.
  marketing_consent_at timestamptz,
  is_banned boolean not null default false,
  banned_reason text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.profiles.push_token is 'Expo push token. Pushes never carry PINs or exact addresses.';

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create table public.tasker_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  verification public.tasker_verification not null default 'pending',
  bio text check (char_length(bio) <= 280),
  categories text[] not null default '{}',
  is_online boolean not null default false,
  last_lat double precision,
  last_lng double precision,
  last_seen_at timestamptz,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  completed_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tasker_profiles_touch before update on public.tasker_profiles
  for each row execute function public.touch_updated_at();

-- A profile row for every auth user, created by the database (never the client).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, full_name)
  values (
    new.id,
    new.phone,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 60), '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and not is_banned);
$$;

-- ─── Pricing ────────────────────────────────────────────────────────────────
create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  label text not null,
  recommended_price integer not null check (recommended_price > 0),
  min_price integer not null check (min_price > 0),
  max_price integer not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  check (min_price <= recommended_price and recommended_price <= max_price)
);

create trigger pricing_rules_touch before update on public.pricing_rules
  for each row execute function public.touch_updated_at();

-- ─── Tasks ──────────────────────────────────────────────────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id),
  mode public.task_mode not null default 'now',
  category text not null,
  title text not null check (char_length(title) between 4 and 120),
  description text check (char_length(description) <= 1000),
  price integer not null check (price > 0),
  status public.task_status not null default 'searching',
  -- Approximate location: rounded (~110 m) and labelled by neighbourhood. Safe for discovery.
  approx_label text not null,
  approx_lat double precision not null,
  approx_lng double precision not null,
  -- Exact location: never in discovery; released by get_task_address() only.
  exact_address text not null check (char_length(exact_address) between 5 and 300),
  exact_details text check (char_length(exact_details) <= 300),
  exact_lat double precision,
  exact_lng double precision,
  scheduled_for timestamptz,
  team_size integer not null default 1 check (team_size = 1),
  searching_since timestamptz,
  first_accepted_at timestamptz,
  arrived_at timestamptz,
  started_at timestamptz,
  proof_submitted_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_customer_idx on public.tasks (customer_id, created_at desc);
create index tasks_status_idx on public.tasks (status, created_at desc);

create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

create table public.task_teams (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks (id) on delete cascade,
  size integer not null default 1 check (size >= 1),
  created_at timestamptz not null default now()
);

create table public.task_team_slots (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.task_teams (id) on delete cascade,
  slot_index integer not null check (slot_index >= 0),
  role text not null default 'worker',
  unique (team_id, slot_index)
);

create table public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  slot_id uuid not null references public.task_team_slots (id) on delete cascade,
  tasker_id uuid not null references public.profiles (id),
  status public.assignment_status not null default 'active',
  is_standby boolean not null default false,
  accepted_at timestamptz not null default now(),
  released_at timestamptz,
  release_reason text
);

-- One active assignment per slot; a Tasker holds at most one active job.
create unique index task_assignments_active_slot on public.task_assignments (slot_id) where status = 'active' and not is_standby;
create unique index task_assignments_active_tasker on public.task_assignments (tasker_id) where status = 'active' and not is_standby;
create index task_assignments_task_idx on public.task_assignments (task_id);

create table public.task_dispatches (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  tasker_id uuid not null references public.profiles (id),
  status public.dispatch_status not null default 'offered',
  distance_m integer,
  offered_at timestamptz not null default now(),
  expires_at timestamptz not null,
  responded_at timestamptz,
  unique (task_id, tasker_id)
);

create index task_dispatches_tasker_idx on public.task_dispatches (tasker_id, status);

-- Lifecycle and audit trail for a task. Data NEVER contains a PIN or an exact address.
create table public.task_events (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  actor_id uuid references public.profiles (id),
  type text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index task_events_task_idx on public.task_events (task_id, id);

create table public.task_media (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  uploader_id uuid not null references public.profiles (id),
  kind public.media_kind not null,
  storage_path text not null unique,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  subject_id uuid not null references public.profiles (id),
  rating integer not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique (task_id, author_id)
);

-- Incidents (safety), disputes, user reports and no-show reviews: one moderation queue.
create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks (id) on delete set null,
  reporter_id uuid references public.profiles (id),
  subject_id uuid references public.profiles (id),
  kind public.dispute_kind not null,
  status public.dispute_status not null default 'open',
  reason text not null,
  details text check (char_length(details) <= 2000),
  resolution text,
  resolved_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index disputes_queue_idx on public.disputes (status, created_at desc);

-- App Store 1.2 (user-generated content): people can block each other.
create table public.user_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- Who did what outside a task (admin actions, account deletion, sensitive reads).
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id),
  action text not null,
  target_type text not null,
  target_id text,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ─── RLS: select-only policies; writes go through RPCs ──────────────────────
alter table public.profiles enable row level security;
alter table public.tasker_profiles enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.tasks enable row level security;
alter table public.task_teams enable row level security;
alter table public.task_team_slots enable row level security;
alter table public.task_assignments enable row level security;
alter table public.task_dispatches enable row level security;
alter table public.task_events enable row level security;
alter table public.task_media enable row level security;
alter table public.reviews enable row level security;
alter table public.disputes enable row level security;
alter table public.user_blocks enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_self on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy tasker_profiles_self on public.tasker_profiles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy pricing_read on public.pricing_rules for select to authenticated using (active or public.is_admin());

-- Customers see their own tasks (their own address included). Taskers have NO policy here.
create policy tasks_customer on public.tasks for select to authenticated using (customer_id = auth.uid() or public.is_admin());

create policy teams_read on public.task_teams for select to authenticated
  using (public.is_admin() or exists (select 1 from public.tasks t where t.id = task_id and t.customer_id = auth.uid()));
create policy slots_read on public.task_team_slots for select to authenticated
  using (public.is_admin() or exists (
    select 1 from public.task_teams tt join public.tasks t on t.id = tt.task_id where tt.id = team_id and t.customer_id = auth.uid()));

create policy assignments_read on public.task_assignments for select to authenticated
  using (tasker_id = auth.uid() or public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.customer_id = auth.uid()));

create policy dispatches_own on public.task_dispatches for select to authenticated using (tasker_id = auth.uid() or public.is_admin());

create policy events_participants on public.task_events for select to authenticated
  using (public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.customer_id = auth.uid())
    or exists (select 1 from public.task_assignments a where a.task_id = task_events.task_id and a.tasker_id = auth.uid()));

create policy media_participants on public.task_media for select to authenticated
  using (public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.customer_id = auth.uid())
    or exists (select 1 from public.task_assignments a where a.task_id = task_media.task_id and a.tasker_id = auth.uid()));

create policy reviews_read on public.reviews for select to authenticated using (author_id = auth.uid() or subject_id = auth.uid() or public.is_admin());
create policy disputes_read on public.disputes for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
create policy blocks_own on public.user_blocks for select to authenticated using (blocker_id = auth.uid() or public.is_admin());
create policy audit_admin on public.audit_log for select to authenticated using (public.is_admin());

-- Belt and braces: anon reads nothing, and no client role writes tables directly.
revoke all on all tables in schema public from anon;
revoke insert, update, delete, truncate on all tables in schema public from authenticated;
grant select on all tables in schema public to authenticated;
