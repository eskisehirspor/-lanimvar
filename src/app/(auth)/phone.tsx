import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { attempt } from '@/features/app/Notice';
import { Screen, TopBar } from '@/features/app/Screen';
import { t } from '@/i18n';
import { normalizeTrPhone, sendPhoneCode } from '@/lib/auth/providers';
import { isDemo } from '@/lib/supabase/config';
import { useTheme } from '@/theme';
import { Button, Chip, Field, IconButton, Text } from '@/ui';

export default function Phone() {
  const theme = useTheme();
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
    <Screen footer={<Button label={t('auth.sendCode')} loading={busy} disabled={!phone} onPress={send} />}>
      <TopBar left={<IconButton icon="arrowLeft" label={t('common.back')} onPress={() => router.back()} />} />
      <Text variant="display.xl" style={{ marginTop: 12 }}>
        {t('auth.phoneTitle')}
      </Text>
      <Text variant="body.l" tone="secondary" style={{ marginTop: 8 }}>
        {t('auth.phoneSub')}
      </Text>
      <View style={{ marginTop: theme.space[8] }}>
        <Field
          leadingIcon="phone"
          value={raw}
          onChangeText={setRaw}
          placeholder={t('auth.phonePlaceholder')}
          keyboardType="phone-pad"
          autoFocus
          maxLength={16}
          hint="+90"
          error={touched && !phone ? t('auth.phoneInvalid') : undefined}
        />
      </View>
      {isDemo ? (
        <View style={{ marginTop: theme.space[6], gap: 10 }}>
          <Text variant="micro" tone="tertiary">
            {t('demo.accounts')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip size="m" tone="outline" label={t('demo.customer')} onPress={() => setRaw('555 000 00 01')} />
            <Chip size="m" tone="outline" label={t('demo.tasker')} onPress={() => setRaw('555 000 00 02')} />
            <Chip size="m" tone="outline" label={t('demo.admin')} onPress={() => setRaw('555 000 00 03')} />
          </View>
          <Text variant="meta" tone="tertiary">
            {t('demo.anyNumber')}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}
