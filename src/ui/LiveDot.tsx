import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useMotion, useTheme } from '@/theme';

import { useBreathing } from './motion';

/** The İ-dot as an indicator. Breathes only while something is actually happening. */
export function LiveDot({ size = 10, live = true, color, onInverse }: { size?: number; live?: boolean; color?: string; onInverse?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const b = useBreathing(live, motion);
  const fill = color ?? theme.color.brand.dot;
  const outline = onInverse || color ? fill : theme.color.brand.dotOutline;
  const halo = useAnimatedStyle(() => ({ opacity: interpolate(b.value, [0, 1], [0, 0.4]), transform: [{ scale: interpolate(b.value, [0, 1], [1, 2.3]) }] }));
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, backgroundColor: fill }, halo]} />
      <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, backgroundColor: fill, borderWidth: outline === fill ? 0 : 1.5, borderColor: outline }]} />
    </View>
  );
}
