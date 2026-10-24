import { useEffect } from 'react';
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { withAlpha } from '@/theme/contrast';
import { durations, useMotion, useTheme } from '@/theme';

import { Icon } from './Icon';
import { riseIn } from './motion';
import { Tactile } from './Tactile';
import { Text } from './Text';

export interface EmergencyScreenProps {
  visible: boolean;
  origin?: { x: number; y: number };
  onClose: () => void;
  /** Product: Linking.openURL('tel:112'). The Design Lab passes a no-op. */
  onCall112: () => void;
  onCallTeam: () => void;
}

/**
 * Red floods out from the button that was pressed ("this is what you asked
 * for"), then one oversized action. Automatic steps are listed as facts so
 * the person knows help is already moving.
 */
export function EmergencyScreen({ visible, origin, onClose, onCall112, onCallTeam }: EmergencyScreenProps) {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const c = theme.color;
  const o = origin ?? { x: width / 2, y: height * 0.8 };
  const d = Math.hypot(Math.max(o.x, width - o.x), Math.max(o.y, height - o.y)) * 2;
  const reveal = useSharedValue(0);
  const reduced = motion.reduced;

  useEffect(() => {
    reveal.set(visible ? (reduced ? withTiming(1, motion.fade()) : withSpring(1, motion.spring('sheet'))) : 0);
  }, [visible, motion, reduced, reveal]);

  const circle = useAnimatedStyle(() => (reduced ? { opacity: reveal.value } : { transform: [{ scale: reveal.value }] }));
  const facts = [t('safety.emergencyShared'), t('safety.emergencyTeam'), t('safety.emergencyLogged')];
  const on = c.safety.onCritical;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.flex}>
        <Animated.View style={[styles.circle, { width: d, height: d, borderRadius: d / 2, left: o.x - d / 2, top: o.y - d / 2, backgroundColor: c.safety.critical }, circle]} />
        {visible ? (
          <View style={[styles.content, { paddingTop: insets.top + theme.space[3], paddingBottom: insets.bottom + theme.space[5], paddingHorizontal: theme.layout.gutter }]}>
            <Animated.View entering={riseIn(motion, 160, 8)} style={styles.top}>
              <View style={styles.titleRow}>
                <Icon name="siren" size="m" color={on} weight="fill" />
                <Text variant="label" tone="onCritical">
                  {t('safety.emergencyTitle')}
                </Text>
              </View>
              <Tactile onPress={onClose} haptic="select" accessibilityLabel={t('common.close')} hitSlop={12} style={[styles.close, { backgroundColor: withAlpha(on, 0.16) }]}>
                <Icon name="x" size="m" color={on} weight="bold" />
              </Tactile>
            </Animated.View>

            <View style={{ gap: theme.space[8] }}>
              <Animated.View entering={riseIn(motion, 220, 16)}>
                <Tactile onPress={onCall112} haptic="critical" accessibilityLabel={t('safety.emergencyCall')} style={[styles.call, { backgroundColor: on, borderRadius: theme.radii.panel }]}>
                  <View style={[styles.callIcon, { backgroundColor: c.safety.critical }]}>
                    <Icon name="phone" size={28} color={on} weight="fill" />
                  </View>
                  <Text variant="display.l" style={{ color: c.safety.critical }}>
                    {t('safety.emergencyCall')}
                  </Text>
                </Tactile>
              </Animated.View>
              <View style={{ gap: 14 }}>
                {facts.map((f, i) => (
                  <Animated.View key={f} entering={riseIn(motion, 380 + durations.stagger * 2 * i, 8)} style={styles.fact}>
                    <View style={[styles.factIcon, { backgroundColor: withAlpha(on, 0.18) }]}>
                      <Icon name="check" size={14} color={on} weight="bold" />
                    </View>
                    <Text variant="body.l" tone="onCritical">
                      {f}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </View>

            <Animated.View entering={riseIn(motion, 560, 8)}>
              <Tactile onPress={onCallTeam} accessibilityLabel={t('safety.emergencyCallTeam')} style={[styles.team, { backgroundColor: withAlpha(on, 0.16), borderRadius: theme.radii.button, height: theme.layout.buttonHeight }]}>
                <Icon name="phone" size="m" color={on} weight="bold" />
                <Text variant="button" tone="onCritical">
                  {t('safety.emergencyCallTeam')}
                </Text>
              </Tactile>
            </Animated.View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  circle: { position: 'absolute' },
  content: { flex: 1, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  call: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  callIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  factIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  team: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
});
