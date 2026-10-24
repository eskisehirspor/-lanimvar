import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

/** A section of a grouped screen: white, generous radius, no border, no shadow. */
export function Panel({ children, padded = true, style }: { children: ReactNode; padded?: boolean; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[{ backgroundColor: theme.color.surface.panel, borderRadius: theme.radii.panel, padding: padded ? theme.space[5] : 0, overflow: 'hidden' }, style]}>
      {children}
    </View>
  );
}

/** Small caps heading above a group, optional trailing action. */
export function SectionHeader({ title, trailing }: { title: string; trailing?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.section, { paddingHorizontal: theme.space[1], marginBottom: theme.space[3] }]}>
      <Text variant="micro" tone="tertiary">
        {title}
      </Text>
      {trailing}
    </View>
  );
}

export function Divider({ inset = 0, onInverse }: { inset?: number; onInverse?: boolean }) {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth * 2, marginLeft: inset, backgroundColor: onInverse ? theme.color.surface.hairlineOnInverse : theme.color.surface.hairline }} />;
}

/** Segmented progress for multi-step flows ("2 of 4"): completed segments ink, current brand. */
export function StepProgress({ step, total }: { step: number; total: number }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <View style={styles.steps} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: step }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.step, { backgroundColor: i < step - 1 ? c.ink.primary : i === step - 1 ? c.brand.fill : c.surface.fieldStrong }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  steps: { flexDirection: 'row', gap: 4, flex: 1 },
  step: { flex: 1, height: 4, borderRadius: 2 },
});
