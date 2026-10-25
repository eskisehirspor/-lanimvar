import { useEffect, useEffectEvent, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import type { ClayStage } from '@/brand/clay';
import { scheduleOnRN } from 'react-native-worklets';

import { formatTL, t } from '@/i18n';
import { useHaptics } from '@/lib/haptics';
import { SchemeProvider, useMotion, useTheme } from '@/theme';
import { Avatar, CircleReveal, ClayObject, easeReveal, Glow, Grain, Icon, LiveDot, Marquee, MaskReveal, Rise, RotatingBadge, Tactile, Text, Waveform, type ClayObjectName } from '@/ui';

import { story, useFrame } from './frame';

const categories: { id: string; label: string; object: ClayObjectName; stage: ClayStage; from: number }[] = [
  { id: 'move', label: 'Ağır eşya', object: 'couch', stage: 'sun', from: 450 },
  { id: 'boxes', label: 'Taşıma', object: 'boxes', stage: 'brick', from: 600 },
  { id: 'build', label: 'Montaj', object: 'drill', stage: 'sky', from: 350 },
  { id: 'shop', label: 'Alışveriş', object: 'bag', stage: 'leaf', from: 200 },
  { id: 'clean', label: 'Temizlik', object: 'spray', stage: 'cream', from: 500 },
];

const BADGE = 168;
const ORB = 104;

export function Home({ play, onDraft }: { play: boolean; onDraft: () => void }) {
  const theme = useTheme();
  const f = useFrame();
  const fire = useHaptics();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [zone, setZone] = useState({ y: 0, h: 0 });
  const [voice, setVoice] = useState<'off' | 'open' | 'closing'>('off');
  const orb = { x: f.w - g - BADGE / 2, y: zone.y + zone.h / 2 };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.grouped }]}>
      <View style={{ paddingTop: f.top + 14 }}>
        <View style={[styles.row, { paddingHorizontal: g }]}>
          <Tactile haptic="select" style={[styles.chip, { backgroundColor: c.surface.panel }]} accessibilityLabel={story.neighbourhood}>
            <LiveDot />
            <Text variant="label">{story.neighbourhood}</Text>
            <Icon name="caretDown" size={14} color={c.ink.secondary} weight="bold" />
          </Tactile>
          <View style={styles.row}>
            <Tactile haptic="select" style={[styles.round, { backgroundColor: c.surface.panel }]} accessibilityLabel="Bildirimler">
              <Icon name="bell" size={20} color={c.ink.primary} />
              <View style={[styles.badgeDot, { backgroundColor: c.safety.critical, borderColor: c.surface.panel }]} />
            </Tactile>
            <Avatar initials={story.customer.initials} size={44} />
          </View>
        </View>

        <View style={{ paddingHorizontal: g, marginTop: 30 }}>
          <Rise play={play} delay={40}>
            <Text variant="meta" tone="secondary">
              {t('proto.hello', { name: story.customer.name })}
            </Text>
          </Rise>
          <View style={{ marginTop: 6 }}>
            <MaskReveal play={play} delay={120}>
              <Text variant="display.hero">{t('proto.heroA')}</Text>
            </MaskReveal>
            <MaskReveal play={play} delay={220}>
              <Text variant="display.hero">
                <Text variant="display.hero" serif>
                  {t('proto.heroB')}
                </Text>{' '}
                {t('proto.heroC')}
              </Text>
            </MaskReveal>
          </View>
        </View>

        <Rise play={play} delay={420} style={[styles.ticker, { borderColor: c.surface.hairlineStrong }]}>
          <Marquee speed={32}>
            {[t('proto.ticker', { online: story.online }), t('proto.tickerB', { min: story.acceptMin }), t('proto.tickerC'), t('proto.tickerD')].map((line) => (
              <View key={line} style={styles.tick}>
                <Text variant="label">{line}</Text>
                <Icon name="sparkle" size={14} color={c.ink.tertiary} weight="fill" />
              </View>
            ))}
          </Marquee>
        </Rise>

        <View style={[styles.zone, { paddingHorizontal: g }]} onLayout={(e) => setZone({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}>
          <Rise play={play} delay={520} style={styles.flex}>
            <Text variant="display.m">{t('proto.hold')}</Text>
            <Text variant="body" tone="secondary" style={{ marginTop: 6, maxWidth: 170 }}>
              {t('proto.release')}
            </Text>
            <Tactile haptic="select" style={[styles.photo, { backgroundColor: c.surface.panel, borderColor: c.surface.hairline }]} accessibilityLabel={t('proto.holdHint')}>
              <Icon name="camera" size={18} color={c.ink.primary} />
              <Text variant="label" style={{ fontSize: 14 }}>
                {t('proto.photo')}
              </Text>
            </Tactile>
          </Rise>
          <Rise play={play} delay={600}>
            <TalkOrb onStart={() => setVoice('open')} />
          </Rise>
        </View>
      </View>

      <Rise play={play} delay={700} style={{ marginTop: 'auto', paddingBottom: f.bottom + 86 }}>
        <View style={[styles.row, { paddingHorizontal: g, marginBottom: 12 }]}>
          <Text variant="title">{t('proto.or')}</Text>
          <View style={styles.rowTight}>
            <Text variant="label" tone="secondary">
              {t('proto.all')}
            </Text>
            <Icon name="arrowRight" size={14} color={c.ink.secondary} weight="bold" />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: g, gap: 10 }}>
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} index={i} {...cat} onPress={() => fire('select')} />
          ))}
        </ScrollView>
      </Rise>

      <FloatingTabs />

      {zone.h && voice !== 'off' ? (
        <VoiceCapture
          open={voice === 'open'}
          origin={orb}
          onFinish={() => {
            setVoice('closing');
            onDraft();
          }}
          onClosed={() => setVoice('off')}
        />
      ) : null}
    </View>
  );
}

