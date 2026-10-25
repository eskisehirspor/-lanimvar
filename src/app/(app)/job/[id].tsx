import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveMap } from '@/features/app/LiveMap';
import { attempt, confirm } from '@/features/app/Notice';
import { ReportMenu } from '@/features/app/ReportMenu';
import { SafetyLayer } from '@/features/app/Safety';
import { stepForStatus } from '@/features/task/model/status';
import { formatTL, t } from '@/i18n';
import { useTaskMedia } from '@/lib/api/customer';
import { toAppError } from '@/lib/api/errors';
import { markArrived, releaseTask, reportNoShow, startRoute, submitProof, useJobAddress, useJobLive, useJobs, verifyPin } from '@/lib/api/tasker';
import { uploadTaskPhoto } from '@/lib/api/trust';
import type { ExactAddress, Job } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/store';
import { demoPinFor } from '@/lib/demo/backend';
import { currentCoords } from '@/lib/location';
import { isDemo } from '@/lib/supabase/config';
import { useTheme } from '@/theme';
import { Button, Callout, IconButton, LifecycleStrip, PinEntry, Skeleton, StatusWord, Text, type PinEntryStatus } from '@/ui';

const addressStatuses = ['assigned', 'en_route', 'arrived', 'in_progress'];

/** The Tasker's job, one clear next step at a time. */
export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const jobs = useJobs();
  useJobLive(id);
  const job = jobs.data?.find((j) => j.task_id === id);
  const live = !!job && addressStatuses.includes(job.status);
  const address = useJobAddress(id, live);

  if (!job) {
    return (
      <View style={{ flex: 1, padding: 20, paddingTop: 80, gap: 12, backgroundColor: c.surface.base }}>
        <Skeleton width="60%" height={36} />
        <Skeleton width="100%" height={220} radius={22} />
      </View>
    );
  }
  const step = stepForStatus(job.status);
  const a = address.data;
  return (
    <View style={[styles.flex, { backgroundColor: c.surface.grouped }]}>
      <LiveMap center={{ lat: a?.exact_lat ?? job.approx_lat, lng: a?.exact_lng ?? job.approx_lng }} mode={a?.exact_lat ? 'exact' : 'approx'} height={300} />
      <View style={[styles.topBar, { top: insets.top + 8, left: g, right: g }]}>
        <IconButton icon="arrowLeft" label={t('common.back')} variant="floating" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        {live ? (
          <View style={styles.rowTight}>
            <SafetyLayer taskId={id} role="tasker" onLeft={() => router.replace('/')} />
            <ReportMenu subjectId={job.customer_id} taskId={id} />
          </View>
        ) : null}
      </View>
      <ScrollView style={[styles.sheet, { backgroundColor: c.surface.base }]} contentContainerStyle={{ padding: g, paddingBottom: insets.bottom + 32, gap: 16 }}>
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="display.m">{job.title}</Text>
            <Text variant="body" tone="secondary">{`${job.customer_first_name} · ${formatTL(job.price)}`}</Text>
          </View>
          <StatusWord status={job.status} />
        </View>
        {step ? <LifecycleStrip step={step} /> : null}
        {live && a ? <AddressCard address={a} /> : null}
        <NextStep job={job} />
      </ScrollView>
    </View>
  );
}

