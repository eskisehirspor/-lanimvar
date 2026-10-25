import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen, TAB_CLEARANCE } from '@/features/app/Screen';
import { shortDate, TaskCard } from '@/features/app/TaskCard';
import { formatTL, t } from '@/i18n';
import { useJobs } from '@/lib/api/tasker';
import { useTheme } from '@/theme';
import { ClayObject, MaskReveal, Skeleton, Text } from '@/ui';

export function TaskerHistory() {
  const theme = useTheme();
  const c = theme.color;
  const q = useJobs();
  const rows = q.data ?? [];
  const earned = rows.filter((x) => x.status === 'completed').reduce((s, x) => s + x.price, 0);
  const done = rows.filter((x) => x.status === 'completed').length;
  return (
    <Screen background="grouped" contentStyle={{ paddingBottom: TAB_CLEARANCE, gap: 10 }}>
      <MaskReveal>
        <Text variant="display.xl" style={{ marginTop: 12 }}>
          {t('tasker.history')}
        </Text>
      </MaskReveal>
      <View style={{ flexDirection: 'row', gap: 10, marginVertical: theme.space[2] }}>
        <View style={{ flex: 1, backgroundColor: c.surface.inverse, borderRadius: 22, padding: 16 }}>
          <Text variant="micro" tone="onInverseTertiary">
            {t('tasker.statEarned')}
          </Text>
          <Text variant="display.l" style={{ color: c.brand.dot }}>
            {formatTL(earned)}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: c.surface.panel, borderRadius: 22, padding: 16 }}>
          <Text variant="micro" tone="tertiary">
            {t('tasker.statDone')}
          </Text>
          <Text variant="display.l">{String(done)}</Text>
        </View>
      </View>
      {q.isLoading ? (
        [0, 1].map((i) => <Skeleton key={i} width="100%" height={84} radius={22} />)
      ) : rows.length === 0 ? (
        <View style={{ alignItems: 'center', gap: 10, paddingVertical: 30 }}>
          <ClayObject name="key" size={130} />
          <Text variant="body" tone="secondary" align="center">
            {t('tasker.offlineHint')}
          </Text>
        </View>
      ) : (
        rows.map((x) => <TaskCard key={x.task_id} title={x.title} category={x.category} place={x.approx_label} when={shortDate(x.accepted_at)} price={x.price} status={x.status} onPress={() => router.push(`/job/${x.task_id}`)} />)
      )}
    </Screen>
  );
}
