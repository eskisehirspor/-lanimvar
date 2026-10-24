import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, Easing } from 'react-native-reanimated';

import { useHaptics } from '@/lib/haptics';
import { formatClock, t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';
import {
  Button,
  Chip,
  EmergencyScreen,
  Icon,
  LifecycleStrip,
  MapCanvas,
  PinDisplay,
  PinEntry,
  ProofGrid,
  SafetyHandle,
  SafetySheet,
  SearchPulse,
  SuccessMoment,
  Tactile,
  Text,
  type PinEntryStatus,
  type ProofItem,
} from '@/ui';
import { riseIn, rollIn, rollOut } from '@/ui/motion';

/** One independently playable transition: title, product reason, stage, controls. */
function Stage({ index, title, why, onPlay, onReset, height = 240, children }: { index: number; title: string; why: string; onPlay: () => void; onReset?: () => void; height?: number; children: ReactNode }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <View style={{ gap: 10 }}>
      <View style={{ paddingHorizontal: 4, gap: 2 }}>
        <Text variant="micro" tone="tertiary">
          {String(index).padStart(2, '0')}
        </Text>
        <Text variant="title">{title}</Text>
        <Text variant="meta" tone="tertiary">{`${t('lab.why')}: ${why}`}</Text>
      </View>
      <View style={{ backgroundColor: c.surface.panel, borderRadius: theme.radii.panel, overflow: 'hidden' }}>
        <View style={{ minHeight: height, padding: 20, justifyContent: 'center' }}>{children}</View>
        <View style={[styles.controls, { borderTopColor: c.surface.hairline }]}>
          <Button layout="fit" size="m" level="secondary" icon="play" label={t('lab.play')} onPress={onPlay} />
          {onReset ? <Button layout="fit" size="m" level="ghost" label={t('lab.reset')} onPress={onReset} /> : null}
        </View>
      </View>
    </View>
  );
}

function useTimers() {
  const motion = useMotion();
  const ids = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => ids.current.forEach(clearTimeout), []);
  return {
    after(ms: number, fn: () => void) {
      ids.current.push(setTimeout(fn, motion.ms(ms)));
    },
    clear() {
      ids.current.forEach(clearTimeout);
      ids.current = [];
    },
  };
}

function useElapsed(running: boolean) {
  const motion = useMotion();
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    let n = 0;
    const id = setInterval(() => setS(++n), motion.ms(1000));
    return () => clearInterval(id);
  }, [running, motion]);
  const [was, setWas] = useState(running);
  if (running !== was) {
    setWas(running);
    setS(0);
  }
  return running ? s : 0;
}

/* 01 · publish → searching */
export function PublishDemo() {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const timers = useTimers();
  const c = theme.color;
  const [width, setWidth] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'morph' | 'searching'>('idle');
  const w = useSharedValue(0);
  const h = useSharedValue<number>(theme.layout.buttonHeight);
  const label = useSharedValue(1);
  const elapsed = useElapsed(phase === 'searching');
  const radius = Math.min(theme.radii.button, theme.layout.buttonHeight / 2);

  useEffect(() => {
    if (phase === 'idle' && width) w.set(width);
  }, [width, phase, w]);

  const reset = () => {
    timers.clear();
    setPhase('idle');
    w.set(width);
    h.set(theme.layout.buttonHeight);
    label.set(1);
  };
  const play = () => {
    reset();
    setPhase('morph');
    fire('press');
    if (motion.reduced) return timers.after(0, () => setPhase('searching'));
    label.set(withTiming(0, motion.timing(120)));
    w.set(withDelay(motion.ms(80), withSequence(withSpring(54, motion.spring('hero')), withSpring(20, motion.spring('snappy')))));
    h.set(withDelay(motion.ms(560), withSpring(20, motion.spring('snappy'))));
    timers.after(820, () => setPhase('searching'));
  };

  const shape = useAnimatedStyle(() => ({
    width: w.value || '100%',
    height: h.value,
    borderRadius: interpolate(w.value, [54, Math.max(55, width)], [h.value / 2, Math.min(radius, h.value / 2)], 'clamp'),
  }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: label.value }));

  return (
    <Stage index={1} title="Yayınla → aranıyor" why="Bastığın buton aramanın kendisine dönüşür; niyet ile sistemin işi arasında kopukluk olmaz." onPlay={play} onReset={reset} height={300}>
      <View style={styles.center} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.slot}>
          {phase === 'searching' ? (
            <SearchPulse size={160} />
          ) : (
            <Animated.View style={[styles.morph, { backgroundColor: c.brand.fill }, shape]}>
              <Animated.View style={labelStyle}>
                <Text variant="button" tone="onFill" numberOfLines={1}>
                  İlanı yayınla
                </Text>
              </Animated.View>
            </Animated.View>
          )}
        </View>
        <View style={{ minHeight: 64, justifyContent: 'center' }}>
          {phase === 'searching' ? (
            <Animated.View entering={riseIn(motion, 120, 12)} style={styles.centerText}>
              <Text variant="display.m" align="center">
                Sana uygun birini arıyoruz.
              </Text>
              <Text variant="meta" tone="tertiary">{`6 görevliye bildirim gitti · ${formatClock(elapsed)}`}</Text>
            </Animated.View>
          ) : null}
        </View>
      </View>
    </Stage>
  );
}

