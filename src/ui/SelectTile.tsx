import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { gestures, useMotion, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Tactile } from './Tactile';
import { Text } from './Text';

export interface SelectTileProps {
  icon: IconName;
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

/** Requirement choice. Selected = ink fill, filled icon, and the brand İ-dot in the corner. */
export function SelectTile({ icon, label, sublabel, selected, onPress, disabled }: SelectTileProps) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const s = useSharedValue(selected ? 1 : 0);
  const reduced = motion.reduced;

  useEffect(() => {
    s.set(reduced ? withTiming(selected ? 1 : 0, motion.fade()) : withSpring(selected ? 1 : 0, motion.spring('snappy')));
  }, [selected, motion, reduced, s]);

  const bg = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(s.value, [0, 1], [c.surface.field, c.surface.inverse]) }));
  const on = useAnimatedStyle(() => ({ opacity: s.value }));
  const off = useAnimatedStyle(() => ({ opacity: 1 - s.value }));
  const dot = useAnimatedStyle(() => ({ opacity: s.value, transform: [{ scale: reduced ? 1 : s.value }] }));

  const textBlock = (inverse: boolean) => (
    <>
      <Text variant="label" tone={inverse ? 'onInverse' : 'primary'} numberOfLines={1}>
        {label}
      </Text>
      {sublabel ? (
        <Text variant="meta" tone={inverse ? 'onInverseSecondary' : 'tertiary'} numberOfLines={1}>
          {sublabel}
        </Text>
      ) : null}
    </>
  );

  return (
    <Tactile
      onPress={onPress}
      disabled={disabled}
      haptic="select"
      pressScale={gestures.tileScale}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
      style={[styles.tile, { borderRadius: theme.radii.tile, padding: 14, opacity: disabled ? 0.45 : 1 }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: theme.radii.tile }, bg]} />
      <View>
        <Animated.View style={off}>
          <Icon name={icon} size="l" color={c.ink.primary} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, on]}>
          <Icon name={icon} size="l" color={c.ink.onInverse} weight="fill" />
        </Animated.View>
      </View>
      <View style={styles.text}>
        <Animated.View style={off}>{textBlock(false)}</Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, on]}>{textBlock(true)}</Animated.View>
      </View>
      <Animated.View style={[styles.dot, { backgroundColor: c.brand.dot }, dot]} />
    </Tactile>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minHeight: 100, justifyContent: 'space-between' },
  text: { marginTop: 14 },
  dot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4 },
});
