import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Tactile } from './Tactile';

export interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
  /** field: on white · floating: over a map/photo · inverse: on ink · brand: the live action. */
  variant?: 'field' | 'floating' | 'inverse' | 'brand' | 'plain';
  size?: number;
  badge?: boolean;
}

/** Round, 44 pt, one glyph. Back, call, locate, close. */
export function IconButton({ icon, label, onPress, variant = 'field', size, badge }: IconButtonProps) {
  const theme = useTheme();
  const c = theme.color;
  const s = size ?? theme.layout.iconButton;
  const map = {
    field: { bg: c.surface.field, fg: c.ink.primary },
    floating: { bg: c.surface.panel, fg: c.ink.primary },
    inverse: { bg: c.surface.inverseRaised, fg: c.ink.onInverse },
    brand: { bg: c.brand.fill, fg: c.brand.onFill },
    plain: { bg: 'transparent', fg: c.ink.primary },
  }[variant];
  return (
    <Tactile
      onPress={onPress}
      haptic="select"
      pressScale={0.92}
      accessibilityLabel={label}
      hitSlop={Math.max(0, (theme.a11y.minTouch - s) / 2)}
      style={[styles.btn, { width: s, height: s, borderRadius: s / 2, backgroundColor: map.bg }, variant === 'floating' ? theme.elevation.floating : null]}
    >
      <Icon name={icon} size={Math.round(s * 0.45)} color={map.fg} weight={variant === 'brand' ? 'fill' : 'bold'} />
      {badge ? <View style={[styles.badge, { backgroundColor: c.brand.dot, borderColor: c.surface.panel }]} /> : null}
    </Tactile>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 4.5, borderWidth: 2 },
});
