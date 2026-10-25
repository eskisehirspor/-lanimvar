import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { categoryLook } from '@/features/app/categories';
import { FlowStep } from '@/features/app/FlowStep';
import { attempt } from '@/features/app/Notice';
import { formatTL, t } from '@/i18n';
import { createTask, usePricing } from '@/lib/api/customer';
import type { CategorySection, PricingRule } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/store';
import { whereAmI } from '@/lib/location';
import { useTheme } from '@/theme';
import { Button, Chip, ClayObject, CTA, Field, Icon, IconButton, PriceDial, Tactile, Text } from '@/ui';

const sectionOrder: CategorySection[] = ['daily', 'social', 'wait', 'pets', 'extra'];
// Phone numbers, e-mails, IBANs, handles: the server refuses them; say so before submit.
const contactPattern = /(\+?9?0?[\s.-]*5\d{2}[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2})|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(TR\s?\d{2}(\s?\d{4}){5})|(whatsapp|instagram|telegram|t\.me\/|@[a-z0-9_.]{3,})/i;

type When = { kind: 'now' } | { kind: 'at'; iso: string; label: string };

function slots(): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  const now = new Date();
  const h = now.getHours() + 1;
  for (let x = h; x <= 23 && out.length < 6; x++) {
    const d = new Date(now);
    d.setHours(x, 0, 0, 0);
    out.push({ iso: d.toISOString(), label: `${String(x).padStart(2, '0')}:00` });
  }
  for (const x of [10, 14, 18, 20]) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(x, 0, 0, 0);
    out.push({ iso: d.toISOString(), label: t('task.tomorrowAt', { time: `${x}:00` }) });
  }
  return out;
}