/* 02 · searching pulse */
export function PulseDemo() {
  const [active, setActive] = useState(true);
  return (
    <Stage index={2} title="Arama nabzı" why="Sistem çalışıyor, panik yok: sakin, düzenli ritim — yalnızca arama gerçekten sürerken." onPlay={() => setActive(true)} onReset={() => setActive(false)}>
      <View style={styles.center}>
        <SearchPulse size={190} active={active} />
      </View>
    </Stage>
  );
}

/* 03 · acceptance: İ-dot → avatar */
export function AcceptanceDemo() {
  const theme = useTheme();
  const motion = useMotion();
  const fire = useHaptics();
  const timers = useTimers();
  const c = theme.color;
  const [accepted, setAccepted] = useState(false);
  const a = useSharedValue(0);
  const reset = () => {
    timers.clear();
    setAccepted(false);
    a.set(0);
  };
  const play = () => {
    reset();
    timers.after(250, () => {
      setAccepted(true);
      fire('success');
      a.set(motion.reduced ? withTiming(1, motion.fade()) : withSpring(1, motion.spring('hero')));
    });
  };
  const dot = useAnimatedStyle(() => {
    const s = interpolate(a.value, [0, 1], [20, 60]);
    return { width: s, height: s, borderRadius: s / 2, backgroundColor: interpolateColor(a.value, [0, 1], [c.brand.dot, c.surface.fieldStrong]) };
  });
  const initials = useAnimatedStyle(() => ({ opacity: interpolate(a.value, [0.45, 1], [0, 1], 'clamp'), transform: [{ scale: interpolate(a.value, [0, 1], [0.5, 1]) }] }));
  return (
    <Stage index={3} title="Kabul: İ-noktası → görevli" why="Arayan nokta, bulunan kişiye dönüşür: “aradığın bu kişi” bağı tek nesneyle kurulur." onPlay={play} onReset={reset} height={260}>
      <View style={{ gap: 28 }}>
        <View style={styles.acceptRow}>
          <View style={styles.anchor}>
            {accepted ? (
              <Animated.View style={[styles.center, dot]}>
                <Animated.View style={initials}>
                  <Text variant="title">MK</Text>
                </Animated.View>
              </Animated.View>
            ) : (
              <SearchPulse size={100} />
            )}
          </View>
          <View style={styles.flex}>
            {accepted ? (
              <Animated.View entering={riseIn(motion, 220, 0)} style={{ gap: 4 }}>
                <Text variant="display.m">Mehmet kabul etti.</Text>
                <Text variant="meta" tone="tertiary">
                  4,9 · 31 iş tamamladı
                </Text>
                <Chip tone="success" icon="check" label={t('verification.identity')} />
              </Animated.View>
            ) : (
              <Text variant="display.m" tone="tertiary">
                Aranıyor…
              </Text>
            )}
          </View>
        </View>
        <LifecycleStrip step={accepted ? 'assigned' : 'searching'} />
      </View>
    </Stage>
  );
}

