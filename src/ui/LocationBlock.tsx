import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { formatKm, t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { Button } from './Button';
import { Icon } from './Icon';
import { MapCanvas } from './MapCanvas';
import { riseIn } from './motion';
import { Text } from './Text';

export type LocationBlockProps =
  | { variant: 'approximate'; district: string; neighbourhood: string; distanceKm: number }
  | { variant: 'exact'; district: string; neighbourhood: string; street: string; details: string; note?: string; onDirections?: () => void; onCopy?: () => void };

/**
 * Two explicit variants: discovery sees an AREA and a distance; only the
 * assigned Tasker (via an authorised RPC) ever receives the exact variant.
 */
export function LocationBlock(props: LocationBlockProps) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const exact = props.variant === 'exact';
  return (
    <View style={{ gap: theme.space[4] }}>
      <MapCanvas mode={exact ? 'exact' : 'approx'} height={170} rounded />
      <Animated.View key={props.variant} entering={riseIn(motion, 80, 8)} style={{ gap: 3 }}>
        <Text variant="micro" tone="tertiary">
          {exact ? t('location.exactLabel') : t('location.approxLabel')}
        </Text>
        {props.variant === 'exact' ? (
          <>
            <Text variant="title">{props.street}</Text>
            <Text variant="body" tone="secondary">{`${props.neighbourhood}, ${props.district} · ${props.details}`}</Text>
            {props.note ? (
              <View style={[styles.note, { backgroundColor: c.surface.field, borderRadius: theme.radii.field }]}>
                <Text variant="body" tone="secondary">{`“${props.note}”`}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <Text variant="title">{`${props.neighbourhood}, ${props.district}`}</Text>
            <Text variant="body" tone="secondary">
              {t('location.distance', { distance: formatKm(props.distanceKm) })}
            </Text>
          </>
        )}
      </Animated.View>
      <View style={styles.privacy}>
        <Icon name={exact ? 'lockOpen' : 'lock'} size="s" color={c.ink.tertiary} weight="bold" />
        <Text variant="meta" tone="tertiary" style={styles.flex}>
          {exact ? t('location.exactPrivate') : t('location.approxLock')}
        </Text>
      </View>
      {props.variant === 'exact' ? (
        <View style={styles.actions}>
          <View style={styles.flex}>
            <Button level="secondary" icon="navigate" label={t('location.directions')} onPress={props.onDirections} />
          </View>
          <Button level="tertiary" layout="fit" label={t('common.copy')} onPress={props.onCopy} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { padding: 12, marginTop: 8 },
  privacy: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
});
