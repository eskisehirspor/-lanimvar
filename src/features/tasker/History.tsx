import { router } from 'expo-router';

import { categoryLook } from '@/features/app/categories';
import { Screen, TAB_CLEARANCE } from '@/features/app/Screen';
import { t } from '@/i18n';
import { useJobs } from '@/lib/api/tasker';
import { useTheme } from '@/theme';
import { EmptyState, Panel, TaskRow, TaskRowSkeleton, Text } from '@/ui';

export function TaskerHistory() {
  const theme = useTheme();
  const q = useJobs();
  const rows = q.data ?? [];
  return (
    <Screen background="grouped" contentStyle={{ paddingBottom: TAB_CLEARANCE }}>
      <Text variant="display.xl" style={{ marginTop: 12, marginBottom: theme.space[5] }}>
        {t('tasker.history')}
      </Text>
      {q.isLoading ? (
        <Panel>
          <TaskRowSkeleton />
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState title={t('tasker.noOffers')} body={t('tasker.offlineHint')} />
      ) : (
        <Panel>
          {rows.map((x, i) => (
            <TaskRow
              key={x.task_id}
              title={x.title}
              neighbourhood={x.approx_label}
              when={new Date(x.accepted_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              price={x.price}
              status={x.status}
              icon={categoryLook(x.category).icon}
              onPress={() => router.push(`/job/${x.task_id}`)}
              last={i === rows.length - 1}
            />
          ))}
        </Panel>
      )}
    </Screen>
  );
}
