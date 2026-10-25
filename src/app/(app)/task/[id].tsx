import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveMap } from '@/features/app/LiveMap';
import { attempt, confirm } from '@/features/app/Notice';
import { ReportMenu } from '@/features/app/ReportMenu';
import { SafetyLayer } from '@/features/app/Safety';
import { stepForStatus } from '@/features/task/model/status';
import { formatTL, groupPin, t } from '@/i18n';
import { cancelTask, confirmCompletion, getPin, leaveReview, openDispute, rotatePin, useTask, useTaskEvents, useTaskMedia, useTaskTasker } from '@/lib/api/customer';
import type { Task, TaskTasker } from '@/lib/api/types';
import { SchemeProvider, useTheme } from '@/theme';
import {
  Avatar,
  Button,
  Confetti,
  CTA,
  FlipText,
  Grain,
  Icon,
  IconButton,
  LifecycleStrip,
  MapCanvas,
  MaskReveal,
  RatingStars,
  Rise,
  Skeleton,
  Text,
  Ticket,
} from '@/ui';

const withTasker = ['assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted', 'completed'];

export default function CustomerTask() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const task = useTask(id);
  const status = task.data?.status;
  const tasker = useTaskTasker(id, !!status && withTasker.includes(status));
  const [prev, setPrev] = useState(status);
  const [flash, setFlash] = useState(false);
  if (status !== prev) {
    if (prev === 'searching' && status === 'assigned') setFlash(true);
    setPrev(status);
  }
  useEffect(() => {
    if (!flash) return;
    const h = setTimeout(() => setFlash(false), 2800);
    return () => clearTimeout(h);
  }, [flash]);

  if (!task.data) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.color.surface.base, padding: 20, paddingTop: 80, gap: 12 }]}>
        <Skeleton width="70%" height={40} />
        <Skeleton width="100%" height={260} radius={22} />
      </View>
    );
  }
  const tk = tasker.data ?? null;
  const s = task.data.status;
  return (
    <View style={styles.flex}>
      {s === 'searching' ? (
        <Searching task={task.data} />
      ) : ['assigned', 'en_route', 'arrived', 'in_progress'].includes(s) ? (
        <Live task={task.data} tasker={tk} />
      ) : s === 'proof_submitted' ? (
        <Proof task={task.data} tasker={tk} />
      ) : s === 'completed' ? (
        <Done task={task.data} tasker={tk} />
      ) : (
        <Closed task={task.data} />
      )}
      {flash && tk ? <AcceptedFlash name={tk.first_name} /> : null}
    </View>
  );
}

function Back({ onInverse }: { onInverse?: boolean }) {
  return <IconButton icon="arrowLeft" label={t('common.back')} variant={onInverse ? 'inverse' : 'floating'} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />;
}

function useElapsed(since: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(h);
  }, []);
  const s = since ? Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000)) : 0;
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function Searching({ task }: { task: Task }) {
  const insets = useSafeAreaInsets();
  const elapsed = useElapsed(task.searching_since);
  return (
    <SchemeProvider scheme="night">
      <SearchingBody task={task} elapsed={elapsed} top={insets.top} bottom={insets.bottom} />
    </SchemeProvider>
  );
}

