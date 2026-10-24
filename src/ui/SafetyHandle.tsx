import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { Icon } from './Icon';
import { useBreathing } from './motion';
import { Tactile } from './Tactile';
import { Text } from './Text';

export type SafetyHandleState = 'normal' | 'checkInDue' | 'incident';

/**
 * Always visible from "accepted" to "completed", top-right, never in a menu.
 * Labelled so it is found under stress. Pulses only when a check-in is due.
 */
export function SafetyHandle({ state = 'normal', onPress, floating }: { state?: SafetyHandleState; onPress: () => void; floating?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const due = state === 'checkInDue';
  const ring = useBreathing(due, motion, 1600);
  const ringStyle = useAnimatedStyle(() => ({ opacity: interpolate(ring.value, [0, 1], [0.6, 0]), transform: [{ scaleX: interpolate(ring.value, [0, 1], [1, 1.16]) }, { scaleY: interpolate(ring.value, [0, 1], [1, 1.45]) }] }));
  const tone = state === 'incident' ? { bg: c.tint.safety, fg: c.safety.critical } : due ? { bg: c.tint.attention, fg: c.status.attention } : { bg: floating ? c.surface.panel : c.surface.field, fg: c.ink.primary };
  return (
    <Tactile onPress={onPress} hitSlop={6} accessibilityLabel={t('safety.handle')} style={styles.wrap}>
      {due ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: theme.radii.pill, borderWidth: 2, borderColor: tone.fg }, ringStyle]} /> : null}
      <View style={[styles.pill, { backgroundColor: tone.bg, borderRadius: theme.radii.pill }, floating ? theme.elevation.floating : null]}>
        <Icon name="shield" size={18} color={tone.fg} weight="fill" />
        <Text variant="label" style={{ color: tone.fg }}>
          {due ? t('safety.checkInDue') : t('safety.handle')}
        </Text>
      </View>
    </Tactile>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14 },
});
