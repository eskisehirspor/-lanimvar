import { StyleSheet, View } from 'react-native';

import { FlowStep } from '@/features/app/FlowStep';
import { useDraft } from '@/features/onboarding/draft';
import { useFlow } from '@/features/onboarding/flow';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { ClayObject, CTA, Icon, Tactile, Text, type ClayObjectName } from '@/ui';

export default function RoleStep() {
  const role = useDraft((s) => s.role);
  const set = useDraft((s) => s.set);
  const flow = useFlow('role');
  return (
    <FlowStep step={flow.step} total={flow.total} title={t('onboarding.roleTitle')} sub={t('onboarding.roleSub')} footer={<CTA label={t('onboarding.next')} onPress={flow.next} />}>
      <RoleCard selected={role === 'customer'} onPress={() => set({ role: 'customer' })} title={t('onboarding.customer')} body={t('onboarding.customerSub')} object="bag" />
      <RoleCard selected={role === 'tasker'} onPress={() => set({ role: 'tasker' })} title={t('onboarding.tasker')} body={t('onboarding.taskerSub')} object="drill" />
    </FlowStep>
  );
}

function RoleCard({ selected, onPress, title, body, object }: { selected: boolean; onPress: () => void; title: string; body: string; object: ClayObjectName }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <Tactile
      haptic="select"
      pressScale={0.98}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      style={[styles.card, { backgroundColor: selected ? c.surface.inverse : c.surface.grouped, borderColor: selected ? c.surface.inverse : c.surface.hairline }]}
    >
      <View style={styles.flex}>
        <Text variant="display.m" tone={selected ? 'onInverse' : 'primary'}>
          {title}
        </Text>
        <Text variant="body" tone={selected ? 'onInverseSecondary' : 'secondary'}>
          {body}
        </Text>
      </View>
      <ClayObject name={object} size={92} />
      <View style={[styles.tick, { backgroundColor: selected ? c.brand.fill : 'transparent', borderColor: selected ? c.brand.fill : c.surface.hairlineStrong }]}>
        {selected ? <Icon name="check" size={14} color={c.brand.onFill} weight="bold" /> : null}
      </View>
    </Tactile>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 6 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 20, paddingRight: 12, borderRadius: 28, borderWidth: 1.5, minHeight: 150 },
  tick: { position: 'absolute', top: 16, right: 16, width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
