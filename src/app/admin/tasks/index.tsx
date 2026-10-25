import { router } from 'expo-router';
import { useState } from 'react';

import { Card, Filter, fmtDate, Page, Row } from '@/features/admin/ui';
import type { TaskStatus } from '@/features/task/model/status';
import { formatTL, t } from '@/i18n';
import { useAdminTasks } from '@/lib/api/admin';
import { StatusWord } from '@/ui';

const filters: (TaskStatus | 'all')[] = ['all', 'searching', 'assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted', 'completed', 'disputed', 'no_show_customer', 'cancelled', 'expired'];

export default function AdminTasks() {
  const [status, setStatus] = useState<TaskStatus | 'all'>('all');
  const q = useAdminTasks(status);
  return (
    <Page title={t('admin.nav.tasks')}>
      <Filter value={status} onChange={setStatus} options={filters.map((f) => ({ key: f, label: f === 'all' ? t('admin.all') : t(`status.${f}`) }))} />
      <Card>
        <Row header cells={[{ content: t('customer.titleLabel'), flex: 3 }, { content: t('customer.approxLabel'), flex: 2 }, { content: 'TL' }, { content: t('admin.colStatus'), flex: 1.4 }, { content: t('admin.colDate'), flex: 1.4 }]} />
        {(q.data ?? []).map((x) => (
          <Row
            key={x.id}
            onPress={() => router.push(`/admin/tasks/${x.id}`)}
            cells={[{ content: x.title, flex: 3 }, { content: x.approx_label, flex: 2 }, { content: formatTL(x.price) }, { content: <StatusWord status={x.status} />, flex: 1.4 }, { content: fmtDate(x.created_at), flex: 1.4 }]}
          />
        ))}
      </Card>
    </Page>
  );
}
