import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen, TAB_CLEARANCE } from '@/features/app/Screen';
import { isLive, shortDate, TaskCard } from '@/features/app/TaskCard';
import { t } from '@/i18n';
import { useMyTasks } from '@/lib/api/customer';
import { useTheme } from '@/theme';
import { ClayObject, CTA, MaskReveal, Skeleton, Text } from '@/ui';

export function CustomerTasks() {
  const theme = useTheme();
  const q = useMyTasks();
  const rows = q.data ?? [];
  const live = rows.filter((x) => isLive(x.status));
  const past = rows.filter((x) => !isLive(x.status));
  return (
    <Screen background="grouped" contentStyle={{ paddingBottom: TAB_CLEARANCE, gap: 10 }}>
      <MaskReveal>
        <Text variant="display.xl" style={{ marginTop: 12, marginBottom: theme.space[3] }}>
          {t('customer.myTasks')}
        </Text>
      </MaskReveal>
      {q.isLoading ? (
        [0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={84} radius={22} />)
      ) : rows.length === 0 ? (
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
          <ClayObject name="boxes" size={140} />
          <Text variant="display.m" align="center">
            {t('customer.emptyTitle')}
          </Text>
          <Text variant="body" tone="secondary" align="center">
            {t('customer.emptyBody')}
          </Text>
          <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
            <CTA label={t('customer.again')} onPress={() => router.push('/task/new')} />
          </View>
        </View>
      ) : (
        <>
          {live.length ? (
            <Text variant="micro" tone="tertiary">
              {t('customer.activeTask')}
            </Text>
          ) : null}
          {live.map((x) => (
            <TaskCard key={x.id} title={x.title} category={x.category} place={x.approx_label} when={shortDate(x.created_at)} price={x.price} status={x.status} onPress={() => router.push(`/task/${x.id}`)} />
          ))}
          {past.length ? (
            <Text variant="micro" tone="tertiary" style={{ marginTop: 10 }}>
              {t('tasker.history')}
            </Text>
          ) : null}
          {past.map((x) => (
            <TaskCard key={x.id} title={x.title} category={x.category} place={x.approx_label} when={shortDate(x.created_at)} price={x.price} status={x.status} onPress={() => router.push(`/task/${x.id}`)} />
          ))}
        </>
      )}
    </Screen>
  );
}
