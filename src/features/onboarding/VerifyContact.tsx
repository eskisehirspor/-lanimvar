import { useState } from 'react';
import { View } from 'react-native';

import { FlowStep } from '@/features/app/FlowStep';
import { showError } from '@/features/app/Notice';
import { t } from '@/i18n';
import { DEMO_CODE } from '@/lib/demo/backend';
import { isDemo } from '@/lib/supabase/config';
import { CTA, Field, PinEntry, Text, type IconName, type PinEntryStatus } from '@/ui';

/** Enter a phone or e-mail, receive a 6-digit code, type it. Used for both contacts. */
export function VerifyContact({
  step,
  total,
  onBack,
  title,
  sub,
  icon,
  placeholder,
  keyboard,
  normalize,
  invalidText,
  send,
  confirm,
  onVerified,
  display,
}: {
  step: number;
  total: number;
  onBack?: () => void;
  title: string;
  sub: string;
  icon: IconName;
  placeholder: string;
  keyboard: 'phone-pad' | 'email-address';
  normalize: (raw: string) => string | null;
  invalidText: string;
  send: (value: string) => Promise<void>;
  confirm: (value: string, code: string) => Promise<void>;
  onVerified: () => void;
  display: (value: string) => string;
}) {
  const [raw, setRaw] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<PinEntryStatus>('idle');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const value = normalize(raw);

  const sendCode = async () => {
    setTouched(true);
    if (!value) return;
    setBusy(true);
    try {
      await send(value);
      setSentTo(value);
      setCode('');
      setStatus('idle');
    } catch (e) {
      showError(e);
    }
    setBusy(false);
  };

  const submit = async (c: string) => {
    if (!sentTo) return;
    try {
      await confirm(sentTo, c);
      setStatus('verified');
      setTimeout(onVerified, 700);
    } catch {
      setStatus('error');
      setCode('');
    }
  };

  if (!sentTo) {
    return (
      <FlowStep step={step} total={total} onBack={onBack} title={title} sub={sub} footer={<CTA label={t('onboarding.sendCode')} disabled={!value} loading={busy} onPress={sendCode} />}>
        <Field leadingIcon={icon} value={raw} onChangeText={setRaw} placeholder={placeholder} keyboardType={keyboard} autoCapitalize="none" autoComplete={keyboard === 'email-address' ? 'email' : 'tel'} autoFocus maxLength={80} error={touched && !value ? invalidText : undefined} />
      </FlowStep>
    );
  }
  return (
    <FlowStep step={step} total={total} onBack={() => setSentTo(null)} title={t('onboarding.codeTitle')} sub={t('onboarding.codeSentTo', { to: display(sentTo) })} footer={<CTA label={t('onboarding.change')} icon="arrowLeft" onPress={() => setSentTo(null)} />}>
      {isDemo ? (
        <Text variant="label" tone="link">
          {t('demo.code', { code: DEMO_CODE })}
        </Text>
      ) : null}
      <View>
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
      </View>
      {status === 'error' ? (
        <Text variant="label" tone="attention" align="center">
          {t('auth.codeWrong')}
        </Text>
      ) : null}
      <Text variant="label" tone="link" align="center" onPress={busy ? undefined : sendCode}>
        {t('auth.resend')}
      </Text>
    </FlowStep>
  );
}
