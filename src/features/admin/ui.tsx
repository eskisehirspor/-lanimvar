import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { Tactile, Text } from '@/ui';

/** Admin page frame: a title row and scrollable content. */
export function Page({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const theme = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.color.surface.grouped }} contentContainerStyle={styles.page}>
      <View style={styles.head}>
        <Text variant="display.l" accessibilityRole="header">
          {title}
        </Text>
        <View style={styles.actions}>{actions}</View>
      </View>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.color.surface.panel, borderColor: theme.color.surface.hairline }, style]}>{children}</View>;
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: 'attention' | 'success' }) {
  return (
    <Card style={styles.stat}>
      <Text variant="micro" tone="tertiary">
        {label}
      </Text>
      <Text variant="numeric.hero" tone={tone === 'attention' ? 'attention' : tone === 'success' ? 'success' : 'primary'} style={{ fontSize: 40, lineHeight: 46 }}>
        {value}
      </Text>
    </Card>
  );
}

export function Filter<T extends string>({ value, options, onChange }: { value: T; options: { key: T; label: string }[]; onChange: (k: T) => void }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Tactile key={o.key} haptic="select" onPress={() => onChange(o.key)} style={[styles.pill, { backgroundColor: on ? c.surface.inverse : c.surface.panel, borderColor: on ? c.surface.inverse : c.surface.hairlineStrong }]}>
            <Text variant="label" tone={on ? 'onInverse' : 'primary'} style={{ fontSize: 14 }}>
              {o.label}
            </Text>
          </Tactile>
        );
      })}
    </ScrollView>
  );
}

export function Input({ value, onChangeText, placeholder, width, numeric }: { value: string; onChangeText: (v: string) => void; placeholder?: string; width?: number; numeric?: boolean }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={c.ink.tertiary}
      keyboardType={numeric ? 'number-pad' : 'default'}
      style={[styles.input, theme.type.body, { width, color: c.ink.primary, backgroundColor: c.surface.field, borderColor: c.surface.hairline, fontFamily: theme.type.body.fontFamily }]}
    />
  );
}

/** A simple table row: cells share width by flex weights. */
export function Row({ cells, onPress, header }: { cells: { content: ReactNode; flex?: number }[]; onPress?: () => void; header?: boolean }) {
  const theme = useTheme();
  const inner = (
    <View style={[styles.row, { borderBottomColor: theme.color.surface.hairline }]}>
      {cells.map((cell, i) => (
        <View key={i} style={{ flex: cell.flex ?? 1, minWidth: 0 }}>
          {typeof cell.content === 'string' || typeof cell.content === 'number' ? (
            <Text variant={header ? 'micro' : 'body'} tone={header ? 'tertiary' : 'primary'} numberOfLines={1}>
              {String(cell.content)}
            </Text>
          ) : (
            cell.content
          )}
        </View>
      ))}
    </View>
  );
  return onPress ? (
    <Tactile pressScale={1} pressDim={0.3} haptic="select" onPress={onPress}>
      {inner}
    </Tactile>
  ) : (
    inner
  );
}

export function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
}

const styles = StyleSheet.create({
  page: { padding: 28, gap: 18, maxWidth: 1240, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  card: { borderRadius: 18, padding: 18, borderWidth: 1, gap: 10 },
  stat: { flexGrow: 1, flexBasis: 200 },
  pill: { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  input: { height: 42, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, outlineWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
});
