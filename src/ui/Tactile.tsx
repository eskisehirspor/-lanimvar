import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useHaptics, type HapticEvent } from '@/lib/haptics';
import { gestures, useMotion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TactileProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  pressScale?: number;
  /** Dim on press as well (rows, links) — for things that should not move. */
  pressDim?: number;
  haptic?: HapticEvent | null;
}

/**
 * The one press behaviour: compress on touch-DOWN, spring back, a haptic that
 * matches the action. Under Reduce Motion the scale becomes a brief dim.
 */
export function Tactile({ style, children, pressScale = gestures.pressScale, pressDim = 0, haptic = 'press', onPressIn, onPressOut, onPress, disabled, ...rest }: TactileProps) {
  const motion = useMotion();
  const fire = useHaptics();
  const p = useSharedValue(0);
  const reduced = motion.reduced;
  const animated = useAnimatedStyle(() =>
    reduced ? { opacity: 1 - p.value * 0.2 } : { opacity: 1 - p.value * pressDim, transform: [{ scale: 1 - (1 - pressScale) * p.value }] },
  );
  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        p.set(reduced ? withTiming(1, motion.fade()) : withSpring(1, motion.spring('press')));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        p.set(reduced ? withTiming(0, motion.fade()) : withSpring(0, motion.spring('snappy')));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) fire(haptic);
        onPress?.(e);
      }}
      style={[style, animated]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
