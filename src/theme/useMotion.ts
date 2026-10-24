import { useMemo } from 'react';
import { Easing, ReduceMotion, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

import { durations, springs, type SpringName } from './motion';
import { useMotionSettings } from './ThemeProvider';

/**
 * Motion helpers bound to the current speed + reduce-motion setting.
 * Reduced motion is handled by components (movement → short cross-fade), so
 * Reanimated's own system check is disabled here.
 */
export function useMotion() {
  const { speed, reduced } = useMotionSettings();
  return useMemo(() => {
    const scale = (ms: number) => Math.round(ms / speed);
    return {
      reduced,
      speed,
      ms: scale,
      spring(name: SpringName): WithSpringConfig {
        const s = springs[name];
        return { duration: scale(s.duration), dampingRatio: s.dampingRatio, reduceMotion: ReduceMotion.Never };
      },
      timing(ms: number, easing: WithTimingConfig['easing'] = Easing.bezier(0.2, 0, 0, 1)): WithTimingConfig {
        return { duration: scale(ms), easing, reduceMotion: ReduceMotion.Never };
      },
      fade(): WithTimingConfig {
        return { duration: scale(durations.reduced), easing: Easing.linear, reduceMotion: ReduceMotion.Never };
      },
    };
  }, [speed, reduced]);
}

export type Motion = ReturnType<typeof useMotion>;
