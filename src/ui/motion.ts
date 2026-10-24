import type React from 'react';
import { useEffect } from 'react';
import type Animated from 'react-native-reanimated';
import {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { durations, gestures, springs, type Motion } from '@/theme';

/** Anything accepted by Animated.View `entering` / `exiting`. */
export type LayoutAnim = NonNullable<React.ComponentProps<typeof Animated.View>['entering']>;

/** Looping 0→1→0 for live indicators. Only live things breathe. */
export function useBreathing(active: boolean, motion: Motion, period: number = durations.pulse): SharedValue<number> {
  const v = useSharedValue(0);
  useEffect(() => {
    if (!active || motion.reduced) {
      cancelAnimation(v);
      v.set(withTiming(0, motion.fade()));
      return;
    }
    v.set(0);
    v.set(withRepeat(withTiming(1, motion.timing(period / 2, Easing.inOut(Easing.sin))), -1, true));
    return () => cancelAnimation(v);
  }, [active, motion, period, v]);
  return v;
}

/** Horizontal "no" shake. Wrong PIN, invalid amount. */
export function playShake(v: SharedValue<number>, motion: Motion) {
  const d = gestures.shakeDistance;
  const seg = Math.round(48 / motion.speed);
  const steps = [];
  for (let i = 0; i < gestures.shakeCycles; i++) steps.push(withTiming(-d, { duration: seg }), withTiming(d, { duration: seg }));
  steps.push(withSpring(0, { duration: Math.round(springs.press.duration / motion.speed), dampingRatio: 1 }));
  v.set(withSequence(...steps));
}

/** Value changes roll: up = forward/increase, down = back/decrease. */
export function rollIn(motion: Motion, distance: number, direction: 1 | -1 = 1): LayoutAnim {
  if (motion.reduced) return FadeIn.duration(motion.ms(durations.reduced));
  const cfg = motion.spring('snappy');
  const fadeMs = motion.ms(durations.micro);
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: distance * direction }] },
      animations: { opacity: withTiming(1, { duration: fadeMs }), transform: [{ translateY: withSpring(0, cfg) }] },
    };
  };
}

export function rollOut(motion: Motion, distance: number, direction: 1 | -1 = 1): LayoutAnim {
  if (motion.reduced) return FadeOut.duration(motion.ms(durations.reduced));
  const cfg = motion.spring('snappy');
  const fadeMs = motion.ms(durations.micro);
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
      animations: { opacity: withTiming(0, { duration: fadeMs }), transform: [{ translateY: withSpring(-distance * direction, cfg) }] },
    };
  };
}

/** Rise-in for content that appears as a consequence of a state change. */
export function riseIn(motion: Motion, delay = 0, distance = 12): LayoutAnim {
  if (motion.reduced) return FadeIn.duration(motion.ms(durations.reduced)).delay(motion.ms(delay));
  const cfg = motion.spring('hero');
  const fadeMs = motion.ms(durations.standard);
  const d = motion.ms(delay);
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: distance }] },
      animations: {
        opacity: withDelay(d, withTiming(1, { duration: fadeMs })),
        transform: [{ translateY: withDelay(d, withSpring(0, cfg)) }],
      },
    };
  };
}
