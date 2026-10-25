import { VerifyContact } from '@/features/onboarding/VerifyContact';
import { useFlow } from '@/features/onboarding/flow';
import { t } from '@/i18n';
import { confirmEmailCode, isEmail, requestEmailCode } from '@/lib/auth/providers';

export default function EmailStep() {
  const flow = useFlow('email');
  return (
    <VerifyContact
      step={flow.step}
      total={flow.total}
      onBack={flow.back}
      title={t('onboarding.emailTitle')}
      sub={t('onboarding.emailSub')}
      icon="chat"
      placeholder={t('onboarding.emailPlaceholder')}
      keyboard="email-address"
      normalize={(v) => (isEmail(v) ? v.trim().toLowerCase() : null)}
      invalidText={t('onboarding.emailInvalid')}
      send={requestEmailCode}
      confirm={confirmEmailCode}
      onVerified={flow.next}
      display={(v) => v}
    />
  );
}
