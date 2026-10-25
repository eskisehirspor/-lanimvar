import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Screen, TopBar } from '@/features/app/Screen';
import { LEGAL_VERSION, legalDocs, type LegalDocId } from '@/features/legal/documents';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { IconButton, Text } from '@/ui';

/** Legal texts, readable before sign-in (also the public URLs for the stores on web). */
export default function LegalDoc() {
  const theme = useTheme();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const d = legalDocs[(doc as LegalDocId) in legalDocs ? (doc as LegalDocId) : 'terms'];
  return (
    <Screen>
      <TopBar left={<IconButton icon="x" label={t('common.close')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />} />
      <Text variant="display.l" accessibilityRole="header">
        {d.title}
      </Text>
      <Text variant="meta" tone="tertiary" style={{ marginTop: 6 }}>
        {t('legalDocs.version', { v: LEGAL_VERSION })}
      </Text>
      {d.intro ? (
        <Text variant="body" tone="secondary" style={{ marginTop: theme.space[4] }}>
          {d.intro}
        </Text>
      ) : null}
      {d.sections.map((s) => (
        <View key={s.h} style={{ marginTop: theme.space[6], gap: theme.space[2] }}>
          <Text variant="title">{s.h}</Text>
          {s.p.map((para, i) => (
            <Text key={i} variant="body" tone="secondary">
              {para}
            </Text>
          ))}
        </View>
      ))}
    </Screen>
  );
}
