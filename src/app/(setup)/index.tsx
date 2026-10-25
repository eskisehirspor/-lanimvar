import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { Wordmark } from '@/brand/Wordmark';
import { Screen } from '@/features/app/Screen';
import { designLabEnabled } from '@/features/lab/enabled';
import { t } from '@/i18n';
import { isWebPreview } from '@/lib/preview';
import { useTheme } from '@/theme';
import { Button, Text } from '@/ui';

/** Shown only when the build has no Supabase settings (e.g. a fresh clone without .env). */
export default function Setup() {
  const theme = useTheme();
  if (isWebPreview && designLabEnabled) return <Redirect href="/lab/prototype" />;
  return (
    <Screen footer={designLabEnabled ? <Button level="secondary" icon="play" label={t('unconfigured.lab')} onPress={() => router.push('/lab/prototype')} /> : undefined}>
      <Wordmark capHeight={18} />
      <View style={{ marginTop: 80, gap: theme.space[4] }}>
        <Text variant="display.xl">{t('unconfigured.title')}</Text>
        <Text variant="body.l" tone="secondary">
          {t('unconfigured.body')}
        </Text>
      </View>
    </Screen>
  );
}
