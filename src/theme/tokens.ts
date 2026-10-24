/** Non-colour, non-type tokens. Palette- and direction-independent. */
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;

export const layout = {
  gutter: 20,
  headlineTop: 28,
  sectionGap: 32,
  fieldGap: 20,
  labelGap: 8,
  buttonHeight: 54,
  buttonHeightCompact: 42,
  fieldHeight: 54,
  rowMinHeight: 64,
  tabBarHeight: 58,
  topBarHeight: 52,
  keypadKeyHeight: 62,
  iconButton: 44,
} as const;

export type ButtonShape = 'pill' | 'slab';

export const buttonShapeMeta: Record<ButtonShape, { name: string }> = {
  pill: { name: 'Hap' },
  slab: { name: 'Blok' },
};

export function buildRadii(shape: ButtonShape) {
  return {
    small: 8,
    field: 14,
    tile: 16,
    panel: 22,
    sheet: 30,
    pill: 999,
    button: shape === 'pill' ? 999 : 14,
  } as const;
}

export const iconSize = { s: 16, m: 20, l: 24, xl: 32 } as const;

/** Flat by default. Only things that float over content lift. */
export function buildElevation(shadowColor: string) {
  return {
    floating: { shadowColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 18, elevation: 6 },
    sheet: { shadowColor, shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 16 },
    dock: { shadowColor, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 12 },
  } as const;
}

export const a11y = {
  minTouch: 44,
  minTextContrast: 4.5,
  minMetaSize: 13,
  textScaleOptions: [1, 1.3, 1.6] as const,
} as const;
