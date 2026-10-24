import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { Button } from './Button';
import { Icon } from './Icon';
import { riseIn, useBreathing } from './motion';
import { RouteMark } from './RouteMark';
import { Text } from './Text';

/** Placeholder in the shape of the content that is coming. Breathes, never shimmers. */
export function Skeleton({ width, height, radius = 6 }: { width: DimensionValue; height: number; radius?: number }) {
  const theme = useTheme();
  const motion = useMotion();
  const b = useBreathing(true, motion, 1400);
  const style = useAnimatedStyle(() => ({ opacity: interpolate(b.value, [0, 1], [1, 0.5]) }));
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: theme.color.surface.field }, style]} />;
}

export function TaskRowSkeleton() {
  const theme = useTheme();
  return (
    <View style={[styles.skRow, { paddingHorizontal: theme.layout.gutter }]} accessibilityLabel={t('feedback.loading')}>
      <Skeleton width={44} height={44} radius={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="45%" height={11} />
        <Skeleton width="28%" height={11} />
      </View>
    </View>
  );
}

/** One display sentence, one line of help, one action. */
export function EmptyState({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space[3], alignItems: 'flex-start' }}>
      <RouteMark width={104} />
      <Text variant="display.m" style={{ marginTop: theme.space[2] }}>
        {title}
      </Text>
      <Text variant="body" tone="secondary">
        {body}
      </Text>
      {action ? (
        <View style={{ marginTop: theme.space[2] }}>
          <Button level="secondary" size="m" layout="fit" label={action} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

/** Tinted callout, never a red box. Says what happened AND what happens next. */
export function Callout({ tone = 'attention', title, body, action, onAction }: { tone?: 'attention' | 'safety'; title: string; body: string; action?: string; onAction?: () => void }) {
  const theme = useTheme();
  const c = theme.color;
  const bg = tone === 'safety' ? c.tint.safety : c.tint.attention;
  const fg = tone === 'safety' ? c.safety.critical : c.status.attention;
  return (
    <View style={[styles.callout, { backgroundColor: bg, borderRadius: theme.radii.field, padding: theme.space[4] }]} accessibilityRole="alert">
      <Icon name={tone === 'safety' ? 'shield' : 'warningCircle'} size="m" color={fg} weight="fill" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="label">{title}</Text>
        <Text variant="meta" tone="secondary">
          {body}
        </Text>
        {action ? (
          <View style={{ marginLeft: -8, marginTop: 2 }}>
            <Button level="ghost" size="m" layout="fit" label={action} onPress={onAction} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Completion: route draws, dot arrives and becomes the check, then the words. */
export function SuccessMoment({ title, body, playKey = 0 }: { title: string; body: string; playKey?: number }) {
  const theme = useTheme();
  const motion = useMotion();
  return (
    <View style={{ gap: theme.space[3] }}>
      <RouteMark mode="play" playKey={playKey} width={124} />
      <Animated.View key={`t${playKey}`} entering={riseIn(motion, 1000, 16)} style={{ marginTop: theme.space[2] }}>
        <Text variant="display.xl" accessibilityRole="header">
          {title}
        </Text>
      </Animated.View>
      <Animated.View key={`b${playKey}`} entering={riseIn(motion, 1120, 10)}>
        <Text variant="body.l" tone="secondary">
          {body}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  skRow: { flexDirection: 'row', gap: 14, paddingVertical: 14 },
  callout: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
});
