import { StyleSheet, View } from 'react-native';

import { AppIconConcept } from '@/brand/AppIconConcept';
import { typeDirectionMeta } from '@/brand/fonts';
import { identity } from '@/brand/identity';
import { Mark } from '@/brand/Mark';
import { Wordmark } from '@/brand/Wordmark';
import { LabGroup, LabScreen, Specimen } from '@/features/lab/components/LabScreen';
import { osDarkWallpaper } from '@/features/lab/constants';
import { useTheme } from '@/theme';
import { RouteMark, Text } from '@/ui';

export default function BrandLab() {
  const theme = useTheme();
  const c = theme.color;
  const current = theme.config.typeDirection;
  const other = current === 'standard' ? 'condensed' : 'standard';
  return (
    <LabScreen index="07" title="Marka" intro={`Çalışma markası ${identity.nameUpper}. Palet, tip ve işaret henüz kilitli değil; hepsi marka katmanından değişir.`}>
      <LabGroup title="Kelime işareti" note="Font çizgilerinden üretilmiş logo; İ’nin noktası marka noktasıdır.">
        <Specimen caption={`Seçili · ${typeDirectionMeta[current].code} ${typeDirectionMeta[current].face}`}>
          <Wordmark capHeight={30} />
        </Specimen>
        <Specimen caption={`Diğer · ${typeDirectionMeta[other].code} ${typeDirectionMeta[other].face}`}>
          <Wordmark capHeight={30} direction={other} />
        </Specimen>
        <Specimen caption="Küçük · 11 pt">
          <Wordmark capHeight={11} />
        </Specimen>
      </LabGroup>
      <LabGroup title="Zeminler" bleed>
        <View style={[styles.band, { backgroundColor: c.surface.inverse }]}>
          <Wordmark capHeight={26} color={c.ink.onInverse} />
        </View>
        <View style={[styles.band, { backgroundColor: c.brand.fill }]}>
          <Wordmark capHeight={26} color={c.brand.onFill} dotColor={c.brand.onFill} />
        </View>
        <View style={[styles.band, { backgroundColor: c.surface.grouped }]}>
          <Wordmark capHeight={26} />
        </View>
      </LabGroup>
      <LabGroup title="İ-noktası ve rota" note="Nokta; seçim, canlı durum, harita ve başarı anlarında hareket eden tek marka öğesidir.">
        <View style={styles.row}>
          <Mark size={88} />
          <View style={[styles.tile, { backgroundColor: c.surface.inverse, borderRadius: theme.radii.tile }]}>
            <Mark size={64} color={c.ink.onInverse} />
          </View>
          <RouteMark width={130} />
        </View>
      </LabGroup>
      <LabGroup title="Uygulama ikonu" note="Yerel ikon dosyaları palet seçilene dek nötr (mürekkep + beyaz).">
        <View style={[styles.wall, { backgroundColor: c.surface.fieldStrong, borderRadius: theme.radii.tile }]}>
          <AppIconConcept size={84} />
          <AppIconConcept size={84} concept="route" />
          <AppIconConcept size={84} concept="word" />
        </View>
        <View style={[styles.wall, { backgroundColor: osDarkWallpaper, borderRadius: theme.radii.tile }]}>
          <AppIconConcept size={60} />
          <AppIconConcept size={60} concept="route" />
          <AppIconConcept size={60} concept="word" />
        </View>
        <Text variant="meta" tone="tertiary">
          Açık risk: tek başına İ, küçük boyutta “bilgi (i)” simgesi gibi okunabilir. Rota ve kelime konseptleri bu riski taşımaz.
        </Text>
      </LabGroup>
    </LabScreen>
  );
}

const styles = StyleSheet.create({
  band: { paddingVertical: 32, paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 18 },
  tile: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  wall: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 24 },
});
