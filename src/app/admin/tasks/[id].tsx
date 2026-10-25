import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, View } from 'react-native';

import { attempt } from '@/features/app/Notice';
import { Card, fmtDate, Input, Page, Row } from '@/features/admin/ui';
import { formatTL, t } from '@/i18n';
import { readAddress, settleTask, useAdminTask } from '@/lib/api/admin';
import type { ExactAddress } from '@/lib/api/types';
import { Button, StatusWord, Text } from '@/ui';

/** Everything about one task: the timeline is the source of truth for incidents. */
export default function AdminTask() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useAdminTask(id);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [address, setAddress] = useState<ExactAddress | null>(null);
  const d = q.data;
  if (!d) return <Page title="…">{null}</Page>;
  const settleable = ['disputed', 'no_show_customer', 'in_progress', 'proof_submitted'].includes(d.task.status);
  return (
    <Page title={d.task.title} actions={<StatusWord status={d.task.status} />}>
      <Card>
        <Text variant="body">{`${d.task.approx_label} · ${formatTL(d.task.price)} · ${d.task.category}`}</Text>
        {d.task.description ? (
          <Text variant="body" tone="secondary">
            {d.task.description}
          </Text>
        ) : null}
        <Text variant="meta" tone="tertiary">{t('admin.dates', { created: fmtDate(d.task.created_at), accepted: fmtDate(d.task.first_accepted_at), arrived: fmtDate(d.task.arrived_at), done: fmtDate(d.task.completed_at) })}</Text>
        {d.task.cancel_reason ? <Text variant="meta" tone="attention">{d.task.cancel_reason}</Text> : null}
      </Card>

      <Card>
        <Text variant="title">{t('admin.showAddress')}</Text>
        {address ? (
          <Text variant="body">{`${address.exact_address}${address.exact_details ? ` · ${address.exact_details}` : ''}`}</Text>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input value={reason} onChangeText={setReason} placeholder={t('admin.addressReason')} width={360} />
            <Button size="m" layout="fit" level="secondary" label={t('admin.showAddress')} disabled={reason.trim().length < 5} onPress={async () => setAddress((await attempt(() => readAddress(id, reason.trim()))) ?? null)} />
          </View>
        )}
      </Card>

      {settleable ? (
        <Card>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input value={note} onChangeText={setNote} placeholder={t('admin.settleNote')} width={360} />
            <Button size="m" layout="fit" label={t('admin.settleDone')} disabled={note.trim().length < 3} onPress={() => attempt(() => settleTask(id, 'completed', note.trim()))} />
            <Button size="m" layout="fit" level="critical" label={t('admin.settleCancel')} disabled={note.trim().length < 3} onPress={() => attempt(() => settleTask(id, 'cancelled', note.trim()))} />
          </View>
        </Card>
      ) : null}

      <Card>
        <Text variant="title">{t('admin.assignments')}</Text>
        {d.assignments.map((a) => (
          <Row key={a.id} cells={[{ content: a.tasker_id.slice(0, 8), flex: 1 }, { content: a.status }, { content: fmtDate(a.accepted_at) }, { content: a.release_reason ?? '—' }]} />
        ))}
      </Card>

      {d.disputes.length ? (
        <Card>
          <Text variant="title">{t('admin.nav.cases')}</Text>
          {d.disputes.map((x) => (
            <Row key={x.id} cells={[{ content: t(`admin.kind.${x.kind}`) }, { content: x.reason, flex: 2 }, { content: t(`admin.dstatus.${x.status}`) }, { content: fmtDate(x.created_at) }]} />
          ))}
        </Card>
      ) : null}

      {d.media.length ? (
        <Card>
          <Text variant="title">{t('admin.media')}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {d.media.map((m) => (m.url ? <Image key={m.id} source={{ uri: m.url }} style={{ width: 160, height: 160, borderRadius: 12 }} /> : null))}
          </View>
        </Card>
      ) : null}

      <Card>
        <Text variant="title">{t('admin.timeline')}</Text>
        {d.events.map((e) => (
          <Row key={e.id} cells={[{ content: fmtDate(e.created_at), flex: 1.2 }, { content: e.type, flex: 1.4 }, { content: e.actor_id ? e.actor_id.slice(0, 8) : t('admin.system') }, { content: JSON.stringify(e.data), flex: 3 }]} />
        ))}
      </Card>
    </Page>
  );
}
