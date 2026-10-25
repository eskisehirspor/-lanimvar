import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categoryLook } from '@/features/app/categories';
import { TAB_CLEARANCE } from '@/features/app/Screen';
import { formatTL, t } from '@/i18n';
import { useMyTasks, usePricing } from '@/lib/api/customer';
import type { CategorySection, PricingRule } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/store';
import { useTheme } from '@/theme';
import { Avatar, ClayObject, Grain, Icon, LiveDot, MaskReveal, Rise, Skeleton, StatusWord, Tactile, Text } from '@/ui';

const live = ['searching', 'assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted'];
const order: CategorySection[] = ['daily', 'wait', 'pets', 'extra'];

export function CustomerHome() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const profile = useAuth((s) => s.profile);
  const pricing = usePricing();
  const rules = pricing.data ?? [];
  const tasks = useMyTasks();
  const active = (tasks.data ?? []).filter((x) => live.includes(x.status));
  const past = (tasks.data ?? []).filter((x) => !live.includes(x.status)).slice(0, 3);
  const first = profile?.first_name ?? (profile?.full_name ?? '').split(' ')[0] ?? '';
  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const social = rules.filter((r) => r.section === 'social');

  return (
    <ScrollView style={{ backgroundColor: c.surface.grouped }} contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + TAB_CLEARANCE }} showsVerticalScrollIndicator={false}>
      <View style={[styles.row, { paddingHorizontal: g }]}>
        <View style={styles.place}>
          <Icon name="mapPin" size={16} color={c.ink.secondary} weight="fill" />
          <Text variant="label" tone="secondary">
            {profile?.home_neighbourhood ?? profile?.home_district ?? 'Eskişehir'}
          </Text>
        </View>
        <Tactile haptic="select" onPress={() => router.replace('/profile')} accessibilityLabel={t('profile.title')}>
          <Avatar initials={initials || '?'} size={44} />
        </Tactile>
      </View>

      <View style={{ paddingHorizontal: g, marginTop: 14 }}>
        <Text variant="meta" tone="secondary">
          {t('customer.greeting', { name: first })}
        </Text>
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

      <Rise delay={260} style={{ paddingHorizontal: g, marginTop: 18 }}>
        <Tactile onPress={() => router.push('/task/new')} pressScale={0.985} style={[styles.composer, { backgroundColor: c.surface.panel, borderColor: c.surface.hairline }, theme.elevation.floating]} accessibilityLabel={t('customer.composer')}>
          <Icon name="sparkle" size={20} color={c.ink.tertiary} weight="fill" />
          <View style={styles.flex}>
            <Text variant="title">{t('customer.composer')}</Text>
            <Text variant="meta" tone="tertiary" numberOfLines={1}>
              {t('customer.composerHint')}
            </Text>
          </View>
          <View style={[styles.go, { backgroundColor: c.brand.fill }]}>
            <Icon name="arrowRight" size={22} color={c.brand.onFill} weight="bold" />
          </View>
        </Tactile>
      </Rise>

      {active.length ? (
        <Rise delay={300} style={{ paddingHorizontal: g, marginTop: 14, gap: 8 }}>
          {active.map((x) => (
            <Tactile key={x.id} onPress={() => router.push(`/task/${x.id}`)} style={[styles.live, { backgroundColor: c.surface.inverse }]} accessibilityLabel={x.title}>
              <LiveDot onInverse />
              <View style={styles.flex}>
                <Text variant="label" tone="onInverse" numberOfLines={1}>
                  {x.title}
                </Text>
                <Text variant="meta" tone="onInverseSecondary">
                  {t(`status.${x.status}`)}
                </Text>
              </View>
              <Icon name="arrowRight" size={20} color={c.brand.dot} weight="bold" />
            </Tactile>
          ))}
        </Rise>
      ) : null}

      {social.length ? (
        <Rise delay={340} style={{ paddingHorizontal: g, marginTop: 22 }}>
          <Tactile onPress={() => router.push({ pathname: '/task/new', params: { category: 'okey' } })} pressScale={0.985} style={[styles.feature, { backgroundColor: c.surface.inverse }]} accessibilityLabel={t('customer.socialTitle')}>
            <Grain opacity={0.1} />
            <View style={styles.flex}>
              <Text variant="micro" style={{ color: c.brand.dot }}>
                {t('sections.social')}
              </Text>
              <Text variant="display.m" tone="onInverse" style={{ marginTop: 6 }}>
                {t('customer.socialTitle')}
                <Text variant="display.m" serif style={{ color: c.brand.dot }}>
                  {` ${t('customer.socialAccent')}`}
                </Text>
              </Text>
              <Text variant="meta" tone="onInverseSecondary" style={{ marginTop: 6 }}>
                {t('customer.socialSub')}
              </Text>
            </View>
            <ClayObject name="tiles" size={96} />
          </Tactile>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: -g }} contentContainerStyle={{ paddingHorizontal: g, gap: 8 }}>
            {social.map((r) => (
              <SocialChip key={r.id} rule={r} />
            ))}
          </ScrollView>
        </Rise>
      ) : null}

      {pricing.isLoading ? (
        <View style={{ paddingHorizontal: g, marginTop: 24, flexDirection: 'row', gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width={128} height={150} radius={24} />
          ))}
        </View>
      ) : (
        order.map((section, si) => {
          const list = rules.filter((r) => r.section === section);
          if (!list.length) return null;
          return (
            <Rise key={section} delay={380 + si * 60} style={{ marginTop: 26 }}>
              <Text variant="title" style={{ paddingHorizontal: g, marginBottom: 10 }}>
                {t(`sections.${section}`)}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: g, gap: 10 }}>
                {list.map((r) => (
                  <CategoryCard key={r.id} rule={r} />
                ))}
              </ScrollView>
            </Rise>
          );
        })
      )}

      {past.length ? (
        <View style={{ paddingHorizontal: g, marginTop: 28, gap: 8 }}>
          <Text variant="title">{t('customer.myTasks')}</Text>
          {past.map((x) => (
            <Tactile key={x.id} pressScale={0.98} onPress={() => router.push(`/task/${x.id}`)} style={[styles.past, { backgroundColor: c.surface.panel }]}>
              <ClayObject name={categoryLook(x.category).object} size={44} />
              <View style={styles.flex}>
                <Text variant="label" numberOfLines={1}>
                  {x.title}
                </Text>
                <StatusWord status={x.status} />
              </View>
              <Text variant="label">{x.price === 0 ? t('task.free') : formatTL(x.price)}</Text>
            </Tactile>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function CategoryCard({ rule }: { rule: PricingRule }) {
  const theme = useTheme();
  const look = categoryLook(rule.category);
  return (
    <Tactile
      haptic="select"
      pressScale={0.96}
      onPress={() => router.push({ pathname: '/task/new', params: { category: rule.category } })}
      style={[styles.card, { backgroundColor: theme.illustration.stage[look.stage] }]}
      accessibilityLabel={rule.label}
    >
      <View style={styles.cardArt}>
        <ClayObject name={look.object} size={92} />
      </View>
      <View style={styles.cardText}>
        <Text variant="label" style={{ color: theme.illustration.ink, fontSize: 14 }} numberOfLines={2}>
          {rule.label}
        </Text>
        <Text variant="meta" style={{ color: theme.illustration.ink, opacity: 0.6 }}>{`~${formatTL(rule.recommended_price)}`}</Text>
      </View>
    </Tactile>
  );
}

function SocialChip({ rule }: { rule: PricingRule }) {
  const theme = useTheme();
  const c = theme.color;
  const look = categoryLook(rule.category);
  return (
    <Tactile haptic="select" onPress={() => router.push({ pathname: '/task/new', params: { category: rule.category } })} style={[styles.socialChip, { backgroundColor: c.surface.panel, borderColor: c.surface.hairline }]} accessibilityLabel={rule.label}>
      <ClayObject name={look.object} size={30} />
      <Text variant="label" style={{ fontSize: 14 }}>
        {rule.label}
      </Text>
    </Tactile>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  place: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingLeft: 18, borderRadius: 32, borderWidth: 1 },
  go: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 22 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 20, borderRadius: 28, overflow: 'hidden' },
  socialChip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingLeft: 8, paddingRight: 14, borderRadius: 22, borderWidth: 1 },
  card: { width: 128, height: 150, borderRadius: 24, overflow: 'hidden' },
  cardArt: { alignItems: 'center', marginTop: 4 },
  cardText: { position: 'absolute', left: 12, bottom: 10, right: 8 },
  past: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18 },
});
