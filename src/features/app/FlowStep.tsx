import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { IconButton, MaskReveal, Rise, Text } from '@/ui';

/**
 * One question per screen: a thin progress rail, an editorial title (with an
 * optional italic accent), the inputs, and one primary action at the bottom.
 */
export function FlowStep({
  step,
  total,
  title,
  accent,
  sub,
  onBack,
  children,
  footer,
}: {
  step: number;
  total: number;
  title: string;
  accent?: string;
  sub?: string;
  onBack?: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: c.surface.base }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: g }}>
        <View style={styles.top}>
          {onBack ? <IconButton icon="arrowLeft" label="Geri" onPress={onBack} /> : <View style={{ width: 44 }} />}
          <View style={styles.rail} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: step }}>
            {Array.from({ length: total }, (_, i) => (
              <View key={i} style={[styles.seg, { backgroundColor: i < step ? c.surface.inverse : c.surface.fieldStrong }]} />
            ))}
          </View>
          <Text variant="meta" tone="tertiary" style={styles.count}>{`${step}/${total}`}</Text>
        </View>
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={{ paddingHorizontal: g, paddingTop: 28, paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <MaskReveal delay={40}>
          <Text variant="display.xl" accessibilityRole="header">
            {title}
            {accent ? (
              <Text variant="display.xl" serif>
                {` ${accent}`}
              </Text>
            ) : null}
          </Text>
        </MaskReveal>
        {sub ? (
          <Rise delay={140}>
            <Text variant="body.l" tone="secondary" style={{ marginTop: 10 }}>
              {sub}
            </Text>
          </Rise>
        ) : null}
        <Rise delay={220} style={{ marginTop: 28, gap: 16 }}>
          {children}
        </Rise>
      </ScrollView>
      <View style={{ paddingHorizontal: g, paddingTop: 8, paddingBottom: insets.bottom + 12 }}>{footer}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 44 },
  rail: { flex: 1, flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  count: { minWidth: 30, textAlign: 'right' },
});
