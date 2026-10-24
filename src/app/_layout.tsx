import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { fontAssets } from '@/brand/fontAssets';
import { designLabEnabled } from '@/features/lab/enabled';
import { bindQueryFocus, queryClient } from '@/lib/query/queryClient';
import { defaultThemeConfig, ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);
  useEffect(() => bindQueryFocus(), []);
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider config={defaultThemeConfig}>
            <RootStack />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const theme = useTheme();
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.surface.base } }}>
        <Stack.Screen name="index" />
        {/* Development-only. Never part of production navigation. */}
        <Stack.Protected guard={designLabEnabled}>
          <Stack.Screen name="lab" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
