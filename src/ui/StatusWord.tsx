import { StyleSheet, View } from 'react-native';

import { statusTone, type StatusTone, type TaskStatus } from '@/features/task/model/status';
import { t } from '@/i18n';
import { useTheme } from '@/theme';

import { LiveDot } from './LiveDot';
import { Text, type TextTone } from './Text';

const toneText: Record<StatusTone, TextTone> = { live: 'live', active: 'primary', attention: 'attention', success: 'success', neutral: 'tertiary' };

/** Status is a coloured WORD (plus a live dot while the system works), not a badge. */
export function StatusWord({ status, extra }: { status: TaskStatus; extra?: string }) {
  const theme = useTheme();
  const tone = statusTone[status];
  const dot: Record<StatusTone, string | undefined> = {
    live: undefined,
    active: theme.color.status.active,
    attention: theme.color.status.attention,
    success: theme.color.status.success,
    neutral: theme.color.ink.tertiary,
  };
  return (
    <View style={styles.row}>
      <LiveDot size={7} live={tone === 'live'} color={dot[tone]} />
      <Text variant="meta" tone={toneText[tone]} emphasis>
        {t(`status.${status}`)}
      </Text>
      {extra ? (
        <Text variant="meta" tone="tertiary">
          {`· ${extra}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 6 } });
