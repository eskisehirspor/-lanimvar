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
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { useAuth } from '@/lib/auth/store';
import { isWebPreview } from '@/lib/preview';
import { bindQueryFocus, queryClient } from '@/lib/query/queryClient';
import { defaultThemeConfig, ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts(isWebPreview ? {} : fontAssets);
  useEffect(() => bindQueryFocus(), []);
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider config={defaultThemeConfig}>
            <AuthProvider>
              <RootStack />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * The front door. Each group is reachable only in its auth state, so a signed-out
 * person can never land inside the product (and vice versa).
 */
function RootStack() {
  const theme = useTheme();
  const status = useAuth((s) => s.status);
  const role = useAuth((s) => s.profile?.role);
  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync().catch(() => undefined);
  }, [status]);
  if (status === 'loading') return null;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.surface.base } }}>
        <Stack.Protected guard={status === 'unconfigured'}>
          <Stack.Screen name="(setup)" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signedOut'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'onboarding'}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'banned'}>
          <Stack.Screen name="banned" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'ready'}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'ready' && role === 'admin'}>
          <Stack.Screen name="admin" />
        </Stack.Protected>
        <Stack.Screen name="legal/[doc]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth-callback" />
        {/* Development-only. Never part of production navigation. */}
        <Stack.Protected guard={designLabEnabled}>
          <Stack.Screen name="lab" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
