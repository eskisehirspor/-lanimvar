import type { TypeDirection } from '@/brand/fonts';
import { palettes, type PaletteId } from '@/brand/palettes';

import { buildColorRoles } from './color';
import { a11y, buildElevation, buildRadii, iconSize, layout, space, type ButtonShape } from './tokens';
import { buildTypeScale } from './typography';

export interface ThemeConfig {
  palette: PaletteId;
  typeDirection: TypeDirection;
  buttonShape: ButtonShape;
  textScale: number;
}

/** Provisional product defaults. The Design Lab decision replaces these. */
export const defaultThemeConfig: ThemeConfig = { palette: 'p1', typeDirection: 'standard', buttonShape: 'slab', textScale: 1 };

export function createTheme(config: ThemeConfig) {
  const palette = palettes[config.palette];
  const color = buildColorRoles(palette);
  return {
    config,
    paletteMeta: { code: palette.code, name: palette.name },
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
