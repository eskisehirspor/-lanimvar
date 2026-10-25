import { View } from 'react-native';

import { Card, Page, Stat } from '@/features/admin/ui';
import { t } from '@/i18n';
import { useMetrics } from '@/lib/api/admin';
import { Text } from '@/ui';

function dur(s: number | null) {
  if (s == null) return '—';
  return t('admin.seconds', { m: Math.floor(s / 60), s: Math.round(s % 60) });
}

/** The north-star metric first (time to first acceptance), then the queues. */
export default function Dashboard() {
  const m = useMetrics(7).data;
  const p50Bad = (m?.accept_p50_s ?? 0) > 300;
  const p90Bad = (m?.accept_p90_s ?? 0) > 480;
  return (
    <Page title={t('admin.nav.dashboard')}>
      <Text variant="meta" tone="tertiary">{`${t('admin.last7')} · ${t('admin.target')}`}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Stat label={t('admin.p50')} value={dur(m?.accept_p50_s ?? null)} tone={p50Bad ? 'attention' : 'success'} />
        <Stat label={t('admin.p90')} value={dur(m?.accept_p90_s ?? null)} tone={p90Bad ? 'attention' : 'success'} />
        <Stat label={t('admin.created')} value={String(m?.tasks_created ?? '—')} />
        <Stat label={t('admin.accepted')} value={String(m?.tasks_accepted ?? '—')} />
        <Stat label={t('admin.completed')} value={String(m?.tasks_completed ?? '—')} />
        <Stat label={t('admin.expired')} value={String(m?.tasks_expired ?? '—')} tone={(m?.tasks_expired ?? 0) > 0 ? 'attention' : undefined} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Stat label={t('admin.incidents')} value={String(m?.open_incidents ?? '—')} tone={(m?.open_incidents ?? 0) > 0 ? 'attention' : undefined} />
        <Stat label={t('admin.disputes')} value={String(m?.open_disputes ?? '—')} />
        <Stat label={t('admin.reports')} value={String(m?.open_reports ?? '—')} />
        <Stat label={t('admin.pending')} value={String(m?.pending_taskers ?? '—')} />
        <Stat label={t('admin.online')} value={String(m?.online_taskers ?? '—')} />
      </View>
      <Card>
        <Text variant="meta" tone="secondary">
          {t('admin.pinNever')}
        </Text>
      </Card>
    </Page>
  );
}
