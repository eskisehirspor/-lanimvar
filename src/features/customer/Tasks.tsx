import { router } from 'expo-router';
import { View } from 'react-native';

import { categoryLook } from '@/features/app/categories';
import { Screen, TAB_CLEARANCE } from '@/features/app/Screen';
import { t } from '@/i18n';
import { useMyTasks } from '@/lib/api/customer';
import { useTheme } from '@/theme';
import { EmptyState, Panel, TaskRow, TaskRowSkeleton, Text } from '@/ui';

export function CustomerTasks() {
  const theme = useTheme();
  const q = useMyTasks();
  const rows = q.data ?? [];
  return (
    <Screen background="grouped" contentStyle={{ paddingBottom: TAB_CLEARANCE }}>
      <Text variant="display.xl" style={{ marginTop: 12, marginBottom: theme.space[5] }}>
        {t('customer.myTasks')}
      </Text>
      {q.isLoading ? (
        <Panel>
          <TaskRowSkeleton />
          <TaskRowSkeleton />
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState title={t('customer.emptyTitle')} body={t('customer.emptyBody')} action={t('customer.again')} onAction={() => router.push('/task/new')} />
      ) : (
        <Panel>
          <View>
            {rows.map((x, i) => (
              <TaskRow
                key={x.id}
                title={x.title}
                neighbourhood={x.approx_label}
                when={new Date(x.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                price={x.price}
                status={x.status}
                icon={categoryLook(x.category).icon}
                onPress={() => router.push(`/task/${x.id}`)}
                last={i === rows.length - 1}
              />
            ))}
          </View>
        </Panel>
      )}
    </Screen>
  );
}
