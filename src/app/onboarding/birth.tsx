import { View } from 'react-native';

import { FlowStep } from '@/features/app/FlowStep';
import { ageOn, birthDateIso, useDraft } from '@/features/onboarding/draft';
import { useFlow } from '@/features/onboarding/flow';
import { t } from '@/i18n';
import { CTA, Field, Text } from '@/ui';

export default function BirthStep() {
  const birth = useDraft((s) => s.birth);
  const set = useDraft((s) => s.set);
  const flow = useFlow('birth');
  const iso = birthDateIso(birth);
  const complete = birth.d.length > 0 && birth.m.length > 0 && birth.y.length === 4;
  const adult = iso ? ageOn(iso) >= 18 : false;
  const error = complete && !iso ? t('onboarding.birthInvalid') : complete && !adult ? t('onboarding.underage') : null;
  const digits = (v: string, n: number) => v.replace(/\D/g, '').slice(0, n);
  return (
    <FlowStep step={flow.step} total={flow.total} onBack={flow.back} title={t('onboarding.birthTitle')} sub={t('onboarding.birthSub')} footer={<CTA label={t('onboarding.next')} disabled={!iso || !adult} onPress={flow.next} />}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field label={t('onboarding.day')} value={birth.d} onChangeText={(v) => set({ birth: { ...birth, d: digits(v, 2) } })} placeholder="14" keyboardType="number-pad" maxLength={2} autoFocus />
        </View>
        <View style={{ flex: 1 }}>
          <Field label={t('onboarding.month')} value={birth.m} onChangeText={(v) => set({ birth: { ...birth, m: digits(v, 2) } })} placeholder="05" keyboardType="number-pad" maxLength={2} />
        </View>
        <View style={{ flex: 1.4 }}>
          <Field label={t('onboarding.year')} value={birth.y} onChangeText={(v) => set({ birth: { ...birth, y: digits(v, 4) } })} placeholder="1998" keyboardType="number-pad" maxLength={4} />
        </View>
      </View>
      {error ? (
        <Text variant="label" tone="attention">
          {error}
        </Text>
      ) : null}
    </FlowStep>
  );
}
