import { useEffect, useEffectEvent, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { t } from '@/i18n';
import { useHaptics } from '@/lib/haptics';
import { useMotion, useTheme } from '@/theme';
import { Avatar, Grain, MapCanvas, mapProjection, MaskReveal, Rise, Tactile, Text, type Project } from '@/ui';

import { story, useFrame, type Point } from './frame';

/** Nearby Taskers in map units; the last one (Mehmet) accepts. */
const nearby: { at: [number, number]; initials: string }[] = [
  { at: [140, 190], initials: 'EY' },
  { at: [272, 292], initials: 'BK' },
  { at: [128, 300], initials: 'SA' },
  { at: [232, 340], initials: 'ÖT' },
  { at: [164, 352], initials: 'FN' },
  { at: [266, 186], initials: story.tasker.initials },
];
const WINNER = nearby.length - 1;
const SEARCH_MS = 4200;

/**
 * Night map. The request ripples out from the door, nearby Taskers light up as
 * it reaches them, and one of them takes it. The clock counts the wait.
 */
export function Searching({ active, onAccepted }: { active: boolean; onAccepted: (origin: Point) => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const f = useFrame();
  const fire = useHaptics();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [secs, setSecs] = useState(0);
  const [won, setWon] = useState(false);
  const accept = useEffectEvent((p: Point) => onAccepted(p));

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSecs((s) => s + 1), motion.ms(1000) / 3);
    return () => clearInterval(id);
  }, [active, motion]);

  useEffect(() => {
    if (!active) return;
    const at = mapProjection(f.w, f.h)(...nearby[WINNER]!.at);
    const winner = { x: at.left, y: at.top };
    const a = setTimeout(() => {
      setWon(true);
      fire('incoming');
    }, motion.ms(SEARCH_MS));
    const b = setTimeout(() => accept(winner), motion.ms(SEARCH_MS + 650));
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [active, motion, fire, f.w, f.h]);

  const mapH = f.h;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.base }]}>
      <MapCanvas
        mode="approx"
        height={mapH}
        overlay={(project) => (
          <>
            <Radar project={project} active={active} />
            {nearby.map((n, i) => (
              <Pinged key={n.initials} index={i} project={project} at={n.at} initials={n.initials} active={active} win={i === WINNER && won} />
            ))}
          </>
        )}
      />
      <Shade top={0} height={f.top + 300} from={c.surface.base} reverse={false} />
      <Shade top={f.h - 260} height={260} from={c.surface.base} reverse />
      <Grain opacity={0.06} />

      <View style={{ position: 'absolute', top: f.top + 34, left: g, right: g }}>
        <MaskReveal play={active} delay={260}>
          <Text variant="display.hero" style={{ fontSize: 60, lineHeight: 58 }}>
            {t('proto.searchingA')}
          </Text>
        </MaskReveal>
        <MaskReveal play={active} delay={360}>
          <Text variant="display.hero" style={{ fontSize: 60, lineHeight: 58 }}>
            {t('proto.searchingB')}
          </Text>
        </MaskReveal>
        <MaskReveal play={active} delay={460}>
          <Text variant="display.hero" serif tone="brand" style={{ fontSize: 66, lineHeight: 62 }}>
            {t('proto.searchingC')}
          </Text>
        </MaskReveal>
        <Rise play={active} delay={640}>
          <Text variant="body" tone="secondary" style={{ marginTop: 12 }}>
            {t('proto.searchingSub', { count: story.online })}
          </Text>
        </Rise>
      </View>

      <Rise play={active} delay={760} style={[styles.bottom, { left: g, right: g, bottom: f.bottom + 22 }]}>
        <View>
          <Text variant="micro" tone="tertiary">
            {t('proto.wait')}
          </Text>
          <Text variant="numeric.hero" style={{ fontVariant: ['tabular-nums'] }}>{`00:${String(Math.min(secs, 59)).padStart(2, '0')}`}</Text>
        </View>
        <Tactile haptic="select" style={[styles.cancel, { borderColor: c.surface.hairlineStrong }]} accessibilityLabel={t('common.cancel')}>
          <Text variant="label">{t('common.cancel')}</Text>
        </Tactile>
      </Rise>
    </View>
  );
}

function Shade({ top, height, from, reverse }: { top: number; height: number; from: string; reverse: boolean }) {
  const id = reverse ? 'shade-up' : 'shade-down';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top, height }}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={from} stopOpacity={reverse ? 0 : 1} />
            <Stop offset={reverse ? '0.55' : '0.5'} stopColor={from} stopOpacity={reverse ? 0.85 : 0.85} />
            <Stop offset="1" stopColor={from} stopOpacity={reverse ? 1 : 0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

function Radar({ project, active }: { project: Project; active: boolean }) {
  const p = project(206, 238);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: p.left, top: p.top }}>
      {[0, 1, 2].map((i) => (
        <Ring key={i} delay={i * 900} active={active} />
      ))}
    </View>
  );
}

function Ring({ delay, active }: { delay: number; active: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    if (!active || motion.reduced) return;
    v.set(withDelay(motion.ms(delay), withRepeat(withTiming(1, { duration: motion.ms(2700), easing: Easing.out(Easing.quad) }), -1, false)));
  }, [active, delay, motion, v]);
  const s = useAnimatedStyle(() => ({ opacity: interpolate(v.value, [0, 0.1, 1], [0, 0.8, 0]), transform: [{ scale: interpolate(v.value, [0, 1], [0.1, 1]) }] }));
  return <Animated.View style={[styles.ring, { borderColor: theme.color.brand.dot, backgroundColor: theme.color.tint.brand }, s]} />;
}

function Pinged({ index, project, at, initials, active, win }: { index: number; project: Project; at: [number, number]; initials: string; active: boolean; win: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const p = project(...at);
  const v = useSharedValue(0);
  const w = useSharedValue(0);
  useEffect(() => {
    if (!active) return;
    v.set(withDelay(motion.ms(500 + index * 420), withSpring(1, { duration: motion.ms(520), dampingRatio: 0.55 })));
  }, [active, index, motion, v]);

  useEffect(() => {
    w.set(win ? withSpring(1, { duration: motion.ms(520), dampingRatio: 0.5 }) : 0);
  }, [win, motion, w]);

  const s = useAnimatedStyle(() => ({ opacity: Math.min(1, v.value), transform: [{ scale: v.value * (1 + w.value * 0.5) }] }));
  const halo = useAnimatedStyle(() => ({ opacity: w.value, transform: [{ scale: 0.6 + w.value * 0.7 }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.pin, { left: p.left - 18, top: p.top - 18 }, s]}>
      <Animated.View style={[styles.halo, { backgroundColor: theme.color.brand.dot }, halo]} />
      <Avatar initials={initials} size={36} ring tone={win ? 'brand' : 'warm'} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', left: -170, top: -170, width: 340, height: 340, borderRadius: 170, borderWidth: 1.5 },
  pin: { position: 'absolute', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 64, height: 64, borderRadius: 32, opacity: 0.4 },
  bottom: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cancel: { height: 48, paddingHorizontal: 22, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
