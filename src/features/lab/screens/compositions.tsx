/**
 * Full-screen compositions for visual approval — "Sokak Tabelası × Tek Dokunuş".
 *
 * STATIC MOCKS assembled only from product primitives and fixtures: no
 * navigation, data or business logic. They exist so the art direction can be
 * judged at real size before any product screen is built.
 *
 * Direction: poster typography and mega numerals for status; immersive night
 * scheme for live moments; full-bleed brand floods for the two big events
 * (accepted, done); photo + voice task creation; tram-line progress; the PIN
 * as a ticket.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatClock, formatTL, groupPin, t, trUpper } from '@/i18n';
import { SchemeProvider, useMotion, useTheme } from '@/theme';
import {
  Avatar,
  Button,
  Chip,
  FlipText,
  Icon,
  IconButton,
  Illustration,
  LifecycleStrip,
  LiveDot,
  MapCanvas,
  MAP_DEST,
  PinEntry,
  PriceDial,
  RatingStars,
  RouteMark,
  SafetyHandle,
  SearchPulse,
  SwipeToAccept,
  TabBar,
  Tactile,
  Text,
  Ticket,
  Viewfinder,
  VoiceButton,
  Waveform,
  type IconName,
  type IllustrationName,
} from '@/ui';
import { riseIn } from '@/ui/motion';

import { customer, offer, tasker } from '../fixtures';

/* ── scaffolding ────────────────────────────────────────────────────────── */

type Surface = 'base' | 'grouped' | 'brand';

function Shell({ children, surface = 'base' }: { children: ReactNode; surface?: Surface }) {
  const theme = useTheme();
  const c = theme.color;
  const bg = surface === 'brand' ? c.brand.fill : surface === 'grouped' ? c.surface.grouped : c.surface.base;
  return <View style={[styles.flex, { backgroundColor: bg }]}>{children}</View>;
}

function Night({ children }: { children: ReactNode }) {
  return <SchemeProvider scheme="night">{children}</SchemeProvider>;
}

function BottomBar({ children, bare }: { children: ReactNode; bare?: boolean }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingHorizontal: theme.layout.gutter,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 16),
        gap: 6,
        backgroundColor: bare ? 'transparent' : theme.color.surface.base,
        borderTopWidth: bare ? 0 : StyleSheet.hairlineWidth * 2,
        borderTopColor: theme.color.surface.hairline,
      }}
    >
      {children}
    </View>
  );
}

function TopRow({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.rowBetween, { paddingTop: insets.top + 6, paddingHorizontal: theme.layout.gutter }]}>
      {left ?? <View />}
      {right ?? <View />}
    </View>
  );
}

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

