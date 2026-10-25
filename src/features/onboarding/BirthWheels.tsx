import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { WheelPicker } from '@/ui';

export const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const daysIn = (m: number, y: number) => new Date(y, m, 0).getDate();

export interface BirthValue {
  d: number;
  m: number;
  y: number;
}

/** Day · month · year wheels (Android and web). iOS uses the system wheel (BirthWheels.ios.tsx). */
export function BirthWheels({ value, onChange }: { value: BirthValue; onChange: (v: BirthValue) => void }) {
  const theme = useTheme();
  const thisYear = new Date().getFullYear();
  const update = (next: Partial<BirthValue>) => {
    const m = next.m ?? value.m;
    const y = next.y ?? value.y;
    onChange({ m, y, d: Math.min(next.d ?? value.d, daysIn(m, y)) });
  };
  const days = Array.from({ length: daysIn(value.m, value.y) }, (_, i) => ({ label: String(i + 1), value: i + 1 }));
  const months = MONTHS.map((label, i) => ({ label, value: i + 1 }));
  const years = Array.from({ length: thisYear - 18 - 1930 + 1 }, (_, i) => ({ label: String(thisYear - 18 - i), value: thisYear - 18 - i }));
  return (
    <View style={[styles.wheels, { backgroundColor: theme.color.surface.grouped }]}>
      <WheelPicker items={days} value={value.d} onChange={(d) => update({ d })} flex={0.8} accessibilityLabel={t('onboarding.day')} />
      <WheelPicker items={months} value={value.m} onChange={(m) => update({ m })} flex={1.4} accessibilityLabel={t('onboarding.month')} />
      <WheelPicker items={years} value={value.y} onChange={(y) => update({ y })} flex={1} accessibilityLabel={t('onboarding.year')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wheels: { flexDirection: 'row', borderRadius: 24, paddingHorizontal: 8, overflow: 'hidden' },
});