function SearchingBody({ task, elapsed, top, bottom }: { task: Task; elapsed: string; top: number; bottom: number }) {
  const theme = useTheme();
  const c = theme.color;
  const g = theme.layout.gutter;
  return (
    <View style={[styles.flex, { backgroundColor: c.surface.base }]}>
      <View style={StyleSheet.absoluteFill}>
        <MapCanvas mode="approx" />
      </View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.base, opacity: 0.55 }]} />
      <Grain opacity={0.06} />
      <View style={{ paddingTop: top + 12, paddingHorizontal: g }}>
        <Back onInverse />
        <View style={{ marginTop: 24 }}>
          <MaskReveal delay={100}>
            <Text variant="display.hero" style={styles.searchType}>
              {t('customer.searchingA')}
            </Text>
          </MaskReveal>
          <MaskReveal delay={200}>
            <Text variant="display.hero" style={styles.searchType}>
              {t('customer.searchingB')}
            </Text>
          </MaskReveal>
          <MaskReveal delay={300}>
            <Text variant="display.hero" serif tone="brand" style={[styles.searchType, { fontSize: 64 }]}>
              {t('customer.searchingC')}
            </Text>
          </MaskReveal>
          <Text variant="body" tone="secondary" style={{ marginTop: 10 }}>
            {`${task.title} · ${task.price === 0 ? t('task.free') : formatTL(task.price)}${task.scheduled_for ? ` · ${t('task.startsAt', { time: new Date(task.scheduled_for).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) })}` : ''}`}
          </Text>
        </View>
      </View>
      <View style={[styles.bottomRow, { left: g, right: g, bottom: bottom + 22 }]}>
        <View>
          <Text variant="micro" tone="tertiary">
            {t('proto.wait')}
          </Text>
          <Text variant="numeric.hero" style={{ fontVariant: ['tabular-nums'] }}>
            {elapsed}
          </Text>
        </View>
        <Button
          level="secondary"
          layout="fit"
          label={t('customer.cancel')}
          onPress={async () => {
            if (await confirm(t('customer.cancelConfirm'), undefined, t('customer.cancel'), true)) await attempt(() => cancelTask(task.id));
          }}
        />
      </View>
    </View>
  );
}

