import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

/**
 * The PIN as a ticket: a stub you show at the door. The perforation with two
 * notches separates the code from who/when, like a boarding pass.
 */
export function Ticket({ top, bottom, cutout }: { top: ReactNode; bottom: ReactNode; cutout?: string }) {
  const theme = useTheme();
  const c = theme.color;
  const notch = cutout ?? c.surface.base;
  return (
    <View style={{ backgroundColor: c.surface.field, borderRadius: theme.radii.panel }}>
      <View style={{ padding: 20 }}>{top}</View>
      <View style={styles.perf}>
        <View style={[styles.notch, styles.left, { backgroundColor: notch }]} />
        <View style={[styles.dash, { borderColor: c.surface.hairlineStrong }]} />
        <View style={[styles.notch, styles.right, { backgroundColor: notch }]} />
      </View>
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>{bottom}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  perf: { height: 22, justifyContent: 'center' },
  notch: { position: 'absolute', width: 22, height: 22, borderRadius: 11 },
  left: { left: -11 },
  right: { right: -11 },
  dash: { marginHorizontal: 20, borderTopWidth: 1.5, borderStyle: 'dashed' },
});
