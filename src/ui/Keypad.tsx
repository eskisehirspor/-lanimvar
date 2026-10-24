import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useHaptics } from '@/lib/haptics';
import { useMotion, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'back';

const ROWS: (KeypadKey | null)[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [null, '0', 'back'],
];

/**
 * Plain digits, no key boxes. Touch-down blooms a soft disc behind the digit
 * (visible even under the thumb) with a selection tick.
 */
export function Keypad({ onKey, onClear, disabled }: { onKey: (k: KeypadKey) => void; onClear?: () => void; disabled?: boolean }) {
  return (
    <View style={{ opacity: disabled ? 0.3 : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
      {ROWS.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((k, i) => (k ? <Key key={k} k={k} onKey={onKey} onClear={onClear} /> : <View key={`e${i}`} style={styles.key} />))}
        </View>
      ))}
    </View>
  );
}

function Key({ k, onKey, onClear }: { k: KeypadKey; onKey: (k: KeypadKey) => void; onClear?: () => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const p = useSharedValue(0);
  const reduced = motion.reduced;
  const bloom = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: reduced ? 1 : 0.55 + 0.45 * p.value }] }));
  const size = theme.layout.keypadKeyHeight;
  return (
    <Pressable
      style={[styles.key, { height: size }]}
      accessibilityRole="keyboardkey"
      accessibilityLabel={k === 'back' ? 'Sil' : k}
      onPressIn={() => {
        p.set(reduced ? withTiming(1, motion.fade()) : withSpring(1, motion.spring('press')));
        fire('select');
        onKey(k);
      }}
      onPressOut={() => p.set(withTiming(0, motion.timing(240)))}
      onLongPress={k === 'back' ? onClear : undefined}
    >
      <Animated.View style={[styles.bloom, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.color.surface.field }, bloom]} />
      {k === 'back' ? <Icon name="backspace" size="l" /> : <Text variant="numeric.key">{k}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  key: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 62 },
  bloom: { position: 'absolute' },
});
