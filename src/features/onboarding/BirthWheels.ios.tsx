import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import type { BirthValue } from './BirthWheels';

export { daysIn, MONTHS, type BirthValue } from './BirthWheels';

/** iOS: the system date wheel, in Turkish, limited to 18+ birth dates. */
export function BirthWheels({ value, onChange }: { value: BirthValue; onChange: (v: BirthValue) => void }) {
  const theme = useTheme();
  const now = new Date();
  const max = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return (
    <View style={[styles.box, { backgroundColor: theme.color.surface.grouped }]}>
      <DateTimePicker
        value={new Date(value.y, value.m - 1, value.d)}
        mode="date"
        display="spinner"
        locale="tr-TR"
        themeVariant="light"
        maximumDate={max}
        minimumDate={new Date(1930, 0, 1)}
        onValueChange={(_, date) => onChange({ d: date.getDate(), m: date.getMonth() + 1, y: date.getFullYear() })}
      />
    </View>
  );
}

const styles = StyleSheet.create({ box: { borderRadius: 24, overflow: 'hidden' } });
