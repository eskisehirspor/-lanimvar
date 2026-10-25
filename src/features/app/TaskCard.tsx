import { StyleSheet, View } from 'react-native';

import type { TaskStatus } from '@/features/task/model/status';
import { formatTL, t } from '@/i18n';
import { useTheme } from '@/theme';
import { ClayObject, Icon, LiveDot, StatusWord, Tactile, Text } from '@/ui';

import { categoryLook } from './categories';

const liveStatuses: TaskStatus[] = ['searching', 'assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted'];

/** A task in a list: its object, what and where, status, price. Live ones read as live. */
export function TaskCard({ title, category, place, when, price, status, onPress }: { title: string; category: string; place: string; when: string; price: number; status: TaskStatus; onPress: () => void }) {
  const theme = useTheme();
  const c = theme.color;
  const live = liveStatuses.includes(status);
  const look = categoryLook(category);
  return (
    <Tactile pressScale={0.985} onPress={onPress} accessibilityLabel={title} style={[styles.card, { backgroundColor: live ? c.surface.inverse : c.surface.panel }]}>
      <View style={[styles.art, { backgroundColor: theme.illustration.stage[look.stage] }]}>
        <ClayObject name={look.object} size={46} />
      </View>
      <View style={styles.body}>
        <Text variant="label" tone={live ? 'onInverse' : 'primary'} numberOfLines={1}>
          {title}
        </Text>
        <Text variant="meta" tone={live ? 'onInverseSecondary' : 'tertiary'} numberOfLines={1}>{`${place} · ${when}`}</Text>
        {live ? (
          <View style={styles.liveRow}>
            <LiveDot onInverse size={8} />
            <Text variant="meta" style={{ color: c.brand.dot }}>
              {t(`status.${status}`)}
            </Text>
          </View>
        ) : (
          <StatusWord status={status} />
        )}
      </View>
      <View style={styles.end}>
        <Text variant="label" tone={live ? 'onInverse' : 'primary'}>
          {price === 0 ? t('task.free') : formatTL(price)}
        </Text>
        <Icon name="caretRight" size="s" color={live ? c.brand.dot : c.ink.tertiary} weight="bold" />
      </View>
    </Tactile>
  );
}

export function isLive(status: TaskStatus) {
  return liveStatuses.includes(status);
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingRight: 14, borderRadius: 22 },
  art: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  end: { alignItems: 'flex-end', gap: 6 },
});