/* 04 · arrival (on the real map) */
export function ArrivalDemo() {
  const motion = useMotion();
  const fire = useHaptics();
  const timers = useTimers();
  const [arrived, setArrived] = useState(false);
  const p = useSharedValue(0);
  const reset = () => {
    timers.clear();
    setArrived(false);
    p.set(0);
  };
  const play = () => {
    reset();
    p.set(motion.reduced ? withTiming(1, motion.fade()) : withTiming(1, motion.timing(2200, Easing.bezier(0.4, 0, 0.2, 1))));
    timers.after(motion.reduced ? 160 : 2200, () => {
      setArrived(true);
      fire('success');
    });
  };
  return (
    <Stage index={4} title="Varış" why="Görevlinin kapıya yaklaştığı hissedilir; varış tek net olaydır ve PIN aşamasını başlatır." onPlay={play} onReset={reset} height={380}>
      <View style={{ gap: 16 }}>
        <View style={styles.clip}>
          <Animated.View key={arrived ? 'a' : 'b'} entering={rollIn(motion, 20)} exiting={rollOut(motion, 20)}>
            <Text variant="display.m">{arrived ? 'Mehmet kapında.' : 'Mehmet yolda · 2 dk'}</Text>
          </Animated.View>
        </View>
        <View style={{ marginHorizontal: -20 }}>
          <MapCanvas mode="route" height={220} progress={p} />
        </View>
        <LifecycleStrip step={arrived ? 'arrived' : 'en_route'} />
      </View>
    </Stage>
  );
}

/* 05 · PIN reveal */
export function PinRevealDemo() {
  const [r, setR] = useState(false);
  return (
    <Stage index={5} title="PIN gösterimi" why="Kod, yüksek sesle okunacağı ritimde belirir: üçlü, kısa es, üçlü." onPlay={() => setR(true)} onReset={() => setR(false)} height={180}>
      <PinDisplay pin="482716" revealed={r} onToggle={() => setR(!r)} />
    </Stage>
  );
}

function useTyping() {
  const timers = useTimers();
  const [value, setValue] = useState('');
  const type = (code: string, done: () => void) => {
    timers.clear();
    setValue('');
    code.split('').forEach((_, i) => timers.after(140 * (i + 1), () => setValue(code.slice(0, i + 1))));
    timers.after(140 * code.length + 160, done);
  };
  return { value, setValue, type, timers };
}

/* 06 · wrong PIN */
export function WrongPinDemo() {
  const { value, setValue, type, timers } = useTyping();
  const [status, setStatus] = useState<PinEntryStatus>('idle');
  const [shown, setShown] = useState(false);
  const reset = () => {
    timers.clear();
    setValue('');
    setStatus('idle');
    setShown(false);
  };
  const play = () => {
    reset();
    type('482719', () => {
      setStatus('error');
      setShown(true);
      timers.after(520, () => setValue(''));
    });
  };
  return (
    <Stage index={6} title="Yanlış PIN" why="“Hayır” fiziksel olarak hissedilir: satır sallanır, kutular dikkat rengine döner, titreşim hata der." onPlay={play} onReset={reset} height={180}>
      <PinEntry value={value} onChange={setValue} status={status} attemptsLeft={shown ? 2 : undefined} showKeypad={false} />
    </Stage>
  );
}

/* 07 · PIN verified */
export function PinVerifiedDemo() {
  const motion = useMotion();
  const { value, setValue, type, timers } = useTyping();
  const [status, setStatus] = useState<PinEntryStatus>('idle');
  const [started, setStarted] = useState(false);
  const elapsed = useElapsed(started);
  const reset = () => {
    timers.clear();
    setValue('');
    setStatus('idle');
    setStarted(false);
  };
  const play = () => {
    reset();
    type('482716', () => {
      setStatus('verified');
      timers.after(1100, () => setStarted(true));
    });
  };
  return (
    <Stage index={7} title="PIN doğrulandı → iş başladı" why="Altı kutu tek bir onaya birleşir: “doğru kişi, doğru kapı”. Sonra zaman işlemeye başlar." onPlay={play} onReset={reset} height={280}>
      <PinEntry value={value} onChange={setValue} status={status} showKeypad={false} />
      {started ? (
        <Animated.View entering={riseIn(motion, 0, 12)} style={[styles.centerText, { marginTop: 12 }]}>
          <Text variant="display.m">İş başladı.</Text>
          <Text variant="numeric.hero">{formatClock(elapsed)}</Text>
        </Animated.View>
      ) : null}
    </Stage>
  );
}

/* 08 · proof upload */
const initialProof: ProofItem[] = [
  { id: '1', kind: 'before', state: 'uploading', progress: 0, subject: 'couch' },
  { id: '2', kind: 'after', state: 'uploading', progress: 0, subject: 'couch' },
  { id: '3', kind: 'after', state: 'uploading', progress: 0, subject: 'door' },
];

