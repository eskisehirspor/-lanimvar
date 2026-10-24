@AGENTS.md

## İlanım Var — project conventions

- Phase: Foundation + Design Lab. Lab screen compositions are static mocks, not product flows;
  do not build real customer/Tasker flows, auth, Supabase migrations or dispatch until approved.
- Layers: `src/app` routes · `src/brand` identity (only place for name/colours/fonts) ·
  `src/theme` semantic tokens · `src/ui` product primitives · `src/features` · `src/i18n` · `src/lib`.
- Components use semantic tokens (`useTheme()`), never palette primitives or hex values.
- All UI text renders via `@/ui` `Text`; Turkish casing via `trUpper` (never `textTransform`).
- Copy lives in `src/i18n/tr.ts`; brand name only via `{{brand}}`.
- Motion: `useMotion()` (speed + Reduce Motion aware); write shared values with `.set()`.
- Gestures: react-native-gesture-handler v3 hook API (`usePanGesture`).
- Before finishing: `npm run typecheck && npm run lint && npm test`.
