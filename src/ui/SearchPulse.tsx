import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';

import { withAlpha } from '@/theme/contrast';
import { useMotion, useTheme } from '@/theme';

const PERIOD = 2400;

/** Searching: rings leave the İ-dot at a calm, steady cadence. Three evenly offset rings, never a gap. */
export function SearchPulse({ size = 180, active = true }: { size?: number; active?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const r0 = useSharedValue(0);
  const r1 = useSharedValue(0);
  const r2 = useSharedValue(0);

  useEffect(() => {
    [r0, r1, r2].forEach((r, i) => {
      cancelAnimation(r);
      r.set(0);
      if (!active || motion.reduced) return;
      r.set(withDelay(motion.ms((PERIOD / 3) * i), withRepeat(withTiming(1, { duration: motion.ms(PERIOD), easing: Easing.out(Easing.quad) }), -1, false)));
    });
  }, [active, motion, r0, r1, r2]);

  const ringColor = c.brand.dotOutline;
  const fill = withAlpha(c.brand.dot, 0.16);
  return (
    <View style={[styles.wrap, { width: size, height: size }]} accessibilityElementsHidden pointerEvents="none">
      {motion.reduced && active ? <View style={[styles.ring, { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3, borderColor: ringColor, backgroundColor: fill }]} /> : null}
      {[r0, r1, r2].map((r, i) => (
        <Ring key={i} v={r} size={size} color={ringColor} fill={fill} />
      ))}
      <View style={[styles.dot, { backgroundColor: c.brand.dot, borderColor: c.surface.panel }, theme.elevation.floating]} />
    </View>
  );
}

function Ring({ v, size, color, fill }: { v: SharedValue<number>; size: number; color: string; fill: string }) {
  const style = useAnimatedStyle(() => ({ opacity: interpolate(v.value, [0, 0.15, 1], [0, 0.85, 0]), transform: [{ scale: interpolate(v.value, [0, 1], [0.1, 1]) }] }));
  return <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color, backgroundColor: fill }, style]} />;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1.5 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 3 },
});