function FloatingTop({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return <View style={[styles.floatingTop, { top: insets.top + 8, paddingHorizontal: theme.layout.gutter }]}>{children}</View>;
}

/** Ticks once a second (scaled by the Lab speed). */
function useSeconds(start = 0) {
  const motion = useMotion();
  const [s, setS] = useState(start);
  useEffect(() => {
    const id = setInterval(() => setS((x) => x + 1), motion.ms(1000));
    return () => clearInterval(id);
  }, [motion]);
  return s;
}

function useLoop(ms: number) {
  const motion = useMotion();
  const p = useSharedValue(0.2);
  useEffect(() => {
    if (motion.reduced) return p.set(0.55);
    p.set(withRepeat(withTiming(0.85, { duration: motion.ms(ms), easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [motion, ms, p]);
  return p;
}

/* ── 1 · Home ───────────────────────────────────────────────────────────── */

const categories: { art: IllustrationName; label: string; from: string }[] = [
  { art: 'couch', label: 'Eşya taşıma', from: 'ort. 450 TL' },
  { art: 'assembly', label: 'Montaj', from: 'ort. 350 TL' },
  { art: 'repair', label: 'Küçük tamir', from: 'ort. 300 TL' },
  { art: 'delivery', label: 'Al-götür', from: 'ort. 200 TL' },
];

export function CustomerHome() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const eta = 7 - (Math.floor(useSeconds() / 5) % 3);
  return (
    <Shell>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.rowBetween, { paddingHorizontal: g }]}>
          <Tactile haptic="select" style={[styles.pill, { backgroundColor: c.surface.field, borderRadius: theme.radii.pill }]}>
            <Icon name="mapPin" size="s" weight="fill" />
            <Text variant="label">Hoşnudiye</Text>
            <Icon name="caretDown" size={13} color={c.ink.tertiary} weight="bold" />
          </Tactile>
          <View style={styles.row}>
            <IconButton icon="bell" label="Bildirimler" badge />
            <Avatar initials={customer.initials} size={44} />
          </View>
        </View>

        <View style={{ paddingHorizontal: g, marginTop: 28 }}>
          <Text variant="micro" tone="tertiary">{`Günaydın, ${customer.name}`}</Text>
          <Text variant="display.poster" style={{ marginTop: 6 }}>
            {trUpper('Bugün\nne lazım?')}
          </Text>
        </View>

        {/* The one-gesture composer: photo + voice, in night colours. */}
        <View style={{ paddingHorizontal: g, marginTop: 22 }}>
          <Night>
            <Composer />
          </Night>
        </View>

        <View style={[styles.row, { paddingHorizontal: g, marginTop: 16 }]}>
          <LiveDot size={8} />
          <Text variant="meta" tone="secondary">
            Şu an 12 görevli çevrimiçi · ortalama kabul 4 dk
          </Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <View style={[styles.rowBetween, { paddingHorizontal: g, marginBottom: 12 }]}>
            <Text variant="title">Ne yaptırmak istersin?</Text>
            <Text variant="label" tone="tertiary">
              Tümü
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: g, gap: 12 }}>
            {categories.map((k) => (
              <Tactile key={k.label} pressScale={0.97} style={[styles.category, { backgroundColor: c.surface.field, borderRadius: theme.radii.panel }]}>
                <View style={styles.categoryArt}>
                  <Illustration name={k.art} size={76} />
                </View>
                <Text variant="label">{k.label}</Text>
                <Text variant="meta" tone="tertiary">
                  {k.from}
                </Text>
              </Tactile>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <TabBar role="customer" active="home" onSelect={() => undefined} live={{ title: `Mehmet yolda · ${eta} dk`, sub: 'Koltuk indirme · Hoşnudiye', initials: tasker.initials }} bottomInset={insets.bottom} />
    </Shell>
  );
}

function Composer() {
  const theme = useTheme();
  const c = theme.color;
  const [listening, setListening] = useState(false);
  return (
    <View style={[styles.composer, { backgroundColor: c.surface.base, borderRadius: 28 }]}>
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Icon name="sparkle" size="s" color={c.brand.text} weight="fill" />
          <Text variant="micro" tone="brand">
            Tek dokunuş
          </Text>
        </View>
        <IconButton icon="camera" label="Fotoğraf çek" size={40} />
      </View>
      <Text variant="display.l" style={{ marginTop: 14 }}>
        {'Fotoğrafla.\nAnlat. Hallet.'}
      </Text>
      <View style={[styles.rowBetween, { marginTop: 4 }]}>
        <Text variant="body" tone="secondary" style={styles.flex}>
          Basılı tut, işi anlat. İlanı biz yazalım.
        </Text>
        <View style={{ marginRight: -36, marginBottom: -40, marginTop: -30 }}>
          <VoiceButton size={64} listening={listening} onStart={() => setListening(true)} onStop={() => setListening(false)} />
        </View>
      </View>
    </View>
  );
}

/* ── 2 · Voice capture (night) ──────────────────────────────────────────── */

export function VoiceCapture() {
  return (
    <Night>
      <VoiceCaptureInner />
    </Night>
  );
}

const transcript = '3. kattaki iki kişilik koltuğu aşağı indirip apartman kapısına bırakacak biri lazım. Asansör yok.';

function VoiceCaptureInner() {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const s = useSeconds();
  const words = transcript.split(' ');
  const shown = Math.min(words.length, 6 + (s % (words.length + 4)));
  return (
    <Shell>
      <TopRow
        left={<IconButton icon="x" label={t('common.close')} />}
        right={
          <View style={[styles.pill, { backgroundColor: c.surface.field, borderRadius: theme.radii.pill }]}>
            <LiveDot size={8} />
            <Text variant="label">{`Dinliyorum · ${formatClock(s)}`}</Text>
          </View>
        }
      />
      <View style={{ paddingHorizontal: g, marginTop: 18 }}>
        <View style={[styles.photo, { backgroundColor: c.surface.panel, borderRadius: 24 }]}>
          <Viewfinder height={190} color={c.brand.dot}>
            <Illustration name="couch" size={110} />
          </Viewfinder>
          <View style={[styles.photoTag, { backgroundColor: c.surface.base, borderRadius: theme.radii.pill }]}>
            <Icon name="check" size={12} color={c.status.success} weight="bold" />
            <Text variant="meta" emphasis>
              1 fotoğraf
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.flex, { paddingHorizontal: g, paddingTop: 22 }]}>
        <Text variant="display.m">
          {words.slice(0, shown).join(' ')}
          <Text variant="display.m" tone="tertiary">
            {shown < words.length ? ` ${words.slice(shown, shown + 3).join(' ')}…` : ''}
          </Text>
        </Text>
      </View>
      <View style={[styles.center, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Waveform active={!motion.reduced} color={c.brand.dot} height={44} />
        <View style={{ marginTop: -28, marginBottom: -28 }}>
          <VoiceButton listening size={78} />
        </View>
        <Text variant="meta" tone="tertiary">
          Bırakınca ilanını hazırlarız
        </Text>
      </View>
    </Shell>
  );
}

/* ── 3 · Draft ready ────────────────────────────────────────────────────── */

export function DraftReady() {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const g = theme.layout.gutter;
  const rows: { icon: IconName; label: string; value: string }[] = [
    { icon: 'mapPin', label: 'Nerede', value: 'Hoşnudiye, Tepebaşı · 3. kat' },
    { icon: 'lightning', label: 'Ne zaman', value: 'Şimdi lazım' },
    { icon: 'people', label: 'Kaç kişi', value: '1 kişi yeterli' },
  ];
  return (
    <Shell surface="grouped">
      <TopRow left={<IconButton icon="arrowLeft" label={t('common.back')} variant="floating" />} right={<Text variant="label" tone="tertiary">Taslak</Text>} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: g, paddingTop: 18, paddingBottom: 24, gap: 18 }} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <Icon name="sparkle" size="s" color={c.brand.text} weight="fill" />
          <Text variant="micro" tone="tertiary">
            Senin için hazırladık · kontrol et
          </Text>
        </View>
        <View style={styles.rowBetween}>
          <Text variant="display.poster" style={styles.flex}>
            {trUpper('Koltuk\nindirme')}
          </Text>
          <Animated.View entering={riseIn(motion, 120, 20)} style={[styles.polaroid, theme.elevation.floating, { backgroundColor: c.surface.panel }]}>
            <View style={[styles.polaroidImg, { backgroundColor: c.surface.field }]}>
              <Illustration name="couch" size={60} />
            </View>
            <Text variant="tab" tone="tertiary" align="center" style={{ marginTop: 6 }}>
              14:02 · 1 foto
            </Text>
          </Animated.View>
        </View>
        <View style={[styles.quote, { backgroundColor: c.surface.panel, borderRadius: theme.radii.panel }]}>
          <Text variant="body.l">“3. kattaki iki kişilik koltuğu aşağı indirip apartman kapısına bırakacak biri lazım. Asansör yok.”</Text>
          <View style={[styles.row, { marginTop: 12 }]}>
            <Icon name="mic" size={14} color={c.ink.tertiary} weight="fill" />
            <Text variant="meta" tone="tertiary">
              Sesli anlatım · 0:18
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: c.surface.panel, borderRadius: theme.radii.panel, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <Tactile key={r.label} pressScale={1} pressDim={0.35} haptic="select" style={styles.listRow}>
              <View style={[styles.well, { backgroundColor: c.surface.field }]}>
                <Icon name={r.icon} size="m" />
              </View>
              <View style={[styles.listBody, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.surface.hairline }]}>
                <View style={styles.flex}>
                  <Text variant="meta" tone="tertiary">
                    {r.label}
                  </Text>
                  <Text variant="label">{r.value}</Text>
                </View>
                <Icon name="caretRight" size="s" color={c.ink.tertiary} weight="bold" />
              </View>
            </Tactile>
          ))}
        </View>
        <View style={styles.wrap}>
          <Chip size="m" icon="handTruck" label="El arabası" selected />
          <Chip size="m" icon="stairs" label="Asansörsüz" selected />
          <Chip size="m" icon="plus" tone="outline" label="Ekle" onPress={() => undefined} />
        </View>
      </ScrollView>
      <BottomBar>
        <Button label="Fiyatı belirle" icon="arrowRight" iconPosition="trailing" />
      </BottomBar>
    </Shell>
  );
}

