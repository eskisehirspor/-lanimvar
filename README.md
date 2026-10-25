# İlanım Var

Local task marketplace, launching in Eskişehir. *İşini bekletme. Hallet.*

Customers post a job (“Şimdi lazım”), nearby verified Taskers get it, the first to accept
wins. The exact address is revealed only to that Tasker, a 6-digit PIN at the door starts the
job, photos prove it, the customer confirms and pays in cash. Safety (Güvendeyim, Sorun var,
Görevi bırak, 112) is part of every live screen.

## Run it on your phone (Expo Go)

```bash
npm install
cp .env.example .env          # fill EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY (see below)
npx expo start --tunnel       # scan the QR with the iPhone camera
```

Without Supabase values the app opens a setup screen (and, in development, the Design Lab
prototype at `/lab/prototype`).

### Backend

Local (Docker): `npx supabase start && npx supabase db reset`, then copy the URL and anon key
from `npx supabase status` into `.env`. Demo logins use code `123456`:
`+90 555 000 00 01` customer · `…02` Tasker · `…03` admin. Details: [`supabase/README.md`](supabase/README.md).

Hosted: create a Supabase project (region Frankfurt), `npx supabase link`, `npx supabase db push`,
deploy the two Edge Functions, set providers — all steps in `supabase/README.md`.

### Admin panel

Same codebase, web: `npx expo start --web` and open `/admin` with an admin account, or build a
static site with `npm run web:admin` (`dist/web`). Legal pages are public at `/legal/<doc>`
(use `/legal/policy` as the store privacy URL).

## Release

- App Store / Play checklist, privacy labels and review notes: [`docs/APP_STORE.md`](docs/APP_STORE.md)
- Legal model (intermediary platform) and launch obligations: [`docs/LEGAL.md`](docs/LEGAL.md)
- Builds: `npx eas-cli@latest build --profile production` (see `eas.json`)

## Architecture

```
src/
  app/        routes (Expo Router), gated by auth state in app/_layout.tsx:
              (setup) · (auth) · onboarding · banned · (app) customer+Tasker · admin · legal · lab (dev)
  brand/      the ONLY place for name, palettes, fonts, wordmark, clay materials, native assets
  theme/      semantic tokens: colour roles, type scale, spacing, radii, motion, a11y
  ui/         product primitives (each has a product job)
  features/   app shell, customer, tasker, admin, legal texts, task lifecycle, Design Lab
  i18n/       Turkish-first copy, Turkish casing, number formatting
  lib/        supabase client, typed RPC API, auth, location, push, haptics
supabase/     migrations (schema, RLS, RPCs), Edge Functions, seed, SQL security checks
```

Guardrails (lint + tests): no raw colours outside brand/theme; no hard-coded brand name;
no `textTransform`; no React Native `<Text>` outside `ui/Text`; every text role passes WCAG AA;
copy never promises absolute safety; database security checks for PIN, address, races,
safety exits and deletion.

```bash
npm run typecheck && npm run lint && npm test && npm run db:check
```

The Design Lab (dev builds only) keeps the visual system: `/lab` and the interactive
prototype at `/lab/prototype`.
