import type { TypeDirection } from '@/brand/fonts';
import { palettes, type PaletteId } from '@/brand/palettes';

import { buildColorRoles, type Scheme } from './color';
import { a11y, buildElevation, buildRadii, iconSize, layout, space, type ButtonShape } from './tokens';
import { buildTypeScale } from './typography';

export interface ThemeConfig {
  palette: PaletteId;
  typeDirection: TypeDirection;
  buttonShape: ButtonShape;
  textScale: number;
  /** light = default; night = immersive live moments. */
  scheme?: Scheme;
}

/** Provisional product defaults. The Design Lab decision replaces these. */
export const defaultThemeConfig: ThemeConfig = { palette: 'p1', typeDirection: 'condensed', buttonShape: 'slab', textScale: 1, scheme: 'light' };

export function createTheme(config: ThemeConfig) {
  const palette = palettes[config.palette];
  const color = buildColorRoles(palette, config.scheme);
  return {
    config,
    paletteMeta: { code: palette.code, name: palette.name },
    scheme: config.scheme ?? 'light',
    /** Warm monogram hues are pale in both schemes, so their text is always the day ink. */
    avatar: { hues: palette.avatarHues, ink: palette.ink[900] },
    /** Illustrations keep day colours in every scheme (they are objects, not UI). */
    illustration: { ink: palette.ink[900], paper: palette.paper.base },
    color,
    type: buildTypeScale(config.typeDirection, config.textScale),
    space,
    layout,
    radii: buildRadii(config.buttonShape),
    elevation: buildElevation(color.shadow),
    icon: iconSize,
    a11y,
  };
}

export type Theme = ReturnType<typeof createTheme>;
