import { useState } from 'react';
import { View } from 'react-native';

import { attempt, confirm } from '@/features/app/Notice';
import { Card, Filter, fmtDate, Input, Page, Row } from '@/features/admin/ui';
import { t } from '@/i18n';
import { setBanned, setRole, setVerification, usePeople } from '@/lib/api/admin';
import { useAuth } from '@/lib/auth/store';
import type { AdminPerson, AppRole } from '@/lib/api/types';
import { Button, Text } from '@/ui';

export default function People() {
  const [query, setQuery] = useState('');
  const [role, setRoleFilter] = useState<AppRole | 'all'>('all');
  const q = usePeople(query.trim(), role);
  return (
    <Page title={t('admin.nav.people')}>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={query} onChangeText={setQuery} placeholder={t('admin.search')} width={300} />
        <Filter
          value={role}
          onChange={setRoleFilter}
          options={[
            { key: 'all', label: t('admin.all') },
            { key: 'customer', label: t('profile.roleCustomer') },
            { key: 'tasker', label: t('profile.roleTasker') },
            { key: 'admin', label: t('profile.roleAdmin') },
          ]}
        />
      </View>
      <Card>
        {(q.data ?? []).map((p) => (
          <Person key={p.id} p={p} />
        ))}
      </Card>
    </Page>
  );
}

function Person({ p }: { p: AdminPerson }) {
  const self = useAuth((s) => s.session?.user.id) === p.id;
  const role = p.role === 'tasker' ? t('profile.roleTasker') : p.role === 'admin' ? t('profile.roleAdmin') : t('profile.roleCustomer');
  return (
    <View>
      <Row
        cells={[
          { content: p.deleted_at ? '—' : (p.full_name ?? '—'), flex: 2 },
          { content: p.phone ? `+${p.phone}` : '—', flex: 1.4 },
          { content: role },
          { content: p.verification ? t(`admin.verification.${p.verification}`) : '' },
          { content: p.open_reports ? t('admin.reportsCount', { count: p.open_reports }) : '' },
          { content: fmtDate(p.created_at), flex: 1.2 },
        ]}
      />
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', paddingBottom: 12 }}>
        {p.role === 'tasker' && p.verification !== 'approved' ? <Button size="m" layout="fit" label={t('admin.approve')} onPress={() => attempt(() => setVerification(p.id, 'approved'))} /> : null}
        {p.role === 'tasker' && p.verification === 'pending' ? <Button size="m" layout="fit" level="secondary" label={t('admin.reject')} onPress={() => attempt(() => setVerification(p.id, 'rejected'))} /> : null}
        {p.role === 'tasker' && p.verification === 'approved' ? <Button size="m" layout="fit" level="secondary" label={t('admin.suspend')} onPress={() => attempt(() => setVerification(p.id, 'suspended'))} /> : null}
        {self ? null : p.is_banned ? (
          <Button size="m" layout="fit" level="secondary" label={t('admin.unban')} onPress={() => attempt(() => setBanned(p.id, false))} />
        ) : (
          <Button
            size="m"
            layout="fit"
            level="critical"
            label={t('admin.ban')}
            onPress={async () => {
              if (await confirm(t('admin.ban'), p.full_name ?? '', t('admin.ban'), true)) await attempt(() => setBanned(p.id, true, 'admin'));
            }}
          />
        )}
        {p.role !== 'admin' && !self ? <Button size="m" layout="fit" level="ghost" label={t('admin.makeAdmin')} onPress={async () => {
          if (await confirm(t('admin.makeAdmin'), p.full_name ?? '', t('admin.makeAdmin'))) await attempt(() => setRole(p.id, 'admin'));
        }} /> : null}
        {p.is_banned ? <Text variant="meta" tone="critical">{t('admin.ban')}</Text> : null}
      </View>
    </View>
  );
}
