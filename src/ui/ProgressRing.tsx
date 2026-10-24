import { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useMotion } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Arc filling clockwise from 12 o'clock. Uploads (eased) and countdowns (linear). */
export function ProgressRing({ progress, size = 36, stroke = 3, color, track, linearMs }: { progress: number; size?: number; stroke?: number; color: string; track: string; linearMs?: number }) {
  const motion = useMotion();
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const p = useSharedValue(progress);
  useEffect(() => {
    p.set(withTiming(progress, linearMs !== undefined ? { duration: motion.ms(linearMs), easing: Easing.linear } : motion.timing(motion.reduced ? 0 : 280)));
  }, [progress, linearMs, motion, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - Math.max(0, Math.min(1, p.value))) }));
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${len} ${len}`} animatedProps={props} />
    </Svg>
  );
}