/* ── 4 · Price dial ─────────────────────────────────────────────────────── */

export function PriceScreen() {
  const theme = useTheme();
  const g = theme.layout.gutter;
  const [v, setV] = useState(650);
  return (
    <Shell>
      <TopRow left={<IconButton icon="arrowLeft" label={t('common.back')} />} right={<Text variant="label" tone="tertiary">Son adım</Text>} />
      <View style={{ paddingHorizontal: g, paddingTop: 24 }}>
        <Text variant="micro" tone="tertiary">
          Koltuk indirme · Şimdi lazım
        </Text>
        <Text variant="display.xl" style={{ marginTop: 8 }}>
          {'Ne kadar\nödersin?'}
        </Text>
      </View>
      <View style={[styles.flex, { justifyContent: 'center', paddingHorizontal: g }]}>
        <PriceDial value={v} onChange={setV} recommended={650} />
      </View>
      <View style={[styles.row, { paddingHorizontal: g, paddingBottom: 12, justifyContent: 'center' }]}>
        <Icon name="lock" size={13} color={theme.color.ink.tertiary} weight="bold" />
        <Text variant="meta" tone="tertiary">
          Ödeme işten sonra, görevliye doğrudan yapılır
        </Text>
      </View>
      <BottomBar>
        <Button label={`İlanı yayınla · ${formatTL(v)}`} />
      </BottomBar>
    </Shell>
  );
}

