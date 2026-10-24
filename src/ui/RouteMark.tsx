import { useEffect } from 'react';
import Animated, { Easing, interpolate, useAnimatedProps, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useHaptics } from '@/lib/haptics';
import { useMotion, useTheme } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ROUTE = 'M10 50 H44 Q56 50 56 38 V26 Q56 14 68 14 H104';
const ROUTE_LEN = 124;
const CHECK = 'M111.5 14.5l4.5 4.5 9-9';
const CHECK_LEN = 20;

/**
 * The brand's graphic device: one route ending in the İ-dot — "someone is on
 * the way to you". At completion the dot arrives and becomes the check.
 */
export function RouteMark({ width = 136, mode = 'static', playKey = 0, lineColor }: { width?: number; mode?: 'static' | 'play'; playKey?: number; lineColor?: string }) {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const c = theme.color;
  const draw = useSharedValue(mode === 'static' ? 1 : 0);
  const land = useSharedValue(mode === 'static' ? 1 : 0);
  const done = useSharedValue(0);

  useEffect(() => {
    if (mode !== 'play') return;
    draw.set(0);
    land.set(0);
    done.set(0);
    const reduced = motion.reduced;
    draw.set(reduced ? withTiming(1, motion.fade()) : withTiming(1, motion.timing(620, Easing.bezier(0.45, 0, 0.2, 1))));
    land.set(reduced ? withTiming(1, motion.fade()) : withDelay(motion.ms(520), withSpring(1, motion.spring('hero'))));
    done.set(withDelay(motion.ms(reduced ? 200 : 900), withTiming(1, reduced ? motion.fade() : motion.timing(360))));
    const id = setTimeout(() => fire('success'), motion.ms(reduced ? 200 : 900));
    return () => clearTimeout(id);
  }, [mode, playKey, motion]); // eslint-disable-line react-hooks/exhaustive-deps

  const routeProps = useAnimatedProps(() => ({ strokeDashoffset: ROUTE_LEN * (1 - draw.value) }));
  // Stacked circles instead of an animated fill: colour props are not reliably animatable everywhere.
  const dotProps = useAnimatedProps(() => ({ r: interpolate(land.value, [0, 1], [0, 8]) + 6 * done.value }));
  const successProps = useAnimatedProps(() => ({ r: interpolate(land.value, [0, 1], [0, 8]) + 6 * done.value, opacity: done.value }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LEN * (1 - Math.max(0, (done.value - 0.35) / 0.65)), opacity: done.value > 0.3 ? 1 : 0 }));
  const line = lineColor ?? c.ink.primary;

  return (
    <Svg width={width} height={(width * 64) / 136} viewBox="0 0 136 64" accessibilityElementsHidden>
      <Circle cx={6} cy={50} r={4.5} fill={line} />
      <AnimatedPath d={ROUTE} stroke={line} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={`${ROUTE_LEN} ${ROUTE_LEN}`} animatedProps={routeProps} />
      <AnimatedCircle cx={118} cy={14} fill={c.brand.dot} animatedProps={dotProps} />
      <AnimatedCircle cx={118} cy={14} fill={c.status.success} animatedProps={successProps} />
      <AnimatedPath d={CHECK} stroke={c.ink.onInverse} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={`${CHECK_LEN} ${CHECK_LEN}`} animatedProps={checkProps} />
    </Svg>
  );
}
