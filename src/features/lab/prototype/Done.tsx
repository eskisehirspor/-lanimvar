import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatTL, t } from '@/i18n';
import { useTheme } from '@/theme';
import { ClayObject, Confetti, Icon, MaskReveal, RatingStars, Rise, Tactile, Text } from '@/ui';

import { story, useFrame } from './frame';

/** The end: a small celebration, the proof, and a two-tap review. */
export function Done({ active, onRestart, onClose }: { active: boolean; onRestart: () => void; onClose: () => void }) {
  const theme = useTheme();
  const f = useFrame();
  const c = theme.color;
  const g = theme.layout.gutter;
  const clay = theme.illustration.clay;
  const [stars, setStars] = useState(0);
  const [tip, setTip] = useState<number | null>(null);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.base }]}>
      <View style={{ paddingTop: f.top + 30, paddingHorizontal: g }}>
        <Rise play={active} delay={100} style={styles.rowTight}>
          <View style={[styles.check, { backgroundColor: c.status.success }]}>
            <Icon name="check" size={14} color={c.ink.onInverse} weight="bold" />
          </View>
          <Text variant="micro" tone="success">
            {t('status.completed')}
          </Text>
        </Rise>
        <MaskReveal play={active} delay={160} duration={1000}>
          <Text variant="display.hero" serif style={{ fontSize: 104, lineHeight: 104, marginTop: 6 }}>
            {`${t('proto.doneA')}.`}
          </Text>
        </MaskReveal>
        <Rise play={active} delay={420}>
          <Text variant="body.l" tone="secondary">
            {t('proto.doneB')}
          </Text>
        </Rise>
      </View>

      <Rise play={active} delay={560} style={styles.proof}>
        <Polaroid label={t('proof.before')} rotate={-6} stage={theme.illustration.stage.sun} />
        <Polaroid label={t('proof.after')} rotate={5} stage={theme.illustration.stage.leaf} />
      </Rise>
      <Rise play={active} delay={640} style={[styles.stats, { marginHorizontal: g, borderColor: c.surface.hairline }]}>
        {[
          { k: t('proto.statTime'), v: t('proto.statTimeValue') },
          { k: t('proto.statPaid'), v: formatTL(story.price) },
          { k: t('proto.statPin'), v: t('proto.statPinValue') },
        ].map((x) => (
          <View key={x.k} style={styles.stat}>
            <Text variant="micro" tone="tertiary">
              {x.k}
            </Text>
            <Text variant="display.m">{x.v}</Text>
          </View>
        ))}
      </Rise>

      <View style={{ marginTop: 'auto', paddingHorizontal: g, paddingBottom: f.bottom + 12, gap: 16 }}>
        <Rise play={active} delay={700} style={[styles.panel, { backgroundColor: c.surface.grouped }]}>
          <View style={styles.row}>
            <Text variant="title">{t('proto.rate', { name: story.tasker.name })}</Text>
            <Text variant="label" tone="secondary">
              {formatTL(story.price + (tip ?? 0))}
            </Text>
          </View>
          <RatingStars value={stars} onChange={setStars} size={40} />
          <View style={styles.tips}>
            {[20, 50, 100].map((v) => {
              const on = tip === v;
              return (
                <Tactile key={v} haptic="select" onPress={() => setTip(on ? null : v)} style={[styles.tip, { backgroundColor: on ? c.surface.inverse : c.surface.panel, borderColor: on ? c.surface.inverse : c.surface.hairlineStrong }]} accessibilityLabel={`${t('proto.tip')} ${formatTL(v)}`}>
                  <Text variant="label" tone={on ? 'onInverse' : 'primary'}>{`+${formatTL(v)}`}</Text>
                </Tactile>
              );
            })}
          </View>
        </Rise>
        <Rise play={active} delay={800} style={styles.row}>
          <Tactile haptic="select" onPress={onClose} style={[styles.ghost, { borderColor: c.surface.hairlineStrong }]} accessibilityLabel={t('proto.close')}>
            <Icon name="x" size={18} color={c.ink.primary} weight="bold" />
          </Tactile>
          <Tactile onPress={onRestart} style={[styles.cta, { backgroundColor: c.surface.inverse }]} accessibilityLabel={t('proto.restart')}>
            <Icon name="retry" size={18} color={c.brand.dot} weight="bold" />
            <Text variant="button" tone="onInverse">
              {t('proto.restart')}
            </Text>
          </Tactile>
        </Rise>
      </View>

      <Confetti play={active} origin={{ x: f.w / 2, y: f.h * 0.42 }} colors={[clay.sun.base, clay.ink.base, clay.brick.base, clay.sky.base, clay.leaf.base]} />
    </View>
  );
}

function Polaroid({ label, rotate, stage }: { label: string; rotate: number; stage: string }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <View style={[styles.polaroid, { backgroundColor: c.surface.panel, transform: [{ rotate: `${rotate}deg` }] }, theme.elevation.floating]}>
      <View style={[styles.photo, { backgroundColor: stage }]}>
        <ClayObject name="couch" size={118} />
      </View>
      <Text variant="meta" style={{ color: theme.illustration.ink, marginTop: 8 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rowTight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  check: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  proof: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 26 },
  polaroid: { padding: 10, paddingBottom: 12, borderRadius: 10 },
  photo: { width: 128, height: 128, borderRadius: 4, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stats: { flexDirection: 'row', marginTop: 26, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 14 },
  stat: { flex: 1, gap: 2 },
  panel: { borderRadius: 24, padding: 18, gap: 14 },
  tips: { flexDirection: 'row', gap: 8 },
  tip: { height: 40, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  ghost: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  cta: { flex: 1, height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
});
