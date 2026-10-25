import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Tactile } from './Tactile';
import { Text } from './Text';

/**
 * The one primary action of a screen: an ink pill with the signal disc. Same
 * shape everywhere, so "this moves me forward" is learned once.
 */
export function CTA({ label, sub, onPress, disabled, loading, icon = 'arrowRight', tone = 'ink' }: { label: string; sub?: string; onPress?: () => void; disabled?: boolean; loading?: boolean; icon?: IconName; tone?: 'ink' | 'brand' }) {
  const theme = useTheme();
  const c = theme.color;
  const off = disabled || loading;
  const bg = disabled ? c.surface.fieldStrong : tone === 'brand' ? c.brand.fill : c.surface.inverse;
  const fg = disabled ? c.ink.tertiary : tone === 'brand' ? c.brand.onFill : c.ink.onInverse;
  const disc = tone === 'brand' ? c.surface.inverse : c.brand.fill;
  const discFg = tone === 'brand' ? c.brand.dot : c.brand.onFill;
  return (
    <Tactile
      haptic="press"
      onPress={off ? undefined : onPress}
      disabled={off}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[styles.cta, { backgroundColor: bg }]}
    >
      <View style={styles.text}>
        <Text variant="button" style={{ color: fg, fontSize: 17 }} numberOfLines={1}>
          {label}
        </Text>
        {sub ? (
          <Text variant="meta" style={{ color: fg, opacity: 0.7 }} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      <View style={[styles.disc, { backgroundColor: disabled ? c.surface.field : disc }]}>
        {loading ? <ActivityIndicator color={discFg} /> : <Icon name={icon} size={22} color={disabled ? c.ink.tertiary : discFg} weight="bold" />}
      </View>
    </Tactile>
  );
}

const styles = StyleSheet.create({
  cta: { height: 64, borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 26, paddingRight: 7 },
  text: { flex: 1, gap: 1 },
  disc: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
});
