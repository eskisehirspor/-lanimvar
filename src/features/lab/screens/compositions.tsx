/**
 * Full-screen compositions for visual approval.
 *
 * These are STATIC MOCKS assembled only from product primitives and fixtures.
 * They have no navigation, data or business logic and are not the product
 * screens — they exist so the art direction can be judged at real size.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatTL, t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';
import {
  AmountEntry,
  Avatar,
  Button,
  Chip,
  Field,
  Icon,
  IconButton,
  IncomingOfferContent,
  LifecycleStrip,
  LiveDot,
  MapCanvas,
  MAP_DEST,
  Panel,
  PinDisplay,
  PinEntry,
  ProofGrid,
  RatingStars,
  RouteMark,
  SafetyHandle,
  SearchPulse,
  SectionHeader,
  StepProgress,
  TabBar,
  Tactile,
  Text,
  type IconName,
} from '@/ui';

import { customer, offer, tasker } from '../fixtures';

/* ── shared scaffolding ─────────────────────────────────────────────────── */

function Shell({ children, grouped }: { children: ReactNode; grouped?: boolean }) {
  const theme = useTheme();
  return <View style={[styles.flex, { backgroundColor: grouped ? theme.color.surface.grouped : theme.color.surface.base }]}>{children}</View>;
}

/** Fixed bottom action zone: hairline top, safe-area aware. */
function BottomBar({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingHorizontal: theme.layout.gutter, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: theme.color.surface.base, borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: theme.color.surface.hairline, gap: 4 }}>
      {children}
    </View>
  );
}

/** Flow header: back · progress · trailing. */
function FlowHeader({ step, total, trailing }: { step: number; total: number; trailing?: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.flowHeader, { paddingTop: insets.top + 6, paddingHorizontal: theme.layout.gutter }]}>
      <IconButton icon="arrowLeft" label={t('common.back')} />
      <StepProgress step={step} total={total} />
      {trailing ?? <IconButton icon="x" label={t('common.close')} variant="plain" />}
    </View>
  );
}

/** Bottom panel that overlaps a map, like a resting sheet. */
function MapPanel({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.mapPanel, theme.elevation.sheet, { backgroundColor: theme.color.surface.panel, borderTopLeftRadius: theme.radii.sheet, borderTopRightRadius: theme.radii.sheet, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.handleZone}>
        <View style={[styles.handle, { backgroundColor: theme.color.surface.fieldStrong }]} />
      </View>
      <View style={{ paddingHorizontal: theme.layout.gutter }}>{children}</View>
    </View>
  );
}

