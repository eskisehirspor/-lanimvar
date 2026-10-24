/**
 * Font FILES, loaded once by the root layout. Kept apart from family names so
 * the theme never pulls binary assets.
 */
import { BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed';
import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';

import type { FontFamilyName } from './fonts';

export const fontAssets = {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} satisfies Record<FontFamilyName, unknown>;
