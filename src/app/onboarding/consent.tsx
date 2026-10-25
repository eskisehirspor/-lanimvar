import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Check } from '@/features/app/Check';
import { FlowStep } from '@/features/app/FlowStep';
import { attempt } from '@/features/app/Notice';
import { LEGAL_VERSION } from '@/features/legal/documents';
import { birthDateIso, useDraft } from '@/features/onboarding/draft';
import { useFlow } from '@/features/onboarding/flow';
import { t } from '@/i18n';
import { rpc } from '@/lib/api/client';
import { refreshProfile } from '@/lib/auth/AuthProvider';
import { CTA, Divider, Text } from '@/ui';

/** Consents (versioned), then everything is submitted at once. */
export default function ConsentStep() {
  const d = useDraft();
  const flow = useFlow('consent');
  const tasker = d.role === 'tasker';
  const [terms, setTerms] = useState(false);
  const [taskerTerms, setTaskerTerms] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const [offPlatform, setOffPlatform] = useState(false);
  const [criminal, setCriminal] = useState(false);
  const [identity, setIdentity] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const ready = terms && kvkk && offPlatform && (!tasker || (taskerTerms && criminal && identity));

  const submit = async () => {
    setBusy(true);
    await attempt(async () => {
      await rpc('complete_onboarding', {
        p_first_name: d.firstName.trim(),
        p_last_name: d.lastName.trim(),
        p_birth_date: birthDateIso(d.birth),
        p_role: d.role,
        p_district: d.district.trim(),
        p_neighbourhood: d.neighbourhood.trim(),
        p_address: d.address.trim(),
        p_details: d.details.trim(),
        p_lat: d.lat,
        p_lng: d.lng,
        p_accept_terms: terms,
        p_accept_kvkk: kvkk,
        p_legal_version: LEGAL_VERSION,
        p_marketing: marketing,
      });
      if (tasker) {
        await rpc('submit_tasker_application', {
          p_national_id: d.nationalId,
          p_id_front_path: d.idFrontPath,
          p_selfie_path: d.selfiePath,
          p_categories: d.categories,
          p_has_vehicle: d.hasVehicle,
          p_bio: d.bio,
          p_criminal_record_declared: criminal,
          p_identity_consent: identity,
        });
      }
      await refreshProfile();
    });
    setBusy(false);
  };

  return (
    <FlowStep step={flow.step} total={flow.total} onBack={flow.back} title={t('onboarding.consentTitle')} sub={t('onboarding.consentSub')} footer={<CTA label={t('onboarding.submit')} tone="brand" icon="check" disabled={!ready} loading={busy} onPress={submit} />}>
      <View style={{ gap: 16 }}>
        <Check checked={terms} onToggle={() => setTerms(!terms)} label={t('onboarding.acceptTerms')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/terms')} />
        {tasker ? <Check checked={taskerTerms} onToggle={() => setTaskerTerms(!taskerTerms)} label={t('onboarding.acceptTasker')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/tasker')} /> : null}
        <Check checked={kvkk} onToggle={() => setKvkk(!kvkk)} label={t('onboarding.acceptKvkk')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/privacy')} />
        <Check checked={offPlatform} onToggle={() => setOffPlatform(!offPlatform)} label={t('onboarding.acceptOffPlatform')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/community')} />
        {tasker ? (
          <>
            <Divider />
            <Check checked={criminal} onToggle={() => setCriminal(!criminal)} label={t('onboarding.criminal')} />
            <Check checked={identity} onToggle={() => setIdentity(!identity)} label={t('onboarding.identityConsent')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/consent')} />
          </>
        ) : null}
        <Divider />
        <Check checked={marketing} onToggle={() => setMarketing(!marketing)} label={t('onboarding.marketing')} readLabel={t('onboarding.read')} onRead={() => router.push('/legal/consent')} />
        {tasker ? (
          <Text variant="meta" tone="tertiary">
            {t('onboarding.taskerNote')}
          </Text>
        ) : null}
      </View>
    </FlowStep>
  );
}