/* ── 5 · Searching (night) ──────────────────────────────────────────────── */

export function Searching() {
  return (
    <Night>
      <SearchingInner />
    </Night>
  );
}

function SearchingInner() {
  const theme = useTheme();
  const c = theme.color;
  const s = useSeconds(84);
  return (
    <Shell>
      <View style={styles.flex}>
        <MapCanvas
          mode="approx"
          overlay={(project) => {
            const p = project(MAP_DEST[0] - 16, MAP_DEST[1] - 16);
            return (
              <View style={[styles.abs, { left: p.left - 130, top: p.top - 130 }]} pointerEvents="none">
                <SearchPulse size={260} />
              </View>
            );
          }}
        />
        <FloatingTop>
          <IconButton icon="arrowLeft" label={t('common.back')} variant="floating" />
          <View style={[styles.pill, { backgroundColor: c.surface.panel, borderRadius: theme.radii.pill }]}>
            <LiveDot size={8} />
            <FlipText text={formatClock(s)} variant="label" upper={false} />
          </View>
        </FloatingTop>
      </View>
      <MapPanel>
        <Text variant="micro" tone="brand">
          Canlı
        </Text>
        <Text variant="display.poster" style={{ marginTop: 6 }}>
          {trUpper('Aranıyor.')}
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: 6 }}>
          Yakındaki 6 görevliye ulaştık. Genellikle 5 dakikadan kısa sürer.
        </Text>
        <View style={[styles.row, { marginTop: 16, gap: 12 }]}>
          <View style={styles.row}>
            {['MK', 'AY', 'EB', 'SÖ', 'TK'].map((i, k) => (
              <View key={i} style={{ marginLeft: k ? -18 : 0 }}>
                <Avatar initials={i} size={36} ring />
              </View>
            ))}
          </View>
          <Text variant="meta" tone="tertiary">
            teklifini görüyor
          </Text>
        </View>
        <View style={{ marginTop: 22 }}>
          <LifecycleStrip step="searching" />
        </View>
        <View style={{ marginTop: 10 }}>
          <Button level="ghost" layout="fit" align="center" label="İlanı iptal et" />
        </View>
      </MapPanel>
    </Shell>
  );
}

/* ── 6 · Accepted (brand flood) ─────────────────────────────────────────── */