function AddressCard({ address }: { address: ExactAddress }) {
  const theme = useTheme();
  const openMaps = () => {
    const q = address.exact_lat && address.exact_lng ? `${address.exact_lat},${address.exact_lng}` : encodeURIComponent(address.exact_address);
    const url = Platform.OS === 'ios' ? `http://maps.apple.com/?daddr=${q}` : `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    Linking.openURL(url);
  };
  return (
    <View style={[styles.card, { backgroundColor: theme.color.surface.grouped }]}>
      <Text variant="micro" tone="tertiary">
        {t('location.exactLabel')}
      </Text>
      <Text variant="title">{address.exact_address}</Text>
      {address.exact_details ? (
        <Text variant="body" tone="secondary">
          {address.exact_details}
        </Text>
      ) : null}
      <Button level="secondary" size="m" layout="fit" icon="navigate" label={t('tasker.openMaps')} onPress={openMaps} />
    </View>
  );
}

function NextStep({ job }: { job: Job }) {
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    await attempt(fn);
    setBusy(false);
  };
  switch (job.status) {
    case 'assigned':
      return (
        <View style={{ gap: 10 }}>
          <Button label={t('tasker.startRoute')} loading={busy} onPress={() => run(() => startRoute(job.task_id))} />
          <CannotDo id={job.task_id} />
        </View>
      );
    case 'en_route':
      return (
        <View style={{ gap: 10 }}>
          <Text variant="meta" tone="secondary">
            {t('tasker.arrivedHint')}
          </Text>
          <Button
            label={t('tasker.arrived')}
            loading={busy}
            onPress={() =>
              run(async () => {
                const here = await currentCoords().catch(() => null);
                await markArrived(job.task_id, here?.lat ?? null, here?.lng ?? null);
              })
            }
          />
          <CannotDo id={job.task_id} />
        </View>
      );
    case 'arrived':
      return <PinStep job={job} />;
    case 'in_progress':
      return <ProofStep id={job.task_id} />;
    case 'proof_submitted':
      return <Callout tone="attention" title={t('tasker.proofTitle')} body={t('tasker.waitingConfirm')} />;
    case 'completed':
      return (
        <View style={{ gap: 6 }}>
          <Text variant="display.l">{t('tasker.done')}</Text>
          <Text variant="body.l" tone="secondary">
            {t('tasker.earned', { price: formatTL(job.price) })}
          </Text>
          <Text variant="meta" tone="tertiary">
            {t('tasker.cashNote')}
          </Text>
        </View>
      );
    default:
      return (
        <Text variant="body" tone="secondary">
          {t(`status.${job.status}`)}
        </Text>
      );
  }
}

function CannotDo({ id }: { id: string }) {
  return (
    <Button
      level="ghost"
      align="center"
      label={t('tasker.leaveCannot')}
      onPress={async () => {
        if (await confirm(t('safety.leave'), t('tasker.leaveReasonTitle'), t('safety.leaveConfirm'), true)) {
          const ok = await attempt(async () => {
            await releaseTask(id, 'cannot_do');
            return true;
          });
          if (ok) router.replace('/');
        }
      }}
    />
  );
}

/** The door: the server checks the code; 5 misses lock it. No-show after 10 minutes. */
function PinStep({ job }: { job: Job }) {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<PinEntryStatus>('idle');
  const [left, setLeft] = useState(5);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(h);
  }, []);
  const waitedMin = job.arrived_at ? (now - new Date(job.arrived_at).getTime()) / 60000 : 0;
  const canNoShow = waitedMin >= 10;

  const submit = async (value: string) => {
    try {
      const ok = await verifyPin(job.task_id, value);
      if (ok) setStatus('verified');
      else {
        setLeft((l) => Math.max(0, l - 1));
        setStatus(left - 1 <= 0 ? 'locked' : 'error');
        setCode('');
      }
    } catch (e) {
      if (toAppError(e).code === 'pin_locked') setStatus('locked');
      else attempt(() => Promise.reject(e));
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <Text variant="display.m">{t('tasker.pinTitle')}</Text>
      <Text variant="body" tone="secondary">
        {t('tasker.pinSub')}
      </Text>
      {isDemo && demoPinFor(job.task_id) ? (
        <Text variant="label" tone="link">
          {t('demo.pinHint', { pin: demoPinFor(job.task_id)! })}
        </Text>
      ) : null}
      <PinEntry
        value={code}
        onChange={(v) => {
          setCode(v);
          if (status === 'error') setStatus('idle');
        }}
        onComplete={submit}
        status={status}
        attemptsLeft={left}
        systemKeyboard={Platform.OS === 'web'}
      />
      <View style={{ marginTop: theme.space[2] }}>
        <Button
          level="ghost"
          align="center"
          disabled={!canNoShow}
          label={canNoShow ? t('tasker.noShow') : t('tasker.noShowIn', { m: Math.max(1, Math.ceil(10 - waitedMin)) })}
          onPress={async () => {
            if (await confirm(t('tasker.noShow'), t('tasker.noShowConfirm'), t('tasker.noShow'), true)) await attempt(() => reportNoShow(job.task_id));
          }}
        />
        <Text variant="meta" tone="tertiary" align="center">
          {t('tasker.noShowHint')}
        </Text>
      </View>
    </View>
  );
}

function ProofStep({ id }: { id: string }) {
  const theme = useTheme();
  const uid = useAuth((s) => s.session?.user.id);
  const media = useTaskMedia(id);
  const [busy, setBusy] = useState<'photo' | 'submit' | null>(null);
  const after = (media.data ?? []).filter((m) => m.kind === 'after' && m.uploader_id === uid);

  const takePhoto = async () => {
    if (isDemo && uid) {
      setBusy('photo');
      await attempt(() => uploadTaskPhoto(id, uid, '', 'after'));
      setBusy(null);
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted || !uid) return;
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.8, exif: false });
    if (shot.canceled || !shot.assets[0]) return;
    setBusy('photo');
    const coords = await currentCoords().catch(() => null);
    await attempt(() => uploadTaskPhoto(id, uid, shot.assets[0]!.uri, 'after', coords ?? undefined));
    setBusy(null);
  };

  return (
    <View style={{ gap: 14 }}>
      <Text variant="display.m">{t('tasker.proofTitle')}</Text>
      <Text variant="body" tone="secondary">
        {t('tasker.proofBody')}
      </Text>
      <View style={styles.photos}>
        {after.map((m) => (m.url ? <Image key={m.id} source={{ uri: m.url }} style={[styles.photo, { backgroundColor: theme.color.surface.field }]} /> : null))}
      </View>
      <Button level="secondary" icon="camera" label={t('tasker.takePhoto')} loading={busy === 'photo'} onPress={takePhoto} />
      <Button
        label={t('tasker.submitProof')}
        disabled={!after.length}
        loading={busy === 'submit'}
        onPress={async () => {
          setBusy('submit');
          await attempt(() => submitProof(id));
          setBusy(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowTight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBar: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheet: { flex: 1, marginTop: -28, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  card: { borderRadius: 18, padding: 16, gap: 6 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 100, height: 100, borderRadius: 12 },
});