function useLoop(ms: number) {
  const motion = useMotion();
  const p = useSharedValue(0.18);
  useEffect(() => {
    if (motion.reduced) {
      p.set(0.55);
      return;
    }
    p.set(withRepeat(withTiming(0.86, { duration: motion.ms(ms), easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [motion, ms, p]);
  return p;
}

/* ── 1 · Customer home ──────────────────────────────────────────────────── */

const quick: { icon: IconName; label: string }[] = [
  { icon: 'package', label: 'Eşya taşıma' },
  { icon: 'wrench', label: 'Montaj' },
  { icon: 'toolbox', label: 'Tamir' },
  { icon: 'handTruck', label: 'Yükleme' },
];

export function CustomerHome() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  return (
    <Shell>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.rowBetween, { paddingHorizontal: g }]}>
          <Tactile haptic="select" pressScale={0.97} style={[styles.locationPill, { backgroundColor: c.surface.field, borderRadius: theme.radii.pill }]}>
            <Icon name="mapPin" size="s" weight="fill" />
            <Text variant="label">Hoşnudiye, Tepebaşı</Text>
            <Icon name="caretDown" size={14} color={c.ink.tertiary} weight="bold" />
          </Tactile>
          <View style={styles.row}>
            <IconButton icon="bell" label="Bildirimler" badge />
            <Avatar initials={customer.initials} size={44} />
          </View>
        </View>

        <View style={{ paddingHorizontal: g, marginTop: theme.space[8], gap: 6 }}>
          <Text variant="body" tone="tertiary">{`Günaydın, ${customer.name}`}</Text>
          <Text variant="display.xl">{'Bugün ne\nhalledelim?'}</Text>
        </View>

        <View style={{ paddingHorizontal: g, marginTop: theme.space[6] }}>
          <Tactile pressScale={0.985} style={[styles.composer, { backgroundColor: c.surface.field, borderRadius: theme.radii.panel }]}>
            <Icon name="plus" size="m" color={c.ink.tertiary} weight="bold" />
            <Text variant="body.l" tone="tertiary" style={styles.flex}>
              Ne yapılması gerekiyor?
            </Text>
            <View style={[styles.composerGo, { backgroundColor: c.surface.inverse }]}>
              <Icon name="arrowRight" size="s" color={c.ink.onInverse} weight="bold" />
            </View>
          </Tactile>
        </View>

        <View style={{ paddingHorizontal: g, marginTop: theme.space[4], gap: 10 }}>
          <Tactile pressScale={0.985} style={[styles.nowCard, { backgroundColor: c.surface.inverse, borderRadius: theme.radii.panel }]}>
            <View style={styles.rowBetween}>
              <View style={[styles.nowIcon, { backgroundColor: c.brand.fill }]}>
                <Icon name="lightning" size="m" color={c.brand.onFill} weight="fill" />
              </View>
              <View style={[styles.nowGo, { borderColor: c.surface.hairlineOnInverse }]}>
                <Icon name="arrowUpRight" size="s" color={c.ink.onInverse} weight="bold" />
              </View>
            </View>
            <View style={{ gap: 4, marginTop: theme.space[8] }}>
              <Text variant="display.m" tone="onInverse">
                Şimdi lazım
              </Text>
              <View style={styles.row}>
                <LiveDot size={7} onInverse />
                <Text variant="meta" tone="onInverseSecondary">
                  Yakında 12 görevli çevrimiçi · ort. 4 dk’da kabul
                </Text>
              </View>
            </View>
          </Tactile>
          <View style={[styles.plannedCard, { backgroundColor: c.surface.field, borderRadius: theme.radii.panel }]}>
            <View style={[styles.plannedIcon, { backgroundColor: c.surface.panel }]}>
              <Icon name="calendar" size="m" />
            </View>
            <View style={styles.flex}>
              <Text variant="label">Planlı</Text>
              <Text variant="meta" tone="tertiary">
                Tarih seç, rahat eşleş
              </Text>
            </View>
            <Chip label="Yakında" />
          </View>
        </View>

        <View style={{ marginTop: theme.space[8] }}>
          <View style={{ paddingHorizontal: g }}>
            <SectionHeader title="Sık istenenler" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: g, gap: 10 }}>
            {quick.map((q) => (
              <Tactile key={q.label} pressScale={0.96} style={[styles.quick, { borderColor: c.surface.hairlineStrong, borderRadius: theme.radii.tile }]}>
                <Icon name={q.icon} size="l" />
                <Text variant="label">{q.label}</Text>
              </Tactile>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <TabBar role="customer" active="home" onSelect={() => undefined} live={{ title: 'Mehmet yolda', sub: '7 dk · Koltuk indirme', initials: tasker.initials }} bottomInset={insets.bottom} />
    </Shell>
  );
}

/* ── 2 · Create task · what ─────────────────────────────────────────────── */

export function CreateWhat() {
  const theme = useTheme();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [text, setText] = useState('3. kattaki iki kişilik koltuğu aşağı indirip apartman kapısının önüne bırakacak birine ihtiyacım var.');
  const [cat, setCat] = useState('Taşıma');
  return (
    <Shell>
      <FlowHeader step={1} total={4} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: g, paddingTop: theme.layout.headlineTop, paddingBottom: 24, gap: theme.space[6] }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          <Text variant="micro" tone="tertiary">
            Adım 1 / 4
          </Text>
          <Text variant="display.xl">Ne yapılacak?</Text>
          <Text variant="body" tone="secondary">
            Kısaca anlat. Fotoğraf eklersen önerilen ücret daha isabetli olur.
          </Text>
        </View>
        <Field multiline value={text} onChangeText={setText} maxLength={240} counter placeholder="Örn. koltuk takımını taşıma" />
        <View style={{ gap: 12 }}>
          <Text variant="label">Fotoğraflar</Text>
          <View style={styles.row}>
            {(['couch', 'door'] as IconName[]).map((i) => (
              <View key={i} style={[styles.thumb, { backgroundColor: c.surface.fieldStrong, borderRadius: theme.radii.field }]}>
                <Icon name={i} size={30} color={c.ink.tertiary} weight="fill" />
              </View>
            ))}
            <Tactile pressScale={0.95} style={[styles.thumb, styles.thumbAdd, { borderColor: c.surface.hairlineStrong, borderRadius: theme.radii.field }]}>
              <Icon name="camera" size="m" />
            </Tactile>
          </View>
        </View>
        <View style={{ gap: 12 }}>
          <Text variant="label">Kategori</Text>
          <View style={styles.wrap}>
            {['Taşıma', 'Montaj', 'Tamir', 'Temizlik', 'Diğer'].map((k) => (
              <Chip key={k} size="m" tone="outline" label={k} selected={cat === k} onPress={() => setCat(k)} />
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomBar>
        <Button label={t('common.continue')} icon="arrowRight" iconPosition="trailing" />
      </BottomBar>
    </Shell>
  );
}

/* ── 3 · Create task · budget ───────────────────────────────────────────── */

export function CreateBudget() {
  const theme = useTheme();
  const g = theme.layout.gutter;
  const [v, setV] = useState(650);
  return (
    <Shell>
      <FlowHeader step={4} total={4} />
      <View style={{ paddingHorizontal: g, paddingTop: theme.layout.headlineTop, gap: 8 }}>
        <Text variant="micro" tone="tertiary">
          Adım 4 / 4 · Şimdi lazım
        </Text>
        <Text variant="display.xl">{'Ne kadar\nödersin?'}</Text>
        <View style={[styles.row, { marginTop: 6 }]}>
          <Chip icon="couch" label="Koltuk indirme" />
          <Chip icon="stairs" label="3. kat · asansörsüz" />
        </View>
      </View>
      <View style={[styles.flex, { paddingHorizontal: g, justifyContent: 'flex-end', paddingBottom: 8 }]}>
        <AmountEntry value={v} onChange={setV} recommended={650} />
      </View>
      <BottomBar>
        <Button label="İlanı yayınla" />
      </BottomBar>
    </Shell>
  );
}

/* ── 4 · Searching ──────────────────────────────────────────────────────── */

export function Searching() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  return (
    <Shell>
      <View style={styles.flex}>
        <MapCanvas
          mode="approx"
          overlay={(project) => {
            const p = project(MAP_DEST[0] - 16, MAP_DEST[1] - 16);
            return (
              <View style={[styles.abs, { left: p.left - 110, top: p.top - 110 }]} pointerEvents="none">
                <SearchPulse size={220} />
              </View>
            );
          }}
        />
        <View style={[styles.floatingTop, { top: insets.top + 8, paddingHorizontal: theme.layout.gutter }]}>
          <IconButton icon="arrowLeft" label={t('common.back')} variant="floating" />
          <View style={[styles.timerPill, { backgroundColor: c.surface.panel, borderRadius: theme.radii.pill }, theme.elevation.floating]}>
            <LiveDot size={8} />
            <Text variant="label" style={{ fontVariant: ['tabular-nums'] }}>
              01:24
            </Text>
          </View>
        </View>
      </View>
      <MapPanel>
        <View style={{ gap: 6 }}>
          <Text variant="display.l">{'Sana uygun birini\narıyoruz.'}</Text>
          <Text variant="body" tone="secondary">
            Yakındaki 6 görevliye bildirim gitti. Genellikle 5 dakikadan kısa sürer.
          </Text>
        </View>
        <View style={[styles.row, { marginTop: theme.space[5], gap: 12 }]}>
          <View style={styles.stack}>
            {['MK', 'AY', 'EB', 'SÖ'].map((i, k) => (
              <View key={i} style={{ marginLeft: k ? -10 : 0 }}>
                <Avatar initials={i} size={36} ring />
              </View>
            ))}
          </View>
          <Text variant="meta" tone="tertiary">
            +2 görevli teklifini gördü
          </Text>
        </View>
        <View style={{ marginTop: theme.space[5] }}>
          <LifecycleStrip step="searching" />
        </View>
        <View style={[styles.summary, { backgroundColor: c.surface.field, borderRadius: theme.radii.field, marginTop: theme.space[5] }]}>
          <Icon name="couch" size="m" />
          <Text variant="label" numberOfLines={1} style={styles.flex}>
            {offer.title}
          </Text>
          <Text variant="label">{formatTL(offer.price)}</Text>
        </View>
        <View style={{ marginTop: 6 }}>
          <Button level="ghost" layout="fit" align="center" label="İlanı iptal et" />
        </View>
      </MapPanel>
    </Shell>
  );
}

/* ── 5 · Live task (customer) ───────────────────────────────────────────── */

export function LiveTask() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useLoop(9000);
  const [revealed, setRevealed] = useState(true);
  return (
    <Shell>
      <View style={styles.flex}>
        <MapCanvas mode="route" progress={progress} />
        <View style={[styles.floatingTop, { top: insets.top + 8, paddingHorizontal: theme.layout.gutter }]}>
          <IconButton icon="arrowLeft" label={t('common.back')} variant="floating" />
          <SafetyHandle floating onPress={() => undefined} />
        </View>
      </View>
      <MapPanel>
        <View style={{ gap: 4 }}>
          <Text variant="display.l">Mehmet yolda.</Text>
          <Text variant="body" tone="secondary">
            Tahmini varış 14:32 · 2,1 km
          </Text>
        </View>
        <View style={[styles.person, { marginTop: theme.space[5] }]}>
          <Avatar initials={tasker.initials} size={56} verified />
          <View style={styles.flex}>
            <Text variant="title">{tasker.name}</Text>
            <View style={styles.row}>
              <Icon name="star" size={13} weight="fill" />
              <Text variant="meta" tone="secondary">{`${tasker.rating} · ${tasker.tasks} iş tamamladı`}</Text>
            </View>
          </View>
          <IconButton icon="chat" label={t('common.message')} />
          <IconButton icon="phone" label={t('common.call')} />
        </View>
        <View style={{ marginTop: theme.space[5] }}>
          <LifecycleStrip step="en_route" />
        </View>
        <View style={[styles.pinWell, { backgroundColor: theme.color.surface.field, borderRadius: theme.radii.panel, marginTop: theme.space[5] }]}>
          <PinDisplay pin="482716" revealed={revealed} onToggle={() => setRevealed(!revealed)} />
        </View>
      </MapPanel>
    </Shell>
  );
}

/* ── 6 · Tasker · incoming offer ────────────────────────────────────────── */

export function TaskerOffer() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  return (
    <Shell>
      <View style={styles.flex}>
        <MapCanvas mode="approx" />
        <View style={[styles.floatingTop, { top: insets.top + 8, paddingHorizontal: theme.layout.gutter }]}>
          <View style={[styles.onlinePill, { backgroundColor: c.surface.inverse, borderRadius: theme.radii.pill }, theme.elevation.floating]}>
            <View style={[styles.onlineDot, { backgroundColor: c.status.success, borderColor: c.surface.inverse }]} />
            <Text variant="label" tone="onInverse">
              Çevrimiçi
            </Text>
            <Text variant="meta" tone="onInverseTertiary">
              · Bugün 2 iş · 1.150 TL
            </Text>
          </View>
          <IconButton icon="locate" label="Konumum" variant="floating" />
        </View>
      </View>
      <View style={[styles.offer, theme.elevation.sheet, { backgroundColor: c.surface.inverse, borderTopLeftRadius: theme.radii.sheet, borderTopRightRadius: theme.radii.sheet, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handleZone}>
          <View style={[styles.handle, { backgroundColor: c.surface.hairlineOnInverse }]} />
        </View>
        <IncomingOfferContent running offer={offer} seconds={45} onAccept={() => undefined} onPass={() => undefined} onExpire={() => undefined} />
      </View>
    </Shell>
  );
}

/* ── 7 · Tasker · PIN at the door ───────────────────────────────────────── */

export function TaskerPin() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [pin, setPin] = useState('4827');
  return (
    <Shell>
      <View style={[styles.rowBetween, { paddingTop: insets.top + 6, paddingHorizontal: g }]}>
        <IconButton icon="arrowLeft" label={t('common.back')} />
        <SafetyHandle onPress={() => undefined} />
      </View>
      <View style={{ paddingHorizontal: g, paddingTop: theme.layout.headlineTop, gap: 8 }}>
        <View style={styles.row}>
          <View style={[styles.arrivedDot, { backgroundColor: c.status.success }]} />
          <Text variant="micro" tone="success">
            Kapıdasın · 14:31
          </Text>
        </View>
        <Text variant="display.xl">Kodu gir.</Text>
        <Text variant="body" tone="secondary">
          Ayşe’den 6 haneli güvenlik kodunu iste. Kod doğrulanınca iş başlar.
        </Text>
      </View>
      <View style={[styles.flex, { paddingHorizontal: g, justifyContent: 'flex-end' }]}>
        <PinEntry value={pin} onChange={setPin} />
      </View>
      <BottomBar>
        <Button level="ghost" layout="fit" align="center" icon="clock" label="Müşteri gelmedi mi? · 06:12" />
      </BottomBar>
    </Shell>
  );
}

/* ── 8 · Completed + review ─────────────────────────────────────────────── */

export function Completed() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const g = theme.layout.gutter;
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>(['Dakik', 'Özenli']);
  const toggle = (k: string) => setTags((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k]));
  return (
    <Shell grouped>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingHorizontal: g, paddingBottom: 24, gap: theme.space[4] }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 10, paddingHorizontal: 4, marginBottom: theme.space[2] }}>
          <RouteMark mode="play" width={116} />
          <Text variant="display.xl" style={{ marginTop: theme.space[2] }}>
            Hallettin.
          </Text>
          <Text variant="body.l" tone="secondary">
            Koltuk 14:58’de teslim edildi. Ödemeyi Mehmet’e doğrudan yapabilirsin.
          </Text>
        </View>

        <Panel>
          <View style={styles.person}>
            <Avatar initials={tasker.initials} size={44} verified />
            <View style={styles.flex}>
              <Text variant="label">{tasker.name}</Text>
              <Text variant="meta" tone="tertiary">
                Nasıl geçti?
              </Text>
            </View>
          </View>
          <View style={{ marginTop: theme.space[4], alignItems: 'center' }}>
            <RatingStars value={stars} onChange={setStars} />
          </View>
          <View style={[styles.wrap, { marginTop: theme.space[4], justifyContent: 'center' }]}>
            {['Dakik', 'Özenli', 'Güler yüzlü', 'Hızlı'].map((k) => (
              <Chip key={k} size="m" tone="outline" label={k} selected={tags.includes(k)} onPress={() => toggle(k)} />
            ))}
          </View>
        </Panel>

        <Panel>
          <View style={[styles.rowBetween, { marginBottom: theme.space[3] }]}>
            <Text variant="label">Kanıt</Text>
            <Text variant="meta" tone="tertiary">
              3 fotoğraf
            </Text>
          </View>
          <ProofGrid
            max={3}
            items={[
              { id: '1', kind: 'before', state: 'done', subject: 'couch' },
              { id: '2', kind: 'after', state: 'done', subject: 'door' },
              { id: '3', kind: 'after', state: 'done', subject: 'package' },
            ]}
          />
        </Panel>

        <Panel>
          <View style={styles.rowBetween}>
            <View style={{ gap: 2 }}>
              <Text variant="micro" tone="tertiary">
                {t('price.agreed')}
              </Text>
              <Text variant="display.m">{formatTL(650)}</Text>
            </View>
            <Chip tone="neutral" icon="lock" label="Uygulama dışı ödeme" />
          </View>
        </Panel>
      </ScrollView>
      <BottomBar>
        <Button label="Değerlendirmeyi gönder" />
      </BottomBar>
    </Shell>
  );
}

