import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';

import { lifecycleSteps, type LifecycleStep } from '@/features/task/model/status';
import { t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { rollIn, rollOut, useBreathing } from './motion';
import { Text } from './Text';

const COUNT = lifecycleSteps.length;
const GAP = 4;
const BAR = 4;
const DOT = 12;

/**
 * Where the task is. ONE progress value drives every segment and the brand
 * dot riding the fill head, so a step change reads as one movement forward.
 */
export function LifecycleStrip({ step, tone = 'normal', onInverse }: { step: LifecycleStep; tone?: 'normal' | 'attention'; onInverse?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const index = lifecycleSteps.indexOf(step);
  const done = step === 'done';
  const target = done ? COUNT : index + 0.5;
  const p = useSharedValue(target);
  const width = useSharedValue(0);

  useEffect(() => {
    p.set(motion.reduced ? withTiming(target, motion.fade()) : withSpring(target, motion.spring('hero')));
  }, [target, motion, p]);

  const fill = tone === 'attention' ? c.status.attention : onInverse ? c.ink.onInverse : c.ink.primary;
  const track = onInverse ? c.surface.hairlineOnInverse : c.surface.fieldStrong;
  const breathing = useBreathing(!done && tone === 'normal', motion);
  const dotX = useDerivedValue(() => {
    const seg = (width.value - GAP * (COUNT - 1)) / COUNT;
    const i = Math.min(Math.floor(p.value), COUNT - 1);
    return i * (seg + GAP) + Math.min(p.value - i, 1) * seg;
  });
  const dotStyle = useAnimatedStyle(() => ({
    opacity: width.value > 0 ? 1 : 0,
    transform: [{ translateX: dotX.value - DOT / 2 }, { scale: interpolate(breathing.value, [0, 1], [1, 1.22]) }],
  }));

  return (
    <View style={{ gap: 10 }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: COUNT, now: done ? COUNT : index + 1 }}>
      <View style={styles.track} onLayout={(e) => width.set(e.nativeEvent.layout.width)}>
        {lifecycleSteps.map((s, i) => (
          <Segment key={s} i={i} p={p} fill={fill} track={track} />
        ))}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dot,
            { backgroundColor: done ? c.status.success : tone === 'attention' ? c.status.attention : c.brand.dot, borderColor: onInverse ? c.surface.inverse : c.surface.panel },
            dotStyle,
          ]}
        />
      </View>
      <View style={styles.labels}>
        <View style={styles.clip}>
          <Animated.View key={step} entering={rollIn(motion, 12)} exiting={rollOut(motion, 12)}>
            <Text variant="label" tone={tone === 'attention' ? 'attention' : onInverse ? 'onInverse' : 'primary'}>
              {t(`lifecycle.${step}`)}
            </Text>
          </Animated.View>
        </View>
        <Text variant="meta" tone={onInverse ? 'onInverseTertiary' : 'tertiary'}>
          {t('lifecycle.progress', { step: done ? COUNT : index + 1, total: COUNT })}
        </Text>
      </View>
    </View>
  );
}

function Segment({ i, p, fill, track }: { i: number; p: SharedValue<number>; fill: string; track: string }) {
  const style = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, p.value - i)) * 100}%` }));
  return (
    <View style={[styles.segment, { backgroundColor: track }]}>
      <Animated.View style={[styles.fill, { backgroundColor: fill }, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', gap: GAP, height: DOT, alignItems: 'center' },
  segment: { flex: 1, height: BAR, borderRadius: BAR / 2, overflow: 'hidden' },
  fill: { height: BAR, borderRadius: BAR / 2 },
  dot: { position: 'absolute', left: 0, width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 2.5 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clip: { overflow: 'hidden', minHeight: 20, justifyContent: 'center' },
});
