import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { attempt, showError } from '@/features/app/Notice';
import { Screen, TopBar } from '@/features/app/Screen';
import { t } from '@/i18n';
import { sendPhoneCode, verifyPhoneCode } from '@/lib/auth/providers';
import { useTheme } from '@/theme';
import { IconButton, PinEntry, Text, type PinEntryStatus } from '@/ui';

const RESEND_S = 60;

/** The 6-digit SMS code. On success the auth listener moves the person on. */
export default function Verify() {
  const theme = useTheme();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<PinEntryStatus>('idle');
  const [left, setLeft] = useState(RESEND_S);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const submit = async (value: string) => {
    try {
      await verifyPhoneCode(phone, value);
      setStatus('verified');
    } catch {
      setStatus('error');
      setCode('');
    }
  };

  return (
    <Screen>
      <TopBar left={<IconButton icon="arrowLeft" label={t('auth.changeNumber')} onPress={() => router.back()} />} />
      <Text variant="display.xl" style={{ marginTop: 12 }}>
        {t('auth.codeTitle')}
      </Text>
      <Text variant="body.l" tone="secondary" style={{ marginTop: 8 }}>
        {t('auth.codeSub', { phone })}
      </Text>
      <View style={{ marginTop: theme.space[8] }}>
        <PinEntry
          value={code}
          onChange={(v) => {
            setCode(v);
            if (status === 'error') setStatus('idle');
          }}
          onComplete={submit}
          status={status}
        />
      </View>
      {status === 'error' ? (
        <Text variant="meta" tone="attention" align="center" style={{ marginTop: 8 }}>
          {t('auth.codeWrong')}
        </Text>
      ) : null}
      <Text
        variant="label"
        tone={left > 0 ? 'tertiary' : 'link'}
        align="center"
        style={{ marginTop: theme.space[6] }}
        onPress={
          left > 0
            ? undefined
            : () =>
                attempt(async () => {
                  await sendPhoneCode(phone);
                  setLeft(RESEND_S);
                }).catch(showError)
        }
      >
        {left > 0 ? t('auth.resendIn', { s: left }) : t('auth.resend')}
      </Text>
    </Screen>
  );
}
