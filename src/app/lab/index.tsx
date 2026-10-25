import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wordmark } from '@/brand/Wordmark';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { Icon, Tactile, Text, type IconName } from '@/ui';

const sections: { href: Href; title: string; body: string; icon: IconName }[] = [
  { href: '/lab/prototype', title: 'Prototip', body: 'Şimdi Lazım hikâyesi baştan sona, dokunarak: sesle ilan, arama, kabul, canlı takip, bitiş', icon: 'play' },
  { href: '/lab/screens', title: 'Ekranlar', body: '10 tam ekran: sesle ilan, fiyat kadranı, canlı takip, görevli teklifi, kabul ve “Hallettin” anları', icon: 'home' },
  { href: '/lab/compare', title: 'Karşılaştır', body: '3 palet × 2 tip yönü × 2 buton biçimi, aynı ekranlarda', icon: 'sliders' },
  { href: '/lab/motion', title: 'Hareket', body: '11 geçiş, her biri ürün gerekçesiyle tek tek oynatılır', icon: 'play' },
  { href: '/lab/primitives', title: 'Bileşenler', body: 'Tüm durumlarıyla gerçek bileşenler', icon: 'tasks' },
  { href: '/lab/typography', title: 'Tipografi', body: 'Ölçek, Türkçe stres testi, rakamlar', icon: 'wrench' },
  { href: '/lab/color', title: 'Renk', body: 'Anlamsal roller ve canlı WCAG kontrolü', icon: 'checkCircle' },
  { href: '/lab/brand', title: 'Marka', body: 'Kelime işareti, İ-noktası, uygulama ikonu', icon: 'star' },
];

export default function LabHome() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  return (
    <ScrollView style={{ backgroundColor: c.surface.grouped }} contentContainerStyle={{ paddingBottom: 140 + insets.bottom }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: c.surface.inverse, paddingTop: insets.top + 18, paddingHorizontal: g, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Wordmark capHeight={15} color={c.ink.onInverse} />
        <Text variant="micro" tone="onInverseTertiary" style={{ marginTop: 44 }}>
          {t('lab.kicker')}
        </Text>
        <Text variant="display.xl" tone="onInverse" style={{ marginTop: 10 }}>
          {t('lab.title')}
        </Text>
        <Text variant="body" tone="onInverseSecondary" style={{ marginTop: 12 }}>
          {t('lab.intro')}
        </Text>
      </View>

      <View style={{ paddingHorizontal: g, marginTop: 20, gap: 10 }}>
        <Tactile pressScale={0.985} onPress={() => router.push(sections[0]!.href)} style={[styles.feature, { backgroundColor: c.surface.panel, borderRadius: theme.radii.panel }]}>
          <View style={[styles.featureIcon, { backgroundColor: c.brand.fill }]}>
            <Icon name="play" size="m" color={c.brand.onFill} weight="fill" />
          </View>
          <Text variant="display.m" style={{ marginTop: 28 }}>
            {sections[0]!.title}
          </Text>
          <Text variant="body" tone="secondary">
            {sections[0]!.body}
          </Text>
          <View style={[styles.featureGo, { backgroundColor: c.surface.inverse }]}>
            <Icon name="arrowRight" size="s" color={c.ink.onInverse} weight="bold" />
          </View>
        </Tactile>

        <View style={{ backgroundColor: c.surface.panel, borderRadius: theme.radii.panel, overflow: 'hidden' }}>
          {sections.slice(1).map((s, i, arr) => (
            <Tactile key={s.title} pressScale={1} pressDim={0.35} haptic="select" onPress={() => router.push(s.href)} accessibilityLabel={s.title} style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: c.surface.field }]}>
                <Icon name={s.icon} size="m" />
              </View>
              <View style={[styles.rowBody, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.surface.hairline }]}>
                <View style={styles.flex}>
                  <Text variant="label">{s.title}</Text>
                  <Text variant="meta" tone="tertiary" numberOfLines={1}>
                    {s.body}
                  </Text>
                </View>
                <Icon name="caretRight" size="s" color={c.ink.tertiary} weight="bold" />
              </View>
            </Tactile>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  feature: { padding: 20, gap: 4 },
  featureIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  featureGo: { position: 'absolute', right: 20, top: 20, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 16 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingRight: 16 },
});
