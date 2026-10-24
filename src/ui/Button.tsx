import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { useMotion, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Tactile } from './Tactile';
import { Text } from './Text';

export type ButtonLevel = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'critical';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  /** primary = brand (one per screen) · secondary = ink · tertiary = quiet fill · ghost = text. */
  level?: ButtonLevel;
  size?: 'l' | 'm';
  layout?: 'full' | 'fit';
  align?: 'start' | 'center';
  icon?: IconName;
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}

function useColors(level: ButtonLevel, disabled: boolean) {
  const { color: c } = useTheme();
  if (disabled && level !== 'ghost') return { bg: c.surface.field, fg: c.ink.tertiary };
  switch (level) {
    case 'primary':
      return { bg: c.brand.fill, fg: c.brand.onFill };
    case 'secondary':
      return { bg: c.surface.inverse, fg: c.ink.onInverse };
    case 'tertiary':
      return { bg: c.surface.field, fg: c.ink.primary };
    case 'critical':
      return { bg: c.safety.critical, fg: c.safety.onCritical };
    case 'ghost':
      return { bg: 'transparent', fg: disabled ? c.ink.tertiary : c.ink.primary };
  }
}

function Dot({ i, color, period, reduced }: { i: number; color: string; period: number; reduced: boolean }) {
  const v = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    v.set(withDelay((period / 6) * i, withRepeat(withSequence(withTiming(1, { duration: period / 3 }), withTiming(0, { duration: (period * 2) / 3 })), -1)));
  }, [i, period, reduced, v]);
  const s = useAnimatedStyle(() => ({ opacity: interpolate(v.value, [0, 1], [0.3, 1]), transform: [{ scale: interpolate(v.value, [0, 1], [0.8, 1.1]) }] }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, s]} />;
}

/** Loading keeps the width (label stays in layout, invisible) so nothing jumps. */
export function Button({
  label,
  onPress,
  level = 'primary',
  size = 'l',
  layout = 'full',
  align = 'start',
  icon,
  iconPosition = 'leading',
  loading = false,
  disabled = false,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme();
  const motion = useMotion();
  const { bg, fg } = useColors(level, disabled);
  const l = useSharedValue(loading ? 1 : 0);
  const reduced = motion.reduced;

  useEffect(() => {
    l.set(reduced ? withTiming(loading ? 1 : 0, motion.fade()) : withSpring(loading ? 1 : 0, motion.spring('snappy')));
  }, [loading, motion, reduced, l]);

  const labelStyle = useAnimatedStyle(() => ({ opacity: 1 - l.value, transform: [{ translateY: reduced ? 0 : -8 * l.value }] }));
  const dotsStyle = useAnimatedStyle(() => ({ opacity: l.value, transform: [{ translateY: reduced ? 0 : 8 * (1 - l.value) }] }));

  const ghost = level === 'ghost';
  const h = size === 'l' ? theme.layout.buttonHeight : theme.layout.buttonHeightCompact;
  const iconEl = icon ? <Icon name={icon} size={size === 'l' ? 'm' : 's'} color={fg} weight="bold" /> : null;

  return (
    <Tactile
      onPress={loading || disabled ? undefined : onPress}
      disabled={disabled}
      haptic={ghost ? 'select' : 'press'}
      pressDim={ghost ? 0.4 : 0}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: loading }}
      style={[
        styles.base,
        {
          height: ghost ? Math.max(h, theme.a11y.minTouch) : h,
          borderRadius: theme.radii.button,
          backgroundColor: bg,
          paddingHorizontal: ghost ? theme.space[2] : size === 'l' ? theme.space[6] : theme.space[4],
          alignSelf: layout === 'full' ? 'stretch' : align === 'center' ? 'center' : 'flex-start',
        },
      ]}
    >
      <Animated.View style={[styles.row, labelStyle]}>
        {iconPosition === 'leading' ? iconEl : null}
        <Text variant={size === 'l' ? 'button' : 'label'} numberOfLines={1} style={{ color: fg }}>
          {label}
        </Text>
        {iconPosition === 'trailing' ? iconEl : null}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, dotsStyle]} pointerEvents="none">
        {loading ? (
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <Dot key={i} i={i} color={fg} period={motion.ms(900)} reduced={reduced} />
            ))}
          </View>
        ) : null}
      </Animated.View>
    </Tactile>
  );
}

const styles = StyleSheet.create({
  base: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  center: { alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});
