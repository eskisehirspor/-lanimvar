import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { durations, useMotion, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Tactile } from './Tactile';

/** Review: five stars; choosing one pops the filled stars in sequence up to it. */
export function RatingStars({ value, onChange, size = 36 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityValue={{ min: 0, max: 5, now: value }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} n={n} on={n <= value} size={size} onPress={() => onChange?.(n)} />
      ))}
    </View>
  );
}

function Star({ n, on, size, onPress }: { n: number; on: boolean; size: number; onPress: () => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const s = useSharedValue(1);
  useEffect(() => {
    if (!on || motion.reduced) return;
    s.set(withDelay(motion.ms(durations.listStagger * (n - 1)), withSequence(withTiming(1.25, motion.timing(110)), withSpring(1, motion.spring('snappy')))));
  }, [on, n, motion, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Tactile onPress={onPress} haptic="select" pressScale={0.85} accessibilityLabel={`${n} yıldız`} hitSlop={4}>
      <Animated.View style={style}>
        <Icon name="star" size={size} color={on ? theme.color.ink.primary : theme.color.surface.fieldStrong} weight="fill" />
      </Animated.View>
    </Tactile>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 6 } });
