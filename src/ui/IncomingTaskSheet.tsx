import { useEffect, useEffectEvent, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useHaptics } from '@/lib/haptics';
import { formatKm, t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { Button } from './Button';
import { Divider } from './Layout';
import { Icon, type IconName } from './Icon';
import { PriceDisplay } from './PriceDisplay';
import { ProgressRing } from './ProgressRing';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface IncomingOffer {
  title: string;
  price: number;
  district: string;
  neighbourhood: string;
  distanceKm: number;
  etaMin: number;
  duration: string;
  needs: { icon: IconName; label: string }[];
  customerTasks: number;
}

const WARN_AT = 10;

/**
 * A new offer takes over in ink — it should feel like a call coming in.
 * Price first (the decision driver), then where (AREA only, never the exact
 * address), how long, what is needed, who asks. The ring is honest time.
 */
export function IncomingTaskSheet({ visible, offer, seconds = 45, accepting, onAccept, onPass, onExpire }: { visible: boolean; offer: IncomingOffer; seconds?: number; accepting?: boolean; onAccept: () => void; onPass: () => void; onExpire: () => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [left, setLeft] = useState(seconds);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setLeft(seconds);
  }
  const expire = useEffectEvent(() => onExpire());

  useEffect(() => {
    if (!visible) return;
    fire('incoming');
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), motion.ms(1000));
    return () => clearInterval(id);
  }, [visible, motion, fire]);

  useEffect(() => {
    if (!visible) return;
    if (left === WARN_AT) fire('warning');
    if (left === 0 && !accepting) {
      const id = setTimeout(expire, motion.ms(1200));
      return () => clearTimeout(id);
    }
  }, [left, visible, accepting, fire, motion]);

  const warn = left <= WARN_AT;
  const expired = left === 0 && !accepting;

  return (
    <Sheet visible={visible} onClose={onPass} dismissible={false} tone="dark" accessibilityLabel={t('incoming.kicker')}>
      <View style={{ paddingHorizontal: g, paddingTop: theme.space[2], gap: theme.space[5] }}>
        <View style={styles.header}>
          <View style={styles.kicker}>
            <View style={[styles.live, { backgroundColor: c.brand.dot }]} />
            <Text variant="micro" tone="onInverseSecondary">
              {t('incoming.kicker')}
            </Text>
          </View>
          <View style={styles.ring} accessibilityLabel={t('incoming.seconds', { count: left })} accessibilityLiveRegion="polite">
            <ProgressRing progress={left / seconds} size={52} stroke={4} color={warn ? c.status.attention : c.brand.dot} track={c.surface.hairlineOnInverse} linearMs={1000} />
            <View style={[StyleSheet.absoluteFill, styles.center]}>
              <Text variant="label" tone="onInverse" style={{ fontVariant: ['tabular-nums'] }}>
                {String(left)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <PriceDisplay amount={offer.price} kind="agreed" onInverse />
          <Text variant="title" tone="onInverse" numberOfLines={2}>
            {offer.title}
          </Text>
        </View>

        <View style={[styles.facts, { backgroundColor: c.surface.inverseRaised, borderRadius: theme.radii.panel }]}>
          <Fact icon="mapPin" title={`${offer.neighbourhood}, ${offer.district}`} sub={`${formatKm(offer.distanceKm)} · ~${offer.etaMin} dk · ${t('location.approxLock')}`} />
          <Divider onInverse inset={52} />
          <Fact icon="timer" title={offer.duration} sub={t('incoming.duration')} />
          <Divider onInverse inset={52} />
          <Fact icon="toolbox" title={offer.needs.map((n) => n.label).join(' · ')} sub={t('incoming.needs')} />
          <Divider onInverse inset={52} />
          <Fact icon="shield" title={t('incoming.customerTrust', { count: offer.customerTasks })} sub={t('verification.phone')} />
        </View>

        {expired ? (
          <Text variant="label" tone="onInverseSecondary" align="center" style={{ paddingVertical: theme.space[4] }}>
            {t('incoming.expired')}
          </Text>
        ) : (
          <View style={styles.actions}>
            <View style={{ width: 96 }}>
              <PassButton onPress={onPass} disabled={accepting} />
            </View>
            <View style={styles.flex}>
              <Button label={t('incoming.accept')} onPress={onAccept} loading={accepting} icon="arrowRight" iconPosition="trailing" />
            </View>
          </View>
        )}
      </View>
    </Sheet>
  );
}

function PassButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const theme = useTheme();
  // A quiet, translucent button on ink: present but clearly secondary.
  return (
    <View style={{ borderRadius: theme.radii.button, overflow: 'hidden', backgroundColor: theme.color.surface.inverseRaised }}>
      <Button level="ghost" label={t('incoming.pass')} onPress={onPress} disabled={disabled} />
    </View>
  );
}

function Fact({ icon, title, sub }: { icon: IconName; title: string; sub: string }) {
  const theme = useTheme();
  return (
    <View style={styles.fact}>
      <Icon name={icon} size="m" color={theme.color.ink.onInverseSecondary} />
      <View style={styles.flex}>
        <Text variant="label" tone="onInverse" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="meta" tone="onInverseTertiary" numberOfLines={1}>
          {sub}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  live: { width: 8, height: 8, borderRadius: 4 },
  ring: { width: 52, height: 52 },
  center: { alignItems: 'center', justifyContent: 'center' },
  facts: { paddingVertical: 4 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10 },
});
