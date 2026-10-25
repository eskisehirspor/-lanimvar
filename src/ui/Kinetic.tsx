import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop, Text as SvgText, TextPath } from 'react-native-svg';

import { fontFamilies } from '@/brand/fonts';
import { trUpper } from '@/i18n/turkish';

import { useMotion, useTheme } from '@/theme';

/** Expo-out: fast start, long settle. The signature curve for reveals. */
export const easeReveal = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * A line of type that rises out of its own mask. Stagger several for headlines.
 * Under Reduce Motion it fades.
 */
export function MaskReveal({ children, delay = 0, play = true, duration = 900 }: { children: ReactNode; delay?: number; play?: boolean; duration?: number }) {
  const motion = useMotion();
  const reduced = motion.reduced;
  const [h, setH] = useState(0);
  const p = useSharedValue(0);

  useEffect(() => {
    if (!h) return;
    if (!play) {
      p.set(0);
      return;
    }
    p.set(withDelay(motion.ms(delay), reduced ? withTiming(1, motion.fade()) : withTiming(1, motion.timing(duration, easeReveal))));
  }, [play, h, delay, duration, motion, reduced, p]);

  const style = useAnimatedStyle(() =>
    reduced
      ? { opacity: h ? p.value : 0 }
      : { opacity: h ? 1 : 0, transform: [{ translateY: (1 - p.value) * h * 1.1 }, { rotate: `${(1 - p.value) * 5}deg` }] },
  );

  return (
    <View style={styles.mask}>
      <Animated.View onLayout={(e) => setH(e.nativeEvent.layout.height)} style={[styles.origin, style]}>
        {children}
      </Animated.View>
    </View>
  );
}

/** Rise + fade for supporting content that follows a reveal. */
export function Rise({ children, delay = 0, play = true, distance = 18, style }: { children: ReactNode; delay?: number; play?: boolean; distance?: number; style?: StyleProp<ViewStyle> }) {
  const motion = useMotion();
  const reduced = motion.reduced;
  const p = useSharedValue(0);
  useEffect(() => {
    if (!play) {
      p.set(0);
      return;
    }
    p.set(withDelay(motion.ms(delay), reduced ? withTiming(1, motion.fade()) : withTiming(1, motion.timing(760, easeReveal))));
  }, [play, delay, motion, reduced, p]);
  const a = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: reduced ? 0 : (1 - p.value) * distance }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** Endless horizontal ticker. Stops (and shows from the start) under Reduce Motion. */
export function Marquee({ children, speed = 36, gap = 28, style }: { children: ReactNode; speed?: number; gap?: number; style?: StyleProp<ViewStyle> }) {
  const motion = useMotion();
  const [w, setW] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(x);
    x.set(0);
    if (!w || motion.reduced) return;
    x.set(withRepeat(withTiming(-w, { duration: motion.ms((w / speed) * 1000), easing: Easing.linear }), -1, false));
    return () => cancelAnimation(x);
  }, [w, speed, motion, x]);

  const a = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const copy = (key: string, measure?: boolean) => (
    <View key={key} style={[styles.copy, { paddingRight: gap }]} onLayout={measure ? (e) => setW(e.nativeEvent.layout.width) : undefined}>
      {children}
    </View>
  );
  return (
    <View style={[styles.marquee, style]} accessibilityRole="text">
      <Animated.View style={[styles.track, a]}>
        {copy('a', true)}
        {copy('b')}
        {copy('c')}
      </Animated.View>
    </View>
  );
}

/** Film grain over a flood of colour. */
export function Grain({ opacity = 0.09 }: { opacity?: number }) {
  const theme = useTheme();
  return <Image source={{ uri: theme.texture.grain }} resizeMode="repeat" style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none" />;
}

/** Soft light source. */
export function Glow({ size, color, opacity = 0.55, style }: { size: number; color: string; opacity?: number; style?: StyleProp<ViewStyle> }) {
  const id = useMemo(() => `glow-${color.replace(/[^a-zA-Z0-9]/g, '')}-${Math.round(opacity * 100)}`, [color, opacity]);
  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * Reveals the next surface through a growing circle from `origin` (the thing
 * that was touched). progress 0 → hidden, 1 → covers the frame.
 */
export function CircleReveal({ progress, origin, frame, children }: { progress: SharedValue<number>; origin: { x: number; y: number }; frame: { w: number; h: number }; children: ReactNode }) {
  const R = Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(frame.w - origin.x, origin.y),
    Math.hypot(origin.x, frame.h - origin.y),
    Math.hypot(frame.w - origin.x, frame.h - origin.y),
  );
  const outer = useAnimatedStyle(() => {
    const r = Math.max(0.5, progress.value * R);
    return { left: origin.x - r, top: origin.y - r, width: r * 2, height: r * 2, borderRadius: r };
  });
  const inner = useAnimatedStyle(() => {
    const r = Math.max(0.5, progress.value * R);
    return { left: r - origin.x, top: r - origin.y };
  });
  return (
    <Animated.View style={[styles.reveal, outer]}>
      <Animated.View style={[{ position: 'absolute', width: frame.w, height: frame.h }, inner]}>{children}</Animated.View>
    </Animated.View>
  );
}

