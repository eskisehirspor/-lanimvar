import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { attempt, confirm } from '@/features/app/Notice';
import { Card, Filter, fmtDate, Input, Page } from '@/features/admin/ui';
import { formatPhone, t } from '@/i18n';
import { setBanned, setRole, setVerification, usePeople } from '@/lib/api/admin';
import { db } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/store';
import type { AdminPerson, AppRole } from '@/lib/api/types';
import { useTheme } from '@/theme';
import { Button, Chip, Text } from '@/ui';

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
  const theme = useTheme();
  const c = theme.color;
  const self = useAuth((s) => s.session?.user.id) === p.id;
  const [docs, setDocs] = useState<{ id: string | null; selfie: string | null } | null>(null);
  const role = p.role === 'tasker' ? t('profile.roleTasker') : p.role === 'admin' ? t('profile.roleAdmin') : t('profile.roleCustomer');
  const age = p.birth_date ? ageFrom(p.birth_date) : null;
  const showDocs = async () => {
    const paths = [p.id_front_path, p.selfie_path].filter(Boolean) as string[];
    const { data } = await db().storage.from('identity').createSignedUrls(paths, 300);
    setDocs({ id: data?.[0]?.signedUrl ?? null, selfie: data?.[1]?.signedUrl ?? null });
  };
  return (
    <View style={[styles.person, { borderBottomColor: c.surface.hairline }]}>
      <View style={styles.head}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="title">{p.deleted_at ? '—' : (p.full_name ?? '—')}</Text>
          <Text variant="meta" tone="secondary">
            {[role, age ? t('admin.age', { age }) : null, p.home_district, p.phone ? formatPhone(p.phone) : null, p.email].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Text variant="meta" tone="tertiary">
          {fmtDate(p.created_at)}
        </Text>
      </View>
      <View style={styles.tags}>
        <Chip label={t('profile.phone')} icon={p.phone_verified ? 'check' : 'x'} tone={p.phone_verified ? 'success' : 'attention'} />
        <Chip label={t('profile.email')} icon={p.email_verified ? 'check' : 'x'} tone={p.email_verified ? 'success' : 'attention'} />
        {p.verification ? <Chip label={t(`admin.verification.${p.verification}`)} tone={p.verification === 'approved' ? 'success' : 'neutral'} /> : null}
        {p.open_reports ? <Chip label={t('admin.reportsCount', { count: p.open_reports })} tone="safety" /> : null}
        {p.late_cancels >= 2 ? <Chip label={t('admin.suspicious', { count: p.late_cancels })} icon="warningCircle" tone="attention" /> : null}
        {p.is_banned ? <Chip label={t('admin.ban')} tone="safety" /> : null}
      </View>
      {p.role === 'tasker' && p.application_submitted_at ? (
        <View style={[styles.app, { backgroundColor: c.surface.grouped }]}>
          <Text variant="micro" tone="tertiary">
            {t('admin.application')}
          </Text>
          <Text variant="body">{`${t('onboarding.nationalId')}: ${p.national_id ?? '—'} · ${p.has_vehicle ? t('onboarding.vehicle') : t('onboarding.noVehicle')}`}</Text>
          <Text variant="meta" tone="secondary">
            {(p.categories ?? []).join(', ')}
          </Text>
          {docs ? (
            <View style={styles.docs}>
              {docs.id ? <Image source={{ uri: docs.id }} style={styles.doc} /> : null}
              {docs.selfie ? <Image source={{ uri: docs.selfie }} style={styles.doc} /> : null}
            </View>
          ) : (
            <Button size="m" layout="fit" level="secondary" icon="lock" label={t('admin.showDocs')} onPress={() => attempt(showDocs)} />
          )}
        </View>
      ) : null}
      <View style={styles.tags}>
        {p.role === 'tasker' && p.verification !== 'approved' ? <Button size="m" layout="fit" label={t('admin.approve')} disabled={!p.application_submitted_at} onPress={() => attempt(() => setVerification(p.id, 'approved'))} /> : null}
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
        {p.role !== 'admin' && !self ? (
          <Button
            size="m"
            layout="fit"
            level="ghost"
            label={t('admin.makeAdmin')}
            onPress={async () => {
              if (await confirm(t('admin.makeAdmin'), p.full_name ?? '', t('admin.makeAdmin'))) await attempt(() => setRole(p.id, 'admin'));
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

/** Whole years since an ISO birth date (by calendar date, not milliseconds). */
function ageFrom(iso: string) {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const today = new Date();
  return today.getFullYear() - y - (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d) ? 1 : 0);
}

const styles = StyleSheet.create({
  person: { paddingVertical: 16, gap: 10, borderBottomWidth: 1 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  app: { borderRadius: 14, padding: 14, gap: 6 },
  docs: { flexDirection: 'row', gap: 10 },
  doc: { width: 180, height: 220, borderRadius: 12 },
});