/** The hold-to-talk orb, wrapped in a turning sticker that says what it does. */
function TalkOrb({ onStart }: { onStart: () => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const c = theme.color;
  const b = useSharedValue(0);
  const press = useSharedValue(0);
  useEffect(() => {
    if (motion.reduced) return;
    b.set(withRepeat(withTiming(1, { duration: motion.ms(2400), easing: Easing.out(Easing.quad) }), -1, false));
  }, [motion, b]);
  const ring = useAnimatedStyle(() => ({ opacity: interpolate(b.value, [0, 1], [0.55, 0]), transform: [{ scale: interpolate(b.value, [0, 1], [1, 1.55]) }] }));
  const core = useAnimatedStyle(() => ({ transform: [{ scale: 1 - press.value * 0.08 }] }));
  return (
    <RotatingBadge text={`${t('proto.hold')} · ${t('proto.holdHint')} · `} size={BADGE} color={c.ink.primary} fontSize={11.6}>
      <Animated.View pointerEvents="none" style={[styles.orbRing, { width: ORB, height: ORB, borderRadius: ORB / 2, borderColor: c.brand.dotOutline }, ring]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('proto.hold')}
        onPressIn={() => {
          press.set(withTiming(1, motion.timing(120)));
          fire('incoming');
          onStart();
        }}
        onPressOut={() => press.set(withTiming(0, motion.timing(200)))}
      >
        <Animated.View style={[styles.orb, { width: ORB, height: ORB, borderRadius: ORB / 2, backgroundColor: c.brand.fill }, theme.elevation.floating, core]}>
          <Icon name="mic" size={34} color={c.brand.onFill} weight="fill" />
        </Animated.View>
      </Pressable>
    </RotatingBadge>
  );
}

function CategoryCard({ label, object, stage, from, index, onPress }: { id?: string; label: string; object: ClayObjectName; stage: ClayStage; from: number; index: number; onPress: () => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const bob = useSharedValue(0);
  useEffect(() => {
    if (motion.reduced) return;
    const ms = motion.ms(2200 + index * 260);
    bob.set(withRepeat(withSequence(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: ms, easing: Easing.inOut(Easing.sin) })), -1, false));
  }, [motion, index, bob]);
  const float = useAnimatedStyle(() => ({ transform: [{ translateY: -bob.value * 5 }, { rotate: `${(bob.value - 0.5) * 3}deg` }] }));
  return (
    <Tactile onPress={onPress} pressScale={0.96} haptic="select" style={[styles.card, { backgroundColor: theme.illustration.stage[stage] }]} accessibilityLabel={label}>
      <Animated.View style={[styles.cardArt, float]}>
        <ClayObject name={object} size={104} />
      </Animated.View>
      <View style={styles.cardText}>
        <Text variant="label" style={{ color: theme.illustration.ink }}>
          {label}
        </Text>
        <Text variant="meta" style={{ color: theme.illustration.ink, opacity: 0.62 }}>{`${formatTL(from)}’den`}</Text>
      </View>
    </Tactile>
  );
}

function FloatingTabs() {
  const theme = useTheme();
  const f = useFrame();
  const c = theme.color;
  const items = [
    { icon: 'home' as const, active: true },
    { icon: 'tasks' as const, active: false },
    { icon: 'user' as const, active: false },
  ];
  return (
    <View style={[styles.tabsWrap, { bottom: f.bottom + 12 }]} pointerEvents="box-none">
      <View style={[styles.tabs, { backgroundColor: c.surface.inverse }, theme.elevation.dock]}>
        {items.map((it) => (
          <Tactile key={it.icon} haptic="select" style={styles.tab} accessibilityLabel={it.icon}>
            <Icon name={it.icon} size={22} color={it.active ? c.brand.dot : c.ink.onInverseTertiary} weight={it.active ? 'fill' : 'regular'} />
            {it.active ? <View style={[styles.tabDot, { backgroundColor: c.brand.dot }]} /> : null}
          </Tactile>
        ))}
      </View>
    </View>
  );
}

