import { StyleSheet, View } from 'react-native';

import { paletteOrder, palettes, type PaletteId } from '@/brand/palettes';
import { LabGroup, LabScreen } from '@/features/lab/components/LabScreen';
import { useLab, useLabMotion } from '@/features/lab/store';
import { ThemeProvider, useTheme, type ColorRoles } from '@/theme';
import { contrastRatio, grade } from '@/theme/contrast';
import { Button, Chip, StatusWord, Text } from '@/ui';

interface Pair {
  role: string;
  fg: (c: ColorRoles) => string;
  bg: (c: ColorRoles) => string;
  kind: 'metin' | 'grafik';
}

const pairs: Pair[] = [
  { role: 'ink.primary / surface.base', fg: (c) => c.ink.primary, bg: (c) => c.surface.base, kind: 'metin' },
  { role: 'ink.secondary / surface.grouped', fg: (c) => c.ink.secondary, bg: (c) => c.surface.grouped, kind: 'metin' },
  { role: 'ink.tertiary / surface.field', fg: (c) => c.ink.tertiary, bg: (c) => c.surface.field, kind: 'metin' },
  { role: 'brand.onFill / brand.fill', fg: (c) => c.brand.onFill, bg: (c) => c.brand.fill, kind: 'metin' },
  { role: 'status.success / surface.base', fg: (c) => c.status.success, bg: (c) => c.surface.base, kind: 'metin' },
  { role: 'status.attention / tint.attention', fg: (c) => c.status.attention, bg: (c) => c.tint.attention, kind: 'metin' },
  { role: 'safety.onCritical / safety.critical', fg: (c) => c.safety.onCritical, bg: (c) => c.safety.critical, kind: 'metin' },
  { role: 'ink.onInverse / surface.inverse', fg: (c) => c.ink.onInverse, bg: (c) => c.surface.inverse, kind: 'metin' },
  { role: 'brand.dot / surface.inverse', fg: (c) => c.brand.dot, bg: (c) => c.surface.inverse, kind: 'grafik' },
  { role: 'brand.dotOutline / surface.base', fg: (c) => c.brand.dotOutline, bg: (c) => c.surface.base, kind: 'grafik' },
];

export default function ColorLab() {
  const theme = useTheme();
  const motion = useLabMotion();
  return (
    <LabScreen index="06" title="Renk" intro="Üç aday, aynı anlamsal roller. Nötrler işi yapar; marka rengi bir sinyaldir. Kırmızı yalnızca güvenlik için.">
      {paletteOrder.map((id) => (
        <ThemeProvider key={id} config={{ ...theme.config, palette: id }} motion={motion}>
          <Section id={id} />
        </ThemeProvider>
      ))}
    </LabScreen>
  );
}

function Section({ id }: { id: PaletteId }) {
  const theme = useTheme();
  const lab = useLab();
  const p = palettes[id];
  const c = theme.color;
  const active = lab.palette === id;
  const swatches = [c.surface.inverse, c.brand.fill, c.surface.grouped, c.surface.field, c.status.success, c.status.attention, c.safety.critical];
  return (
    <LabGroup title={`${p.code} · ${p.name}`} note={p.idea}>
      <View style={styles.swatches}>
        {swatches.map((s, i) => (
          <View key={i} style={[styles.swatch, { backgroundColor: s, borderColor: c.surface.hairline, flex: i < 2 ? 2 : 1 }]} />
        ))}
      </View>
      <View style={styles.wrap}>
        <Button layout="fit" size="m" label="Kabul et" />
        <Button layout="fit" size="m" level="secondary" label="Görevli ol" />
        <Button layout="fit" size="m" level="tertiary" label="Vazgeç" />
      </View>
      <View style={styles.wrap}>
        <StatusWord status="en_route" extra="7 dk" />
        <Chip tone="success" icon="check" label="Doğrulandı" />
        <Chip tone="attention" icon="warning" label="Onay bekliyor" />
      </View>
      <View>
        {pairs.map((pair) => {
          const fg = pair.fg(c);
          const bg = pair.bg(c);
          const r = contrastRatio(fg, bg);
          const pass = r >= (pair.kind === 'metin' ? 4.5 : 3);
          return (
            <View key={pair.role} style={[styles.pair, { borderTopColor: c.surface.hairline }]}>
              <View style={[styles.chip, { backgroundColor: bg, borderColor: c.surface.hairline }]}>
                <View style={[styles.chipDot, { backgroundColor: fg }]} />
              </View>
              <View style={styles.flex}>
                <Text variant="meta" emphasis>
                  {pair.role}
                </Text>
                <Text variant="meta" tone="tertiary">
                  {pair.kind}
                </Text>
              </View>
              <Text variant="label" tone={pass ? 'primary' : 'attention'} style={{ fontVariant: ['tabular-nums'] }}>{`${r.toFixed(1).replace('.', ',')}:1`}</Text>
              <Text variant="meta" tone={pass ? 'success' : 'attention'} emphasis style={{ width: 64, textAlign: 'right' }}>
                {pass ? grade(r) : 'Yetersiz'}
              </Text>
            </View>
          );
        })}
      </View>
      <Button level={active ? 'tertiary' : 'secondary'} icon={active ? 'check' : undefined} label={active ? 'Lab’da seçili' : `${p.code}’i tüm Lab’da kullan`} onPress={() => lab.set({ palette: id })} />
    </LabGroup>
  );
}

const styles = StyleSheet.create({
  swatches: { flexDirection: 'row', gap: 6, height: 56 },
  swatch: { borderRadius: 12, borderWidth: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1 },
  chip: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipDot: { width: 14, height: 14, borderRadius: 7 },
  flex: { flex: 1 },
});
