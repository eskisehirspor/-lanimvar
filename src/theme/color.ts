import type { PalettePrimitives } from '@/brand/palettes';

import { withAlpha } from './contrast';

/** Semantic colour roles. Components use ONLY these. Each role has one job. */
export interface ColorRoles {
  ink: { primary: string; secondary: string; tertiary: string; onInverse: string; onInverseSecondary: string; onInverseTertiary: string };
  surface: {
    /** Screens that are one continuous composition (questions, live status). */
    base: string;
    /** Screens organised in panels (details, lists, settings). */
    grouped: string;
    panel: string;
    field: string;
    fieldStrong: string;
    inverse: string;
    inverseRaised: string;
    hairline: string;
    hairlineStrong: string;
    hairlineOnInverse: string;
    scrim: string;
  };
  tint: { brand: string; success: string; attention: string; safety: string };
  brand: { fill: string; fillPressed: string; onFill: string; dot: string; dotOutline: string; text: string };
  status: { live: string; active: string; attention: string; success: string; neutral: string };
  safety: { critical: string; criticalPressed: string; onCritical: string };
  focus: { ring: string };
  link: { color: string; underline: boolean };
  map: PalettePrimitives['map'] & { route: string; routeCasing: string };
  shadow: string;
}

export type Scheme = 'light' | 'night';

export function buildColorRoles(p: PalettePrimitives, scheme: Scheme = 'light'): ColorRoles {
  return scheme === 'night' ? buildNight(p) : buildLight(p);
}

function buildNight(p: PalettePrimitives): ColorRoles {
  const n = p.night;
  const white = '#FFFFFF';
  return {
    ink: {
      primary: n.ink[900],
      secondary: n.ink[700],
      tertiary: n.ink[500],
      // "Inverse" on night is light: secondary buttons become white with dark text.
      onInverse: n.paper.base,
      onInverseSecondary: withAlpha(n.paper.base, 0.72),
      onInverseTertiary: withAlpha(n.paper.base, 0.55),
    },
    surface: {
      base: n.paper.base,
      grouped: n.paper.grouped,
      panel: n.paper.panel,
      field: n.paper.field,
      fieldStrong: n.paper.fieldStrong,
      inverse: n.ink[900],
      inverseRaised: withAlpha(n.paper.base, 0.08),
      hairline: withAlpha(white, 0.09),
      hairlineStrong: withAlpha(white, 0.18),
      hairlineOnInverse: withAlpha(n.paper.base, 0.12),
      scrim: withAlpha('#000000', 0.6),
    },
    tint: { brand: n.brand.tint, success: n.signal.successTint, attention: n.signal.attentionTint, safety: n.signal.criticalTint },
    brand: { fill: n.brand.fill, fillPressed: n.brand.fillPressed, onFill: n.brand.onFill, dot: n.brand.dot, dotOutline: n.brand.dot, text: n.brand.text },
    status: { live: n.brand.text, active: n.ink[900], attention: n.signal.attention, success: n.signal.success, neutral: n.ink[700] },
    safety: { critical: n.signal.critical, criticalPressed: n.signal.criticalPressed, onCritical: n.signal.onCritical },
    focus: { ring: n.brand.dot },
    link: { color: n.brand.text, underline: false },
    map: { ...n.map, route: n.brand.dot, routeCasing: n.paper.base },
    shadow: '#000000',
  };
}

function buildLight(p: PalettePrimitives): ColorRoles {
  const brandText = p.brand.text ?? p.ink[900];
  const white = p.paper.base;
  return {
    ink: {
      primary: p.ink[900],
      secondary: p.ink[700],
      tertiary: p.ink[500],
      onInverse: white,
      onInverseSecondary: withAlpha(white, 0.74),
      onInverseTertiary: withAlpha(white, 0.5),
    },
    surface: {
      base: p.paper.base,
      grouped: p.paper.grouped,
      panel: p.paper.base,
      field: p.paper.field,
      fieldStrong: p.paper.fieldStrong,
      inverse: p.ink[900],
      inverseRaised: withAlpha(white, 0.08),
      hairline: withAlpha(p.ink[900], 0.08),
      hairlineStrong: withAlpha(p.ink[900], 0.16),
      hairlineOnInverse: withAlpha(white, 0.12),
      scrim: withAlpha(p.ink[900], 0.5),
    },
    tint: { brand: p.brand.tint, success: p.signal.successTint, attention: p.signal.attentionTint, safety: p.signal.criticalTint },
    brand: {
      fill: p.brand.fill,
      fillPressed: p.brand.fillPressed,
      onFill: p.brand.onFill,
      dot: p.brand.dot,
      // A pale dot loses its shape on white; it gets an ink outline there (P1).
      dotOutline: p.brand.text === null ? p.ink[900] : p.brand.dot,
      text: brandText,
    },
    status: { live: brandText, active: p.ink[900], attention: p.signal.attention, success: p.signal.success, neutral: p.ink[700] },
    safety: { critical: p.signal.critical, criticalPressed: p.signal.criticalPressed, onCritical: white },
    focus: { ring: p.brand.text ?? p.ink[900] },
    link: { color: brandText, underline: p.brand.text === null },
    map: { ...p.map, route: p.ink[900], routeCasing: white },
    shadow: p.ink[900],
  };
}
