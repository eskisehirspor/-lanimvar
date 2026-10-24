import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { typeDirectionMeta, type TypeDirection } from '@/brand/fonts';
import { paletteOrder, palettes, type PaletteId } from '@/brand/palettes';
import { Completed, CustomerHome, LiveTask, TaskerOffer } from '@/features/lab/screens/compositions';
import { useLab, useLabMotion } from '@/features/lab/store';
import { ThemeProvider, useTheme, type ButtonShape } from '@/theme';
import { buttonShapeMeta } from '@/theme/tokens';
import { Button, IconButton, Tactile, Text } from '@/ui';

interface Combo {
  palette: PaletteId;
  type: TypeDirection;
  shape: ButtonShape;
}
const combos: Combo[] = paletteOrder.flatMap((palette) => (['condensed', 'standard'] as const).flatMap((type) => (['pill', 'slab'] as const).map((shape) => ({ palette, type, shape }))));
const label = (c: Combo) => `${palettes[c.palette].code} · ${typeDirectionMeta[c.type].code} · ${buttonShapeMeta[c.shape].name}`;
const phones = [CustomerHome, LiveTask, TaskerOffer, Completed];

/**
 * The approval matrix: 3 palettes × 2 type directions × 2 button shapes,
 * each rendering the same four real compositions as phones side by side.
 */
export default function CompareLab() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const motion = useLabMotion();
  const lab = useLab();
  const pager = useRef<ScrollViewInstance>(null);
  const [page, setPage] = useState(0);
  const c = theme.color;
  const g = theme.layout.gutter;
  const go = (i: number) => {
    setPage(i);
    pager.current?.scrollTo({ x: i * width, animated: true });
  };
  const phoneW = (width - g * 2 - 12) / 2;
  const scale = phoneW / width;

  return (
    <View style={[styles.flex, { backgroundColor: c.surface.grouped, paddingTop: insets.top + 6 }]}>
      <View style={{ paddingHorizontal: g, gap: 12, paddingBottom: 12 }}>
        <View style={styles.top}>
          <IconButton icon="arrowLeft" label="Geri" variant="floating" onPress={() => router.back()} />
          <Text variant="micro" tone="tertiary">{`Karşılaştır · ${page + 1}/${combos.length}`}</Text>
        </View>
        <View style={styles.matrix}>
          {combos.map((combo, i) => {
            const on = i === page;
            return (
              <Tactile key={label(combo)} haptic="select" pressScale={0.94} onPress={() => go(i)} accessibilityLabel={label(combo)} style={[styles.cell, { backgroundColor: on ? c.surface.inverse : c.surface.panel, borderRadius: 10 }]}>
                <View style={[styles.dot, { backgroundColor: palettes[combo.palette].brand.fill }]} />
                <Text variant="meta" emphasis style={{ color: on ? c.ink.onInverse : c.ink.primary }}>
                  {typeDirectionMeta[combo.type].code}
                </Text>
                <View style={[styles.shape, { borderColor: on ? c.ink.onInverse : c.ink.primary, borderRadius: combo.shape === 'pill' ? 5 : 2 }]} />
              </Tactile>
            );
          })}
        </View>
      </View>
      <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}>
        {combos.map((combo) => (
          <ThemeProvider key={label(combo)} config={{ palette: combo.palette, typeDirection: combo.type, buttonShape: combo.shape, textScale: lab.textScale }} motion={motion}>
            <ScrollView style={{ width }} contentContainerStyle={{ paddingHorizontal: g, paddingBottom: 120 + insets.bottom, gap: 12 }}>
              <View style={{ gap: 2 }}>
                <Text variant="title">{label(combo)}</Text>
                <Text variant="meta" tone="tertiary">{`${palettes[combo.palette].name} · ${typeDirectionMeta[combo.type].face}`}</Text>
              </View>
              <View style={styles.grid}>
                {phones.map((Phone, i) => (
                  <View key={i} style={[styles.phone, { width: phoneW, height: height * scale, borderColor: c.surface.hairlineStrong }]}>
                    <View style={{ width, height, transform: [{ scale }], position: 'absolute', left: (phoneW - width) / 2, top: (height * scale - height) / 2 }}>
                      <Phone />
                    </View>
                  </View>
                ))}
              </View>
              <Button level="secondary" icon="check" label="Bu kombinasyonu tüm Lab’da kullan" onPress={() => lab.set({ palette: combo.palette, typeDirection: combo.type, buttonShape: combo.shape })} />
            </ScrollView>
          </ThemeProvider>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  matrix: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: '15%', flexGrow: 1, height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  shape: { width: 14, height: 9, borderWidth: 1.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  phone: { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
});
