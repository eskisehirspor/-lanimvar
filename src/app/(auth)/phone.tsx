import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FlowStep } from '@/features/app/FlowStep';
import { attempt } from '@/features/app/Notice';
import { t } from '@/i18n';
import { normalizeTrPhone, sendPhoneCode } from '@/lib/auth/providers';
import { isDemo } from '@/lib/supabase/config';
import { Chip, CTA, Field, Text } from '@/ui';

export default function Phone() {
  const [raw, setRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const phone = normalizeTrPhone(raw);

  const send = async () => {
    setTouched(true);
    if (!phone) return;
    setBusy(true);
    const ok = await attempt(async () => {
      await sendPhoneCode(phone);
      return true;
    });
    setBusy(false);
    if (ok) router.push({ pathname: '/verify', params: { phone } });
  };

  return (
    <FlowStep step={1} total={2} onBack={() => router.back()} title={t('auth.phoneTitle')} sub={t('auth.phoneSub')} footer={<CTA label={t('auth.sendCode')} disabled={!phone} loading={busy} onPress={send} />}>
      <Field
        leadingIcon="phone"
        value={raw}
        onChangeText={setRaw}
        placeholder={t('auth.phonePlaceholder')}
        keyboardType="phone-pad"
        autoComplete="tel"
        autoFocus
        maxLength={16}
        hint="+90"
        error={touched && !phone ? t('auth.phoneInvalid') : undefined}
      />
      {isDemo ? (
        <View style={{ gap: 10 }}>
          <Text variant="micro" tone="tertiary">
            {t('demo.accounts')}
          </Text>
          <View style={styles.chips}>
            <Chip size="m" tone="outline" label={t('demo.customer')} onPress={() => setRaw('555 000 00 01')} />
            <Chip size="m" tone="outline" label={t('demo.tasker')} onPress={() => setRaw('555 000 00 02')} />
            <Chip size="m" tone="outline" label={t('demo.admin')} onPress={() => setRaw('555 000 00 03')} />
          </View>
          <Text variant="meta" tone="tertiary">
            {t('demo.anyNumber')}
          </Text>
        </View>
      ) : null}
    </FlowStep>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } });
