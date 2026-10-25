import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Check } from '@/features/app/Check';
import { attempt } from '@/features/app/Notice';
import { Screen } from '@/features/app/Screen';
import { LEGAL_VERSION } from '@/features/legal/documents';
import { t } from '@/i18n';
import { rpc } from '@/lib/api/client';
import { refreshProfile } from '@/lib/auth/AuthProvider';
import { useAuth } from '@/lib/auth/store';
import { useTheme } from '@/theme';
import { Button, Field, SelectTile, Text } from '@/ui';

/** Name, role and the legal consents (recorded with the text version). */
export default function Onboarding() {
  const theme = useTheme();
  const profile = useAuth((s) => s.profile);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [role, setRole] = useState<'customer' | 'tasker'>('customer');
  const [terms, setTerms] = useState(false);
  const [taskerTerms, setTaskerTerms] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const ready = name.trim().length >= 2 && terms && kvkk && (role === 'customer' || taskerTerms);

  const submit = async () => {
    setBusy(true);
    await attempt(async () => {
      await rpc('complete_onboarding', { p_full_name: name.trim(), p_role: role, p_accept_terms: terms, p_accept_kvkk: kvkk, p_legal_version: LEGAL_VERSION, p_marketing: marketing });
      await refreshProfile();
    });
    setBusy(false);
  };

  return (
    <Screen footer={<Button label={t('onboarding.submit')} loading={busy} disabled={!ready} onPress={submit} />}>
      <Text variant="display.xl" style={{ marginTop: 24 }}>
        {t('onboarding.title')}
      </Text>
      <View style={{ marginTop: theme.space[6] }}>
        <Field label={t('onboarding.nameLabel')} value={name} onChangeText={setName} placeholder={t('onboarding.namePlaceholder')} maxLength={60} />
      </View>
      <Text variant="label" style={{ marginTop: theme.space[6], marginBottom: theme.space[3] }}>
        {t('onboarding.roleTitle')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SelectTile icon="home" label={t('onboarding.customer')} sublabel={t('onboarding.customerSub')} selected={role === 'customer'} onPress={() => setRole('customer')} />
        <SelectTile icon="handTruck" label={t('onboarding.tasker')} sublabel={t('onboarding.taskerSub')} selected={role === 'tasker'} onPress={() => setRole('tasker')} />
      </View>
      {role === 'tasker' ? (
        <Text variant="meta" tone="secondary" style={{ marginTop: 10 }}>
          {t('onboarding.taskerNote')}
        </Text>
      ) : null}
      <View style={{ marginTop: theme.space[6], gap: 14 }}>
        <Check checked={terms} onToggle={() => setTerms(!terms)} label={t('onboarding.acceptTerms')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/terms')} />
        {role === 'tasker' ? (
          <Check checked={taskerTerms} onToggle={() => setTaskerTerms(!taskerTerms)} label={t('onboarding.acceptTasker')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/tasker')} />
        ) : null}
        <Check checked={kvkk} onToggle={() => setKvkk(!kvkk)} label={t('onboarding.acceptKvkk')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/privacy')} />
        <Check checked={marketing} onToggle={() => setMarketing(!marketing)} label={t('onboarding.marketing')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/consent')} />
      </View>
    </Screen>
  );
}
