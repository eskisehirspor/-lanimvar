import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { attempt, confirm } from '@/features/app/Notice';
import { Screen, TAB_CLEARANCE } from '@/features/app/Screen';
import { legalDocs, type LegalDocId } from '@/features/legal/documents';
import { t } from '@/i18n';
import { useTaskerProfile } from '@/lib/api/tasker';
import { deleteAccount, signOut } from '@/lib/auth/providers';
import { useAuth } from '@/lib/auth/store';
import { supportContact } from '@/lib/support';
import { useTheme } from '@/theme';
import { Avatar, Button, Grain, Icon, Panel, Tactile, Text, type IconName } from '@/ui';

const legalOrder: LegalDocId[] = ['terms', 'privacy', 'policy', 'community', 'tasker', 'consent'];

export default function Profile() {
  const theme = useTheme();
  const c = theme.color;
  const profile = useAuth((s) => s.profile);
  const tasker = useTaskerProfile();
  const [busy, setBusy] = useState(false);
  const name = profile?.full_name ?? '';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = profile?.role === 'tasker' ? t('profile.roleTasker') : profile?.role === 'admin' ? t('profile.roleAdmin') : t('profile.roleCustomer');
  const verifiedId = tasker.data?.verification === 'approved';

  const remove = async () => {
    if (!(await confirm(t('profile.deleteTitle'), t('profile.deleteBody'), t('profile.deleteConfirm'), true))) return;
    setBusy(true);
    await attempt(deleteAccount);
    setBusy(false);
  };

  return (
    <Screen background="grouped" contentStyle={{ paddingBottom: TAB_CLEARANCE, gap: 16 }}>
      <View style={[styles.hero, { backgroundColor: c.surface.inverse, marginTop: 8 }]}>
        <Grain opacity={0.1} />
        <Avatar initials={initials || '?'} size={72} tone="brand" verified={verifiedId} />
        <Text variant="display.l" tone="onInverse" style={{ marginTop: 14 }}>
          {name}
        </Text>
        <Text variant="body" tone="onInverseSecondary">
          {roleLabel}
        </Text>
        <View style={styles.badges}>
          <Badge ok={!!profile?.phone_verified_at} label={t('profile.phone')} />
          <Badge ok={!!profile?.email_verified_at} label={t('profile.email')} />
          {profile?.role === 'tasker' ? <Badge ok={verifiedId} label={verifiedId ? t('profile.idApproved') : t('profile.idPending')} /> : null}
        </View>
      </View>

      {profile?.role === 'admin' ? <Row icon="sliders" label={t('profile.admin')} onPress={() => router.push('/admin')} single /> : null}

      <Panel padded={false}>
        <Text variant="micro" tone="tertiary" style={styles.groupTitle}>
          {t('profile.account')}
        </Text>
        <Info icon="phone" label={t('profile.phone')} value={profile?.phone ? `+${profile.phone}` : '—'} />
        <Info icon="chat" label={t('profile.email')} value={profile?.email ?? '—'} />
        <Row icon="home" label={t('profile.address')} value={[profile?.home_neighbourhood, profile?.home_district].filter(Boolean).join(', ') || '—'} onPress={() => router.push('/address')} />
      </Panel>

      <Panel padded={false}>
        <Text variant="micro" tone="tertiary" style={styles.groupTitle}>
          {t('profile.legal')}
        </Text>
        {legalOrder
          .filter((id) => id !== 'tasker' || profile?.role !== 'customer')
          .map((id) => (
            <Row key={id} icon="tasks" label={legalDocs[id].title} onPress={() => router.push(`/legal/${id}`)} />
          ))}
      </Panel>

      <Panel padded={false}>
        <Row icon="chat" label={t('profile.support')} onPress={() => Linking.openURL(`mailto:${supportContact.email}`)} />
        <Row icon="signOut" label={t('profile.signOut')} onPress={() => attempt(signOut)} />
      </Panel>

      <Button level="ghost" align="center" label={t('profile.delete')} loading={busy} onPress={remove} />
    </Screen>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <View style={[styles.badge, { backgroundColor: ok ? c.brand.fill : c.surface.inverseRaised }]}>
      <Icon name={ok ? 'checkCircle' : 'warningCircle'} size={14} color={ok ? c.brand.onFill : c.ink.onInverseSecondary} weight="fill" />
      <Text variant="meta" style={{ color: ok ? c.brand.onFill : c.ink.onInverseSecondary, fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

function Info({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: theme.color.surface.field }]}>
        <Icon name={icon} size="m" />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="meta" tone="tertiary">
          {label}
        </Text>
        <Text variant="label" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Row({ icon, label, value, onPress, single }: { icon: IconName; label: string; value?: string; onPress: () => void; single?: boolean }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <Tactile pressScale={1} pressDim={0.35} haptic="select" onPress={onPress} accessibilityLabel={label} style={[styles.row, single ? { backgroundColor: c.surface.panel, borderRadius: theme.radii.panel } : null]}>
      <View style={[styles.icon, { backgroundColor: c.surface.field }]}>
        <Icon name={icon} size="m" />
      </View>
      <View style={{ flex: 1 }}>
        {value ? (
          <Text variant="meta" tone="tertiary">
            {label}
          </Text>
        ) : null}
        <Text variant="label" numberOfLines={1}>
          {value ?? label}
        </Text>
      </View>
      <Icon name="caretRight" size="s" color={c.ink.tertiary} weight="bold" />
    </Tactile>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 30, padding: 22, overflow: 'hidden' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, height: 28, borderRadius: 14 },
  groupTitle: { paddingHorizontal: 16, paddingTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, minHeight: 62 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
