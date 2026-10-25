import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { attempt } from '@/features/app/Notice';
import { Card, Filter, fmtDate, Input, Page } from '@/features/admin/ui';
import { t } from '@/i18n';
import { tr } from '@/i18n/tr';
import { updateDispute, useDisputes } from '@/lib/api/admin';
import type { Dispute, DisputeStatus } from '@/lib/api/types';
import { Button, Chip, Text } from '@/ui';

/** One queue for safety incidents, disputes, user reports and no-shows. Incidents first. */
export default function Cases() {
  const [status, setStatus] = useState<DisputeStatus | 'active'>('active');
  const q = useDisputes(status);
  const rows = [...(q.data ?? [])].sort((a, b) => Number(b.kind === 'incident') - Number(a.kind === 'incident'));
  return (
    <Page title={t('admin.nav.cases')}>
      <Filter
        value={status}
        onChange={setStatus}
        options={[
          { key: 'active', label: `${t('admin.dstatus.open')} + ${t('admin.dstatus.reviewing')}` },
          { key: 'resolved', label: t('admin.dstatus.resolved') },
          { key: 'dismissed', label: t('admin.dstatus.dismissed') },
        ]}
      />
      {rows.map((d) => (
        <CaseCard key={d.id} d={d} />
      ))}
    </Page>
  );
}

function CaseCard({ d }: { d: Dispute }) {
  const [note, setNote] = useState(d.resolution ?? '');
  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip label={t(`admin.kind.${d.kind}`)} tone={d.kind === 'incident' ? 'safety' : 'neutral'} />
        <Chip label={t(`admin.dstatus.${d.status}`)} tone="outline" />
        <Text variant="meta" tone="tertiary">
          {fmtDate(d.created_at)}
        </Text>
      </View>
      <Text variant="title">{d.reason in tr.admin.reasons ? t(`admin.reasons.${d.reason as keyof typeof tr.admin.reasons}`) : d.reason}</Text>
      {d.details ? (
        <Text variant="body" tone="secondary">
          {d.details}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {d.task_id ? <Button size="m" layout="fit" level="secondary" icon="arrowUpRight" label={t('admin.nav.tasks')} onPress={() => router.push(`/admin/tasks/${d.task_id}`)} /> : null}
        <Input value={note} onChangeText={setNote} placeholder={t('admin.resolution')} width={320} />
        {d.status === 'open' ? <Button size="m" layout="fit" level="secondary" label={t('admin.review')} onPress={() => attempt(() => updateDispute(d.id, 'reviewing', note || undefined))} /> : null}
        {['open', 'reviewing'].includes(d.status) ? (
          <>
            <Button size="m" layout="fit" label={t('admin.resolve')} onPress={() => attempt(() => updateDispute(d.id, 'resolved', note || undefined))} />
            <Button size="m" layout="fit" level="ghost" label={t('admin.dismiss')} onPress={() => attempt(() => updateDispute(d.id, 'dismissed', note || undefined))} />
          </>
        ) : null}
      </View>
    </Card>
  );
}
