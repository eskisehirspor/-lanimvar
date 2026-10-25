import { StyleSheet, View } from 'react-native';

import { FlowStep } from '@/features/app/FlowStep';
import { useDraft, validTckn } from '@/features/onboarding/draft';
import { useFlow } from '@/features/onboarding/flow';
import { PhotoSlot } from '@/features/onboarding/PhotoSlot';
import { t } from '@/i18n';
import { usePricing } from '@/lib/api/customer';
import type { CategorySection } from '@/lib/api/types';
import { uploadIdentityPhoto } from '@/lib/api/trust';
import { useAuth } from '@/lib/auth/store';
import { Chip, CTA, Field, Text } from '@/ui';

const order: CategorySection[] = ['daily', 'social', 'wait', 'pets', 'extra'];

/** The application the safety team reviews: identity, what you do, and your declarations (on the next step). */
export default function TaskerStep() {
  const d = useDraft();
  const uid = useAuth((s) => s.session?.user.id);
  const flow = useFlow('tasker');
  const rules = usePricing().data ?? [];
  const idOk = validTckn(d.nationalId);
  const ok = idOk && d.categories.length > 0 && !!d.idFrontPath && !!d.selfiePath;
  const toggle = (cat: string) => d.set({ categories: d.categories.includes(cat) ? d.categories.filter((x) => x !== cat) : [...d.categories, cat] });

  return (
    <FlowStep step={flow.step} total={flow.total} onBack={flow.back} title={t('onboarding.applicationTitle')} sub={t('onboarding.applicationSub')} footer={<CTA label={t('onboarding.next')} disabled={!ok} onPress={flow.next} />}>
      <Field
        label={t('onboarding.nationalId')}
        value={d.nationalId}
        onChangeText={(v) => d.set({ nationalId: v.replace(/\D/g, '').slice(0, 11) })}
        keyboardType="number-pad"
        maxLength={11}
        leadingIcon="shield"
        error={d.nationalId.length === 11 && !idOk ? t('onboarding.nationalIdInvalid') : undefined}
      />
      <View style={styles.photos}>
        <PhotoSlot
          label={t('onboarding.idFront')}
          icon="ticket"
          preview={d.idFrontPreview}
          onShot={async (uri) => {
            if (!uid) return;
            const path = await uploadIdentityPhoto(uid, uri, 'id-front');
            d.set({ idFrontPath: path, idFrontPreview: uri });
          }}
        />
        <PhotoSlot
          label={t('onboarding.selfie')}
          icon="user"
          front
          preview={d.selfiePreview}
          onShot={async (uri) => {
            if (!uid) return;
            const path = await uploadIdentityPhoto(uid, uri, 'selfie');
            d.set({ selfiePath: path, selfiePreview: uri });
          }}
        />
      </View>

      <Text variant="title" style={{ marginTop: 8 }}>
        {t('onboarding.categoriesTitle')}
      </Text>
      {order.map((section) => {
        const list = rules.filter((r) => r.section === section);
        if (!list.length) return null;
        return (
          <View key={section} style={{ gap: 8 }}>
            <Text variant="micro" tone="tertiary">
              {t(`sections.${section}`)}
            </Text>
            <View style={styles.chips}>
              {list.map((r) => {
                const on = d.categories.includes(r.category);
                return <Chip key={r.id} size="m" label={r.label} icon={on ? 'check' : undefined} tone={on ? 'inverse' : 'outline'} selected={on} onPress={() => toggle(r.category)} />;
              })}
            </View>
          </View>
        );
      })}

      <View style={styles.chips}>
        <Chip size="m" icon="car" label={t('onboarding.vehicle')} tone={d.hasVehicle ? 'inverse' : 'outline'} selected={d.hasVehicle} onPress={() => d.set({ hasVehicle: true })} />
        <Chip size="m" label={t('onboarding.noVehicle')} tone={!d.hasVehicle ? 'inverse' : 'outline'} selected={!d.hasVehicle} onPress={() => d.set({ hasVehicle: false })} />
      </View>
      <Field label={t('onboarding.bio')} optional multiline counter maxLength={280} value={d.bio} onChangeText={(v) => d.set({ bio: v })} placeholder={t('onboarding.bioPlaceholder')} />
    </FlowStep>
  );
}

const styles = StyleSheet.create({
  photos: { flexDirection: 'row', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
