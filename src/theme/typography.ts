import type { TextStyle } from 'react-native';

import { fontFamilies, type TypeDirection } from '@/brand/fonts';

/**
 * Two voices with strict jobs:
 *  DISPLAY — one per screen: the question, the live status, the price, the PIN.
 *  UI      — everything else. Quiet, precise, tabular where numbers move.
 */
export type TypeVariant =
  | 'display.hero'
  | 'display.poster'
  | 'numeric.mega'
  | 'display.xl'
  | 'display.l'
  | 'display.m'
  | 'numeric.hero'
  | 'numeric.pin'
  | 'numeric.key'
  | 'title'
  | 'body.l'
  | 'body'
  | 'label'
  | 'button'
  | 'meta'
  | 'micro'
  | 'tab';

export interface TypeToken {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  tabular?: boolean;
  /** Uppercased with Turkish rules by <Text>. Never via textTransform. */
  caps?: boolean;
  voice: 'display' | 'ui';
}

type DisplayKey = 'display.hero' | 'display.poster' | 'numeric.mega' | 'display.xl' | 'display.l' | 'display.m' | 'numeric.hero' | 'numeric.pin';
type Spec = Omit<TypeToken, 'fontFamily' | 'voice'> & { weight: 'heavy' | 'bold' };

const displaySpecs: Record<TypeDirection, Record<DisplayKey, Spec>> = {
  standard: {
    // Editorial hero: one per flow moment, set tight like a magazine cover.
    'display.hero': { weight: 'heavy', fontSize: 74, lineHeight: 72, letterSpacing: -3.6 },
    // Signage moments: status as a poster, numbers that fill the width.
    'display.poster': { weight: 'heavy', fontSize: 58, lineHeight: 62, letterSpacing: -2.4 },
    'numeric.mega': { weight: 'heavy', fontSize: 96, lineHeight: 92, letterSpacing: -4.5, tabular: true },
    'display.xl': { weight: 'heavy', fontSize: 40, lineHeight: 44, letterSpacing: -1.5 },
    'display.l': { weight: 'bold', fontSize: 30, lineHeight: 34, letterSpacing: -0.9 },
    'display.m': { weight: 'bold', fontSize: 23, lineHeight: 28, letterSpacing: -0.5 },
    'numeric.hero': { weight: 'heavy', fontSize: 56, lineHeight: 62, letterSpacing: -2.2, tabular: true },
    'numeric.pin': { weight: 'bold', fontSize: 40, lineHeight: 48, letterSpacing: 0, tabular: true },
  },
  condensed: {
    'display.hero': { weight: 'heavy', fontSize: 98, lineHeight: 90, letterSpacing: -1.2 },
    'display.poster': { weight: 'heavy', fontSize: 76, lineHeight: 78, letterSpacing: -0.6 },
    'numeric.mega': { weight: 'heavy', fontSize: 128, lineHeight: 112, letterSpacing: -1.5, tabular: true },
    'display.xl': { weight: 'heavy', fontSize: 50, lineHeight: 50, letterSpacing: -0.4 },
    'display.l': { weight: 'bold', fontSize: 38, lineHeight: 40, letterSpacing: -0.2 },
    'display.m': { weight: 'bold', fontSize: 28, lineHeight: 30, letterSpacing: 0 },
    'numeric.hero': { weight: 'heavy', fontSize: 68, lineHeight: 70, letterSpacing: -0.6, tabular: true },
    'numeric.pin': { weight: 'bold', fontSize: 50, lineHeight: 56, letterSpacing: 0, tabular: true },
  },
};

const ui = fontFamilies.ui;
const uiSpecs: Record<Exclude<TypeVariant, DisplayKey>, TypeToken> = {
  'numeric.key': { fontFamily: ui.medium, fontSize: 28, lineHeight: 34, letterSpacing: -0.2, tabular: true, voice: 'ui' },
  title: { fontFamily: ui.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.25, voice: 'ui' },
  'body.l': { fontFamily: ui.regular, fontSize: 17, lineHeight: 24, letterSpacing: -0.15, voice: 'ui' },
  body: { fontFamily: ui.regular, fontSize: 15, lineHeight: 21, letterSpacing: -0.05, voice: 'ui' },
  label: { fontFamily: ui.semibold, fontSize: 15, lineHeight: 20, letterSpacing: -0.1, voice: 'ui' },
  button: { fontFamily: ui.semibold, fontSize: 16, lineHeight: 20, letterSpacing: -0.15, voice: 'ui' },
  meta: { fontFamily: ui.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0, tabular: true, voice: 'ui' },
  micro: { fontFamily: ui.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, caps: true, voice: 'ui' },
  tab: { fontFamily: ui.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.1, voice: 'ui' },
};

export type TypeScale = Record<TypeVariant, TypeToken>;

export function buildTypeScale(direction: TypeDirection, textScale: number): TypeScale {
  const families = fontFamilies.display[direction];
  const scaled = (t: TypeToken): TypeToken => ({
    ...t,
    fontSize: Math.round(t.fontSize * textScale),
    lineHeight: Math.round(t.lineHeight * textScale),
    letterSpacing: +(t.letterSpacing * textScale).toFixed(2),
  });
  const out = {} as TypeScale;
  for (const [key, { weight, ...spec }] of Object.entries(displaySpecs[direction])) {
    out[key as TypeVariant] = scaled({ ...spec, fontFamily: families[weight], voice: 'display' });
  }
  for (const [key, token] of Object.entries(uiSpecs)) out[key as TypeVariant] = scaled(token);
  return out;
}

export function toTextStyle(t: TypeToken): TextStyle {
  return {
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    fontVariant: t.tabular ? ['tabular-nums'] : undefined,
    // Weight lives in the family file; never let the platform synthesize bold.
    fontWeight: 'normal',
  };
}
