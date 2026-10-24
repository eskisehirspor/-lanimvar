import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Platform } from 'react-native';

import { useMotionSettings } from '@/theme';

/** Semantic haptics: components ask for a MEANING, not a vibration style. */
export type HapticEvent = 'press' | 'select' | 'success' | 'error' | 'warning' | 'incoming' | 'critical';

const fire: Record<HapticEvent, () => Promise<void>> = {
  press: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  select: () => Haptics.selectionAsync(),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  incoming: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  critical: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
};

export function useHaptics() {
  const { haptics } = useMotionSettings();
  return useMemo(
    () => (event: HapticEvent) => {
      if (!haptics || Platform.OS === 'web') return;
      fire[event]().catch(() => undefined);
    },
    [haptics],
  );
}
