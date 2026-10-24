import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { LabDock } from '@/features/lab/components/LabDock';
import { designLabEnabled } from '@/features/lab/enabled';
import { useLabMotion, useLabThemeConfig } from '@/features/lab/store';
import { ThemeProvider, useTheme } from '@/theme';

export default function LabLayout() {
  const config = useLabThemeConfig();
  const motion = useLabMotion();
  // Belt and braces: the root Stack.Protected already hides this route.
  if (!designLabEnabled) return <Redirect href="/" />;
  return (
    <ThemeProvider config={config} motion={motion}>
      <View style={{ flex: 1 }}>
        <LabStack />
        {/* The dock stays at 100% text so it never breaks under the text-size stress test. */}
        <ThemeProvider config={{ ...config, textScale: 1 }} motion={motion}>
          <LabDock />
        </ThemeProvider>
      </View>
    </ThemeProvider>
  );
}

function LabStack() {
  const theme = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.surface.grouped } }} />;
}
