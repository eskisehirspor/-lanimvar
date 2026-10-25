import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categoryLook } from '@/features/app/categories';
import { TAB_CLEARANCE } from '@/features/app/Screen';
import { formatTL, t } from '@/i18n';
import { usePricing, useMyTasks } from '@/lib/api/customer';
import { useAuth } from '@/lib/auth/store';
import { useTheme } from '@/theme';
import { Avatar, ClayObject, Icon, LiveDot, MaskReveal, Rise, Skeleton, StatusWord, Tactile, Text } from '@/ui';

const live = ['searching', 'assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted'];

export function CustomerHome() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const profile = useAuth((s) => s.profile);
  const pricing = usePricing();
  const tasks = useMyTasks();
  const active = tasks.data?.find((x) => live.includes(x.status));
  const first = (profile?.full_name ?? '').split(' ')[0] ?? '';
  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView style={{ backgroundColor: c.surface.grouped }} contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + TAB_CLEARANCE }} showsVerticalScrollIndicator={false}>
      <View style={[styles.row, { paddingHorizontal: g }]}>
        <Text variant="meta" tone="secondary">
          {t('customer.greeting', { name: first })}
        </Text>
        <Tactile haptic="select" onPress={() => router.replace('/profile')} accessibilityLabel={t('profile.title')}>
          <Avatar initials={initials || '?'} size={44} />
        </Tactile>
      </View>

      <View style={{ paddingHorizontal: g, marginTop: 8 }}>
        <MaskReveal delay={80}>
          <Text variant="display.hero">{t('customer.heroA')}</Text>
        </MaskReveal>
        <MaskReveal delay={180}>
          <Text variant="display.hero">
            <Text variant="display.hero" serif>
              {t('customer.heroB')}
            </Text>{' '}
            {t('customer.heroC')}
          </Text>
        </MaskReveal>
      </View>

      {active ? (
        <Rise delay={240} style={{ paddingHorizontal: g, marginTop: 20 }}>
          <Tactile onPress={() => router.push(`/task/${active.id}`)} style={[styles.live, { backgroundColor: c.surface.inverse }]} accessibilityLabel={t('customer.activeTask')}>
            <LiveDot onInverse />
            <View style={styles.flex}>
              <Text variant="label" tone="onInverse" numberOfLines={1}>
                {active.title}
              </Text>
              <Text variant="meta" tone="onInverseSecondary">
                {t(`status.${active.status}`)}
              </Text>
            </View>
            <Icon name="arrowRight" size={20} color={c.brand.dot} weight="bold" />
          </Tactile>
        </Rise>
      ) : null}

      <Rise delay={300} style={{ paddingHorizontal: g, marginTop: 20 }}>
        <Tactile onPress={() => router.push('/task/new')} style={[styles.composer, { backgroundColor: c.surface.panel, borderColor: c.surface.hairline }]} accessibilityLabel={t('customer.composer')}>
          <View style={styles.flex}>
            <Text variant="title">{t('customer.composer')}</Text>
            <Text variant="meta" tone="tertiary" numberOfLines={1}>
              {t('customer.composerHint')}
            </Text>
          </View>
          <View style={[styles.go, { backgroundColor: c.brand.fill }]}>
            <Icon name="plus" size={24} color={c.brand.onFill} weight="bold" />
          </View>
        </Tactile>
      </Rise>

      <Rise delay={380} style={{ marginTop: 28 }}>
        <Text variant="title" style={{ paddingHorizontal: g, marginBottom: 12 }}>
          {t('customer.categories')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: g, gap: 10 }}>
          {pricing.isLoading
            ? [0, 1, 2].map((i) => <Skeleton key={i} width={138} height={164} radius={26} />)
            : (pricing.data ?? []).map((rule) => {
                const look = categoryLook(rule.category);
                return (
                  <Tactile
                    key={rule.id}
                    haptic="select"
                    pressScale={0.96}
                    onPress={() => router.push({ pathname: '/task/new', params: { category: rule.category } })}
                    style={[styles.card, { backgroundColor: theme.illustration.stage[look.stage] }]}
                    accessibilityLabel={rule.label}
                  >
                    <View style={styles.cardArt}>
                      <ClayObject name={look.object} size={104} />
                    </View>
                    <View style={styles.cardText}>
                      <Text variant="label" style={{ color: theme.illustration.ink }}>
                        {rule.label}
                      </Text>
                      <Text variant="meta" style={{ color: theme.illustration.ink, opacity: 0.62 }}>{`~${formatTL(rule.recommended_price)}`}</Text>
                    </View>
                  </Tactile>
                );
              })}
        </ScrollView>
      </Rise>

      {tasks.data && tasks.data.filter((x) => !live.includes(x.status)).length ? (
        <View style={{ paddingHorizontal: g, marginTop: 28, gap: 10 }}>
          <Text variant="title">{t('customer.myTasks')}</Text>
          {tasks.data
            .filter((x) => !live.includes(x.status))
            .slice(0, 3)
            .map((x) => (
              <Tactile key={x.id} pressScale={0.98} onPress={() => router.push(`/task/${x.id}`)} style={[styles.past, { backgroundColor: c.surface.panel }]}>
                <View style={styles.flex}>
                  <Text variant="label" numberOfLines={1}>
                    {x.title}
                  </Text>
                  <StatusWord status={x.status} />
                </View>
                <Text variant="label">{formatTL(x.price)}</Text>
              </Tactile>
            ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 22 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingLeft: 20, borderRadius: 26, borderWidth: 1 },
  go: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  card: { width: 138, height: 164, borderRadius: 26, overflow: 'hidden' },
  cardArt: { alignItems: 'center', marginTop: 6 },
  cardText: { position: 'absolute', left: 14, bottom: 12, right: 10 },
  past: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18 },
});
