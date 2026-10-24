import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface LabelValueBlockProps {
  icon: IconName;
  label: string;
  value: string | ReactNode;
  sub?: string;
  action?: { label: string; onPress: () => void };
}

/** A fact in a detail view: caps label over value, icon in a soft well, optional action. */
export function LabelValueBlock({ icon, label, value, sub, action }: LabelValueBlockProps) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <View style={styles.row}>
      <View style={[styles.well, { backgroundColor: c.surface.field }]}>
        <Icon name={icon} size="m" color={c.ink.primary} />
      </View>
      <View style={styles.body}>
        <Text variant="micro" tone="tertiary">
          {label}
        </Text>
        {typeof value === 'string' ? <Text variant="body.l">{value}</Text> : value}
        {sub ? (
          <Text variant="meta" tone="tertiary">
            {sub}
          </Text>
        ) : null}
      </View>
      {action ? <Button level="ghost" size="m" layout="fit" label={action.label} onPress={action.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  well: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  body: { flex: 1, gap: 2 },
});
