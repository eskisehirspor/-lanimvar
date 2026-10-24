# İlanım Var

Local task marketplace, launching in Eskişehir. *İşini bekletme. Hallet.*

**Phase: Foundation + Design Lab.** Visual quality is approved in the Lab
before any real product screen is built. No auth, backend tables or dispatch yet.

## Open the Design Lab on an iPhone

All native modules used here ship in **Expo Go (SDK 58)**.

1. Install **Expo Go** from the App Store.
2. `npm install` then `npx expo start` (add `--tunnel` if the phone is on another network).
3. Scan the QR code with the iPhone camera.
4. Tap **Tasarım Laboratuvarı**.

Browser: `npx expo start --web`, then open `/lab`. On a Mac, press `i` for the iOS Simulator.

The Lab exists only in development builds, or in a preview build with `EXPO_PUBLIC_DESIGN_LAB=1`.

| Section | What to judge |
|---|---|
| Ekranlar | 10 full-screen compositions: voice + photo task creation, price dial, night searching and tracking, PIN ticket, swipe-to-accept offer, brand-flood "accepted" and "done" moments — static mocks built only from product primitives |
| Karşılaştır | 3 palettes × 2 type directions × 2 button shapes, four real screens side by side per combination |
| Hareket | 11 transitions, each playable alone with its product reason |
| Bileşenler | Every primitive in every state; sheets and emergency are live |
| Tipografi · Renk · Marka | Scale, Turkish stress tests, live WCAG checks, wordmark and icon concepts |

The floating button (bottom right) opens palette / type / button shape, speed (1×, ½×, ¼×),
Reduce Motion, text size (100/130/160 %) and haptics.

## Architecture

```
src/
  app/        routes only (Expo Router); lab/ is dev-only (Stack.Protected)
  brand/      the ONLY place for name, palettes, fonts, wordmark, mark, native assets
  theme/      semantic tokens: colour roles, type scale, spacing, radii, motion, a11y
  ui/         product primitives (each has a product job)
  features/   task/ (lifecycle contract), lab/ (Design Lab tooling and compositions)
  i18n/       Turkish-first copy, Turkish casing, number formatting
  lib/        supabase (placeholder), query client, session store, haptics
```

Guardrails (lint + tests): no raw colours outside brand/theme; no hard-coded brand name;
no `textTransform`; no React Native `<Text>` outside `ui/Text`; every text role passes WCAG AA
in all three palettes; copy never promises absolute safety.

Rebrand: edit `src/brand/*`, then `npm run brand:wordmark` and `npm run brand:icons`.

```bash
npm run typecheck && npm run lint && npm test
```