export function Accepted() {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const g = theme.layout.gutter;
  return (
    <Shell surface="brand">
      <View style={[styles.flex, { paddingTop: insets.top + 24, paddingHorizontal: g }]}>
        <View style={styles.rowBetween}>
          <Text variant="micro" tone="onFill">
            Kabul edildi · 14:24
          </Text>
          <Icon name="checkCircle" size="l" color={theme.color.brand.onFill} weight="fill" />
        </View>
        <Animated.View entering={riseIn(motion, 80, 30)} style={{ marginTop: 40 }}>
          <Text variant="display.poster" tone="onFill">
            {trUpper('Mehmet\ngeliyor.')}
          </Text>
        </Animated.View>
        <Animated.View entering={riseIn(motion, 240, 30)} style={[styles.rowBottom, { marginTop: 18 }]}>
          <Text variant="numeric.mega" tone="onFill">
            7
          </Text>
          <Text variant="display.l" tone="onFill" style={{ marginBottom: 14, marginLeft: 8 }}>
            {trUpper('dk')}
          </Text>
        </Animated.View>
        <Text variant="body.l" tone="onFill" style={{ marginTop: 4 }}>
          Tahmini varış 14:32. Kapıya gelince sana bir güvenlik kodu soracak.
        </Text>
        <View style={styles.flex} />
        <Night>
          <AcceptedCard />
        </Night>
      </View>
      <View style={{ paddingHorizontal: g, paddingTop: 14, paddingBottom: Math.max(insets.bottom, 16) }}>
        <Night>
          <Button level="secondary" label="Canlı takibe geç" icon="arrowRight" iconPosition="trailing" />
        </Night>
      </View>
    </Shell>
  );
}

function AcceptedCard() {
  const theme = useTheme();
  const c = theme.color;
  return (
    <View style={[styles.personCard, { backgroundColor: c.surface.base, borderRadius: theme.radii.panel }]}>
      <Avatar initials={tasker.initials} size={56} verified />
      <View style={styles.flex}>
        <Text variant="title">{tasker.name}</Text>
        <View style={styles.row}>
          <Icon name="star" size={13} color={c.brand.dot} weight="fill" />
          <Text variant="meta" tone="secondary">{`${tasker.rating} · ${tasker.tasks} iş · Kimlik kontrollü`}</Text>
        </View>
      </View>
      <IconButton icon="phone" label={t('common.call')} />
    </View>
  );
}

/* ── 7 · Live tracking (night) ──────────────────────────────────────────── */

export function LiveTask() {
  return (
    <Night>
      <LiveTaskInner />
    </Night>
  );
}

function LiveTaskInner() {
  const theme = useTheme();
  const c = theme.color;
  const progress = useLoop(9000);
  const eta = 7 - (Math.floor(useSeconds() / 4) % 4);
  const [a, b] = groupPin('482716');
  return (
    <Shell>
      <View style={styles.flex}>
        <MapCanvas mode="route" progress={progress} />
        <FloatingTop>
          <IconButton icon="arrowLeft" label={t('common.back')} variant="floating" />
          <SafetyHandle floating onPress={() => undefined} />
        </FloatingTop>
      </View>
      <MapPanel>
        <View style={styles.rowBetween}>
          <View>
            <Text variant="micro" tone="brand">
              Yolda
            </Text>
            <View style={styles.rowBottom}>
              <FlipText text={String(eta)} variant="numeric.mega" upper={false} />
              <Text variant="display.m" style={{ marginBottom: 12, marginLeft: 6 }}>
                {trUpper('dk')}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Avatar initials={tasker.initials} size={56} verified />
            <Text variant="label">{tasker.name}</Text>
          </View>
        </View>
        <View style={{ marginTop: 6 }}>
          <LifecycleStrip step="en_route" />
        </View>
        <View style={{ marginTop: 18 }}>
          <Ticket
            cutout={c.surface.panel}
            top={
              <View style={styles.rowBetween}>
                <View>
                  <Text variant="micro" tone="tertiary">
                    {t('pin.label')}
                  </Text>
                  <Text variant="numeric.hero" style={{ letterSpacing: 2 }}>{`${a} ${b}`}</Text>
                </View>
                <Icon name="ticket" size="xl" color={c.brand.dot} weight="fill" />
              </View>
            }
            bottom={
              <View style={styles.rowBetween}>
                <Text variant="meta" tone="tertiary">
                  Yalnızca kapıda, yüz yüze söyle
                </Text>
                <View style={styles.row}>
                  <IconButton icon="chat" label={t('common.message')} size={38} />
                  <IconButton icon="phone" label={t('common.call')} size={38} />
                </View>
              </View>
            }
          />
        </View>
      </MapPanel>
    </Shell>
  );
}

