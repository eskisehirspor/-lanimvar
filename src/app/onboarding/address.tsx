import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FlowStep } from '@/features/app/FlowStep';
import { attempt } from '@/features/app/Notice';
import { useDraft } from '@/features/onboarding/draft';
import { useFlow } from '@/features/onboarding/flow';
import { t } from '@/i18n';
import { whereAmI } from '@/lib/location';
import { useTheme } from '@/theme';
import { Button, Chip, CTA, Field, Icon, Text } from '@/ui';

const districts = ['Odunpazarı', 'Tepebaşı'];

export default function AddressStep() {
  const theme = useTheme();
  const d = useDraft();
  const flow = useFlow('address');
  const [locating, setLocating] = useState(false);
  const [other, setOther] = useState(d.district !== '' && !districts.includes(d.district));
  const ok = d.district.trim().length >= 2 && d.address.trim().length >= 5;

  const locate = async () => {
    setLocating(true);
    const here = await attempt(whereAmI);
    setLocating(false);
    if (!here) return;
    const district = here.district || districts.find((x) => here.label.includes(x)) || d.district;
    setOther(!!district && !districts.includes(district));
    d.set({ lat: here.lat, lng: here.lng, district, neighbourhood: d.neighbourhood || here.neighbourhood, address: d.address || here.street });
  };

  return (
    <FlowStep step={flow.step} total={flow.total} onBack={flow.back} title={t('onboarding.addressTitle')} sub={t('onboarding.addressSub')} footer={<CTA label={t('onboarding.next')} disabled={!ok} onPress={flow.next} />}>
      <Button level={d.lat ? 'tertiary' : 'secondary'} icon="locate" label={locating ? t('customer.locating') : t('customer.useLocation')} loading={locating} onPress={locate} />
      <View style={{ gap: 8 }}>
        <Text variant="label">{t('onboarding.district')}</Text>
        <View style={styles.chips}>
          {districts.map((x) => (
            <Chip key={x} size="m" label={x} tone={!other && d.district === x ? 'inverse' : 'outline'} selected={!other && d.district === x} onPress={() => {
              setOther(false);
              d.set({ district: x });
            }} />
          ))}
          <Chip size="m" label={t('onboarding.otherDistrict')} tone={other ? 'inverse' : 'outline'} selected={other} onPress={() => {
            setOther(true);
            d.set({ district: '' });
          }} />
        </View>
        {other ? <Field value={d.district} onChangeText={(v) => d.set({ district: v })} placeholder="Ör. Sivrihisar" maxLength={40} /> : null}
      </View>
      <Field label={t('onboarding.neighbourhood')} value={d.neighbourhood} onChangeText={(v) => d.set({ neighbourhood: v })} placeholder="Hoşnudiye" maxLength={60} />
      <Field label={t('customer.addressLabel')} value={d.address} onChangeText={(v) => d.set({ address: v })} placeholder={t('customer.addressPlaceholder')} maxLength={300} />
      <Field label={t('customer.detailsLabel')} optional value={d.details} onChangeText={(v) => d.set({ details: v })} placeholder="Kat 3, Daire 7" maxLength={300} />
      <View style={[styles.privacy, { backgroundColor: theme.color.tint.brand }]}>
        <Icon name="lock" size={16} color={theme.color.ink.primary} weight="bold" />
        <Text variant="meta" style={{ flex: 1 }}>
          {t('customer.addressPrivacy')}
        </Text>
      </View>
    </FlowStep>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  privacy: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 14 },
});
