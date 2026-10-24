import { StyleSheet, View } from 'react-native';

import type { TaskStatus } from '@/features/task/model/status';
import { formatTL } from '@/i18n';
import { useTheme } from '@/theme';

import { Avatar } from './Avatar';
import { Icon, type IconName } from './Icon';
import { StatusWord } from './StatusWord';
import { Tactile } from './Tactile';
import { Text } from './Text';

export interface TaskRowProps {
  title: string;
  neighbourhood: string;
  when: string;
  price: number;
  status: TaskStatus;
  statusExtra?: string;
  icon?: IconName;
  assignee?: { initials: string; verified?: boolean };
  onPress?: () => void;
  last?: boolean;
}

/** A task in a list: category glyph · title → facts → status · price anchor. No card. */
export function TaskRow({ title, neighbourhood, when, price, status, statusExtra, icon = 'package', assignee, onPress, last }: TaskRowProps) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <Tactile
      onPress={onPress}
      pressScale={0.985}
      haptic={onPress ? 'select' : null}
      accessibilityLabel={`${title}, ${neighbourhood}, ${formatTL(price)}`}
      style={[styles.row, { paddingHorizontal: theme.layout.gutter, paddingTop: 14, minHeight: theme.layout.rowMinHeight }]}
    >
      <View style={[styles.glyph, { backgroundColor: c.surface.field, borderRadius: 12 }]}>
        <Icon name={icon} size="m" color={c.ink.primary} />
      </View>
      <View style={[styles.main, !last && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.surface.hairline }]}>
        <View style={styles.top}>
          <Text variant="label" numberOfLines={1} style={styles.flex}>
            {title}
          </Text>
          <Text variant="label" style={{ fontVariant: ['tabular-nums'] }}>
            {formatTL(price)}
          </Text>
        </View>
        <Text variant="meta" tone="tertiary" numberOfLines={1}>
          {`${neighbourhood} · ${when}`}
        </Text>
        <View style={styles.bottom}>
          <StatusWord status={status} extra={statusExtra} />
          {assignee ? <Avatar initials={assignee.initials} verified={assignee.verified} size={28} /> : null}
        </View>
      </View>
    </Tactile>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  glyph: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, gap: 3, paddingBottom: 14 },
  top: { flexDirection: 'row', gap: 12, alignItems: 'baseline' },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, minHeight: 28 },
  flex: { flex: 1 },
});
