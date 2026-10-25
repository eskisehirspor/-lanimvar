import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categoryLook } from '@/features/app/categories';
import { attempt, notify } from '@/features/app/Notice';
import { TAB_CLEARANCE } from '@/features/app/Screen';
import { formatKm, formatTL, t } from '@/i18n';
import { acceptTask, declineOffer, ping, setOnline, useJobs, useOffers, useTaskerProfile } from '@/lib/api/tasker';
import type { Offer } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/store';
import { currentCoords, watchCoords } from '@/lib/location';
import { useTheme } from '@/theme';
import { Callout, ClayObject, Icon, LiveDot, MaskReveal, Rise, StatusWord, SwipeToAccept, Tactile, Text } from '@/ui';

const activeStatuses = ['assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted'];

export function TaskerHome() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const name = useAuth((s) => s.profile?.full_name ?? '');
  const me = useTaskerProfile();
  const jobs = useJobs();
  const online = !!me.data?.is_online;
  const offers = useOffers(online);
  const active = jobs.data?.find((j) => activeStatuses.includes(j.status));
  const [toggling, setToggling] = useState(false);

  // While online: a foreground heartbeat so dispatch knows where you are.
  useEffect(() => {
    if (!online) return;
    let sub: { remove: () => void } | null = null;
    let cancelled = false;
    watchCoords((p) => ping(p.lat, p.lng).catch(() => undefined))
      .then((s) => (cancelled ? s.remove() : (sub = s)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [online]);

  const toggle = async (next: boolean) => {
    setToggling(true);
    await attempt(async () => {
      if (next) {
        const here = await currentCoords();
        if (!here) {
          notify(t('customer.locationDenied'));
          return;
        }
        await setOnline(true, here.lat, here.lng);
      } else await setOnline(false);
    });
    setToggling(false);
  };

  const verification = me.data?.verification;
  return (
    <ScrollView style={{ backgroundColor: c.surface.grouped }} contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: g, paddingBottom: insets.bottom + TAB_CLEARANCE, gap: 18 }}>
      <Text variant="meta" tone="secondary">
        {t('customer.greeting', { name: name.split(' ')[0] ?? '' })}
      </Text>
      <View>
        <MaskReveal key={`a${online}`} delay={60}>
          <Text variant="display.hero">{online ? t('tasker.heroOnA') : t('tasker.heroOffA')}</Text>
        </MaskReveal>
        <MaskReveal key={`b${online}`} delay={160}>
          <Text variant="display.hero" serif>
            {online ? t('tasker.heroOnB') : t('tasker.heroOffB')}
          </Text>
        </MaskReveal>
      </View>

      {verification && verification !== 'approved' ? (
        <Callout tone="attention" title={verification === 'pending' ? t('tasker.pendingTitle') : t('tasker.rejectedTitle')} body={verification === 'pending' ? t('tasker.pendingBody') : t('tasker.rejectedBody')} />
      ) : (
        <View style={[styles.toggle, { backgroundColor: online ? c.surface.inverse : c.surface.panel }]}>
          <View style={styles.rowTight}>
            {online ? <LiveDot onInverse /> : <Icon name="timer" size={20} color={c.ink.secondary} />}
            <View style={{ flex: 1 }}>
              <Text variant="title" tone={online ? 'onInverse' : 'primary'}>
                {online ? t('tasker.goOffline') : t('tasker.goOnline')}
              </Text>
              <Text variant="meta" tone={online ? 'onInverseSecondary' : 'secondary'}>
                {online ? t('tasker.onlineHint') : t('tasker.offlineHint')}
              </Text>
            </View>
          </View>
          <Switch value={online} disabled={toggling || !!active} onValueChange={toggle} trackColor={{ true: c.brand.fill, false: c.surface.fieldStrong }} thumbColor={c.surface.panel} accessibilityLabel={t('tasker.goOnline')} />
        </View>
      )}

      {active ? (
        <Rise>
          <Text variant="title" style={{ marginBottom: 10 }}>
            {t('tasker.activeJob')}
          </Text>
          <Tactile onPress={() => router.push(`/job/${active.task_id}`)} style={[styles.job, { backgroundColor: c.brand.fill }]} accessibilityLabel={active.title}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="title" tone="onFill">
                {active.title}
              </Text>
              <Text variant="meta" tone="onFill">{`${active.approx_label} · ${formatTL(active.price)}`}</Text>
              <StatusWord status={active.status} />
            </View>
            <Icon name="arrowRight" size={22} color={c.brand.onFill} weight="bold" />
          </Tactile>
        </Rise>
      ) : online ? (
        (offers.data ?? []).length ? (
          (offers.data ?? []).map((o) => <OfferCard key={o.task_id} offer={o} />)
        ) : (
          <View style={styles.empty}>
            <ClayObject name="key" size={120} />
            <Text variant="body" tone="secondary" align="center">
              {t('tasker.noOffers')}
            </Text>
          </View>
        )
      ) : null}
    </ScrollView>
  );
}

