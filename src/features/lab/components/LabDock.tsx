import { usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';
import { Icon, Tactile, Text } from '@/ui';
import { riseIn } from '@/ui/motion';

import { useLab } from '../store';
import { Segmented } from './Segmented';

/**
 * Lab controls as a single floating button that opens into a panel, so it
 * never covers the screens being judged.
 */
export function LabDock() {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const lab = useLab();
  const open = lab.dockOpen;
  // On the full-screen deck the trigger lives in the deck's own pill.
  const path = usePathname();
  const onDeck = path.endsWith('/screens') || path.endsWith('/prototype');

  return (
    <View pointerEvents="box-none" style={[styles.host, { paddingBottom: Math.max(insets.bottom, 12) + (onDeck ? 0 : 64) }]}>
      {open ? (
        <Animated.View entering={riseIn(motion, 0, 16)} style={[styles.panel, theme.elevation.dock, { backgroundColor: c.surface.inverse, borderRadius: 24 }]}>
          <Row label={t('lab.dock.palette')}>
            <Segmented value={lab.palette} options={[{ key: 'p1', label: 'P1' }, { key: 'p2', label: 'P2' }, { key: 'p3', label: 'P3' }]} onChange={(k) => lab.set({ palette: k })} />
          </Row>
          <Row label={t('lab.dock.type')}>
            <Segmented value={lab.typeDirection} options={[{ key: 'condensed', label: 'A · Dar' }, { key: 'standard', label: 'B · Standart' }]} onChange={(k) => lab.set({ typeDirection: k })} />
          </Row>
          <Row label={t('lab.dock.button')}>
            <Segmented value={lab.buttonShape} options={[{ key: 'pill', label: 'Hap' }, { key: 'slab', label: 'Blok' }]} onChange={(k) => lab.set({ buttonShape: k })} />
          </Row>
          <View style={[styles.sep, { backgroundColor: c.surface.hairlineOnInverse }]} />
          <Row label={t('lab.dock.speed')}>
            <Segmented value={String(lab.speed)} options={[{ key: '1', label: '1×' }, { key: '0.5', label: '½×' }, { key: '0.25', label: '¼×' }]} onChange={(k) => lab.set({ speed: Number(k) })} />
          </Row>
          <Row label={t('lab.dock.reduceMotion')}>
            <Segmented value={lab.reduceMotion} options={[{ key: 'system', label: t('lab.dock.system') }, { key: 'on', label: t('lab.dock.on') }, { key: 'off', label: t('lab.dock.off') }]} onChange={(k) => lab.set({ reduceMotion: k })} />
          </Row>
          <Row label={t('lab.dock.textSize')}>
            <Segmented value={String(lab.textScale)} options={theme.a11y.textScaleOptions.map((s) => ({ key: String(s), label: `%${Math.round(s * 100)}` }))} onChange={(k) => lab.set({ textScale: Number(k) })} />
          </Row>
          <Row label={t('lab.dock.haptics')}>
            <Segmented value={lab.haptics ? 'on' : 'off'} options={[{ key: 'on', label: t('lab.dock.on') }, { key: 'off', label: t('lab.dock.off') }]} onChange={(k) => lab.set({ haptics: k === 'on' })} />
          </Row>
        </Animated.View>
      ) : null}
      {onDeck ? null : (
      <View style={[styles.fabRow, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
        <Tactile
          haptic="select"
          onPress={() => lab.set({ dockOpen: !open })}
          accessibilityLabel={t('lab.dock.more')}
          accessibilityState={{ expanded: open }}
          style={[styles.fab, theme.elevation.dock, { backgroundColor: c.surface.inverse }]}
        >
          <Icon name={open ? 'x' : 'sliders'} size="m" color={c.ink.onInverse} weight="bold" />
          <Text variant="label" tone="onInverse" style={{ fontSize: 14 }}>
            {`${lab.palette.toUpperCase()} · ${lab.typeDirection === 'condensed' ? 'A' : 'B'} · ${lab.buttonShape === 'pill' ? 'Hap' : 'Blok'}`}
          </Text>
        </Tactile>
      </View>
      )}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text variant="micro" tone="onInverseTertiary" style={styles.rowLabel}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end', paddingHorizontal: 12 },
  panel: { padding: 16, gap: 10, alignSelf: 'stretch', maxWidth: 440, width: '100%', marginHorizontal: 'auto' },
  sep: { height: 1, marginVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rowLabel: { flexShrink: 1 },
  fabRow: { position: 'absolute', right: 12, left: 12, alignItems: 'flex-end' },
  fab: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 16, borderRadius: 24 },
});
