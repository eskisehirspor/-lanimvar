import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import { t } from '@/i18n';
import { withAlpha } from '@/theme/contrast';
import { useMotion, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { riseIn } from './motion';
import { ProgressRing } from './ProgressRing';
import { Tactile } from './Tactile';
import { Text } from './Text';

export interface ProofItem {
  id: string;
  kind: 'before' | 'after';
  state: 'uploading' | 'failed' | 'done';
  progress?: number;
  subject?: 'package' | 'couch' | 'door';
}

const subjects: Record<NonNullable<ProofItem['subject']>, IconName> = { package: 'package', couch: 'couch', door: 'door' };

/** Proof is evidence: each photo shows exactly where it is (uploading, failed, done) and whether it is before/after. */
export function ProofGrid({ items, max = 6, onAdd, onRetry, showRequirement }: { items: ProofItem[]; max?: number; onAdd?: () => void; onRetry?: (id: string) => void; showRequirement?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const r = theme.radii.field;
  const hasAfter = items.some((i) => i.kind === 'after' && i.state === 'done');
  return (
    <View style={{ gap: theme.space[3] }}>
      <View style={styles.grid}>
        {items.map((item) => (
          <Animated.View key={item.id} entering={riseIn(motion, 0, 10)} style={styles.cell}>
            <View style={[styles.photo, { borderRadius: r, backgroundColor: c.surface.fieldStrong }]}>
              <Icon name={subjects[item.subject ?? 'package']} size={38} color={withAlpha(c.ink.primary, 0.2)} weight="fill" />
              <View style={[styles.tag, { backgroundColor: withAlpha(c.surface.inverse, 0.72), borderRadius: theme.radii.pill }]}>
                <Text variant="micro" tone="onInverse" style={{ fontSize: 10, lineHeight: 13 }}>
                  {item.kind === 'before' ? t('proof.before') : t('proof.after')}
                </Text>
              </View>
              {item.state === 'uploading' ? (
                <Animated.View exiting={FadeOut.duration(motion.ms(160))} style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: withAlpha(c.surface.inverse, 0.4), borderRadius: r }]} accessibilityLabel={`${t('proof.uploading')} %${Math.round((item.progress ?? 0) * 100)}`}>
                  <ProgressRing progress={item.progress ?? 0} size={38} stroke={3} color={c.ink.onInverse} track={withAlpha(c.ink.onInverse, 0.25)} />
                </Animated.View>
              ) : null}
              {item.state === 'failed' ? (
                <Tactile onPress={() => onRetry?.(item.id)} accessibilityLabel={`${t('proof.failed')}. ${t('common.retry')}`} style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: withAlpha(c.tint.attention, 0.95), borderRadius: r, gap: 4 }]}>
                  <Icon name="retry" size="l" color={c.status.attention} weight="bold" />
                  <Text variant="meta" tone="attention" emphasis>
                    {t('common.retry')}
                  </Text>
                </Tactile>
              ) : null}
              {item.state === 'done' ? (
                <Animated.View entering={motion.reduced ? undefined : ZoomIn.springify().duration(motion.ms(360)).dampingRatio(0.6)} style={[styles.check, { backgroundColor: c.status.success, borderColor: c.surface.panel }]}>
                  <Icon name="check" size={12} color={c.ink.onInverse} weight="bold" />
                </Animated.View>
              ) : null}
            </View>
          </Animated.View>
        ))}
        {items.length < max ? (
          <View style={styles.cell}>
            <Tactile onPress={onAdd} pressScale={0.96} accessibilityLabel={t('proof.add')} style={[styles.photo, styles.add, { borderRadius: r, borderColor: c.surface.hairlineStrong }]}>
              <Icon name="camera" size="l" />
              <Text variant="meta" emphasis align="center">
                {t('proof.add')}
              </Text>
            </Tactile>
          </View>
        ) : null}
      </View>
      {showRequirement && !hasAfter ? (
        <Text variant="meta" tone="tertiary">
          {t('proof.required')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  cell: { width: '33.333%', padding: 4 },
  photo: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  add: { gap: 6, borderWidth: 1.5, borderStyle: 'dashed' },
  tag: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 7, paddingVertical: 2 },
  center: { alignItems: 'center', justifyContent: 'center' },
  check: { position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
