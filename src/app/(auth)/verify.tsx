import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { FlowStep } from '@/features/app/FlowStep';
import { attempt } from '@/features/app/Notice';
import { formatPhone, t } from '@/i18n';
import { sendPhoneCode, verifyPhoneCode } from '@/lib/auth/providers';
import { DEMO_CODE } from '@/lib/demo/backend';
import { isDemo } from '@/lib/supabase/config';
import { CTA, PinEntry, Text, type PinEntryStatus } from '@/ui';

const RESEND_S = 60;

/** The 6-digit SMS code (iOS autofills it). On success the auth listener moves the person on. */
export default function Verify() {
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
    <FlowStep
      step={2}
      total={2}
      onBack={() => router.back()}
      title={t('auth.codeTitle')}
      sub={t('onboarding.codeSentTo', { to: formatPhone(phone) })}
      footer={
        <CTA
          label={left > 0 ? t('auth.resendIn', { s: left }) : t('auth.resend')}
          icon="retry"
          disabled={left > 0}
          onPress={() =>
            attempt(async () => {
              await sendPhoneCode(phone);
              setLeft(RESEND_S);
            })
          }
        />
      }
    >
      {isDemo ? (
        <Text variant="label" tone="link">
          {t('demo.code', { code: DEMO_CODE })}
        </Text>
      ) : null}
      <PinEntry
        value={code}
        onChange={(v) => {
          setCode(v);
          if (status === 'error') setStatus('idle');
        }}
        onComplete={submit}
        status={status}
        systemKeyboard
        hint=""
      />
      {status === 'error' ? (
        <Text variant="label" tone="attention" align="center">
          {t('auth.codeWrong')}
        </Text>
      ) : null}
    </FlowStep>
  );
}
