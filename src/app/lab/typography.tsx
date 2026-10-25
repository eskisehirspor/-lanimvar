import { StyleSheet, View } from 'react-native';

import { typeDirectionMeta } from '@/brand/fonts';
import { LabGroup, LabScreen, Specimen } from '@/features/lab/components/LabScreen';
import { useLabMotion } from '@/features/lab/store';
import { formatClock, formatKm, formatTL, trUpper } from '@/i18n';
import { ThemeProvider, useTheme, type TypeVariant } from '@/theme';
import { Icon, Text } from '@/ui';

const samples: Record<TypeVariant, string> = {
  'display.hero': 'Bugün\nne lazım?',
  'display.poster': 'KAPIDA.',
  'numeric.mega': '7 DK',
  'display.xl': 'Bugün ne\nhalledelim?',
  'display.l': 'Mehmet kapında.',
  'display.m': 'Güvende misin?',
  'numeric.hero': '1.250',
  'numeric.pin': '482 716',
  'numeric.key': '1 2 3 4 5 6 7 8 9 0',
  title: 'Koltuk takımını taşıma',
  'body.l': 'Üçüncü kattan zemine iki kişilik koltuk. Asansör yok, merdiven geniş.',
  body: 'Görevli kabul ettiğinde tam adres yalnızca ona görünür.',
  label: 'Kabul et',
  button: 'İlanı yayınla',
  meta: 'Hoşnudiye, Tepebaşı · 14:05',
  micro: 'yaklaşık konum',
  tab: 'Görevler',
};
const order: TypeVariant[] = ['display.hero', 'display.poster', 'numeric.mega', 'display.xl', 'display.l', 'display.m', 'numeric.hero', 'numeric.pin', 'title', 'body.l', 'body', 'label', 'button', 'meta', 'micro', 'tab', 'numeric.key'];
const caseTests = ['istanbul', 'iş ilanı', 'ışık', 'çiğdem', 'eskişehir', 'ılgaz'];

export default function TypographyLab() {
  const theme = useTheme();
  const motion = useLabMotion();
  const c = theme.color;
  const meta = typeDirectionMeta[theme.config.typeDirection];
  return (
    <LabScreen index="05" title="Tipografi" intro={`İki ses: ekranda tek bir büyük başlık (${meta.code} · ${meta.face}) ve geri kalan her şey için Instrument Sans.`}>
      <LabGroup title="A / B">
        {(['condensed', 'standard'] as const).map((d) => (
          <Specimen key={d} caption={`${typeDirectionMeta[d].code} · ${typeDirectionMeta[d].face}`}>
            <ThemeProvider config={{ ...theme.config, typeDirection: d }} motion={motion}>
              <DirectionSample />
            </ThemeProvider>
          </Specimen>
        ))}
      </LabGroup>
      <LabGroup title={`Ölçek · ${meta.code}`}>
        {order.map((v) => {
          const tok = theme.type[v];
          return (
            <Specimen key={v} token={`${v} · ${tok.fontSize}/${tok.lineHeight}${tok.tabular ? ' · tabular' : ''}${tok.caps ? ' · TR büyük harf' : ''}`}>
              <Text variant={v}>{samples[v]}</Text>
            </Specimen>
          );
        })}
      </LabGroup>
      <LabGroup title="Türkçe stres testi">
        <Text variant="display.l">İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü</Text>
        <Text variant="title">İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü</Text>
        <Text variant="display.m">Pijamalı hasta yağız şoföre çabucak güvendi.</Text>
        <Text variant="body.l">Pijamalı hasta yağız şoföre çabucak güvendi.</Text>
        <Specimen token="trUpper() · toUpperCase()" caption="Arayüzde asla textTransform kullanılmaz">
          {caseTests.map((s) => {
            const ok = trUpper(s);
            const naive = s.toUpperCase();
            const differs = ok !== naive;
            return (
              <View key={s} style={[styles.caseRow, { borderBottomColor: c.surface.hairline }]}>
                <Text variant="meta" tone="tertiary" style={{ width: 72 }}>
                  {s}
                </Text>
                <Text variant="label" style={styles.flex}>
                  {ok}
                </Text>
                <Text variant="meta" tone={differs ? 'attention' : 'tertiary'} style={styles.flex}>
                  {naive}
                </Text>
                <Icon name={differs ? 'warning' : 'check'} size="s" color={differs ? c.status.attention : c.status.success} weight="bold" />
              </View>
            );
          })}
        </Specimen>
        <Specimen caption="Uzun sözcük">
          <Text variant="display.m">Çekoslovakyalılaştıramadıklarımızdan</Text>
        </Specimen>
      </LabGroup>
      <LabGroup title="Rakamlar">
        <View style={{ alignItems: 'flex-end', alignSelf: 'flex-start' }}>
          {[650, 1250, 12500, 99999].map((n) => (
            <Text key={n} variant="display.m" style={{ fontVariant: ['tabular-nums'] }}>
              {formatTL(n)}
            </Text>
          ))}
        </View>
        <Text variant="title">{`${formatKm(2.1)} · ${formatKm(0.45)} · ${formatClock(462)} · ${formatClock(3930)}`}</Text>
      </LabGroup>
    </LabScreen>
  );
}

function DirectionSample() {
  return (
    <View style={{ gap: 4 }}>
      <Text variant="display.xl">Şimdi lazım.</Text>
      <Text variant="display.m">İşini bekletme. Hallet.</Text>
      <Text variant="numeric.hero">650</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1 },
  flex: { flex: 1 },
});
