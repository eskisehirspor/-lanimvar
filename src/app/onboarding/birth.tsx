import { StyleSheet, View } from 'react-native';

import { FlowStep } from '@/features/app/FlowStep';
import { ageOn, birthDateIso, useDraft } from '@/features/onboarding/draft';
import { useFlow } from '@/features/onboarding/flow';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { CTA, Text, WheelPicker } from '@/ui';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const daysIn = (m: number, y: number) => new Date(y, m, 0).getDate();

/** Birth date on three wheels (day · month · year). Always a real date; 18+ is checked live. */
export default function BirthStep() {
  const theme = useTheme();
  const birth = useDraft((s) => s.birth);
  const set = useDraft((s) => s.set);
  const flow = useFlow('birth');
  const thisYear = new Date().getFullYear();
  const d = Number(birth.d) || 1;
  const m = Number(birth.m) || 1;
  const y = Number(birth.y) || thisYear - 25;
  const iso = birthDateIso(birth);
  const age = iso ? ageOn(iso) : 0;
  const adult = age >= 18;

  const update = (next: { d?: number; m?: number; y?: number }) => {
    const nm = next.m ?? m;
    const ny = next.y ?? y;
    const nd = Math.min(next.d ?? d, daysIn(nm, ny));
    set({ birth: { d: String(nd), m: String(nm), y: String(ny) } });
  };

  const days = Array.from({ length: daysIn(m, y) }, (_, i) => ({ label: String(i + 1), value: i + 1 }));
  const months = MONTHS.map((label, i) => ({ label, value: i + 1 }));
  const years = Array.from({ length: thisYear - 18 - 1930 + 1 }, (_, i) => ({ label: String(thisYear - 18 - i), value: thisYear - 18 - i }));

  return (
    <FlowStep step={flow.step} total={flow.total} onBack={flow.back} title={t('onboarding.birthTitle')} sub={t('onboarding.birthSub')} footer={<CTA label={t('onboarding.next')} disabled={!adult} onPress={flow.next} />}>
      <View style={[styles.wheels, { backgroundColor: theme.color.surface.grouped }]}>
        <WheelPicker items={days} value={d} onChange={(v) => update({ d: v })} flex={0.8} accessibilityLabel={t('onboarding.day')} />
        <WheelPicker items={months} value={m} onChange={(v) => update({ m: v })} flex={1.4} accessibilityLabel={t('onboarding.month')} />
        <WheelPicker items={years} value={y} onChange={(v) => update({ y: v })} flex={1} accessibilityLabel={t('onboarding.year')} />
      </View>
      <Text variant="title" align="center">
        {`${d} ${MONTHS[m - 1]} ${y}`}
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

const styles = StyleSheet.create({
  wheels: { flexDirection: 'row', borderRadius: 24, paddingHorizontal: 8, overflow: 'hidden' },
});
