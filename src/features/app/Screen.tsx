import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

/** Space to leave under content so the floating tab bar never covers it. */
export const TAB_CLEARANCE = 110;

/** Product screen frame: safe areas, gutter, keyboard, optional sticky footer. */
export function Screen({
  children,
  footer,
  scroll = true,
  background = 'base',
  contentStyle,
  edgeToEdge,
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  background?: 'base' | 'grouped' | 'inverse';
  contentStyle?: StyleProp<ViewStyle>;
  /** No top padding (screens that draw under the status bar). */
  edgeToEdge?: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bg = background === 'inverse' ? theme.color.surface.inverse : background === 'grouped' ? theme.color.surface.grouped : theme.color.surface.base;
  const pad = { paddingTop: edgeToEdge ? 0 : insets.top + 12, paddingHorizontal: theme.layout.gutter, paddingBottom: footer ? 16 : insets.bottom + 24 };
  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? (
        <ScrollView style={styles.flex} contentContainerStyle={[pad, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, pad, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={{ paddingHorizontal: theme.layout.gutter, paddingTop: 8, paddingBottom: insets.bottom + 12 }}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

/** Small back affordance for pushed screens. */
export function TopBar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.bar}>
      <View>{left}</View>
      <View>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44, marginBottom: 8 },
});