export const labScreens = [
  { key: 'home', title: 'Müşteri · Ana sayfa', Component: CustomerHome },
  { key: 'what', title: 'İlan · Ne yapılacak?', Component: CreateWhat },
  { key: 'budget', title: 'İlan · Bütçe', Component: CreateBudget },
  { key: 'searching', title: 'Aranıyor', Component: Searching },
  { key: 'live', title: 'Canlı takip · PIN', Component: LiveTask },
  { key: 'offer', title: 'Görevli · Yeni iş', Component: TaskerOffer },
  { key: 'pin', title: 'Görevli · Kapıda', Component: TaskerPin },
  { key: 'done', title: 'Tamamlandı', Component: Completed },
] as const;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  abs: { position: 'absolute' },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 60, paddingLeft: 18, paddingRight: 8 },
  composerGo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  nowCard: { padding: 20 },
  nowIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  nowGo: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  plannedCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  plannedIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  quick: { width: 120, height: 104, borderWidth: 1, padding: 14, justifyContent: 'space-between' },
  flowHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 8 },
  thumb: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  thumbAdd: { borderWidth: 1.5, borderStyle: 'dashed' },
  mapPanel: { marginTop: -28 },
  handleZone: { alignItems: 'center', paddingTop: 8, paddingBottom: 10 },
  handle: { width: 36, height: 5, borderRadius: 2.5 },
  floatingTop: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 14 },
  stack: { flexDirection: 'row' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pinWell: { padding: 16 },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  offer: { marginTop: -28 },
  arrivedDot: { width: 8, height: 8, borderRadius: 4 },
});
