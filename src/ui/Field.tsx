import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { t } from '@/i18n';
import { durations, useMotion, useTheme } from '@/theme';
import { toTextStyle } from '@/theme/typography';

import { Icon, type IconName } from './Icon';
import { riseIn } from './motion';
import { Text } from './Text';

export interface FieldProps extends Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'autoFocus' | 'maxLength'> {
  label?: string;
  optional?: boolean;
  multiline?: boolean;
  leadingIcon?: IconName;
  error?: string;
  hint?: string;
  disabled?: boolean;
  /** Show a character counter (with maxLength). */
  counter?: boolean;
  /** Force the focused look (specimens). */
  focused?: boolean;
}

/** Filled, borderless. State is carried by FILL: rest = field, focus = white + ring, error = attention tint. */
export function Field({ label, optional, multiline, leadingIcon, error, hint, disabled, counter, focused: forced, ...input }: FieldProps) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const [focused, setFocused] = useState(false);
  const isFocused = forced ?? focused;
  const f = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    f.set(withTiming(isFocused ? 1 : 0, motion.reduced ? motion.fade() : motion.timing(durations.micro)));
  }, [isFocused, motion, f]);

  const rest = error ? c.tint.attention : c.surface.field;
  const ring = error ? c.status.attention : c.focus.ring;
  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(f.value, [0, 1], [rest, c.surface.panel]),
    borderColor: interpolateColor(f.value, [0, 1], ['rgba(0,0,0,0)', ring]),
  }));

  const len = input.value?.length ?? 0;
  return (
    <View style={{ gap: theme.layout.labelGap, opacity: disabled ? 0.55 : 1 }}>
      {label ? (
        <View style={styles.labelRow}>
          <Text variant="label">{label}</Text>
          {optional ? (
            <Text variant="meta" tone="tertiary">
              {t('field.optional')}
            </Text>
          ) : null}
        </View>
      ) : null}
      <Animated.View
        style={[
          styles.box,
          {
            minHeight: multiline ? 136 : theme.layout.fieldHeight,
            borderRadius: theme.radii.field,
            paddingHorizontal: theme.space[4],
            alignItems: multiline ? 'flex-start' : 'center',
            paddingVertical: multiline ? 14 : 0,
          },
          box,
        ]}
      >
        {leadingIcon ? <Icon name={leadingIcon} size="m" color={isFocused ? c.ink.primary : c.ink.tertiary} /> : null}
        <TextInput
          {...input}
          editable={!disabled}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={c.ink.tertiary}
          selectionColor={c.focus.ring}
          cursorColor={c.ink.primary}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          style={[toTextStyle(theme.type['body.l']), styles.input, { color: c.ink.primary, textAlignVertical: multiline ? 'top' : 'center' }]}
        />
      </Animated.View>
      {error ? (
        <Animated.View key={error} entering={riseIn(motion, 0, 4)} style={styles.message}>
          <Icon name="warningCircle" size="s" color={c.status.attention} weight="fill" />
          <Text variant="meta" tone="attention" emphasis>
            {error}
          </Text>
        </Animated.View>
      ) : hint || (counter && input.maxLength) ? (
        <View style={styles.labelRow}>
          <Text variant="meta" tone="tertiary" style={styles.flex}>
            {hint ?? ''}
          </Text>
          {counter && input.maxLength ? (
            <Text variant="meta" tone="tertiary">{`${len}/${input.maxLength}`}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  box: { flexDirection: 'row', gap: 12, borderWidth: 1.5 },
  input: { flex: 1, minHeight: 24, paddingVertical: 0, outlineWidth: 0 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flex: { flex: 1 },
});
