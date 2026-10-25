import { FlowStep } from '@/features/app/FlowStep';
import { BirthWheels, MONTHS } from '@/features/onboarding/BirthWheels';
import { ageOn, birthDateIso, useDraft } from '@/features/onboarding/draft';
import { useFlow } from '@/features/onboarding/flow';
import { t } from '@/i18n';
import { CTA, Text } from '@/ui';

/** Birth date on wheels (system wheel on iOS). Always a real date; 18+ is checked live. */
export default function BirthStep() {
  const birth = useDraft((s) => s.birth);
  const set = useDraft((s) => s.set);
  const flow = useFlow('birth');
  const value = { d: Number(birth.d) || 1, m: Number(birth.m) || 1, y: Number(birth.y) || new Date().getFullYear() - 25 };
  const iso = birthDateIso(birth);
  const age = iso ? ageOn(iso) : 0;
  const adult = age >= 18;
  return (
    <FlowStep step={flow.step} total={flow.total} onBack={flow.back} title={t('onboarding.birthTitle')} sub={t('onboarding.birthSub')} footer={<CTA label={t('onboarding.next')} disabled={!adult} onPress={flow.next} />}>
      <BirthWheels value={value} onChange={(v) => set({ birth: { d: String(v.d), m: String(v.m), y: String(v.y) } })} />
      <Text variant="title" align="center">
        {`${value.d} ${MONTHS[value.m - 1]} ${value.y}`}
        <Text variant="title" tone={adult ? 'secondary' : 'attention'}>{`  ·  ${t('admin.age', { age })}`}</Text>
      </Text>
      {!adult ? (
        <Text variant="label" tone="attention" align="center">
          {t('onboarding.underage')}
        </Text>
      ) : null}
    </FlowStep>
  );
}
