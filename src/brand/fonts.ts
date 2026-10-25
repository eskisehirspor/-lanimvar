/**
 * Brand font families. Names must match the keys in brand/fontAssets.ts.
 * theme/typography.ts decides how they are used.
 */
export type TypeDirection = 'condensed' | 'standard';

export type FontFamilyName =
  | 'BarlowCondensed_700Bold'
  | 'BarlowCondensed_800ExtraBold'
  | 'BricolageGrotesque_700Bold'
  | 'BricolageGrotesque_800ExtraBold'
  | 'InstrumentSans_400Regular'
  | 'InstrumentSans_500Medium'
  | 'InstrumentSans_600SemiBold'
  | 'InstrumentSans_700Bold'
  | 'InstrumentSerif_400Regular_Italic';

export const fontFamilies = {
  /** heavy: the one hero per screen. bold: secondary display (sheet titles, status). */
  display: {
    condensed: { heavy: 'BarlowCondensed_800ExtraBold', bold: 'BarlowCondensed_700Bold' },
    standard: { heavy: 'BricolageGrotesque_800ExtraBold', bold: 'BricolageGrotesque_700Bold' },
  } satisfies Record<TypeDirection, { heavy: FontFamilyName; bold: FontFamilyName }>,
  ui: {
    regular: 'InstrumentSans_400Regular',
    medium: 'InstrumentSans_500Medium',
    semibold: 'InstrumentSans_600SemiBold',
    bold: 'InstrumentSans_700Bold',
  } satisfies Record<string, FontFamilyName>,
  /** Editorial accent: one or two words per headline set in italic serif. Never for UI text. */
  accent: 'InstrumentSerif_400Regular_Italic' satisfies FontFamilyName,
};

export const typeDirectionMeta: Record<TypeDirection, { code: string; name: string; face: string }> = {
  condensed: { code: 'A', name: 'Dar', face: 'Barlow Condensed' },
  standard: { code: 'B', name: 'Standart', face: 'Bricolage Grotesque' },
};