/**
 * Night surface that opens from the orb while the person talks. Words light up
 * as they are heard; on release the listing is written and the sheet rises.
 */
function VoiceCapture({ open, origin, onFinish, onClosed }: { open: boolean; origin: { x: number; y: number }; onFinish: () => void; onClosed: () => void }) {
  const motion = useMotion();
  const f = useFrame();
  const fire = useHaptics();
  const words = t('proto.transcript').split(' ');
  const [lit, setLit] = useState(0);
  const [writing, setWriting] = useState(false);
  const v = useSharedValue(0);
  const finish = useEffectEvent(onFinish);
  const closed = useEffectEvent(onClosed);

  useEffect(() => {
    if (open) v.set(withTiming(1, motion.timing(720, easeReveal)));
    else v.set(withTiming(0, motion.timing(560, Easing.bezier(0.7, 0, 0.84, 0)), (ok) => ok && scheduleOnRN(closed)));
  }, [open, motion, v]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setLit((n) => Math.min(words.length, n + 1)), motion.ms(150));
    return () => clearInterval(id);
  }, [open, motion, words.length]);

  useEffect(() => {
    if (!open || lit < words.length) return;
    const a = setTimeout(() => {
      setWriting(true);
      fire('success');
    }, motion.ms(250));
    const b = setTimeout(() => finish(), motion.ms(1300));
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [open, lit, words.length, motion, fire]);

  return (
    <SchemeProvider scheme="night">
      <CircleReveal progress={v} origin={origin} frame={{ w: f.w, h: f.h }}>
        <VoiceSurface words={words} lit={lit} writing={writing} origin={origin} />
      </CircleReveal>
    </SchemeProvider>
  );
}

function VoiceSurface({ words, lit, writing, origin }: { words: string[]; lit: number; writing: boolean; origin: { x: number; y: number } }) {
  const theme = useTheme();
  const f = useFrame();
  const c = theme.color;
  const g = theme.layout.gutter;
  const secs = Math.floor((lit * 380) / 1000);
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.base }]}>
      <Grain opacity={0.08} />
      <Glow size={f.w * 1.6} color={c.brand.dot} opacity={0.32} style={{ position: 'absolute', left: origin.x - f.w * 0.8, top: origin.y - f.w * 0.8 }} />
      <View style={{ paddingTop: f.top + 30, paddingHorizontal: g }}>
        <View style={styles.row}>
          <View style={styles.rowTight}>
            <LiveDot />
            <Text variant="micro" tone="brand">
              {writing ? t('proto.writing') : t('proto.listening')}
            </Text>
          </View>
          <Text variant="meta" tone="secondary">{`0:${String(secs).padStart(2, '0')}`}</Text>
        </View>
        <Text variant="display.l" style={{ marginTop: 28, fontSize: 34, lineHeight: 40 }}>
          {words.map((w, i) => (
            <Text key={i} variant="display.l" style={{ fontSize: 34, lineHeight: 40, color: i < lit ? c.ink.primary : c.surface.hairlineStrong }}>
              {`${w} `}
            </Text>
          ))}
        </Text>
      </View>
      <View style={{ position: 'absolute', left: g, right: g, top: origin.y - 150 }}>
        <Waveform active={!writing} height={64} color={c.brand.dot} />
      </View>
      <View style={[styles.orb, { position: 'absolute', left: origin.x - ORB / 2, top: origin.y - ORB / 2, width: ORB, height: ORB, borderRadius: ORB / 2, backgroundColor: c.brand.fill }]}>
        <Icon name={writing ? 'sparkle' : 'mic'} size={34} color={c.brand.onFill} weight="fill" />
      </View>
      <View style={{ position: 'absolute', left: g, right: g, bottom: f.bottom + 40 }}>
        <Text variant="body" tone="secondary" align="center">
          {writing ? t('proto.writing') : t('proto.release')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rowTight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: 16, borderRadius: 22 },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badgeDot: { position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 4.5, borderWidth: 2 },
  ticker: { marginTop: 22, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 11 },
  tick: { flexDirection: 'row', alignItems: 'center', gap: 28, paddingRight: 28 },
  zone: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  photo: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, marginTop: 16 },
  orb: { alignItems: 'center', justifyContent: 'center' },
  orbRing: { position: 'absolute', borderWidth: 2 },
  card: { width: 138, height: 164, borderRadius: 26, overflow: 'hidden' },
  cardArt: { alignItems: 'center', marginTop: 6 },
  cardText: { position: 'absolute', left: 14, bottom: 12, right: 10 },
  tabsWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  tabs: { flexDirection: 'row', height: 60, borderRadius: 30, paddingHorizontal: 10, alignItems: 'center' },
  tab: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  tabDot: { position: 'absolute', bottom: 10, width: 4, height: 4, borderRadius: 2 },
});