function Live({ task, tasker }: { task: Task; tasker: TaskTasker | null }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const step = stepForStatus(task.status);
  const center = { lat: task.exact_lat ?? task.approx_lat, lng: task.exact_lng ?? task.approx_lng };
  const label = task.status === 'arrived' ? t('customer.atDoor') : task.status === 'in_progress' ? t('customer.working') : t('customer.onTheWay');
  return (
    <View style={[styles.flex, { backgroundColor: c.surface.grouped }]}>
      <LiveMap center={center} mode="exact" height={420} tasker={tasker?.lat && tasker.lng ? { lat: tasker.lat, lng: tasker.lng, initials: tasker.initials } : null} />
      <View style={[styles.topBar, { top: insets.top + 8, left: g, right: g }]}>
        <Back />
        <View style={styles.rowTight}>
          <SafetyLayer taskId={task.id} role="customer" />
          {tasker ? <ReportMenu subjectId={tasker.tasker_id} taskId={task.id} /> : null}
        </View>
      </View>
      <ScrollView style={[styles.sheet, { backgroundColor: c.surface.base }]} contentContainerStyle={{ padding: g, paddingBottom: insets.bottom + 24, gap: 16 }}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text variant="micro" tone="tertiary">
              {task.title}
            </Text>
            <FlipText text={label} variant="display.xl" />
          </View>
          {tasker ? <Avatar initials={tasker.initials} size={56} verified={tasker.verified} /> : null}
        </View>
        {tasker ? (
          <Text variant="body" tone="secondary">{`${tasker.first_name} · ${t('customer.taskerLine', { rating: String(tasker.rating_avg).replace('.', ','), count: tasker.completed_count })}`}</Text>
        ) : null}
        {step ? <LifecycleStrip step={step} /> : null}
        {task.status !== 'in_progress' ? <PinTicket taskId={task.id} /> : null}
        {['assigned', 'en_route'].includes(task.status) ? (
          <Button
            level="ghost"
            align="center"
            label={t('customer.cancel')}
            onPress={async () => {
              if (await confirm(t('customer.cancelConfirm'), undefined, t('customer.cancel'), true)) await attempt(() => cancelTask(task.id));
            }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

/** The PIN: hidden until held (it is a key), fetched from the server only for this screen. */
function PinTicket({ taskId }: { taskId: string }) {
  const theme = useTheme();
  const c = theme.color;
  const events = useTaskEvents(taskId);
  const [pin, setPin] = useState<string | null>(null);
  const [peek, setPeek] = useState(false);
  const lastKey = events.data?.filter((e) => e.type === 'pin_generated' || e.type === 'pin_rotated').at(-1)?.id ?? 0;
  const locked = (events.data ?? []).some((e) => e.type === 'pin_locked' && e.id > lastKey);

  useEffect(() => {
    let alive = true;
    getPin(taskId)
      .then((p) => alive && setPin(p))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [taskId, lastKey]);

  if (locked) {
    return (
      <View style={[styles.lockBox, { backgroundColor: c.tint.attention }]}>
        <Text variant="body">{t('customer.pinLocked')}</Text>
        <Button
          label={t('customer.newPin')}
          onPress={async () => {
            await attempt(() => rotatePin(taskId));
            events.refetch();
          }}
        />
      </View>
    );
  }
  return (
    <Pressable onPressIn={() => setPeek(true)} onPressOut={() => setPeek(false)} accessibilityRole="button" accessibilityLabel={t('customer.pinHold')}>
      <Ticket
        cutout={c.surface.base}
        top={
          <View style={styles.row}>
            <View>
              <Text variant="micro" tone="tertiary">
                {t('customer.pinLabel')}
              </Text>
              <Text variant="numeric.pin" style={{ marginTop: 4 }}>
                {peek && pin ? groupPin(pin) : '••• •••'}
              </Text>
            </View>
            <Icon name={peek ? 'lockOpen' : 'lock'} size={22} color={c.ink.secondary} weight="bold" />
          </View>
        }
        bottom={
          <Text variant="meta" tone="tertiary">
            {`${t('customer.pinHold')} · ${t('pin.faceToFace')}`}
          </Text>
        }
      />
    </Pressable>
  );
}

function Proof({ task, tasker }: { task: Task; tasker: TaskTasker | null }) {
  const theme = useTheme();
  const media = useTaskMedia(task.id);
  const [busy, setBusy] = useState(false);
  return (
    <View style={[styles.flex, { backgroundColor: theme.color.surface.base }]}>
      <ScrollView contentContainerStyle={{ padding: theme.layout.gutter, paddingTop: 70, gap: 16, paddingBottom: 200 }}>
        <Back />
        <Text variant="display.xl">{t('customer.proofTitle')}</Text>
        <Text variant="body.l" tone="secondary">
          {t('customer.proofBody')}
        </Text>
        <Text variant="meta" tone="tertiary">
          {t('task.autoComplete')}
        </Text>
        <View style={styles.photos}>
          {(media.data ?? [])
            .filter((m) => m.url)
            .map((m) => (
              <Image key={m.id} source={{ uri: m.url! }} style={[styles.photo, { backgroundColor: theme.color.surface.field }]} accessibilityLabel={t(`proof.${m.kind === 'before' ? 'before' : 'after'}`)} />
            ))}
        </View>
        {tasker ? <Text variant="body" tone="secondary">{`${tasker.first_name} · ${formatTL(task.price)}`}</Text> : null}
      </ScrollView>
      <View style={[styles.footer, { padding: theme.layout.gutter, gap: 10 }]}>
        <Button
          label={t('customer.confirm')}
          loading={busy}
          onPress={async () => {
            setBusy(true);
            await attempt(() => confirmCompletion(task.id));
            setBusy(false);
          }}
        />
        <Button level="ghost" align="center" label={t('customer.dispute')} onPress={() => attempt(() => openDispute(task.id, t('customer.disputeReason')))} />
      </View>
    </View>
  );
}

function Done({ task, tasker }: { task: Task; tasker: TaskTasker | null }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const clay = theme.illustration.clay;
  const [stars, setStars] = useState(0);
  const [sent, setSent] = useState(false);
  return (
    <View style={[styles.flex, { backgroundColor: theme.color.surface.base }]}>
      <ScrollView contentContainerStyle={{ padding: theme.layout.gutter, paddingTop: insets.top + 12, gap: 14, paddingBottom: insets.bottom + 40 }}>
        <Back />
        <MaskReveal delay={120}>
          <Text variant="display.hero" serif style={{ fontSize: 96, lineHeight: 98 }}>{`${t('customer.doneA')}.`}</Text>
        </MaskReveal>
        <Text variant="body.l" tone="secondary">{`${task.title} · ${task.price === 0 ? t('task.free') : formatTL(task.price)}${task.scheduled_for ? ` · ${t('task.startsAt', { time: new Date(task.scheduled_for).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) })}` : ''}`}</Text>
        {tasker && !sent ? (
          <Rise delay={300} style={[styles.panel, { backgroundColor: theme.color.surface.grouped }]}>
            <Text variant="title">{t('customer.rate', { name: tasker.first_name })}</Text>
            <RatingStars value={stars} onChange={setStars} size={40} />
            <Button
              label={t('customer.rateSend')}
              disabled={!stars}
              onPress={async () => {
                const ok = await attempt(async () => {
                  await leaveReview(task.id, stars);
                  return true;
                });
                if (ok) setSent(true);
              }}
            />
          </Rise>
        ) : sent ? (
          <Text variant="body" tone="success">
            {t('customer.rated')}
          </Text>
        ) : null}
        {tasker ? (
          <CTA
            label={t('task.rehire', { name: tasker.first_name })}
            icon="retry"
            onPress={() => router.replace({ pathname: '/task/new', params: { category: task.category, rehire: tasker.tasker_id, rehireName: tasker.first_name } })}
          />
        ) : null}
        <Button level="secondary" label={t('customer.again')} onPress={() => router.replace('/task/new')} />
      </ScrollView>
      <Confetti play origin={{ x: 200, y: 260 }} colors={[clay.sun.base, clay.ink.base, clay.brick.base, clay.sky.base, clay.leaf.base]} />
    </View>
  );
}

function Closed({ task }: { task: Task }) {
  const theme = useTheme();
  const msg = task.status === 'expired' ? t('customer.expired') : task.status === 'no_show_customer' ? t('customer.noShow') : task.status === 'disputed' ? t('customer.disputed') : t('customer.cancelled');
  return (
    <View style={[styles.flex, { backgroundColor: theme.color.surface.base, padding: theme.layout.gutter, paddingTop: 70, gap: 16 }]}>
      <Back />
      <Text variant="display.xl">{t(`status.${task.status}`)}</Text>
      <Text variant="body.l" tone="secondary">
        {msg}
      </Text>
      <Text variant="body" tone="tertiary">{`${task.title} · ${task.price === 0 ? t('task.free') : formatTL(task.price)}${task.scheduled_for ? ` · ${t('task.startsAt', { time: new Date(task.scheduled_for).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) })}` : ''}`}</Text>
      <Button label={t('customer.again')} onPress={() => router.replace('/task/new')} />
    </View>
  );
}

/** The answer, at full volume, for a beat. */
function AcceptedFlash({ name }: { name: string }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <Animated.View exiting={FadeOut.duration(400)} style={[StyleSheet.absoluteFill, { backgroundColor: c.brand.fill, padding: theme.layout.gutter, justifyContent: 'center' }]}>
      <Grain opacity={0.13} />
      <MaskReveal delay={60}>
        <Text variant="display.hero" tone="onFill" numberOfLines={1} style={{ fontSize: 84, lineHeight: 82 }}>
          {name}
        </Text>
      </MaskReveal>
      <MaskReveal delay={180}>
        <Text variant="display.hero" serif tone="onFill" style={{ fontSize: 92, lineHeight: 92 }}>
          {t('customer.acceptedB')}
        </Text>
      </MaskReveal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowTight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchType: { fontSize: 58, lineHeight: 58 },
  bottomRow: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  topBar: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheet: { flex: 1, marginTop: -28, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  lockBox: { padding: 16, borderRadius: 18, gap: 12 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: '48%', aspectRatio: 1, borderRadius: 14 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 24 },
  panel: { borderRadius: 24, padding: 18, gap: 14 },
});
