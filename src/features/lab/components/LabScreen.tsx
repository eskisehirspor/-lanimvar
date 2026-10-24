import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { IconButton, Text } from '@/ui';

/** Lab page chrome: back, section index, one display title, content on the grouped surface. */
export function LabScreen({ index, title, intro, children }: { index: string; title: string; intro?: string; children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const g = theme.layout.gutter;
  return (
    <View style={[styles.flex, { backgroundColor: theme.color.surface.grouped }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 160 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: g, gap: 10 }}>
          <View style={styles.top}>
            <IconButton icon="arrowLeft" label="Geri" variant="floating" onPress={() => router.back()} />
            <Text variant="micro" tone="tertiary">{`${index} · ${title}`}</Text>
          </View>
          <Text variant="display.l" accessibilityRole="header" style={{ marginTop: theme.space[5] }}>
            {title}
          </Text>
          {intro ? (
            <Text variant="body" tone="secondary">
              {intro}
            </Text>
          ) : null}
        </View>
        <View style={{ paddingHorizontal: g, marginTop: theme.layout.sectionGap, gap: theme.space[4] }}>{children}</View>
      </ScrollView>
    </View>
  );
}

/** A labelled group inside a white panel. */
export function LabGroup({ title, note, children, bleed }: { title: string; note?: string; children: ReactNode; bleed?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ paddingHorizontal: 4, gap: 2 }}>
        <Text variant="title">{title}</Text>
        {note ? (
          <Text variant="meta" tone="tertiary">
            {note}
          </Text>
        ) : null}
      </View>
      <View style={{ backgroundColor: theme.color.surface.panel, borderRadius: theme.radii.panel, padding: bleed ? 0 : theme.space[5], overflow: 'hidden', gap: theme.space[5] }}>{children}</View>
    </View>
  );
}

/** A specimen caption. `token` is a code identifier, shown verbatim (never Turkish-uppercased). */
export function Specimen({ caption, token, children }: { caption?: string; token?: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 1 }}>
        {token ? (
          <Text variant="meta" emphasis tone="secondary">
            {token}
          </Text>
        ) : null}
        {caption ? (
          <Text variant="micro" tone="tertiary">
            {caption}
          </Text>
        ) : null}
      </View>
      <View style={{ gap: theme.space[3] }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
});
