import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wordmark } from '@/brand/Wordmark';
import { designLabEnabled } from '@/features/lab/enabled';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { Button, RouteMark, Text } from '@/ui';

/** Holding screen. Product flows are not built yet (Design Lab gate first). */
export default function Holding() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.surface.base, paddingTop: insets.top + theme.space[5], paddingBottom: insets.bottom + theme.space[5], paddingHorizontal: theme.layout.gutter, justifyContent: 'space-between' }}>
      <Wordmark capHeight={18} />
      <View style={{ gap: theme.space[5] }}>
        <RouteMark width={112} />
        <Text variant="display.xl" accessibilityRole="header">
          {t('holding.title')}
        </Text>
        <Text variant="body.l" tone="secondary">
          {t('holding.body')}
        </Text>
      </View>
      {designLabEnabled ? <Button level="secondary" icon="sliders" label={t('holding.labLink')} onPress={() => router.push('/lab')} /> : <View />}
    </View>
  );
}
