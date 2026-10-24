import { View } from 'react-native';

import { useTheme } from '@/theme';
import { RouteMark } from '@/ui/RouteMark';

import { Mark } from './Mark';
import { Wordmark } from './Wordmark';

/** iOS squircle approximation (22.37% radius). Three concepts to compare at real sizes. */
export function AppIconConcept({ size, concept = 'mark' }: { size: number; concept?: 'mark' | 'route' | 'word' }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.2237, backgroundColor: c.surface.inverse, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} accessibilityRole="image">
      {concept === 'mark' ? <Mark size={size * 0.54} color={c.ink.onInverse} /> : null}
      {concept === 'route' ? <RouteMark width={size * 0.7} lineColor={c.ink.onInverse} /> : null}
      {concept === 'word' ? <Wordmark capHeight={size * 0.11} color={c.ink.onInverse} /> : null}
    </View>
  );
}
