import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { useMotion, useTheme } from '@/theme';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  /** Offers that must be answered (accept/pass) are not dismissible by drag or backdrop. */
  dismissible?: boolean;
  /** dark = the sheet itself is ink (incoming offer). */
  tone?: 'light' | 'dark';
  children: ReactNode;
  accessibilityLabel?: string;
}

/** Springs up from the bottom edge (where the thumb is), follows the finger, releases on distance or flick. */
export function Sheet({ visible, onClose, dismissible = true, tone = 'light', children, accessibilityLabel }: SheetProps) {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  const closed = useSharedValue(1);
  const drag = useSharedValue(0);
  const height = useSharedValue(0);
  const reduced = motion.reduced;

  const open = () => {
    drag.set(0);
    closed.set(reduced ? withTiming(0, motion.fade()) : withSpring(0, motion.spring('sheet')));
  };

  useEffect(() => {
    if (visible) {
      if (height.value > 0) open();
      return;
    }
    if (!mounted) return;
    closed.set(
      withTiming(1, motion.timing(reduced ? 160 : 240, Easing.in(Easing.cubic)), (done) => {
        if (done) scheduleOnRN(setMounted, false);
      }),
    );
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const snapBack = motion.spring('snappy');
  const pan = usePanGesture({
    enabled: dismissible,
    activeOffsetY: 8,
    onUpdate: (e) => {
      drag.set(Math.max(0, e.translationY));
    },
    onDeactivate: (e) => {
      if (drag.value > height.value * 0.25 || e.velocityY > 900) scheduleOnRN(onClose);
      else drag.set(withSpring(0, snapBack));
    },
  });

  const sheetStyle = useAnimatedStyle(() =>
    reduced ? { opacity: 1 - closed.value, transform: [{ translateY: drag.value }] } : { transform: [{ translateY: closed.value * (height.value || 1000) + drag.value }] },
  );
  const scrimStyle = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - closed.value - (height.value ? drag.value / height.value : 0)) }));
  const dark = tone === 'dark';

  return (
    <Modal transparent visible={mounted} animationType="none" statusBarTranslucent onRequestClose={dismissible ? onClose : undefined}>
      <GestureHandlerRootView style={styles.flex}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.scrim }, scrimStyle]}>
          <Pressable style={styles.flex} onPress={dismissible ? onClose : undefined} accessibilityRole="button" accessibilityLabel="Kapat" disabled={!dismissible} />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            accessibilityLabel={accessibilityLabel}
            onLayout={(e) => {
              height.set(e.nativeEvent.layout.height);
              if (visible && closed.value === 1) open();
            }}
            style={[
              styles.sheet,
              theme.elevation.sheet,
              {
                backgroundColor: dark ? c.surface.inverse : c.surface.panel,
                borderTopLeftRadius: theme.radii.sheet,
                borderTopRightRadius: theme.radii.sheet,
                paddingBottom: Math.max(insets.bottom, theme.space[5]),
              },
              sheetStyle,
            ]}
          >
            <View style={styles.handleZone}>
              <View style={[styles.handle, { backgroundColor: dark ? c.surface.hairlineOnInverse : c.surface.fieldStrong }]} />
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '94%' },
  handleZone: { alignItems: 'center', paddingTop: 8, paddingBottom: 6 },
  handle: { width: 36, height: 5, borderRadius: 2.5 },
});
