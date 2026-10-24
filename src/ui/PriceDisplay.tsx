import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { useTheme } from '@/theme';

import { RollingNumber } from './RollingNumber';
import { Text } from './Text';

/** The price is a fact, not a breakdown: label, big number, one plain reason. */
export function PriceDisplay({
  amount,
  kind = 'recommended',
  reason,
  align = 'left',
  size = 'hero',
  onInverse,
}: {
  amount: number;
  kind?: 'recommended' | 'agreed' | 'budget';
  reason?: string;
  align?: 'left' | 'center';
  size?: 'hero' | 'compact';
  onInverse?: boolean;
}) {
  const theme = useTheme();
  const hero = size === 'hero';
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start', gap: 2 }}>
      <Text variant="micro" tone={onInverse ? 'onInverseTertiary' : 'tertiary'}>
        {t(`price.${kind}`)}
      </Text>
      <View style={styles.amount}>
        <RollingNumber value={amount} variant={hero ? 'numeric.hero' : 'display.l'} tone={onInverse ? 'onInverse' : 'primary'} />
        <Text variant={hero ? 'title' : 'label'} tone={onInverse ? 'onInverseSecondary' : 'secondary'} style={{ marginBottom: hero ? theme.type['numeric.hero'].lineHeight * 0.16 : 6, marginLeft: 6 }}>
          {t('common.currency')}
        </Text>
      </View>
      {reason ? (
        <Text variant="meta" tone={onInverse ? 'onInverseSecondary' : 'tertiary'} align={align}>
          {reason}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ amount: { flexDirection: 'row', alignItems: 'flex-end' } });