/** Posting a job, one question at a time: what → when (and how many) → where → price. */
export default function NewTask() {
  const theme = useTheme();
  const c = theme.color;
  const params = useLocalSearchParams<{ category?: string; rehire?: string; rehireName?: string }>();
  const profile = useAuth((s) => s.profile);
  const rules = usePricing().data ?? [];
  const [step, setStep] = useState(params.category ? 1 : 0);
  const [category, setCategory] = useState(params.category ?? '');
  const rule: PricingRule | undefined = rules.find((r) => r.category === category);
  const social = rule?.section === 'social';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [when, setWhen] = useState<When>({ kind: 'now' });
  const [people, setPeople] = useState(1);
  const hasHome = !!profile?.home_address;
  const [useHome, setUseHome] = useState(hasHome);
  const [where, setWhere] = useState<{ lat: number; lng: number } | null>(profile?.home_lat && profile.home_lng ? { lat: profile.home_lat, lng: profile.home_lng } : null);
  const [label, setLabel] = useState(profile?.home_neighbourhood ? `${profile.home_neighbourhood}, ${profile.home_district ?? 'Eskişehir'}` : (profile?.home_district ?? ''));
  const [address, setAddress] = useState(profile?.home_address ?? '');
  const [details, setDetails] = useState(profile?.home_details ?? '');
  const [locating, setLocating] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const value = price ?? rule?.recommended_price ?? 0;
  const contactWarning = contactPattern.test(`${title} ${description} ${details}`);
  const total = 4;

  const back = () => (step === 0 ? router.back() : setStep(step - 1));

  const locate = async () => {
    setLocating(true);
    const here = await attempt(whereAmI);
    setLocating(false);
    if (!here) return;
    setUseHome(false);
    setWhere({ lat: here.lat, lng: here.lng });
    if (here.label) setLabel(here.label);
    if (here.street) setAddress(here.street);
    setDetails('');
  };

  const submit = async () => {
    if (!rule) return;
    const coords = where ?? { lat: 39.7767, lng: 30.5206 };
    setBusy(true);
    const ids = await attempt(async () => {
      const made: string[] = [];
      for (let i = 0; i < people; i++) {
        made.push(
          await createTask({
            category: rule.category,
            title: title.trim(),
            description: description.trim(),
            price: value,
            approxLabel: label.trim() || 'Eskişehir',
            lat: coords.lat,
            lng: coords.lng,
            exactAddress: address.trim(),
            exactDetails: details.trim(),
            scheduledFor: when.kind === 'at' ? when.iso : null,
            preferredTasker: params.rehire ?? null,
          }),
        );
      }
      return made;
    });
    setBusy(false);
    if (ids?.[0]) router.replace(people > 1 ? '/tasks' : `/task/${ids[0]}`);
  };

  if (step === 0) {
    return (
      <FlowStep step={1} total={total} onBack={back} title={t('task.pickTitle')} accent={t('task.pickAccent')} sub={t('task.pickSub')} footer={<CTA label={t('onboarding.next')} disabled={!rule} onPress={() => setStep(1)} />}>
        {sectionOrder.map((section) => {
          const list = rules.filter((r) => r.section === section);
          if (!list.length) return null;
          return (
            <View key={section} style={{ gap: 10 }}>
              <Text variant="micro" tone="tertiary">
                {t(`sections.${section}`)}
              </Text>
              <View style={styles.grid}>
                {list.map((r) => {
                  const look = categoryLook(r.category);
                  const on = r.category === category;
                  return (
                    <Tactile
                      key={r.id}
                      haptic="select"
                      pressScale={0.97}
                      onPress={() => {
                        setCategory(r.category);
                        setPrice(null);
                        setPeople(1);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={r.label}
                      style={[styles.tile, { backgroundColor: theme.illustration.stage[look.stage], borderColor: on ? c.surface.inverse : 'transparent' }]}
                    >
                      <ClayObject name={look.object} size={58} />
                      <Text variant="label" style={{ color: theme.illustration.ink, fontSize: 14 }} numberOfLines={2}>
                        {r.label}
                      </Text>
                      {on ? (
                        <View style={[styles.tick, { backgroundColor: c.surface.inverse }]}>
                          <Icon name="check" size={12} color={c.ink.onInverse} weight="bold" />
                        </View>
                      ) : null}
                    </Tactile>
                  );
                })}
              </View>
            </View>
          );
        })}
      </FlowStep>
    );
  }

  if (step === 1) {
    return (
      <FlowStep
        step={2}
        total={total}
        onBack={back}
        title={rule?.label ?? ''}
        sub={social ? t('task.socialSub') : t('task.whatSub')}
        footer={<CTA label={t('onboarding.next')} disabled={title.trim().length < 4 || contactWarning} onPress={() => setStep(2)} />}
      >
        {params.rehire ? (
          <View style={[styles.note, { backgroundColor: c.tint.brand }]}>
            <Icon name="star" size={16} color={c.ink.primary} weight="fill" />
            <Text variant="meta" style={{ flex: 1 }}>
              {t('task.rehireNote', { name: params.rehireName ?? '' })}
            </Text>
          </View>
        ) : null}
        <Field label={t('customer.titleLabel')} value={title} onChangeText={setTitle} placeholder={social ? t('task.socialTitlePlaceholder') : t('customer.titlePlaceholder')} maxLength={120} autoFocus />
        <Field label={t('customer.descLabel')} optional multiline counter maxLength={1000} value={description} onChangeText={setDescription} placeholder={social ? t('task.socialDescPlaceholder') : t('customer.descPlaceholder')} />
        {contactWarning ? (
          <View style={[styles.note, { backgroundColor: c.tint.attention }]}>
            <Icon name="warningCircle" size={16} color={c.status.attention} weight="fill" />
            <Text variant="meta" style={{ flex: 1 }}>
              {t('errors.contact_info_not_allowed')}
            </Text>
          </View>
        ) : null}
        <Text variant="label" style={{ marginTop: 8 }}>
          {t('task.when')}
        </Text>
        <View style={styles.chips}>
          <Chip size="m" icon="lightning" label={t('task.now')} tone={when.kind === 'now' ? 'inverse' : 'outline'} selected={when.kind === 'now'} onPress={() => setWhen({ kind: 'now' })} />
          {slots().map((s) => {
            const on = when.kind === 'at' && when.iso === s.iso;
            return <Chip key={s.iso} size="m" label={s.label} tone={on ? 'inverse' : 'outline'} selected={on} onPress={() => setWhen({ kind: 'at', iso: s.iso, label: s.label })} />;
          })}
        </View>
        {rule && rule.max_people > 1 ? (
          <View style={[styles.stepper, { backgroundColor: c.surface.grouped }]}>
            <View style={{ flex: 1 }}>
              <Text variant="label">{t('task.people')}</Text>
              <Text variant="meta" tone="secondary">
                {t('task.peopleHint')}
              </Text>
            </View>
            <IconButton icon="minus" label="-" size={40} onPress={() => setPeople(Math.max(1, people - 1))} />
            <Text variant="display.m" style={{ minWidth: 28, textAlign: 'center' }}>
              {String(people)}
            </Text>
            <IconButton icon="plus" label="+" size={40} variant="inverse" onPress={() => setPeople(Math.min(rule.max_people, people + 1))} />
          </View>
        ) : null}
      </FlowStep>
    );
  }

  if (step === 2) {
    const ok = address.trim().length >= 5 && label.trim().length > 1;
    return (
      <FlowStep step={3} total={total} onBack={back} title={t('customer.stepWhere')} sub={t('customer.addressPrivacy')} footer={<CTA label={t('onboarding.next')} disabled={!ok} onPress={() => setStep(3)} />}>
        {hasHome ? (
          <Tactile
            haptic="select"
            onPress={() => {
              setUseHome(true);
              setWhere(profile?.home_lat && profile.home_lng ? { lat: profile.home_lat, lng: profile.home_lng } : where);
              setLabel(profile?.home_neighbourhood ? `${profile.home_neighbourhood}, ${profile.home_district ?? ''}` : (profile?.home_district ?? ''));
              setAddress(profile?.home_address ?? '');
              setDetails(profile?.home_details ?? '');
            }}
            style={[styles.place, { backgroundColor: useHome ? c.surface.inverse : c.surface.grouped }]}
            accessibilityLabel={t('task.homeAddress')}
          >
            <Icon name="home" size={22} color={useHome ? c.brand.dot : c.ink.primary} weight="fill" />
            <View style={{ flex: 1 }}>
              <Text variant="label" tone={useHome ? 'onInverse' : 'primary'}>
                {t('task.homeAddress')}
              </Text>
              <Text variant="meta" tone={useHome ? 'onInverseSecondary' : 'secondary'} numberOfLines={1}>
                {profile?.home_address}
              </Text>
            </View>
            {useHome ? <Icon name="checkCircle" size={22} color={c.brand.dot} weight="fill" /> : null}
          </Tactile>
        ) : null}
        <Button level="secondary" icon="locate" label={locating ? t('customer.locating') : t('task.elsewhere')} loading={locating} onPress={locate} />
        {!useHome ? (
          <>
            <Field label={t('customer.approxLabel')} value={label} onChangeText={setLabel} placeholder="Hoşnudiye, Eskişehir" maxLength={80} leadingIcon="mapPin" />
            <Field label={t('customer.addressLabel')} value={address} onChangeText={setAddress} placeholder={social ? t('task.venuePlaceholder') : t('customer.addressPlaceholder')} maxLength={300} />
            <Field label={t('customer.detailsLabel')} optional value={details} onChangeText={setDetails} placeholder="Kat 3, Daire 7" maxLength={300} />
          </>
        ) : null}
      </FlowStep>
    );
  }

  const free = value === 0;
  return (
    <FlowStep
      step={4}
      total={total}
      onBack={back}
      title={t('customer.stepPrice')}
      sub={social ? t('task.freeHint') : t('customer.cashNote')}
      footer={
        <CTA
          label={social ? t('task.publishSocial', { count: people }) : t('task.publish')}
          sub={`${free ? t('task.free') : formatTL(value)}${when.kind === 'at' ? ` · ${when.label}` : ` · ${t('task.now')}`}`}
          tone="brand"
          loading={busy}
          onPress={submit}
        />
      }
    >
      {rule && rule.min_price === 0 ? (
        <View style={styles.chips}>
          <Chip size="m" icon="sparkle" label={t('task.free')} tone={free ? 'inverse' : 'outline'} selected={free} onPress={() => setPrice(0)} />
          <Chip size="m" label={t('task.paid')} tone={!free ? 'inverse' : 'outline'} selected={!free} onPress={() => setPrice(Math.max(50, rule.recommended_price || 100))} />
        </View>
      ) : null}
      {rule && !free ? <PriceDial key={rule.category} value={value} onChange={setPrice} recommended={rule.recommended_price || 100} min={Math.max(rule.min_price, rule.min_price === 0 ? 10 : 0)} max={rule.max_price} /> : null}
      <View style={[styles.summary, { backgroundColor: c.surface.grouped }]}>
        <ClayObject name={categoryLook(category).object} size={64} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="label" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="meta" tone="secondary" numberOfLines={1}>{`${label} · ${when.kind === 'at' ? when.label : t('task.now')}${people > 1 ? ` · ${t('task.peopleCount', { count: people })}` : ''}`}</Text>
        </View>
      </View>
      <View style={[styles.note, { backgroundColor: c.surface.grouped }]}>
        <Icon name="shield" size={16} color={c.status.success} weight="fill" />
        <Text variant="meta" style={{ flex: 1 }}>
          {t('task.inAppNote')}
        </Text>
      </View>
    </FlowStep>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', flexGrow: 1, minHeight: 116, borderRadius: 20, padding: 10, gap: 4, borderWidth: 2, justifyContent: 'space-between' },
  tick: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 18 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20 },
});
