# Supabase backend

Everything the app needs lives here: schema, row-level security, RPCs, Edge Functions and seed data.

## Run locally (Docker required)

```bash
npx supabase start          # first run downloads images (~2 GB)
npx supabase db reset       # applies migrations + seed.sql
npx supabase status         # prints API URL and anon key → put them in .env
npx supabase functions serve
```

Demo accounts (code `123456`, from `[auth.sms.test_otp]`):

| Phone | Role |
|---|---|
| +90 555 000 00 01 | customer (Ayşe) |
| +90 555 000 00 02 | approved Tasker (Mehmet) |
| +90 555 000 00 03 | admin |

SMS to real numbers needs Twilio values in `.env` (see `.env.example`).

## Checks without Docker

`npm run db:check` applies every migration and the seed to a plain PostgreSQL (with a small
shim for `auth`, `vault`, `storage`) and runs `supabase/checks/*.sql`: anonymous access,
direct writes, Taskers never reading task rows, PIN secrecy and lockout, address release
rules, accept-first races, safety exit, no-show timing, blocks and account deletion.

```bash
PGHOST=... PGPORT=... PGUSER=postgres npm run db:check
```

## Deploy

```bash
npx supabase link --project-ref <ref>
npx supabase db push
npx supabase functions deploy delete-account
npx supabase functions deploy push --no-verify-jwt
npx supabase secrets set PUSH_WEBHOOK_SECRET=<random>
```

Then in the dashboard:

1. **Auth › Providers**: Phone (SMS provider + test numbers for App Review), Apple, Google.
2. **Auth › URL configuration**: add `ilanimvar://auth-callback`.
3. **Database › Webhooks** → call the `push` function with header `x-webhook-secret: <random>`:
   - `task_dispatches` on INSERT (new offer → Tasker)
   - `tasks` on UPDATE (status change → customer)
4. **Integrations › Cron**: confirm `expire-and-redispatch` runs every minute.
5. Make the first admin: `update profiles set role = 'admin' where phone = '90…';`

## Security model (short)

- RLS on every table, clients have SELECT policies only. All writes are `SECURITY DEFINER`
  RPCs that check `auth.uid()`, role and task state. Function execute rights are granted
  explicitly; everything else is closed.
- Taskers never read `tasks` rows. Offers and jobs come from `tasker_offers()` /
  `tasker_jobs()` (no address). The exact address is released only by
  `get_task_address()` to the active, non-standby, assigned Tasker while the task is live,
  and every read is logged.
- The PIN is a Vault secret `task_pin:<task_id>`: generated on acceptance, rotated on
  reassignment or after lockout, deleted at the end. Customers read it with
  `get_task_pin()`; Taskers only get yes/no from `verify_pin()`; 5 misses lock it. It never
  appears in events, pushes, Realtime payloads or logs.
- Admins read everything except PINs; reading an exact address requires a reason and is
  written to `audit_log`.
