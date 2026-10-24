import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutRectangle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useMotion, useTheme } from '@/theme';
import { Tactile, Text } from '@/ui';

/** Lab control: an indicator slides to the chosen option. */
export function Segmented<K extends string>({ options, value, onChange, accessibilityLabel }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; accessibilityLabel?: string }) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const [frames, setFrames] = useState<Record<string, LayoutRectangle>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  useEffect(() => {
    const f = frames[value];
    if (!f) return;
    x.set(withSpring(f.x, motion.spring('snappy')));
    w.set(withSpring(f.width, motion.spring('snappy')));
  }, [value, frames, motion, x, w]);
  const indicator = useAnimatedStyle(() => ({ width: w.value, transform: [{ translateX: x.value }], opacity: w.value ? 1 : 0 }));
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={[styles.wrap, { backgroundColor: c.surface.inverseRaised }]}>
      <Animated.View style={[styles.indicator, { backgroundColor: c.surface.panel }, indicator]} />
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Tactile
            key={o.key}
            haptic="select"
            pressScale={0.94}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onLayout={(e) => {
              const l = e.nativeEvent.layout;
              setFrames((p) => ({ ...p, [o.key]: l }));
            }}
            onPress={() => onChange(o.key)}
            style={styles.option}
          >
            <Text variant="label" style={{ color: on ? c.ink.primary : c.ink.onInverseSecondary, fontSize: 14 }}>
              {o.label}
            </Text>
          </Tactile>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  indicator: { position: 'absolute', top: 3, bottom: 3, left: 0, borderRadius: 9 },
  option: { minWidth: 34, height: 32, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' },
});
