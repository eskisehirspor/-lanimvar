import { VerifyContact } from '@/features/onboarding/VerifyContact';
import { useFlow } from '@/features/onboarding/flow';
import { t } from '@/i18n';
import { confirmPhoneLink, normalizeTrPhone, requestPhoneLink } from '@/lib/auth/providers';

/** Apple/Google accounts add a verified phone here (phone sign-ups skip this step). */
export default function PhoneStep() {
  const flow = useFlow('phone');
  return (
    <VerifyContact
      step={flow.step}
      total={flow.total}
      onBack={flow.back}
      title={t('onboarding.phoneTitle')}
      sub={t('onboarding.phoneSub')}
      icon="phone"
      placeholder={t('auth.phonePlaceholder')}
      keyboard="phone-pad"
      normalize={normalizeTrPhone}
      invalidText={t('auth.phoneInvalid')}
      send={requestPhoneLink}
      confirm={confirmPhoneLink}
      onVerified={flow.next}
      display={(v) => `+${v}`}
    />
  );
}