export function ProofDemo() {
  const motion = useMotion();
  const fire = useHaptics();
  const [items, setItems] = useState<ProofItem[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failedOnce = useRef(false);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    if (retryTimer.current) clearTimeout(retryTimer.current);
    timer.current = null;
    retryTimer.current = null;
  };
  useEffect(() => stop, []);
  const retry = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, state: 'uploading', progress: 0 } : it)));
    if (!timer.current) timer.current = setInterval(tick, motion.ms(160));
  };
  const tick = () =>
    setItems((prev) =>
      prev.map((it, i) => {
        if (it.state !== 'uploading') return it;
        const next = Math.min(1, (it.progress ?? 0) + [0.09, 0.06, 0.12][i]!);
        if (it.id === '2' && next >= 0.6 && !failedOnce.current) {
          failedOnce.current = true;
          fire('error');
          // The demo retries on its own; in the product the Tasker taps the tile.
          retryTimer.current = setTimeout(() => retry('2'), motion.ms(1200));
          return { ...it, state: 'failed', progress: next };
        }
        if (next >= 1) {
          fire('success');
          return { ...it, state: 'done', progress: 1 };
        }
        return { ...it, progress: next };
      }),
    );
  const play = () => {
    stop();
    failedOnce.current = false;
    setItems(initialProof);
    timer.current = setInterval(tick, motion.ms(160));
  };
  const allDone = items.length > 0 && items.every((i) => i.state === 'done');
  useEffect(() => {
    if (allDone) stop();
  }, [allDone]);
  return (
    <Stage index={8} title="Kanıt yükleme" why="Kanıt iş bitti demenin şartı: her fotoğraf durumunu gösterir; hata saklanmaz, tek dokunuşla düzelir." onPlay={play} onReset={() => { stop(); setItems([]); }} height={300}>
      <View style={{ gap: 16 }}>
        <ProofGrid items={items} onRetry={retry} onAdd={play} showRequirement />
        <Button label="İşi tamamla" disabled={!allDone} />
      </View>
    </Stage>
  );
}

/* 09 · completion */
export function CompletionDemo() {
  const [k, setK] = useState(0);
  return (
    <Stage index={9} title="Tamamlandı" why="Rota biter, nokta varır ve onaya dönüşür. Marka anı yalnızca gerçekten bir şey bittiğinde." onPlay={() => setK((x) => x + 1)} height={260}>
      <SuccessMoment title={t('feedback.successTitle')} body={t('feedback.successBody', { name: 'Mehmet' })} playKey={k} />
    </Stage>
  );
}

/* 10 · safety sheet */
export function SafetySheetDemo() {
  const [open, setOpen] = useState(false);
  const [em, setEm] = useState<{ x: number; y: number } | null>(null);
  return (
    <Stage index={10} title="Güvenlik sayfası" why="Başparmağın olduğu yerden yükselir, parmağı izler; seçenekler yukarıdan aşağı sırayla belirir." onPlay={() => setOpen(true)} height={120}>
      <SafetyHandle state="checkInDue" onPress={() => setOpen(true)} />
      <SafetySheet visible={open} onClose={() => setOpen(false)} onLeave={() => setOpen(false)} onEmergency={(o) => { setOpen(false); setEm(o); }} />
      <EmergencyScreen visible={em !== null} origin={em ?? undefined} onClose={() => setEm(null)} onCall112={() => undefined} onCallTeam={() => undefined} />
    </Stage>
  );
}

/* 11 · emergency */
export function EmergencyDemo() {
  const theme = useTheme();
  const ref = useRef<HostInstance>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const c = theme.color;
  return (
    <Stage index={11} title="Acil durum" why="Kırmızı basılan butondan yayılır: “istediğin bu”. Tek dev eylem; otomatik adımlar gerçek olarak listelenir." onPlay={() => ref.current?.measureInWindow((x, y, w, h) => setOrigin({ x: x + w / 2, y: y + h / 2 }))} height={120}>
      <View ref={ref} collapsable={false}>
        <Tactile haptic="critical" onPress={(e) => setOrigin({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })} style={[styles.emergency, { backgroundColor: c.safety.critical, borderRadius: theme.radii.button, height: theme.layout.buttonHeight }]}>
          <Icon name="siren" size="m" color={c.safety.onCritical} weight="fill" />
          <Text variant="button" tone="onCritical">
            {t('safety.emergency')}
          </Text>
        </Tactile>
      </View>
      <EmergencyScreen visible={origin !== null} origin={origin ?? undefined} onClose={() => setOrigin(null)} onCall112={() => undefined} onCallTeam={() => undefined} />
    </Stage>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  centerText: { alignItems: 'center', gap: 6 },
  flex: { flex: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1 },
  slot: { height: 170, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  morph: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  acceptRow: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 110 },
  anchor: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  clip: { overflow: 'hidden', minHeight: 32 },
  emergency: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
});
