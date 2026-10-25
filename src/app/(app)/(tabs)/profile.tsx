import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { attempt, confirm } from '@/features/app/Notice';
import { Screen, TAB_CLEARANCE } from '@/features/app/Screen';
import { legalDocs, type LegalDocId } from '@/features/legal/documents';
import { t } from '@/i18n';
import { deleteAccount, signOut } from '@/lib/auth/providers';
import { useAuth } from '@/lib/auth/store';
import { supportContact } from '@/lib/support';
import { useTheme } from '@/theme';
import { Avatar, Button, Icon, Panel, Tactile, Text, type IconName } from '@/ui';

const legalOrder: LegalDocId[] = ['terms', 'privacy', 'policy', 'community', 'tasker', 'consent'];

export default function Profile() {
  const theme = useTheme();
  const c = theme.color;
  const profile = useAuth((s) => s.profile);
  const [busy, setBusy] = useState(false);
  const name = profile?.full_name ?? '';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = profile?.role === 'tasker' ? t('profile.roleTasker') : profile?.role === 'admin' ? t('profile.roleAdmin') : t('profile.roleCustomer');

  const remove = async () => {
    if (!(await confirm(t('profile.deleteTitle'), t('profile.deleteBody'), t('profile.deleteConfirm'), true))) return;
    setBusy(true);
    await attempt(deleteAccount);
    setBusy(false);
  };

  return (
    <Screen background="grouped" contentStyle={{ paddingBottom: TAB_CLEARANCE, gap: 18 }}>
      <View style={[styles.head, { marginTop: 12 }]}>
        <Avatar initials={initials || '?'} size={72} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="display.m">{name}</Text>
          <Text variant="body" tone="secondary">{`${roleLabel}${profile?.phone ? ` · +${profile.phone}` : ''}`}</Text>
        </View>
      </View>

      {profile?.role === 'admin' ? <Row icon="sliders" label={t('profile.admin')} onPress={() => router.push('/admin')} single /> : null}

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

      <Button level="critical" label={t('profile.delete')} loading={busy} onPress={remove} />
      <Text variant="meta" tone="tertiary" align="center" style={{ color: c.ink.tertiary }}>
        {t('profile.deleteBody')}
      </Text>
    </Screen>
  );
}

function Row({ icon, label, onPress, single }: { icon: IconName; label: string; onPress: () => void; single?: boolean }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <Tactile pressScale={1} pressDim={0.35} haptic="select" onPress={onPress} accessibilityLabel={label} style={[styles.row, single ? { backgroundColor: c.surface.panel, borderRadius: theme.radii.panel } : null]}>
      <View style={[styles.icon, { backgroundColor: c.surface.field }]}>
        <Icon name={icon} size="m" />
      </View>
      <Text variant="label" style={{ flex: 1 }}>
        {label}
      </Text>
      <Icon name="caretRight" size="s" color={c.ink.tertiary} weight="bold" />
    </Tactile>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  groupTitle: { paddingHorizontal: 16, paddingTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, minHeight: 60 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
