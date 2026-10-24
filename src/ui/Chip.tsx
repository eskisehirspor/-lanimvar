import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Tactile } from './Tactile';
import { Text, type TextTone } from './Text';

export type ChipTone = 'neutral' | 'outline' | 'brand' | 'success' | 'attention' | 'safety' | 'inverse';

export interface ChipProps {
  label: string;
  tone?: ChipTone;
  icon?: IconName;
  size?: 's' | 'm';
  onPress?: () => void;
  selected?: boolean;
}

/** Facts (verification, requirements) and, with onPress, quick choices. */
export function Chip({ label, tone = 'neutral', icon, size = 's', onPress, selected }: ChipProps) {
  const theme = useTheme();
  const c = theme.color;
  const t = selected ? 'inverse' : tone;
  const map: Record<ChipTone, { bg: string; fg: string; text: TextTone; border?: string }> = {
    neutral: { bg: c.surface.field, fg: c.ink.secondary, text: 'secondary' },
    outline: { bg: 'transparent', fg: c.ink.primary, text: 'primary', border: c.surface.hairlineStrong },
    brand: { bg: c.tint.brand, fg: c.brand.text, text: 'brand' },
    success: { bg: c.tint.success, fg: c.status.success, text: 'success' },
    attention: { bg: c.tint.attention, fg: c.status.attention, text: 'attention' },
    safety: { bg: c.tint.safety, fg: c.safety.critical, text: 'critical' },
    inverse: { bg: c.surface.inverse, fg: c.ink.onInverse, text: 'onInverse' },
  };
  const m = map[t];
  const h = size === 'm' ? 38 : 28;
  const body = (
    <View
      style={[
        styles.chip,
        { backgroundColor: m.bg, borderRadius: theme.radii.pill, height: h, paddingHorizontal: size === 'm' ? 14 : 10 },
        m.border ? { borderWidth: 1, borderColor: m.border } : null,
      ]}
    >
      {icon ? <Icon name={icon} size={size === 'm' ? 16 : 13} color={m.fg} weight="bold" /> : null}
      <Text variant={size === 'm' ? 'label' : 'meta'} tone={m.text} emphasis numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
  if (!onPress) return body;
  return (
    <Tactile onPress={onPress} haptic="select" pressScale={0.95} accessibilityState={{ selected }} accessibilityLabel={label}>
      {body}
    </Tactile>
  );
}

const styles = StyleSheet.create({ chip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' } });