function useCountdown(until: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(h);
  }, []);
  return Math.max(0, Math.round((new Date(until).getTime() - now) / 1000));
}

function OfferCard({ offer }: { offer: Offer }) {
  const theme = useTheme();
  const c = theme.color;
  const left = useCountdown(offer.expires_at);
  const look = categoryLook(offer.category);
  if (left === 0) return null;
  return (
    <Rise style={[styles.offer, { backgroundColor: c.surface.inverse }]}>
      <View style={styles.row}>
        <Text variant="micro" tone="onInverseSecondary">
          {t('tasker.offerKicker')}
        </Text>
        <Text variant="label" tone="onInverse">{`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}</Text>
      </View>
      <View style={[styles.bar, { backgroundColor: c.surface.hairlineOnInverse }]}>
        <View style={[styles.barFill, { width: `${Math.min(100, (left / 90) * 100)}%`, backgroundColor: c.brand.dot }]} />
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 6 }}>
          {offer.rehire ? (
            <View style={[styles.badge, { backgroundColor: c.brand.fill }]}>
              <Text variant="micro" tone="onFill">
                {t('task.rehireBadge')}
              </Text>
            </View>
          ) : null}
          <Text variant="numeric.hero" tone="onInverse">
            {offer.price === 0 ? t('task.free') : formatTL(offer.price)}
          </Text>
          <Text variant="title" tone="onInverse">
            {offer.title}
          </Text>
          <Text variant="meta" tone="onInverseSecondary">
            {[
              offer.approx_label,
              offer.distance_m != null ? formatKm(offer.distance_m / 1000) : null,
              offer.scheduled_for ? t('task.startsAt', { time: new Date(offer.scheduled_for).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }) : t('task.now'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <Text variant="meta" tone="onInverseTertiary">
            {t('tasker.offerFrom', { name: offer.customer_first_name, count: offer.customer_tasks })}
          </Text>
        </View>
        <ClayObject name={look.object} size={92} />
      </View>
      {offer.description ? (
        <Text variant="body" tone="onInverseSecondary" numberOfLines={3}>
          {offer.description}
        </Text>
      ) : null}
      <SwipeToAccept
        label={t('tasker.swipe')}
        onAccept={async () => {
          const ok = await attempt(async () => {
            await acceptTask(offer.task_id);
            return true;
          });
          if (ok) router.push(`/job/${offer.task_id}`);
        }}
      />
      <Text variant="label" tone="onInverseSecondary" align="center" onPress={() => attempt(() => declineOffer(offer.task_id))}>
        {t('tasker.decline')}
      </Text>
    </Rise>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowTight: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 24 },
  job: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 24 },
  offer: { borderRadius: 28, padding: 18, gap: 14 },
  bar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 30 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
});
