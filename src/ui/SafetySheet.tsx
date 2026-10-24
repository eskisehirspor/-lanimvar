import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { t } from '@/i18n';
import { durations, useMotion, useTheme } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Chip } from './Chip';
import { riseIn } from './motion';
import { Sheet } from './Sheet';
import { Tactile } from './Tactile';
import { Text } from './Text';

export type SafetyExpanded = 'none' | 'issue' | 'leave';
type IssueReason = 'behaviour' | 'scope' | 'environment' | 'other';

export interface SafetySheetProps {
  visible: boolean;
  onClose: () => void;
  onSafe?: () => void;
  onIssue?: (reason: IssueReason) => void;
  onLeave?: () => void;
  onEmergency: (origin: { x: number; y: number }) => void;
  initialExpanded?: SafetyExpanded;
  initialSafeAt?: string;
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Four actions, ordered by frequency, escalating in weight. Everything is
 * logged and the copy says so; red appears in one place only — emergency.
 */
export function SafetySheet({ visible, onClose, onSafe, onIssue, onLeave, onEmergency, initialExpanded = 'none', initialSafeAt }: SafetySheetProps) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [expanded, setExpanded] = useState<SafetyExpanded>(initialExpanded);
  const [safeAt, setSafeAt] = useState<string | undefined>(initialSafeAt);
  const [issueSent, setIssueSent] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setExpanded(initialExpanded);
      setSafeAt(initialSafeAt);
      setIssueSent(false);
    }
  }
  const reasons: IssueReason[] = ['behaviour', 'scope', 'environment', 'other'];

  return (
    <Sheet visible={visible} onClose={onClose} accessibilityLabel={t('safety.sheetTitle')}>
      <View style={{ paddingHorizontal: g, paddingTop: theme.space[2], paddingBottom: theme.space[3], flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[styles.badge, { backgroundColor: c.surface.field }]}>
          <Icon name="shield" size="m" weight="fill" />
        </View>
        <Text variant="display.m" accessibilityRole="header">
          {t('safety.sheetTitle')}
        </Text>
      </View>
      <View style={{ marginHorizontal: g, borderRadius: theme.radii.panel, backgroundColor: c.surface.grouped, overflow: 'hidden' }}>
        <Row order={0} icon="checkCircle" title={t('safety.safe')} hint={safeAt ? t('safety.safeDone', { time: safeAt }) : t('safety.safeHint')} done={Boolean(safeAt)} onPress={() => { setSafeAt(nowHHMM()); onSafe?.(); }} />
        <Row order={1} icon="warningCircle" title={t('safety.issue')} hint={issueSent ? t('safety.issueSent') : t('safety.issueHint')} done={issueSent} onPress={() => setExpanded(expanded === 'issue' ? 'none' : 'issue')} />
        {expanded === 'issue' && !issueSent ? (
          <Animated.View entering={riseIn(motion, 0, 6)} style={[styles.reasons, { paddingHorizontal: 16 }]}>
            {reasons.map((r) => (
              <Chip key={r} size="m" tone="outline" label={t(`safety.issueReasons.${r}`)} onPress={() => { setIssueSent(true); setExpanded('none'); onIssue?.(r); }} />
            ))}
          </Animated.View>
        ) : null}
        <Row order={2} icon="signOut" title={t('safety.leave')} hint={t('safety.leaveHint')} onPress={() => setExpanded(expanded === 'leave' ? 'none' : 'leave')} last />
        {expanded === 'leave' ? (
          <Animated.View entering={riseIn(motion, 0, 6)} style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button level="secondary" label={t('safety.leaveConfirm')} onPress={onLeave} />
          </Animated.View>
        ) : null}
      </View>
      <Animated.View entering={riseIn(motion, durations.listStagger * 3, 10)} style={{ paddingHorizontal: g, paddingTop: theme.space[5], gap: theme.space[3] }}>
        <Tactile
          haptic="critical"
          accessibilityLabel={t('safety.emergency')}
          onPress={(e) => onEmergency({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
          style={[styles.emergency, { backgroundColor: c.safety.critical, borderRadius: theme.radii.button, height: theme.layout.buttonHeight }]}
        >
          <Icon name="siren" size="m" color={c.safety.onCritical} weight="fill" />
          <Text variant="button" tone="onCritical">
            {t('safety.emergency')}
          </Text>
        </Tactile>
        <Text variant="meta" tone="tertiary" align="center">
          {t('safety.footer')}
        </Text>
      </Animated.View>
    </Sheet>
  );
}

function Row({ order, icon, title, hint, onPress, done, last }: { order: number; icon: IconName; title: string; hint: string; onPress: () => void; done?: boolean; last?: boolean }) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  return (
    <Animated.View entering={riseIn(motion, durations.listStagger * order, 10)}>
      <Tactile onPress={onPress} pressScale={1} pressDim={0.35} haptic={done ? null : 'select'} accessibilityLabel={`${title}. ${hint}`} style={[styles.row, { paddingHorizontal: 16, paddingVertical: 14 }]}>
        <View style={[styles.iconWrap, { backgroundColor: done ? c.tint.success : c.surface.panel }]}>
          <Icon name={done ? 'check' : icon} size="m" color={done ? c.status.success : c.ink.primary} weight={done ? 'bold' : 'regular'} />
        </View>
        <View style={[styles.flex, !last && { borderBottomWidth: 0 }]}>
          <Text variant="title">{title}</Text>
          <Animated.View key={hint} entering={riseIn(motion, 0, 4)}>
            <Text variant="meta" tone={done ? 'success' : 'tertiary'} emphasis={done}>
              {hint}
            </Text>
          </Animated.View>
        </View>
        <Icon name="caretRight" size="s" color={c.ink.tertiary} weight="bold" />
      </Tactile>
      {!last ? <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: c.surface.hairline, marginLeft: 72 }} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 1 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 14 },
  emergency: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
});
