import { useState } from 'react';
import { Switch, View } from 'react-native';

import { attempt } from '@/features/app/Notice';
import { Card, Input, Page } from '@/features/admin/ui';
import { t } from '@/i18n';
import { savePricing, useAdminPricing } from '@/lib/api/admin';
import type { PricingRule } from '@/lib/api/types';
import { Button, Text } from '@/ui';

export default function Pricing() {
  const q = useAdminPricing();
  return (
    <Page title={t('admin.nav.pricing')}>
      {(q.data ?? []).map((r) => (
        <RuleEditor key={r.id} rule={r} />
      ))}
      <RuleEditor rule={{ id: 'new', category: '', label: '', recommended_price: 500, min_price: 200, max_price: 3000, active: true, section: 'daily', sort: 999, max_people: 1 }} isNew />
    </Page>
  );
}

function RuleEditor({ rule, isNew }: { rule: PricingRule; isNew?: boolean }) {
  const [r, setR] = useState(rule);
  const num = (v: string) => Number(v.replace(/\D/g, '')) || 0;
  const valid = r.category.trim().length > 1 && r.label.trim().length > 1 && r.min_price >= 0 && r.min_price <= r.recommended_price && r.recommended_price <= r.max_price;
  return (
    <Card>
      {isNew ? <Text variant="title">{t('admin.newRule')}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={r.category} onChangeText={(v) => setR({ ...r, category: v.toLowerCase() })} placeholder={t('admin.category')} width={130} />
        <Input value={r.label} onChangeText={(v) => setR({ ...r, label: v })} placeholder={t('admin.label')} width={170} />
        <Input numeric value={String(r.min_price)} onChangeText={(v) => setR({ ...r, min_price: num(v) })} placeholder={t('admin.min')} width={90} />
        <Input numeric value={String(r.recommended_price)} onChangeText={(v) => setR({ ...r, recommended_price: num(v) })} placeholder={t('admin.recommended')} width={90} />
        <Input numeric value={String(r.max_price)} onChangeText={(v) => setR({ ...r, max_price: num(v) })} placeholder={t('admin.max')} width={90} />
        <Text variant="meta">{t('admin.active')}</Text>
        <Switch value={r.active} onValueChange={(v) => setR({ ...r, active: v })} />
        <Button size="m" layout="fit" label={t('admin.save')} disabled={!valid} onPress={() => attempt(() => savePricing({ category: r.category.trim(), label: r.label.trim(), recommended_price: r.recommended_price, min_price: r.min_price, max_price: r.max_price, active: r.active, section: r.section, max_people: r.max_people }))} />
      </View>
    </Card>
  );
}
