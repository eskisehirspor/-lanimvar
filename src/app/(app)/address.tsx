import { router } from 'expo-router';
import { useState } from 'react';

import { FlowStep } from '@/features/app/FlowStep';
import { attempt, notify } from '@/features/app/Notice';
import { t } from '@/i18n';
import { rpc } from '@/lib/api/client';
import { refreshProfile } from '@/lib/auth/AuthProvider';
import { useAuth } from '@/lib/auth/store';
import { whereAmI } from '@/lib/location';
import { Button, CTA, Field } from '@/ui';

export default function EditAddress() {
  const p = useAuth((s) => s.profile);
  const [district, setDistrict] = useState(p?.home_district ?? '');
  const [neighbourhood, setNeighbourhood] = useState(p?.home_neighbourhood ?? '');
  const [address, setAddress] = useState(p?.home_address ?? '');
  const [details, setDetails] = useState(p?.home_details ?? '');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(p?.home_lat && p.home_lng ? { lat: p.home_lat, lng: p.home_lng } : null);
  const [busy, setBusy] = useState(false);
  const ok = district.trim().length >= 2 && address.trim().length >= 5;
  return (
    <FlowStep
      step={1}
      total={1}
      onBack={() => router.back()}
      title={t('profile.address')}
      sub={t('customer.addressPrivacy')}
      footer={
        <CTA
          label={t('admin.save')}
          icon="check"
          disabled={!ok}
          loading={busy}
          onPress={async () => {
            setBusy(true);
            const done = await attempt(async () => {
              await rpc('update_home_address', { p_district: district, p_neighbourhood: neighbourhood, p_address: address, p_details: details, p_lat: coords?.lat ?? null, p_lng: coords?.lng ?? null });
              await refreshProfile();
              return true;
            });
            setBusy(false);
            if (done) {
              notify(t('profile.addressSaved'));
              router.back();
            }
          }}
        />
      }
    >
      <Button
        level="secondary"
        icon="locate"
        label={t('customer.useLocation')}
        onPress={async () => {
          const here = await attempt(whereAmI);
          if (!here) return;
          setCoords({ lat: here.lat, lng: here.lng });
          if (here.street) setAddress(here.street);
        }}
      />
      <Field label={t('onboarding.district')} value={district} onChangeText={setDistrict} placeholder="Tepebaşı" maxLength={40} />
      <Field label={t('onboarding.neighbourhood')} value={neighbourhood} onChangeText={setNeighbourhood} placeholder="Hoşnudiye" maxLength={60} />
      <Field label={t('customer.addressLabel')} value={address} onChangeText={setAddress} maxLength={300} />
      <Field label={t('customer.detailsLabel')} optional value={details} onChangeText={setDetails} maxLength={300} />
    </FlowStep>
  );
}
