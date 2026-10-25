import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { attempt, notify } from '@/features/app/Notice';
import { Screen, TopBar } from '@/features/app/Screen';
import { formatTL, t } from '@/i18n';
import { createTask, usePricing } from '@/lib/api/customer';
import { whereAmI } from '@/lib/location';
import { useTheme } from '@/theme';
import { Button, Chip, Field, Icon, IconButton, PriceDial, Text } from '@/ui';

/** One screen, three questions: what, where, how much. The exact address stays private until acceptance. */
export default function NewTask() {
  const theme = useTheme();
  const c = theme.color;
  const params = useLocalSearchParams<{ category?: string }>();
  const pricing = usePricing();
  const rules = pricing.data ?? [];
  const [category, setCategory] = useState(params.category ?? '');
  const rule = rules.find((r) => r.category === category) ?? rules[0];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [where, setWhere] = useState<{ lat: number; lng: number } | null>(null);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');
  const [locating, setLocating] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const value = price ?? rule?.recommended_price ?? 0;
  const ready = !!rule && title.trim().length >= 4 && !!where && label.trim().length > 1 && address.trim().length >= 5;

  const locate = async () => {
    setLocating(true);
    const here = await attempt(whereAmI);
    setLocating(false);
    if (here === null) {
      notify(t('customer.locationDenied'));
      return;
    }
    if (!here) return;
    setWhere({ lat: here.lat, lng: here.lng });
    if (here.label) setLabel(here.label);
    if (here.street && !address) setAddress(here.street);
  };

  const submit = async () => {
    if (!rule || !where) return;
    setBusy(true);
    const id = await attempt(() =>
      createTask({
        category: rule.category,
        title: title.trim(),
        description: description.trim(),
        price: value,
        approxLabel: label.trim(),
        lat: where.lat,
        lng: where.lng,
        exactAddress: address.trim(),
        exactDetails: details.trim(),
      }),
    );
    setBusy(false);
    if (id) router.replace(`/task/${id}`);
  };

  return (
    <Screen
      footer={
        <View style={{ gap: 8 }}>
          <Button label={t('customer.submit', { price: formatTL(value) })} disabled={!ready} loading={busy} onPress={submit} />
          <Text variant="meta" tone="tertiary" align="center">
            {t('customer.cashNote')}
          </Text>
        </View>
      }
    >
      <TopBar left={<IconButton icon="x" label={t('common.close')} onPress={() => router.back()} />} right={<Text variant="label">{t('customer.newTitle')}</Text>} />

      <Text variant="display.m" style={styles.h}>
        {t('customer.stepWhat')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ marginHorizontal: -theme.layout.gutter }}>
        {rules.map((r) => (
          <Chip key={r.id} label={r.label} size="m" selected={r.category === rule?.category} tone={r.category === rule?.category ? 'inverse' : 'outline'} onPress={() => {
            setCategory(r.category);
            setPrice(null);
          }} />
        ))}
      </ScrollView>
      <View style={styles.gap}>
        <Field label={t('customer.titleLabel')} value={title} onChangeText={setTitle} placeholder={t('customer.titlePlaceholder')} maxLength={120} />
        <Field label={t('customer.descLabel')} optional multiline counter maxLength={1000} value={description} onChangeText={setDescription} placeholder={t('customer.descPlaceholder')} />
      </View>

      <Text variant="display.m" style={styles.h}>
        {t('customer.stepWhere')}
      </Text>
      <Button level={where ? 'tertiary' : 'secondary'} icon="locate" label={locating ? t('customer.locating') : t('customer.useLocation')} loading={locating} onPress={locate} />
      <View style={[styles.gap, { marginTop: 14 }]}>
        <Field label={t('customer.approxLabel')} value={label} onChangeText={setLabel} placeholder="Hoşnudiye, Eskişehir" maxLength={80} leadingIcon="mapPin" />
        <Field label={t('customer.addressLabel')} value={address} onChangeText={setAddress} placeholder={t('customer.addressPlaceholder')} maxLength={300} />
        <Field label={t('customer.detailsLabel')} optional value={details} onChangeText={setDetails} placeholder="Kat 3, Daire 7" maxLength={300} />
      </View>
      <View style={[styles.privacy, { backgroundColor: c.tint.brand }]}>
        <Icon name="lock" size={16} color={c.ink.primary} weight="bold" />
        <Text variant="meta" style={{ flex: 1 }}>
          {t('customer.addressPrivacy')}
        </Text>
      </View>

      <Text variant="display.m" style={styles.h}>
        {t('customer.stepPrice')}
      </Text>
      {rule ? <PriceDial key={rule.category} value={value} onChange={setPrice} recommended={rule.recommended_price} min={rule.min_price} max={rule.max_price} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { marginTop: 28, marginBottom: 14 },
  chips: { gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  gap: { gap: 16 },
  privacy: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 14, marginTop: 14 },
});
