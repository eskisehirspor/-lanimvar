import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useHaptics } from '@/lib/haptics';
import { useMotion, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

const H = 64;
const KNOB = 54;

/**
 * Accepting a job is a commitment, so it takes a deliberate swipe, not a
 * tap a pocket could make. Past 80% it locks in with a success haptic.
 */
export function SwipeToAccept({ label, onAccept, disabled }: { label: string; onAccept: () => void; disabled?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const c = theme.color;
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);
  const maxX = Math.max(1, width - KNOB - (H - KNOB));
  const back = motion.spring('snappy');
  const lock = motion.spring('press');

  const commit = () => {
    fire('success');
    onAccept();
  };

  const pan = usePanGesture({
    enabled: !disabled,
    onUpdate: (e) => {
      x.set(Math.max(0, Math.min(maxX, e.translationX)));
    },
    onDeactivate: () => {
      if (x.value > maxX * 0.8) {
        x.set(withSpring(maxX, lock));
        scheduleOnRN(commit);
      } else {
        x.set(withSpring(0, back));
      }
    },
  });

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const trail = useAnimatedStyle(() => ({ width: x.value + KNOB + (H - KNOB) / 2 }));
  const text = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, maxX * 0.5], [1, 0], 'clamp'), transform: [{ translateX: interpolate(x.value, [0, maxX], [0, 24]) }] }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor: c.surface.field, borderRadius: H / 2, opacity: disabled ? 0.5 : 1 }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityActions={[{ name: 'activate', label }]}
      onAccessibilityAction={commit}
    >
      <Animated.View style={[styles.trail, { backgroundColor: c.tint.brand, borderRadius: H / 2 }, trail]} />
      <Animated.View style={[styles.label, text]} pointerEvents="none">
        <Text variant="button" tone="secondary">
          {label}
        </Text>
        <Icon name="caretRight" size="s" color={c.ink.tertiary} weight="bold" />
        <Icon name="caretRight" size="s" color={c.ink.tertiary} weight="bold" />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, { backgroundColor: c.brand.fill }, knob]}>
          <Icon name="arrowRight" size="m" color={c.brand.onFill} weight="bold" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: H, justifyContent: 'center', overflow: 'hidden' },
  trail: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  label: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, paddingLeft: KNOB },
  knob: { position: 'absolute', left: (H - KNOB) / 2, width: KNOB, height: KNOB, borderRadius: KNOB / 2, alignItems: 'center', justifyContent: 'center' },
});
