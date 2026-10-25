import { Linking, View } from 'react-native';

import { Screen } from '@/features/app/Screen';
import { t } from '@/i18n';
import { signOut } from '@/lib/auth/providers';
import { supportContact } from '@/lib/support';
import { useTheme } from '@/theme';
import { Button, Text } from '@/ui';

export default function Banned() {
  const theme = useTheme();
  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          <Button label={t('banned.support')} onPress={() => Linking.openURL(`mailto:${supportContact.email}`)} />
          <Button level="ghost" label={t('banned.signOut')} onPress={signOut} align="center" />
        </View>
      }
    >
      <Text variant="display.xl" style={{ marginTop: 60 }}>
        {t('banned.title')}
      </Text>
      <Text variant="body.l" tone="secondary" style={{ marginTop: theme.space[3] }}>
        {t('banned.body')}
      </Text>
    </Screen>
  );
}
