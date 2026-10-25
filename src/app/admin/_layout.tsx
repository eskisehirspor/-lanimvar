import { router, Slot, usePathname, type Href } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Wordmark } from '@/brand/Wordmark';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { Icon, Tactile, Text, type IconName } from '@/ui';

const nav: { href: Href; match: string; icon: IconName; label: string }[] = [
  { href: '/admin', match: '/admin', icon: 'home', label: t('admin.nav.dashboard') },
  { href: '/admin/tasks', match: '/admin/tasks', icon: 'tasks', label: t('admin.nav.tasks') },
  { href: '/admin/people', match: '/admin/people', icon: 'people', label: t('admin.nav.people') },
  { href: '/admin/cases', match: '/admin/cases', icon: 'shield', label: t('admin.nav.cases') },
  { href: '/admin/pricing', match: '/admin/pricing', icon: 'ticket', label: t('admin.nav.pricing') },
  { href: '/admin/audit', match: '/admin/audit', icon: 'history', label: t('admin.nav.audit') },
];

/** Admin shell: sidebar on wide screens, a top strip on narrow ones. Route is admin-only (root guard). */
export default function AdminLayout() {
  const theme = useTheme();
  const c = theme.color;
  const path = usePathname();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const isActive = (m: string) => (m === '/admin' ? path === '/admin' : path.startsWith(m));
  const items = nav.map((n) => (
    <Tactile key={n.match} haptic="select" pressScale={1} pressDim={0.3} onPress={() => router.replace(n.href)} style={[styles.item, isActive(n.match) && { backgroundColor: c.surface.inverseRaised }]} accessibilityLabel={n.label}>
      <Icon name={n.icon} size={18} color={isActive(n.match) ? c.brand.dot : c.ink.onInverseSecondary} weight={isActive(n.match) ? 'fill' : 'regular'} />
      {wide ? (
        <Text variant="label" tone={isActive(n.match) ? 'onInverse' : 'onInverseSecondary'}>
          {n.label}
        </Text>
      ) : null}
    </Tactile>
  ));
  return (
    <View style={[styles.flex, { flexDirection: wide ? 'row' : 'column', backgroundColor: c.surface.grouped }]}>
      <View style={[wide ? styles.side : styles.top, { backgroundColor: c.surface.inverse }]}>
        <View style={wide ? styles.brand : styles.brandTop}>
          <Wordmark capHeight={14} color={c.ink.onInverse} />
          {wide ? (
            <Text variant="micro" tone="onInverseTertiary" style={{ marginTop: 10 }}>
              {t('admin.title')}
            </Text>
          ) : null}
        </View>
        <View style={wide ? styles.items : styles.itemsTop}>{items}</View>
        {wide ? (
          <Tactile haptic="select" pressScale={1} pressDim={0.3} onPress={() => router.replace('/')} style={[styles.item, { marginTop: 'auto' }]}>
            <Icon name="arrowLeft" size={18} color={c.ink.onInverseTertiary} />
            <Text variant="label" tone="onInverseTertiary">
              {t('admin.nav.app')}
            </Text>
          </Tactile>
        ) : null}
      </View>
      <View style={styles.flex}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  side: { width: 240, padding: 16, paddingTop: 28 },
  top: { paddingHorizontal: 12, paddingTop: 44, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { paddingHorizontal: 10, marginBottom: 28 },
  brandTop: { paddingHorizontal: 6 },
  items: { gap: 4 },
  itemsTop: { flexDirection: 'row', gap: 2, flex: 1, justifyContent: 'flex-end' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, height: 42, borderRadius: 12 },
});
