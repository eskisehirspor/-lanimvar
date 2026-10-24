import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import type { Role } from '@/lib/session/store';
import { t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';

import { Avatar } from './Avatar';
import { Icon, type IconName } from './Icon';
import { LiveDot } from './LiveDot';
import { Tactile } from './Tactile';
import { Text } from './Text';

export type TabKey = 'home' | 'tasks' | 'history' | 'profile';

const tabsByRole: Record<Role, { key: TabKey; icon: IconName }[]> = {
  customer: [
    { key: 'home', icon: 'home' },
    { key: 'tasks', icon: 'tasks' },
    { key: 'profile', icon: 'user' },
  ],
  tasker: [
    { key: 'home', icon: 'home' },
    { key: 'history', icon: 'history' },
    { key: 'profile', icon: 'user' },
  ],
};

export interface TabBarProps {
  role: Role;
  active: TabKey;
  onSelect: (key: TabKey) => void;
  /** A live task floats above the bar on every tab: one tap back to it. */
  live?: { title: string; sub: string; initials?: string };
  onLivePress?: () => void;
  bottomInset?: number;
}

/** Three tabs. The active tab carries the brand İ-dot, which glides between tabs. */
export function TabBar({ role, active, onSelect, live, onLivePress, bottomInset = 0 }: TabBarProps) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const tabs = tabsByRole[role];
  const [width, setWidth] = useState(0);
  const index = Math.max(0, tabs.findIndex((x) => x.key === active));
  const x = useSharedValue(0);

  useEffect(() => {
    if (!width) return;
    const target = (width / tabs.length) * (index + 0.5) - 3;
    x.set(motion.reduced ? withTiming(target, motion.fade()) : withSpring(target, motion.spring('snappy')));
  }, [index, width, tabs.length, motion, x]);

  const dot = useAnimatedStyle(() => ({ opacity: width ? 1 : 0, transform: [{ translateX: x.value }] }));

  return (
    <View>
      {live ? (
        <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
          <Tactile onPress={onLivePress} pressScale={0.98} accessibilityLabel={`${live.title}, ${live.sub}`} style={[styles.live, { backgroundColor: c.surface.inverse, borderRadius: theme.radii.panel }, theme.elevation.dock]}>
            {live.initials ? <Avatar initials={live.initials} size={36} tone="brand" /> : <LiveDot size={10} onInverse />}
            <View style={styles.flex}>
              <Text variant="label" tone="onInverse" numberOfLines={1}>
                {live.title}
              </Text>
              <View style={styles.liveSub}>
                <LiveDot size={6} onInverse />
                <Text variant="meta" tone="onInverseSecondary" numberOfLines={1}>
                  {live.sub}
                </Text>
              </View>
            </View>
            <Icon name="caretRight" size="s" color={c.ink.onInverseSecondary} weight="bold" />
          </Tactile>
        </View>
      ) : null}
      <View style={[styles.bar, { backgroundColor: c.surface.panel, borderTopColor: c.surface.hairline, paddingBottom: bottomInset }]}>
        <View style={styles.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityRole="tablist">
          <Animated.View style={[styles.dot, { backgroundColor: c.brand.dot, borderColor: c.brand.dotOutline }, dot]} />
          {tabs.map((tab) => {
            const on = tab.key === active;
            return (
              <Tactile
                key={tab.key}
                onPress={() => onSelect(tab.key)}
                haptic="select"
                pressScale={0.92}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t(`tabs.${tab.key}`)}
                style={[styles.tab, { height: theme.layout.tabBarHeight }]}
              >
                <Icon name={tab.icon} size="l" color={on ? c.ink.primary : c.ink.tertiary} weight={on ? 'fill' : 'regular'} />
                <Text variant="tab" tone={on ? 'primary' : 'tertiary'}>
                  {t(`tabs.${tab.key}`)}
                </Text>
              </Tactile>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  live: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  liveSub: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flex: { flex: 1, gap: 1 },
  bar: { borderTopWidth: StyleSheet.hairlineWidth * 2 },
  row: { flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 4 },
  dot: { position: 'absolute', top: 4, left: 0, width: 6, height: 6, borderRadius: 3, borderWidth: 1 },
});
