@AGENTS.md

## İlanım Var — project conventions

- Phase: Product (Design Lab approved 2026-10-25: P1, Bricolage + serif accent, pill buttons).
  The Lab stays as a dev-only tool; its compositions/prototype are still static mocks.
- Backend: `supabase/` (migrations, RLS, RPCs, Edge Functions). Clients get SELECT policies only;
  every write is a SECURITY DEFINER RPC. No new tables without explicit approval.
  Run `npm run db:check` after any migration change.
- Layers: `src/app` routes · `src/brand` identity (only place for name/colours/fonts) ·
  `src/theme` semantic tokens · `src/ui` product primitives · `src/features` · `src/i18n` · `src/lib`.
- Components use semantic tokens (`useTheme()`), never palette primitives or hex values.
- All UI text renders via `@/ui` `Text`; Turkish casing via `trUpper` (never `textTransform`).
- Copy lives in `src/i18n/tr.ts`; brand name only via `{{brand}}`.
- Motion: `useMotion()` (speed + Reduce Motion aware); write shared values with `.set()`.
- Gestures: react-native-gesture-handler v3 hook API (`usePanGesture`).
- Legal texts: `src/features/legal/documents.ts` (bump `LEGAL_VERSION` on change).
- Before finishing: `npm run typecheck && npm run lint && npm test` (+ `npm run db:check` for SQL).