/**
 * Words running round a circle, slowly turning: a sticker that says what the
 * thing in its centre does. Stops turning under Reduce Motion.
 */
export function RotatingBadge({ text, size, color, period = 16000, fontSize = 11.5, children }: { text: string; size: number; color: string; period?: number; fontSize?: number; children?: ReactNode }) {
  const motion = useMotion();
  const a = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(a);
    a.set(0);
    if (motion.reduced) return;
    a.set(withRepeat(withTiming(360, { duration: motion.ms(period), easing: Easing.linear }), -1, false));
    return () => cancelAnimation(a);
  }, [motion, period, a]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${a.value}deg` }] }));
  const r = size / 2 - fontSize;
  const c = size / 2;
  const id = `badge-${Math.round(size)}`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, spin]} pointerEvents="none">
        <Svg width={size} height={size}>
          <Defs>
            <Path id={id} d={`M ${c} ${c} m -${r} 0 a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 -${r * 2} 0`} />
          </Defs>
          <SvgText fill={color} fontSize={fontSize} fontFamily={fontFamilies.ui.bold} letterSpacing={fontSize * 0.22}>
            <TextPath href={`#${id}`}>{trUpper(text)}</TextPath>
          </SvgText>
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
}

/** Deterministic PRNG so particle layouts are stable between renders. */
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Particle {
  vx: number;
  vy: number;
  spin: number;
  w: number;
  h: number;
  color: string;
  round: boolean;
}

/** A celebratory burst from a point. Only for completion. Skipped under Reduce Motion. */
export function Confetti({ play, origin, colors, count = 44, seed = 3 }: { play: boolean; origin: { x: number; y: number }; colors: string[]; count?: number; seed?: number }) {
  const motion = useMotion();
  const t = useSharedValue(0);
  const particles = useMemo<Particle[]>(() => {
    const r = mulberry(seed);
    return Array.from({ length: count }, (_, i) => {
      const angle = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.25;
      const v = 520 + r() * 760;
      const big = r() > 0.6;
      return {
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        spin: (r() - 0.5) * 1440,
        w: big ? 10 + r() * 6 : 6 + r() * 4,
        h: big ? 6 + r() * 4 : 10 + r() * 8,
        color: colors[i % colors.length]!,
        round: r() > 0.7,
      };
    });
  }, [count, seed, colors]);

  useEffect(() => {
    if (!play || motion.reduced) {
      t.set(0);
      return;
    }
    t.set(0);
    t.set(withTiming(1, { duration: motion.ms(2600), easing: Easing.linear }));
  }, [play, motion, t]);

  if (motion.reduced) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <ConfettiBit key={i} p={p} t={t} origin={origin} />
      ))}
    </View>
  );
}

function ConfettiBit({ p, t, origin }: { p: Particle; t: SharedValue<number>; origin: { x: number; y: number } }) {
  const style = useAnimatedStyle(() => {
    const T = t.value * 2.6;
    const k = 2.2;
    const damp = (1 - Math.exp(-k * T)) / k;
    const x = p.vx * damp + Math.sin(T * 5 + p.spin) * 10 * T;
    const y = p.vy * damp + 210 * T * T;
    const fade = t.value > 0.72 ? 1 - (t.value - 0.72) / 0.28 : 1;
    return {
      opacity: t.value === 0 ? 0 : fade,
      transform: [{ translateX: origin.x + x - p.w / 2 }, { translateY: origin.y + y - p.h / 2 }, { rotate: `${p.spin * T}deg` }, { scaleY: Math.cos(T * 9 + p.spin) }],
    };
  });
  return <Animated.View style={[styles.bit, { width: p.w, height: p.h, backgroundColor: p.color, borderRadius: p.round ? p.w : 2 }, style]} />;
}

const styles = StyleSheet.create({
  mask: { overflow: 'hidden' },
  origin: { transformOrigin: 'left bottom' },
  marquee: { overflow: 'hidden', width: '100%' },
  track: { flexDirection: 'row', alignSelf: 'flex-start' },
  copy: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  reveal: { position: 'absolute', overflow: 'hidden' },
  bit: { position: 'absolute', left: 0, top: 0 },
});
