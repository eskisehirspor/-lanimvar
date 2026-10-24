import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { useHaptics } from '@/lib/haptics';
import { useMotion, useTheme } from '@/theme';

import { Icon } from './Icon';
import { useBreathing } from './motion';
import { Tactile } from './Tactile';

const BARS = 32;
// Deterministic "speech" envelope so the waveform looks like a voice, not noise.
const PEAKS = Array.from({ length: BARS }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)));

/** Live voice level. Bars move only while actually listening. */
export function Waveform({ active, height = 56, color }: { active: boolean; height?: number; color?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.wave, { height }]} accessibilityElementsHidden>
      {PEAKS.map((peak, i) => (
        <Bar key={i} i={i} peak={peak} active={active} height={height} color={color ?? theme.color.ink.primary} />
      ))}
    </View>
  );
}

function Bar({ i, peak, active, height, color }: { i: number; peak: number; active: boolean; height: number; color: string }) {
  const motion = useMotion();
  const v = useSharedValue(0.12);
  useEffect(() => {
    cancelAnimation(v);
    if (!active || motion.reduced) {
      v.set(withTiming(active ? peak * 0.6 : 0.12, motion.timing(200)));
      return;
    }
    const up = motion.ms(180 + (i % 5) * 40);
    v.set(withDelay(motion.ms((i % 7) * 30), withRepeat(withSequence(withTiming(peak, { duration: up, easing: Easing.out(Easing.quad) }), withTiming(peak * 0.25, { duration: up, easing: Easing.in(Easing.quad) })), -1, true)));
  }, [active, peak, i, motion, v]);
  const s = useAnimatedStyle(() => ({ height: Math.max(4, v.value * height) }));
  return <Animated.View style={[styles.bar, { backgroundColor: color }, s]} />;
}

/**
 * Hold-to-talk: press and keep holding to describe the job. Rings breathe
 * while listening; release sends. One gesture instead of a form.
 */
export function VoiceButton({ listening, onStart, onStop, size = 84 }: { listening: boolean; onStart?: () => void; onStop?: () => void; size?: number }) {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const c = theme.color;
  const b = useBreathing(listening, motion, 1200);
  const s = useSharedValue(1);
  useEffect(() => {
    s.set(motion.reduced ? 1 : withSpring(listening ? 1.12 : 1, motion.spring('snappy')));
  }, [listening, motion, s]);
  const ring1 = useAnimatedStyle(() => ({ opacity: interpolate(b.value, [0, 1], [0.5, 0]), transform: [{ scale: interpolate(b.value, [0, 1], [1, 1.7]) }] }));
  const ring2 = useAnimatedStyle(() => ({ opacity: interpolate(b.value, [0, 1], [0.3, 0.05]), transform: [{ scale: interpolate(b.value, [0, 1], [1.25, 2.1]) }] }));
  const core = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <View style={{ width: size * 2.2, height: size * 2.2, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.brand.dot }, ring2]} />
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.brand.dot }, ring1]} />
      <Animated.View style={core}>
        <Tactile
          haptic={null}
          pressScale={0.94}
          accessibilityLabel="Basılı tut ve anlat"
          onPressIn={() => {
            fire('press');
            onStart?.();
          }}
          onPressOut={() => {
            fire('success');
            onStop?.();
          }}
          style={[styles.button, theme.elevation.floating, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.brand.fill }]}
        >
          <Icon name="mic" size={size * 0.38} color={c.brand.onFill} weight="fill" />
        </Tactile>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wave: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  bar: { width: 4, borderRadius: 2 },
  ring: { position: 'absolute' },
  button: { alignItems: 'center', justifyContent: 'center' },
});
