import { router, Slot, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { useAuth } from '@/lib/auth/store';
import { useTheme } from '@/theme';
import { Icon, Tactile, type IconName } from '@/ui';

/** Three destinations, one floating bar. Home and the list adapt to the person's role. */
export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const path = usePathname();
  const role = useAuth((s) => s.profile?.role);
  const c = theme.color;
  const items: { href: '/' | '/tasks' | '/profile'; icon: IconName; label: string }[] = [
    { href: '/', icon: 'home', label: t('tabs.home') },
    { href: '/tasks', icon: role === 'tasker' ? 'history' : 'tasks', label: role === 'tasker' ? t('tabs.history') : t('tabs.tasks') },
    { href: '/profile', icon: 'user', label: t('tabs.profile') },
  ];
  return (
    <View style={styles.flex}>
      <Slot />
      <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}>
        <View style={[styles.bar, { backgroundColor: c.surface.inverse }, theme.elevation.dock]}>
          {items.map((it) => {
            const active = path === it.href;
            return (
              <Tactile key={it.href} haptic="select" onPress={() => router.replace(it.href)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={it.label}>
                <Icon name={it.icon} size={22} color={active ? c.brand.dot : c.ink.onInverseTertiary} weight={active ? 'fill' : 'regular'} />
                {active ? <View style={[styles.dot, { backgroundColor: c.brand.dot }]} /> : null}
              </Tactile>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { flexDirection: 'row', height: 60, borderRadius: 30, paddingHorizontal: 10, alignItems: 'center' },
  tab: { width: 62, height: 60, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', bottom: 10, width: 4, height: 4, borderRadius: 2 },
});
