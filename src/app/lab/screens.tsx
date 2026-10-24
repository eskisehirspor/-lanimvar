import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { labScreens } from '@/features/lab/screens/compositions';
import { useLab } from '@/features/lab/store';
import { useMotion, useTheme } from '@/theme';
import { Icon, Tactile, Text } from '@/ui';

/**
 * Full-screen compositions, swiped like a deck. Static mocks made only of
 * product primitives. The lab pill fades away so it never covers a screen;
 * starting a swipe brings it back.
 */
export default function LabScreens() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const lab = useLab();
  const [page, setPage] = useState(0);
  const [shownAt, setShownAt] = useState(0);
  const o = useSharedValue(1);
  const current = labScreens[page]!;

  useEffect(() => {
    o.set(1);
    if (lab.dockOpen) return;
    o.set(withDelay(2600, withTiming(0, motion.timing(400))));
  }, [shownAt, lab.dockOpen, motion, o]);

  const pill = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <View style={styles.flex}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => setShownAt(Date.now())}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {labScreens.map(({ key, Component }) => (
          <View key={key} style={{ width, height }}>
            <Component />
          </View>
        ))}
      </ScrollView>
      <Animated.View style={[styles.pill, theme.elevation.dock, { top: insets.top + 64, backgroundColor: c.surface.inverse }, pill]}>
        <Tactile haptic="select" onPress={() => router.back()} accessibilityLabel="Laboratuvara dön" style={styles.pillBtn}>
          <Icon name="x" size={16} color={c.ink.onInverse} weight="bold" />
        </Tactile>
        <Text variant="label" tone="onInverse" style={{ fontSize: 14 }}>{`${page + 1}/${labScreens.length}`}</Text>
        <Text variant="meta" tone="onInverseSecondary" numberOfLines={1} style={{ maxWidth: 170 }}>
          {current.title}
        </Text>
        <Tactile haptic="select" onPress={() => lab.set({ dockOpen: !lab.dockOpen })} accessibilityLabel="Ayarlar" style={styles.pillBtn}>
          <Icon name="sliders" size={16} color={c.ink.onInverse} weight="bold" />
        </Tactile>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pill: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: 4, borderRadius: 22 },
  pillBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
