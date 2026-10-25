import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { Icon, Tactile, Text } from '@/ui';

/** A consent row: tappable box + label + optional "read" link. */
export function Check({ checked, onToggle, label, onRead, readLabel }: { checked: boolean; onToggle: () => void; label: string; onRead?: () => void; readLabel?: string }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <View style={styles.row}>
      <Tactile
        haptic="select"
        pressScale={0.92}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        style={[styles.box, { borderColor: checked ? c.surface.inverse : c.surface.hairlineStrong, backgroundColor: checked ? c.surface.inverse : 'transparent' }]}
      >
        {checked ? <Icon name="check" size={14} color={c.ink.onInverse} weight="bold" /> : null}
      </Tactile>
      <Text variant="body" style={styles.flex} onPress={onToggle}>
        {label}
        {onRead ? (
          <Text variant="body" tone="link" onPress={onRead}>
            {`  ${readLabel ?? ''}`}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  flex: { flex: 1 },
});
