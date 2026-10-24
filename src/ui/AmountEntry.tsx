import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { useHaptics } from '@/lib/haptics';
import { formatTL, t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { Chip } from './Chip';
import { Icon } from './Icon';
import { Keypad, type KeypadKey } from './Keypad';
import { playShake } from './motion';
import { RollingNumber } from './RollingNumber';
import { Text } from './Text';

const MAX = 99_999;

/** Budget entry: the amount is the hero over a plain keypad. Low warns, never blocks. */
export function AmountEntry({ value, onChange, recommended, step = 50, floorRatio = 0.8, showKeypad = true }: { value: number; onChange: (v: number) => void; recommended: number; step?: number; floorRatio?: number; showKeypad?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const reject = () => {
    fire('error');
    playShake(shake, motion);
  };
  const onKey = (k: KeypadKey) => {
    if (k === 'back') return onChange(Math.floor(value / 10));
    const next = value * 10 + Number(k);
    if (next > MAX) return reject();
    onChange(next);
  };
  const nudge = (d: number) => {
    const next = Math.max(0, Math.min(MAX, value + d));
    if (next === value) return reject();
    onChange(next);
  };
  const low = value > 0 && value < recommended * floorRatio;

  return (
    <View style={{ gap: theme.space[6] }}>
      <View style={styles.center}>
        <Animated.View style={[styles.amount, shakeStyle]}>
          <RollingNumber value={value} variant="numeric.hero" />
          <Text variant="title" tone="tertiary" style={{ marginBottom: theme.type['numeric.hero'].lineHeight * 0.16, marginLeft: 6 }}>
            {t('common.currency')}
          </Text>
        </Animated.View>
        <View style={styles.hint}>
          {low ? (
            <View style={styles.warn}>
              <Icon name="warningCircle" size="s" color={theme.color.status.attention} weight="fill" />
              <Text variant="meta" tone="attention" emphasis>
                {t('price.belowFloor')}
              </Text>
            </View>
          ) : (
            <Text variant="meta" tone="tertiary">{`${t('price.recommended')} ${formatTL(recommended)} · Eskişehir ortalaması`}</Text>
          )}
        </View>
        <View style={styles.steps}>
          <Chip size="m" tone="outline" label={`−${step}`} onPress={() => nudge(-step)} />
          <Chip size="m" tone={value === recommended ? 'inverse' : 'outline'} label={formatTL(recommended)} onPress={() => onChange(recommended)} />
          <Chip size="m" tone="outline" label={`+${step}`} onPress={() => nudge(step)} />
        </View>
      </View>
      {showKeypad ? <Keypad onKey={onKey} onClear={() => onChange(0)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 10 },
  amount: { flexDirection: 'row', alignItems: 'flex-end' },
  hint: { minHeight: 20, justifyContent: 'center' },
  warn: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 12 },
  steps: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 6 },
});
