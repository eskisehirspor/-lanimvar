import { useEffect, useEffectEvent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { wordmarkPaths } from '@/brand/generated/wordmarkPaths';
import { Wordmark } from '@/brand/Wordmark';
import { t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';
import { easeReveal, Grain, MaskReveal, Text } from '@/ui';

import { useFrame } from './frame';

/**
 * Cold open: the wordmark rises, the İ's dot drops in, swells into a flood of
 * signal yellow, and the flood lifts away to reveal home. Tap to skip.
 */
export function Intro({ onLift, onDone }: { onLift: () => void; onDone: () => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const f = useFrame();
  const c = theme.color;
  const d = wordmarkPaths[theme.config.typeDirection];
  const width = Math.min(f.w - 72, 320);
  const capHeight = (width / d.advance) * d.capHeight;
  const k = capHeight / d.capHeight;
  const markH = (d.capHeight + d.dot.gap + d.dot.r * 2) * k;
  const markTop = f.h / 2 - markH / 2 - 20;
  const markLeft = (f.w - d.advance * k) / 2;
  const dot = { x: markLeft + d.dot.cx * k, y: markTop + d.dot.r * k, r: d.dot.r * k };
  const cover = Math.max(Math.hypot(dot.x, dot.y), Math.hypot(f.w - dot.x, f.h - dot.y), Math.hypot(dot.x, f.h - dot.y), Math.hypot(f.w - dot.x, dot.y));

  const pop = useSharedValue(0);
  const grow = useSharedValue(0);
  const lift = useSharedValue(0);
  const finish = useEffectEvent(() => onDone());
  const lifting = useEffectEvent(() => onLift());

  useEffect(() => {
    pop.set(0);
    grow.set(0);
    lift.set(0);
    const liftAt = motion.ms(motion.reduced ? 1500 : 2560);
    const id = setTimeout(() => lifting(), liftAt);
    if (motion.reduced) {
      pop.set(withDelay(motion.ms(700), withTiming(1, motion.fade())));
      lift.set(withDelay(liftAt, withTiming(1, motion.fade(), (ok) => ok && scheduleOnRN(finish))));
      return () => clearTimeout(id);
    }
    pop.set(withDelay(motion.ms(820), withSpring(1, { duration: motion.ms(520), dampingRatio: 0.45 })));
    grow.set(withDelay(motion.ms(1720), withTiming(1, motion.timing(760, Easing.bezier(0.7, 0, 0.84, 0)))));
    lift.set(withDelay(liftAt, withTiming(1, motion.timing(820, easeReveal), (ok) => ok && scheduleOnRN(finish))));
    return () => clearTimeout(id);
  }, [motion, pop, grow, lift]);

  const layer = useAnimatedStyle(() => ({ transform: [{ translateY: -lift.value * f.h }] }));
  const G = cover / dot.r;
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value * (1 + grow.value * (G - 1)) }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.inverse }, layer]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onDone} accessibilityRole="button" accessibilityLabel={t('proto.skip')}>
        <Grain opacity={0.12} />
        <View style={{ position: 'absolute', left: markLeft, top: markTop }}>
          <MaskReveal delay={120} duration={1000}>
            <Wordmark capHeight={capHeight} color={c.ink.onInverse} dotColor="transparent" />
          </MaskReveal>
        </View>
        <Animated.View
          style={[{ position: 'absolute', left: dot.x - dot.r, top: dot.y - dot.r, width: dot.r * 2, height: dot.r * 2, borderRadius: dot.r, backgroundColor: c.brand.dot }, dotStyle]}
        />
        <View style={[styles.foot, { bottom: f.bottom + 28 }]}>
          <Text variant="micro" tone="onInverseTertiary">
            {t('proto.skip')}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  foot: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
