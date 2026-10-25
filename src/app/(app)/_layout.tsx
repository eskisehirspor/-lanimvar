import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { registerPush } from '@/lib/push';
import { useTheme } from '@/theme';

export default function AppLayout() {
  const theme = useTheme();
  useEffect(() => {
    registerPush().catch(() => undefined);
  }, []);
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.surface.grouped } }} />;
}
