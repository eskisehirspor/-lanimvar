import { Card, fmtDate, Page, Row } from '@/features/admin/ui';
import { t } from '@/i18n';
import { useAudit } from '@/lib/api/admin';

export default function Audit() {
  const q = useAudit();
  return (
    <Page title={t('admin.nav.audit')}>
      <Card>
        {(q.data ?? []).map((a) => (
          <Row key={a.id} cells={[{ content: fmtDate(a.created_at), flex: 1.2 }, { content: a.action, flex: 1.4 }, { content: `${a.target_type} ${a.target_id?.slice(0, 8) ?? ''}`, flex: 1.4 }, { content: a.actor_id?.slice(0, 8) ?? '—' }, { content: JSON.stringify(a.data), flex: 3 }]} />
        ))}
      </Card>
    </Page>
  );
}
