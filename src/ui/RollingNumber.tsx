import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { groupThousands } from '@/i18n';
import { useMotion, useTheme, type TypeVariant } from '@/theme';

import { rollIn, rollOut } from './motion';
import { Text, type TextTone } from './Text';

/** Changed digits roll (up when growing, down when shrinking); unchanged digits stay still. */
export function RollingNumber({ value, variant = 'numeric.hero', tone = 'primary', format = groupThousands }: { value: number; variant?: TypeVariant; tone?: TextTone; format?: (n: number) => string }) {
  const theme = useTheme();
  const motion = useMotion();
  const [prev, setPrev] = useState(value);
  const [direction, setDirection] = useState<1 | -1>(1);
  if (value !== prev) {
    setDirection(value > prev ? 1 : -1);
    setPrev(value);
  }
  const chars = format(value).split('');
  const lh = theme.type[variant].lineHeight;
  return (
    <View style={[styles.row, { height: lh }]} accessible accessibilityLabel={format(value)}>
      {chars.map((ch, i) => (
        <Animated.View
          key={`${chars.length - i}-${ch}`}
          entering={rollIn(motion, lh * 0.55, direction)}
          exiting={rollOut(motion, lh * 0.55, direction)}
          layout={motion.reduced ? undefined : LinearTransition.springify().duration(motion.ms(320)).dampingRatio(0.8)}
        >
          <Text variant={variant} tone={tone}>
            {ch}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', overflow: 'hidden' } });
