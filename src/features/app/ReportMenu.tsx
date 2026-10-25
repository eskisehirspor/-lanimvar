import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { blockUser, reportUser } from '@/lib/api/trust';
import { useTheme } from '@/theme';
import { Chip, IconButton, Sheet, Text } from '@/ui';

import { attempt, confirm, notify } from './Notice';

const reasons = ['harassment', 'fraud', 'unsafe', 'fake', 'other'] as const;

/** Report or block the other person (App Store 1.2: user-generated content must be reportable and blockable). */
export function ReportMenu({ subjectId, taskId }: { subjectId: string; taskId?: string }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const g = theme.layout.gutter;
  return (
    <>
      <IconButton icon="more" label={t('report.menu')} variant="floating" onPress={() => setOpen(true)} />
      <Sheet visible={open} onClose={() => setOpen(false)} accessibilityLabel={t('report.menu')}>
        <View style={{ paddingHorizontal: g, paddingBottom: 24, gap: 14 }}>
          <Text variant="display.m">{t('report.reportTitle')}</Text>
          <View style={styles.chips}>
            {reasons.map((r) => (
              <Chip
                key={r}
                size="m"
                tone="outline"
                label={t(`report.reasons.${r}`)}
                onPress={async () => {
                  setOpen(false);
                  const ok = await attempt(() => reportUser(subjectId, r, undefined, taskId));
                  if (ok) notify(t('report.sent'));
                }}
              />
            ))}
          </View>
          <Chip
            size="m"
            tone="safety"
            icon="x"
            label={t('report.block')}
            onPress={async () => {
              setOpen(false);
              if (!(await confirm(t('report.block'), t('report.blockConfirm'), t('report.block'), true))) return;
              await attempt(() => blockUser(subjectId));
              notify(t('report.blocked'));
            }}
          />
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } });
