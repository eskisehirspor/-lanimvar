import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { groupPin, t } from '@/i18n';
import { useHaptics } from '@/lib/haptics';
import { useMotion, useTheme } from '@/theme';
import { Avatar, FlipText, Icon, LifecycleStrip, MapCanvas, Rise, SafetyHandle, Tactile, Text, Ticket } from '@/ui';

import { story, useFrame, type Point } from './frame';

/**
 * Tracking: the Tasker travels the real streets to the door; the sheet holds
 * who, when, the stage, and the PIN (hidden until held — it is a key).
 */
export function Live({ active, onArrived }: { active: boolean; onArrived: (origin: Point) => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const f = useFrame();
  const fire = useHaptics();
  const c = theme.color;
  const g = theme.layout.gutter;
  const progress = useSharedValue(0.05);
  const [eta, setEta] = useState(story.eta);
  const [peek, setPeek] = useState(false);
  const [cta, setCta] = useState({ y: 0 });

  useEffect(() => {
    if (!active) return;
    progress.set(withTiming(0.9, { duration: motion.ms(16000), easing: Easing.inOut(Easing.quad) }));
    const id = setInterval(() => setEta((e) => Math.max(2, e - 1)), motion.ms(2800));
    return () => clearInterval(id);
  }, [active, motion, progress]);

  const arrival = `14:${String(17 + eta).padStart(2, '0')}`;
  const veil = useSharedValue(1);
  useEffect(() => {
    veil.set(withTiming(peek ? 0 : 1, motion.timing(peek ? 160 : 420)));
  }, [peek, motion, veil]);
  const pinStyle = useAnimatedStyle(() => ({ opacity: 1 - veil.value }));
  const dotsStyle = useAnimatedStyle(() => ({ opacity: veil.value }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.grouped }]}>
      <MapCanvas mode="route" height={f.h * 0.5} progress={progress} />
      <View style={[styles.topBar, { top: f.top + 12, left: g, right: g }]} pointerEvents="box-none">
        <SafetyHandle floating onPress={() => fire('select')} />
      </View>

      <View style={[styles.sheet, { top: f.h * 0.44, backgroundColor: c.surface.base }, theme.elevation.sheet]}>
        <View style={styles.handleZone}>
          <View style={[styles.handle, { backgroundColor: c.surface.hairlineStrong }]} />
        </View>
        <View style={{ paddingHorizontal: g }}>
          <Rise play={active} delay={100} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text variant="micro" tone="tertiary">{`${t('proto.etaLabel')} · ${arrival}`}</Text>
              <View style={styles.etaRow}>
                <FlipText text={`${eta} ${t('proto.min')}`} variant="display.xl" />
              </View>
            </View>
            <View style={styles.person}>
              <Avatar initials={story.tasker.initials} size={56} verified />
            </View>
          </Rise>
          <Rise play={active} delay={180} style={[styles.row, { marginTop: 4 }]}>
            <Text variant="body" tone="secondary">{t('proto.taskerLine', { name: story.tasker.full, rating: story.tasker.rating, tasks: story.tasker.tasks })}</Text>
            <View style={styles.rowTight}>
              <Tactile haptic="select" style={[styles.round, { backgroundColor: c.surface.field }]} accessibilityLabel={t('proto.message')}>
                <Icon name="chat" size={20} color={c.ink.primary} />
              </Tactile>
              <Tactile haptic="select" style={[styles.round, { backgroundColor: c.surface.field }]} accessibilityLabel={t('proto.callTasker')}>
                <Icon name="phone" size={20} color={c.ink.primary} />
              </Tactile>
            </View>
          </Rise>

          <Rise play={active} delay={260} style={{ marginTop: 14 }}>
            <LifecycleStrip step="en_route" />
          </Rise>

          <Rise play={active} delay={340} style={{ marginTop: 14 }}>
            <Pressable onPressIn={() => setPeek(true)} onPressOut={() => setPeek(false)} accessibilityRole="button" accessibilityLabel={t('proto.pinHold')}>
              <Ticket
                cutout={c.surface.base}
                top={
                  <View style={styles.row}>
                    <View>
                      <Text variant="micro" tone="tertiary">
                        {t('proto.pinLabel')}
                      </Text>
                      <View style={{ height: theme.type['numeric.pin'].lineHeight, marginTop: 4 }}>
                        <Animated.View style={[StyleSheet.absoluteFill, pinStyle]}>
                          <Text variant="numeric.pin">{groupPin(story.pin)}</Text>
                        </Animated.View>
                        <Animated.View style={[StyleSheet.absoluteFill, styles.dots, dotsStyle]}>
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <View key={i} style={[styles.pinDot, { backgroundColor: c.ink.primary, marginRight: i === 2 ? 18 : 8 }]} />
                          ))}
                        </Animated.View>
                      </View>
                    </View>
                    <Icon name={peek ? 'lockOpen' : 'lock'} size={22} color={c.ink.secondary} weight="bold" />
                  </View>
                }
                bottom={
                  <View style={styles.rowTight}>
                    <Icon name="ticket" size={16} color={c.ink.tertiary} />
                    <Text variant="meta" tone="tertiary">
                      {t('proto.pinHold')}
                    </Text>
                  </View>
                }
              />
            </Pressable>
          </Rise>
        </View>
      </View>

      <View style={{ position: 'absolute', left: g, right: g, bottom: f.bottom + 12 }} onLayout={(e) => setCta({ y: e.nativeEvent.layout.y })}>
        <Tactile
          haptic="success"
          onPress={() => onArrived({ x: f.w / 2, y: cta.y + 30 })}
          style={[styles.cta, { backgroundColor: c.surface.inverse }]}
          accessibilityLabel={t('proto.arrived')}
        >
          <View style={[styles.demo, { borderColor: c.surface.hairlineOnInverse }]}>
            <Text variant="micro" tone="onInverseTertiary" style={{ fontSize: 10 }}>
              {t('proto.demo')}
            </Text>
          </View>
          <Text variant="button" tone="onInverse">
            {t('proto.arrived')}
          </Text>
          <Icon name="arrowRight" size={20} color={c.brand.dot} weight="bold" />
        </Tactile>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 10 },
  handle: { width: 38, height: 5, borderRadius: 2.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rowTight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  etaRow: { marginTop: 2 },
  person: { alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center' },
  pinDot: { width: 12, height: 12, borderRadius: 6 },
  cta: { height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  demo: { position: 'absolute', left: 18, borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
});
