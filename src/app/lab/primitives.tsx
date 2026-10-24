import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LabGroup, LabScreen, Specimen } from '@/features/lab/components/LabScreen';
import { exactAddress, offer, proofItems } from '@/features/lab/fixtures';
import { lifecycleSteps, type LifecycleStep } from '@/features/task/model/status';
import { t } from '@/i18n';
import {
  AmountEntry,
  Avatar,
  Button,
  Callout,
  Chip,
  EmergencyScreen,
  EmptyState,
  Field,
  IconButton,
  IncomingTaskSheet,
  LabelValueBlock,
  LifecycleStrip,
  LocationBlock,
  PinDisplay,
  PinEntry,
  PriceDisplay,
  ProofGrid,
  RatingStars,
  SafetyHandle,
  SafetySheet,
  SelectTile,
  Skeleton,
  SuccessMoment,
  TabBar,
  TaskRow,
  TaskRowSkeleton,
  Text,
  type PinEntryStatus,
  type TabKey,
} from '@/ui';

type SafetyPreset = 'default' | 'issue' | 'leave' | 'safeDone';

export default function PrimitivesLab() {
  const [vehicle, setVehicle] = useState<'none' | 'car' | 'van'>('van');
  const [budget, setBudget] = useState(650);
  const [step, setStep] = useState<LifecycleStep>('en_route');
  const [pinRevealed, setPinRevealed] = useState(false);
  const [exact, setExact] = useState(false);
  const [tabC, setTabC] = useState<TabKey>('home');
  const [tabT, setTabT] = useState<TabKey>('home');
  const [safety, setSafety] = useState<SafetyPreset | null>(null);
  const [emergency, setEmergency] = useState<{ x: number; y: number } | null>(null);
  const [incoming, setIncoming] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [successKey, setSuccessKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState(4);

  return (
    <LabScreen index="04" title="Bileşenler" intro="Gerçek bileşenler, tüm durumlarıyla. Dokunun, yazın, sürükleyin.">
      <LabGroup title="Button" note="Ekran başına tek birincil (marka); ikincil mürekkep; üçüncül sessiz dolgu; hayalet metin.">
        {(['primary', 'secondary', 'tertiary'] as const).map((level) => (
          <Specimen key={level} token={`level="${level}"`} caption="varsayılan / yükleniyor / pasif">
            <Button level={level} label="İlanı yayınla" />
            <Button level={level} label="İlanı yayınla" loading />
            <Button level={level} label="İlanı yayınla" disabled />
          </Specimen>
        ))}
        <Specimen caption="yüklenme geçişi · dokun">
          <Button
            label={loading ? 'Gönderiliyor' : 'Kabul et'}
            loading={loading}
            icon="arrowRight"
            iconPosition="trailing"
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1800);
            }}
          />
        </Specimen>
        <Specimen token={'size="m" · level="ghost" · level="critical"'}>
          <View style={styles.wrap}>
            <Button layout="fit" size="m" level="secondary" icon="navigate" label="Yol tarifi" />
            <Button layout="fit" size="m" level="tertiary" icon="phone" label="Ara" />
            <Button layout="fit" size="m" level="ghost" label="İptal et" />
          </View>
          <Button level="critical" icon="siren" label={t('safety.emergency')} />
        </Specimen>
        <Specimen token="IconButton" caption="field / floating / brand / plain">
          <View style={styles.wrap}>
            <IconButton icon="arrowLeft" label="Geri" />
            <IconButton icon="locate" label="Konum" variant="floating" />
            <IconButton icon="phone" label="Ara" variant="brand" />
            <IconButton icon="bell" label="Bildirim" badge />
            <IconButton icon="x" label="Kapat" variant="plain" />
          </View>
        </Specimen>
      </LabGroup>

      <LabGroup title="Field">
        <Field label="Ne yapılacak?" placeholder="Örn. koltuk takımını taşıma" />
        <Field label="Adres" leadingIcon="mapPin" value="Ahmet Kanatlı Cad. No: 24" />
        <Field label="Daire / kat" focused value="Kat 3, Daire 7" />
        <Field label="Telefon" value="0532 12" error="Numara eksik görünüyor." keyboardType="phone-pad" />
        <Field label="Görevliye not" optional multiline maxLength={240} counter placeholder="Kapı, zil, park yeri…" />
        <Field label="Şehir" value="Eskişehir" disabled hint="İlk etapta yalnızca Eskişehir." />
      </LabGroup>

      <LabGroup title="SelectTile · Chip">
        <View style={styles.tiles}>
          <SelectTile icon="people" label="Araç yok" selected={vehicle === 'none'} onPress={() => setVehicle('none')} />
          <SelectTile icon="car" label="Otomobil" selected={vehicle === 'car'} onPress={() => setVehicle('car')} />
          <SelectTile icon="van" label="Kamyonet" sublabel="+150 TL" selected={vehicle === 'van'} onPress={() => setVehicle('van')} />
        </View>
        <View style={styles.wrap}>
          <Chip label="1 kişi" icon="people" />
          <Chip tone="brand" label="Şimdi lazım" />
          <Chip tone="success" icon="check" label={t('verification.identity')} />
          <Chip tone="attention" icon="warning" label="Onay bekliyor" />
          <Chip tone="safety" icon="shield" label="Güvenlik" />
          <Chip tone="outline" size="m" label="Montaj" onPress={() => undefined} />
          <Chip size="m" label="Taşıma" selected onPress={() => undefined} />
        </View>
        <View style={styles.wrap}>
          <Avatar initials="MK" size={56} verified />
          <Avatar initials="AY" size={44} />
          <Avatar initials="EB" size={36} tone="brand" />
          <Avatar initials="SÖ" size={28} tone="inverse" />
          <RatingStars value={stars} onChange={setStars} size={28} />
        </View>
      </LabGroup>

      <LabGroup title="TaskRow" bleed>
        <View style={{ paddingTop: 4 }}>
          <TaskRow icon="couch" title="Koltuk takımını 3. kata taşıma" neighbourhood="Hoşnudiye, Tepebaşı" when="Şimdi" price={650} status="searching" statusExtra="3 dk" onPress={() => undefined} />
          <TaskRow icon="package" title="Buzdolabını mutfağa yerleştirme" neighbourhood="Vişnelik, Odunpazarı" when="14:30" price={400} status="en_route" statusExtra="7 dk" assignee={{ initials: 'MK', verified: true }} onPress={() => undefined} />
          <TaskRow icon="wrench" title="Kitaplık montajı" neighbourhood="Arifiye, Odunpazarı" when="11:00" price={350} status="in_progress" assignee={{ initials: 'AY' }} onPress={() => undefined} />
          <TaskRow icon="toolbox" title="Perde rayı takma" neighbourhood="Batıkent, Tepebaşı" when="Dün" price={300} status="proof_submitted" onPress={() => undefined} />
          <TaskRow icon="handTruck" title="Halı taşıma" neighbourhood="Şirintepe, Tepebaşı" when="12 Eyl" price={250} status="completed" onPress={() => undefined} />
          <TaskRow icon="door" title="Kapı kolu değişimi" neighbourhood="Emek, Odunpazarı" when="8 Eyl" price={200} status="cancelled" last onPress={() => undefined} />
        </View>
      </LabGroup>

      <LabGroup title="LifecycleStrip" note="Tek bir değer tüm şeridi ve noktayı taşır.">
        <LifecycleStrip step={step} />
        <View style={styles.wrap}>
          {lifecycleSteps.map((s) => (
            <Chip key={s} size="m" tone="outline" label={t(`lifecycle.${s}`)} selected={s === step} onPress={() => setStep(s)} />
          ))}
        </View>
        <Specimen caption="yol dışı · müşteri gelmedi">
          <LifecycleStrip step="arrived" tone="attention" />
        </Specimen>
      </LabGroup>

      <LabGroup title="LabelValueBlock · PriceDisplay">
        <LabelValueBlock icon="user" label="İlan veren" value="Ayşe K." sub="3 iş · Telefon doğrulandı" />
        <LabelValueBlock icon="mapPin" label="Konum" value="Hoşnudiye, Tepebaşı" sub="Yaklaşık 2,1 km" action={{ label: 'Harita', onPress: () => undefined }} />
        <LabelValueBlock icon="clock" label="Ne zaman" value="Şimdi" />
        <PriceDisplay amount={650} reason="3. kat, asansörsüz, 1 kişi" />
        <PriceDisplay amount={1250} kind="agreed" size="compact" />
      </LabGroup>

      <LabGroup title="AmountEntry" note="Rakamlar yuvarlanır. Önerinin %80 altı uyarır, engellemez. 99.999 üstü sallanır.">
        <AmountEntry value={budget} onChange={setBudget} recommended={650} />
      </LabGroup>

      <LabGroup title="LocationBlock" note="Kabul anında alan bir iğneye dönüşür: gizlilik modeli görünür olur.">
        {exact ? <LocationBlock variant="exact" {...exactAddress} /> : <LocationBlock variant="approximate" district="Tepebaşı" neighbourhood="Hoşnudiye" distanceKm={2.1} />}
        <Button level="tertiary" label={exact ? 'Yaklaşığa dön' : 'Kabul et → tam adres'} onPress={() => setExact(!exact)} />
      </LabGroup>

      <LabGroup title="PIN">
        <Specimen token="PinDisplay" caption="müşteri · dokun: göster / gizle">
          <PinDisplay pin="482716" revealed={pinRevealed} onToggle={() => setPinRevealed(!pinRevealed)} />
        </Specimen>
        <Specimen token="PinDisplay verified">
          <PinDisplay pin="482716" revealed verified compact />
        </Specimen>
        <Specimen token="PinEntry" caption="görevli · canlı (doğru kod 482716)">
          <LivePin />
        </Specimen>
        <Specimen token={'status="error" · status="locked"'}>
          <PinEntry value="482719" onChange={() => undefined} status="error" attemptsLeft={2} showKeypad={false} />
          <PinEntry value="" onChange={() => undefined} status="locked" showKeypad={false} />
        </Specimen>
      </LabGroup>

      <LabGroup title="ProofGrid">
        <ProofGrid items={proofItems} onAdd={() => undefined} onRetry={() => undefined} showRequirement />
      </LabGroup>

      <LabGroup title="Güvenlik">
        <View style={styles.wrap}>
          <SafetyHandle onPress={() => setSafety('default')} />
          <SafetyHandle state="checkInDue" onPress={() => setSafety('default')} />
          <SafetyHandle state="incident" onPress={() => setSafety('default')} />
        </View>
        <Button level="secondary" label="Güvenlik sayfası" onPress={() => setSafety('default')} />
        <View style={styles.wrap}>
          <Button layout="fit" size="m" level="tertiary" label="Sorun var · açık" onPress={() => setSafety('issue')} />
          <Button layout="fit" size="m" level="tertiary" label="Görevi bırak · onay" onPress={() => setSafety('leave')} />
          <Button layout="fit" size="m" level="tertiary" label="Güvendeyim · kayıtlı" onPress={() => setSafety('safeDone')} />
        </View>
        <Button
          level="tertiary"
          label="Yeni iş teklifi (sayfa)"
          onPress={() => {
            setAccepting(false);
            setIncoming(true);
          }}
        />
      </LabGroup>

      <LabGroup title="Tab bar" bleed>
        <TabBar role="customer" active={tabC} onSelect={setTabC} live={{ title: 'Mehmet yolda', sub: '7 dk · Koltuk indirme', initials: 'MK' }} />
        <TabBar role="tasker" active={tabT} onSelect={setTabT} />
      </LabGroup>

      <LabGroup title="Yükleniyor · Boş · Hata · Başarı">
        <View style={{ marginHorizontal: -20 }}>
          <TaskRowSkeleton />
          <TaskRowSkeleton />
        </View>
        <Skeleton width="55%" height={28} />
        <EmptyState title={t('feedback.emptyTitle')} body={t('feedback.emptyBody')} action={t('feedback.emptyAction')} onAction={() => undefined} />
        <Callout title={t('feedback.errorTitle')} body={t('feedback.errorBody')} action={t('common.retry')} onAction={() => undefined} />
        <Callout tone="safety" title="Güvenlik bildirimin alındı." body="Ekibimiz 2 dakika içinde seni arayacak. İstersen görevi bırakabilirsin." />
        <SuccessMoment title={t('feedback.successTitle')} body={t('feedback.successBody', { name: 'Mehmet' })} playKey={successKey} />
        <Button level="tertiary" icon="play" label="Tekrar oynat" onPress={() => setSuccessKey((k) => k + 1)} />
        <Text variant="meta" tone="tertiary">
          Lab’da 112 araması simüle edilir; gerçek arama yapılmaz.
        </Text>
      </LabGroup>

      <SafetySheet
        visible={safety !== null}
        onClose={() => setSafety(null)}
        initialExpanded={safety === 'issue' ? 'issue' : safety === 'leave' ? 'leave' : 'none'}
        initialSafeAt={safety === 'safeDone' ? '14:32' : undefined}
        onLeave={() => setSafety(null)}
        onEmergency={(o) => {
          setSafety(null);
          setEmergency(o);
        }}
      />
      <EmergencyScreen visible={emergency !== null} origin={emergency ?? undefined} onClose={() => setEmergency(null)} onCall112={() => undefined} onCallTeam={() => undefined} />
      <IncomingTaskSheet
        visible={incoming}
        offer={offer}
        accepting={accepting}
        onAccept={() => {
          setAccepting(true);
          setTimeout(() => setIncoming(false), 1400);
        }}
        onPass={() => setIncoming(false)}
        onExpire={() => setIncoming(false)}
      />
    </LabScreen>
  );
}

function LivePin() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<PinEntryStatus>('idle');
  const [fails, setFails] = useState(0);
  return (
    <View style={{ gap: 4 }}>
      <PinEntry
        value={value}
        status={status}
        attemptsLeft={fails >= 2 && status !== 'locked' ? 5 - fails : undefined}
        onChange={(v) => {
          if (status === 'error') setStatus('idle');
          setValue(v);
        }}
        onComplete={(v) => {
          if (v === '482716') return setStatus('verified');
          const next = fails + 1;
          setFails(next);
          setStatus(next >= 5 ? 'locked' : 'error');
          setTimeout(() => setValue(''), 450);
        }}
      />
      <Button
        level="ghost"
        layout="fit"
        align="center"
        label="Sıfırla"
        onPress={() => {
          setStatus('idle');
          setFails(0);
          setValue('');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  tiles: { flexDirection: 'row', gap: 8 },
});
