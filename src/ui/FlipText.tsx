import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { trUpper } from '@/i18n/turkish';
import { durations, useMotion, useTheme, type TypeVariant } from '@/theme';

import type { LayoutAnim } from './motion';
import { Text, type TextTone } from './Text';

/**
 * Split-flap signage: changed characters flip over like a departure board,
 * unchanged characters stay still. The brand's way of saying "status changed".
 */
export function FlipText({ text, variant = 'display.poster', tone = 'primary', upper = true }: { text: string; variant?: TypeVariant; tone?: TextTone; upper?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const value = upper ? trUpper(text) : text;
  const [prev, setPrev] = useState(value);
  const [gen, setGen] = useState(0);
  if (value !== prev) {
    setPrev(value);
    setGen((g) => g + 1);
  }
  const lh = theme.type[variant].lineHeight;
  const chars = value.split('');
  return (
    <View style={[styles.row, { minHeight: lh }]} accessible accessibilityLabel={value} accessibilityLiveRegion="polite">
      {chars.map((ch, i) => (
        <Animated.View key={`${i}-${ch}`} entering={gen ? flipIn(motion, i) : undefined} exiting={flipOut(motion)} style={styles.cell}>
          <Text variant={variant} tone={tone}>
            {ch === ' ' ? ' ' : ch}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

function flipIn(motion: ReturnType<typeof useMotion>, i: number): LayoutAnim {
  if (motion.reduced) return FadeIn.duration(motion.ms(durations.reduced));
  const delay = motion.ms(i * 35);
  const cfg = motion.spring('snappy');
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ perspective: 400 }, { rotateX: '-90deg' }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: 60 })),
        transform: [{ perspective: 400 }, { rotateX: withDelay(delay, withSpring('0deg', cfg)) }],
      },
    };
  };
}

function flipOut(motion: ReturnType<typeof useMotion>): LayoutAnim {
  if (motion.reduced) return FadeOut.duration(motion.ms(durations.reduced));
  const ms = motion.ms(140);
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 1, transform: [{ perspective: 400 }, { rotateX: '0deg' }] },
      animations: { opacity: withTiming(0, { duration: ms }), transform: [{ perspective: 400 }, { rotateX: withTiming('90deg', { duration: ms }) }] },
    };
  };
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { backfaceVisibility: 'hidden' },
});
