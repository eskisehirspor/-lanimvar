import { useDraft } from '@/features/onboarding/draft';
import { useFlow } from '@/features/onboarding/flow';
import { FlowStep } from '@/features/app/FlowStep';
import { t } from '@/i18n';
import { CTA, Field } from '@/ui';

export default function NameStep() {
  const d = useDraft();
  const flow = useFlow('name');
  const ok = d.firstName.trim().length >= 2 && d.lastName.trim().length >= 2;
  return (
    <FlowStep step={flow.step} total={flow.total} onBack={flow.back} title={t('onboarding.nameTitle')} sub={t('onboarding.nameSub')} footer={<CTA label={t('onboarding.next')} disabled={!ok} onPress={flow.next} />}>
      <Field label={t('onboarding.firstName')} value={d.firstName} onChangeText={(v) => d.set({ firstName: v })} maxLength={40} autoFocus />
      <Field label={t('onboarding.lastName')} value={d.lastName} onChangeText={(v) => d.set({ lastName: v })} maxLength={40} />
    </FlowStep>
  );
}
