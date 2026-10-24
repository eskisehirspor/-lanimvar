import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';

import { lifecycleSteps, type LifecycleStep } from '@/features/task/model/status';
import { t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { useBreathing } from './motion';
import { Text } from './Text';

const COUNT = lifecycleSteps.length;
const STATION = 10;
const TRAM = 18;
const LABEL = 64;

/**
 * Progress as an Eskişehir tram line: six stations, the brand dot is the tram.
 * ONE progress value drives the track fill, the stations and the tram, so a
 * step change reads as the tram moving to the next stop.
 */
export function LifecycleStrip({ step, tone = 'normal', labels = true }: { step: LifecycleStep; tone?: 'normal' | 'attention'; labels?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const index = lifecycleSteps.indexOf(step);
  const p = useSharedValue(index);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    p.set(motion.reduced ? withTiming(index, motion.fade()) : withSpring(index, motion.spring('glide')));
  }, [index, motion, p]);

  const accent = tone === 'attention' ? c.status.attention : c.brand.dot;
  const gap = width / (COUNT - 1);
  const breathing = useBreathing(step !== 'done' && tone === 'normal', motion);
  const fill = useAnimatedStyle(() => ({ width: p.value * gap }));
  const tram = useAnimatedStyle(() => ({ transform: [{ translateX: p.value * gap - TRAM / 2 }] }));
  const halo = useAnimatedStyle(() => ({ opacity: interpolate(breathing.value, [0, 1], [0.5, 0]), transform: [{ scale: interpolate(breathing.value, [0, 1], [1, 2.2]) }] }));

  return (
    <View style={{ gap: 10 }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: COUNT, now: index + 1, text: t(`lifecycle.${step}`) }}>
      <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={[styles.rail, { backgroundColor: c.surface.fieldStrong }]} />
        <Animated.View style={[styles.rail, { backgroundColor: c.ink.primary }, fill]} />
        {width
          ? lifecycleSteps.map((s, i) => (
              <Station key={s} i={i} p={p} left={i * gap} color={c.ink.primary} empty={c.surface.base} track={c.surface.fieldStrong} />
            ))
          : null}
        {width ? (
          <Animated.View style={[styles.tram, tram]}>
            <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: TRAM / 2, backgroundColor: accent }, halo]} />
            <View style={[styles.tramCore, { backgroundColor: accent, borderColor: c.surface.base }]} />
          </Animated.View>
        ) : null}
      </View>
      {labels ? (
        <View style={[styles.labels, { height: theme.type.tab.lineHeight }]}>
          {width
            ? lifecycleSteps.map((s, i) => {
                const center = TRAM / 2 + i * gap;
                const pos = i === 0 ? { left: 0 } : i === COUNT - 1 ? { right: 0 } : { left: center - LABEL / 2, width: LABEL };
                return (
                  <Text
                    key={s}
                    variant="tab"
                    tone={i === index ? (tone === 'attention' ? 'attention' : 'primary') : i < index ? 'secondary' : 'tertiary'}
                    emphasis={i === index}
                    numberOfLines={1}
                    style={[styles.label, pos, { textAlign: i === 0 ? 'left' : i === COUNT - 1 ? 'right' : 'center' }]}
                  >
                    {t(`lifecycle.${s}`)}
                  </Text>
                );
              })
            : null}
        </View>
      ) : null}
    </View>
  );
}

function Station({ i, p, left, color, empty, track }: { i: number; p: SharedValue<number>; left: number; color: string; empty: string; track: string }) {
  const passed = useDerivedValue(() => (p.value >= i - 0.01 ? 1 : 0));
  const style = useAnimatedStyle(() => ({ backgroundColor: passed.value ? color : empty, borderColor: passed.value ? color : track }));
  return <Animated.View style={[styles.station, { left: left - STATION / 2 }, style]} />;
}

const styles = StyleSheet.create({
  track: { height: TRAM, justifyContent: 'center', marginHorizontal: TRAM / 2 },
  rail: { position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 1.5 },
  station: { position: 'absolute', width: STATION, height: STATION, borderRadius: STATION / 2, borderWidth: 2 },
  tram: { position: 'absolute', left: 0, width: TRAM, height: TRAM, alignItems: 'center', justifyContent: 'center' },
  tramCore: { width: TRAM, height: TRAM, borderRadius: TRAM / 2, borderWidth: 3 },
  labels: { position: 'relative' },
  label: { position: 'absolute', top: 0 },
});