/* ── 8 · Tasker offer (night) ───────────────────────────────────────────── */

export function TaskerOffer() {
  return (
    <Night>
      <TaskerOfferInner />
    </Night>
  );
}

function TaskerOfferInner() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const s = useSeconds();
  const left = Math.max(0, 45 - (s % 46));
  return (
    <Shell>
      <View style={styles.flex}>
        <MapCanvas mode="approx" />
        <FloatingTop>
          <View style={[styles.pill, { backgroundColor: c.surface.panel, borderRadius: theme.radii.pill }]}>
            <View style={[styles.onlineDot, { backgroundColor: c.status.success }]} />
            <Text variant="label">Çevrimiçi</Text>
            <Text variant="meta" tone="tertiary">
              · bugün 1.150 TL
            </Text>
          </View>
          <IconButton icon="locate" label="Konumum" variant="floating" />
        </FloatingTop>
      </View>
      <View style={[styles.offer, theme.elevation.sheet, { backgroundColor: c.surface.panel, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={[styles.countdown, { backgroundColor: c.surface.fieldStrong }]}>
          <View style={{ width: `${(left / 45) * 100}%`, height: '100%', backgroundColor: left <= 10 ? c.status.attention : c.brand.dot }} />
        </View>
        <View style={{ paddingHorizontal: g, paddingTop: 18, gap: 14 }}>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <LiveDot size={8} />
              <Text variant="micro" tone="brand">
                {t('incoming.kicker')}
              </Text>
            </View>
            <FlipText text={`${left} sn`} variant="label" upper={false} />
          </View>
          <View style={styles.rowBottom}>
            <Text variant="numeric.mega">650</Text>
            <Text variant="display.m" tone="tertiary" style={{ marginBottom: 12, marginLeft: 6 }}>
              TL
            </Text>
          </View>
          <Text variant="title">{offer.title}</Text>
          <View style={styles.wrap}>
            <Chip icon="mapPin" label="Hoşnudiye · 2,1 km" />
            <Chip icon="timer" label="1–2 saat" />
            <Chip icon="stairs" label="3. kat" />
            <Chip icon="shield" tone="success" label="Doğrulanmış müşteri" />
          </View>
          <View style={[styles.row, { marginTop: 2 }]}>
            <Icon name="lock" size={13} color={c.ink.tertiary} weight="bold" />
            <Text variant="meta" tone="tertiary">
              {t('location.approxLock')}
            </Text>
          </View>
          <SwipeToAccept label="Kaydır, kabul et" onAccept={() => undefined} />
          <Button level="ghost" layout="fit" align="center" label="Geç" />
        </View>
      </View>
    </Shell>
  );
}

/* ── 9 · Tasker PIN at the door (night) ─────────────────────────────────── */

export function TaskerPin() {
  return (
    <Night>
      <TaskerPinInner />
    </Night>
  );
}

function TaskerPinInner() {
  const theme = useTheme();
  const g = theme.layout.gutter;
  const [pin, setPin] = useState('4827');
  const s = useSeconds(372);
  return (
    <Shell>
      <TopRow left={<IconButton icon="arrowLeft" label={t('common.back')} />} right={<SafetyHandle onPress={() => undefined} />} />
      <View style={{ paddingHorizontal: g, paddingTop: 24 }}>
        <Text variant="micro" tone="success">
          Konum doğrulandı · Ahmet Kanatlı Cad. 24
        </Text>
        <Text variant="display.poster" style={{ marginTop: 8 }}>
          {trUpper('Kapıdasın.')}
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: 6 }}>
          Ayşe’den 6 haneli kodu iste. Kod doğrulanınca iş başlar.
        </Text>
      </View>
      <View style={[styles.flex, { paddingHorizontal: g, justifyContent: 'flex-end' }]}>
        <PinEntry value={pin} onChange={setPin} />
      </View>
      <BottomBar bare>
        <Button level="ghost" layout="fit" align="center" icon="clock" label={`Müşteri gelmedi mi? · ${formatClock(s)}`} />
      </BottomBar>
    </Shell>
  );
}

/* ── 10 · Done (brand flood + review) ───────────────────────────────────── */

