import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { groupPin, t } from '@/i18n';
import { durations, useMotion, useTheme } from '@/theme';

import { Chip } from './Chip';
import { Icon } from './Icon';
import { Text } from './Text';

/**
 * Customer's PIN (arrives from the authorised RPC; never stored here). Two
 * groups of three, the way it is read aloud. Hidden in public by default;
 * reveal staggers left→right.
 */
export function PinDisplay({ pin, revealed, onToggle, verified, compact }: { pin: string; revealed: boolean; onToggle?: () => void; verified?: boolean; compact?: boolean }) {
  const theme = useTheme();
  const [a, b] = groupPin(pin);
  return (
    <View style={{ gap: compact ? 6 : 10 }}>
      <View style={styles.header}>
        <Text variant="micro" tone="tertiary">
          {t('pin.label')}
        </Text>
        {verified ? <Chip tone="success" icon="check" label={t('pin.verified')} /> : null}
      </View>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={revealed ? pin.split('').join(' ') : t('pin.hiddenHint')} style={styles.digits}>
        <Group digits={a} offset={0} revealed={revealed} verified={verified} />
        <View style={{ width: theme.space[4] }} />
        <Group digits={b} offset={4} revealed={revealed} verified={verified} />
      </Pressable>
      {!compact ? (
        <View style={styles.note}>
          <Icon name="shield" size="s" color={theme.color.ink.tertiary} weight="bold" />
          <Text variant="meta" tone="tertiary" style={styles.flex}>
            {revealed ? t('pin.faceToFace') : t('pin.hiddenHint')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Group({ digits, offset, revealed, verified }: { digits: string; offset: number; revealed: boolean; verified?: boolean }) {
  return (
    <View style={styles.group}>
      {digits.split('').map((d, i) => (
        <Digit key={i} d={d} order={offset + i} revealed={revealed} verified={verified} />
      ))}
    </View>
  );
}

function Digit({ d, order, revealed, verified }: { d: string; order: number; revealed: boolean; verified?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const r = useSharedValue(revealed ? 1 : 0);
  const reduced = motion.reduced;
  useEffect(() => {
    r.set(reduced ? withTiming(revealed ? 1 : 0, motion.fade()) : withDelay(revealed ? motion.ms(durations.stagger * order) : 0, withSpring(revealed ? 1 : 0, motion.spring('snappy'))));
  }, [revealed, order, motion, reduced, r]);
  const token = theme.type['numeric.pin'];
  const digit = useAnimatedStyle(() => ({ opacity: r.value, transform: [{ translateY: reduced ? 0 : interpolate(r.value, [0, 1], [token.fontSize * 0.28, 0]) }] }));
  const mask = useAnimatedStyle(() => ({ opacity: 1 - r.value, transform: [{ scale: reduced ? 1 : 1 - r.value * 0.6 }] }));
  return (
    <View style={{ height: token.lineHeight, justifyContent: 'center' }}>
      <Animated.View style={digit}>
        <Text variant="numeric.pin" tone={verified ? 'success' : 'primary'}>
          {d}
        </Text>
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Animated.View style={[styles.mask, { backgroundColor: theme.color.ink.primary }, mask]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28 },
  digits: { flexDirection: 'row', alignSelf: 'flex-start' },
  group: { flexDirection: 'row', gap: 3 },
  mask: { width: 11, height: 11, borderRadius: 5.5 },
  center: { alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  flex: { flex: 1 },
});
