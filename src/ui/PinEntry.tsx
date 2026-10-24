import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useHaptics } from '@/lib/haptics';
import { PIN_LENGTH, t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Keypad, type KeypadKey } from './Keypad';
import { playShake, riseIn, useBreathing } from './motion';
import { Text } from './Text';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LEN = 40;
const GAP = 8;
const GROUP_GAP = 20;

export type PinEntryStatus = 'idle' | 'error' | 'locked' | 'verified';

export interface PinEntryProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when the sixth digit lands. The SERVER verifies; this only collects. */
  onComplete?: (value: string) => void;
  status?: PinEntryStatus;
  attemptsLeft?: number;
  showKeypad?: boolean;
}

/**
 * Tasker's PIN entry — each outcome is physically distinct:
 * wrong → shake + attention fill · locked → quiet + disabled · verified → six boxes converge into one check.
 */
export function PinEntry({ value, onChange, onComplete, status = 'idle', attemptsLeft, showKeypad = true }: PinEntryProps) {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const c = theme.color;
  const [width, setWidth] = useState(0);
  const cell = Math.min(50, Math.max(34, (width - GAP * 4 - GROUP_GAP) / PIN_LENGTH));
  const shake = useSharedValue(0);
  const flash = useSharedValue(0);
  const converge = useSharedValue(status === 'verified' ? 1 : 0);
  const check = useSharedValue(status === 'verified' ? 1 : 0);
  const reduced = motion.reduced;

  useEffect(() => {
    if (status === 'error') {
      fire('error');
      playShake(shake, motion);
      flash.set(withSequence(withTiming(1, motion.timing(80)), withDelay(motion.ms(450), withTiming(0, motion.timing(280)))));
    }
    if (status === 'verified') {
      fire('success');
      converge.set(reduced ? withTiming(1, motion.fade()) : withSpring(1, motion.spring('hero')));
      check.set(reduced ? withTiming(1, motion.fade()) : withDelay(motion.ms(260), withTiming(1, motion.timing(320))));
    } else {
      converge.set(0);
      check.set(0);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const row = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const success = useAnimatedStyle(() => ({ opacity: converge.value, transform: [{ scale: reduced ? 1 : interpolate(converge.value, [0, 1], [0.3, 1]) }] }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LEN * (1 - check.value) }));

  const locked = status === 'locked';
  const onKey = (k: KeypadKey) => {
    if (status === 'verified' || locked) return;
    if (k === 'back') return onChange(value.slice(0, -1));
    if (value.length >= PIN_LENGTH) return;
    const next = value + k;
    onChange(next);
    if (next.length === PIN_LENGTH) onComplete?.(next);
  };

  const rowWidth = cell * PIN_LENGTH + GAP * 4 + GROUP_GAP;
  const center = rowWidth / 2;
  const cellX = (i: number) => i * (cell + GAP) + (i >= 3 ? GROUP_GAP - GAP : 0) + cell / 2;
  const h = Math.round(cell * 1.18);

  return (
    <View style={{ gap: theme.space[6] }}>
      <View style={styles.center} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Animated.View style={[{ width: rowWidth, height: h }, row]}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <Slot key={i} digit={value[i]} current={!locked && status !== 'verified' && i === value.length} x={cellX(i)} center={center} cell={cell} height={h} converge={converge} flash={flash} locked={locked} />
          ))}
          <Animated.View pointerEvents="none" style={[styles.success, { left: center - 30, top: h / 2 - 30, backgroundColor: c.status.success }, success]}>
            <Svg width={30} height={30} viewBox="0 0 30 30">
              <AnimatedPath d="M7 15.5l5.5 5.5L23.5 9.5" stroke={c.ink.onInverse} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={CHECK_LEN} animatedProps={checkProps} />
            </Svg>
          </Animated.View>
        </Animated.View>
        <View style={styles.message}>
          {status === 'verified' ? (
            <Animated.View entering={riseIn(motion, 380, 8)}>
              <Text variant="label" tone="success">
                {t('pin.verified')}
              </Text>
            </Animated.View>
          ) : locked ? (
            <View style={[styles.locked, { backgroundColor: c.tint.attention, borderRadius: theme.radii.field }]}>
              <Icon name="lock" size="m" color={c.status.attention} weight="fill" />
              <Text variant="meta" style={styles.flex}>
                {t('pin.locked')}
              </Text>
            </View>
          ) : status === 'error' || attemptsLeft !== undefined ? (
            <View style={styles.center}>
              {status === 'error' ? (
                <Text variant="label" tone="attention">
                  {t('pin.wrong')}
                </Text>
              ) : null}
              {attemptsLeft !== undefined ? (
                <Text variant="meta" tone="attention">
                  {t('pin.attemptsLeft', { count: attemptsLeft })}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text variant="meta" tone="tertiary">
              {t('pin.faceToFace')}
            </Text>
          )}
        </View>
      </View>
      {showKeypad ? <Keypad onKey={onKey} onClear={() => onChange('')} disabled={locked || status === 'verified'} /> : null}
    </View>
  );
}

function Slot({ digit, current, x, center, cell, height, converge, flash, locked }: { digit?: string; current: boolean; x: number; center: number; cell: number; height: number; converge: SharedValue<number>; flash: SharedValue<number>; locked: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const caret = useBreathing(current, motion, 1000);
  const filled = digit !== undefined;
  const rest = current ? c.surface.panel : c.surface.field;
  const border = current ? c.focus.ring : 'rgba(0,0,0,0)';
  const reduced = motion.reduced;
  const slot = useAnimatedStyle(() => ({
    opacity: 1 - converge.value,
    backgroundColor: interpolateColor(flash.value, [0, 1], [rest, c.tint.attention]),
    borderColor: interpolateColor(flash.value, [0, 1], [border, c.status.attention]),
    transform: [{ translateX: reduced ? 0 : (center - x) * converge.value }, { scale: reduced ? 1 : 1 - 0.5 * converge.value }],
  }));
  const caretStyle = useAnimatedStyle(() => ({ opacity: 1 - caret.value }));
  return (
    <Animated.View style={[styles.slot, { left: x - cell / 2, width: cell, height, borderRadius: 12 }, slot]}>
      {filled && !locked ? (
        <Animated.View key={digit} entering={riseIn(motion, 0, 8)}>
          <Text variant="display.m">{digit}</Text>
        </Animated.View>
      ) : current ? (
        <Animated.View style={[styles.caret, { backgroundColor: c.ink.primary }, caretStyle]} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 14 },
  slot: { position: 'absolute', top: 0, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  caret: { width: 2, height: 24, borderRadius: 1 },
  success: { position: 'absolute', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  message: { minHeight: 44, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  locked: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, alignSelf: 'stretch' },
  flex: { flex: 1 },
});