export function Completed() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>(['Dakik', 'Özenli']);
  const toggle = (k: string) => setTags((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k]));
  return (
    <Shell surface="brand">
      <View style={{ paddingTop: insets.top + 22, paddingHorizontal: g, paddingBottom: 28 }}>
        <RouteMark mode="play" width={120} lineColor={c.brand.onFill} />
        <Text variant="display.poster" tone="onFill" style={{ marginTop: 18 }}>
          {trUpper('Hallettin.')}
        </Text>
        <Text variant="body.l" tone="onFill" style={{ marginTop: 6 }}>
          Koltuk 14:58’de teslim edildi. 34 dakika sürdü.
        </Text>
      </View>
      <View style={[styles.flex, styles.sheetTop, { backgroundColor: c.surface.base, borderTopLeftRadius: theme.radii.sheet, borderTopRightRadius: theme.radii.sheet }]}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: g, paddingTop: 24, paddingBottom: 16, gap: 18 }} showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            <Avatar initials={tasker.initials} size={44} verified />
            <View style={styles.flex}>
              <Text variant="label">{`${tasker.name} nasıldı?`}</Text>
              <Text variant="meta" tone="tertiary">
                Değerlendirmen bir sonraki eşleşmeyi iyileştirir
              </Text>
            </View>
          </View>
          <View style={styles.center}>
            <RatingStars value={stars} onChange={setStars} size={40} />
          </View>
          <View style={[styles.wrap, { justifyContent: 'center' }]}>
            {['Dakik', 'Özenli', 'Güler yüzlü', 'Hızlı'].map((k) => (
              <Chip key={k} size="m" tone="outline" label={k} selected={tags.includes(k)} onPress={() => toggle(k)} />
            ))}
          </View>
          <View style={[styles.payRow, { backgroundColor: c.surface.field, borderRadius: theme.radii.field }]}>
            <View style={styles.flex}>
              <Text variant="meta" tone="tertiary">
                {t('price.agreed')}
              </Text>
              <Text variant="title">{formatTL(650)}</Text>
            </View>
            <Chip icon="lock" label="Uygulama dışı ödeme" />
          </View>
        </ScrollView>
        <BottomBar>
          <Button label="Değerlendirmeyi gönder" />
        </BottomBar>
      </View>
    </Shell>
  );
}

export const labScreens = [
  { key: 'home', title: 'Müşteri · Ana sayfa', Component: CustomerHome },
  { key: 'voice', title: 'Sesle anlat', Component: VoiceCapture },
  { key: 'draft', title: 'İlan hazır', Component: DraftReady },
  { key: 'price', title: 'Fiyat kadranı', Component: PriceScreen },
  { key: 'searching', title: 'Aranıyor', Component: Searching },
  { key: 'accepted', title: 'Kabul anı', Component: Accepted },
  { key: 'live', title: 'Canlı takip · Bilet', Component: LiveTask },
  { key: 'offer', title: 'Görevli · Yeni iş', Component: TaskerOffer },
  { key: 'pin', title: 'Görevli · Kapıda', Component: TaskerPin },
  { key: 'done', title: 'Hallettin', Component: Completed },
] as const;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBottom: { flexDirection: 'row', alignItems: 'flex-end' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  abs: { position: 'absolute' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14 },
  composer: { padding: 20, overflow: 'hidden' },
  category: { width: 152, padding: 14, gap: 2 },
  categoryArt: { height: 92, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  photo: { padding: 16, overflow: 'hidden' },
  photoTag: { position: 'absolute', left: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingHorizontal: 10 },
  polaroid: { padding: 8, paddingBottom: 6, borderRadius: 6, transform: [{ rotate: '4deg' }] },
  polaroidImg: { width: 92, height: 92, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  quote: { padding: 18 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 16 },
  well: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingRight: 16 },
  mapPanel: { marginTop: -28 },
  handleZone: { alignItems: 'center', paddingTop: 8, paddingBottom: 10 },
  handle: { width: 36, height: 5, borderRadius: 2.5 },
  floatingTop: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  personCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  offer: { marginTop: -28, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  countdown: { height: 4 },
  onlineDot: { width: 9, height: 9, borderRadius: 4.5 },
  sheetTop: { overflow: 'hidden' },
  payRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
});
