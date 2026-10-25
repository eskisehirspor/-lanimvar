import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';

import { useHaptics } from '@/lib/haptics';
import { useTheme } from '@/theme';

import { Text } from './Text';

const ITEM = 46;
const VISIBLE = 5;

export interface WheelItem<T> {
  label: string;
  value: T;
}

/**
 * A scrolling wheel column (iOS picker feel on every platform): items snap to
 * the centre band, a selection tick fires on each step, far rows fade.
 */
export function WheelPicker<T extends string | number>({ items, value, onChange, flex = 1, accessibilityLabel }: { items: WheelItem<T>[]; value: T; onChange: (v: T) => void; flex?: number; accessibilityLabel: string }) {
  const theme = useTheme();
  const fire = useHaptics();
  const ref = useRef<ScrollViewInstance>(null);
  const index = Math.max(0, items.findIndex((i) => i.value === value));
  const [live, setLive] = useState(index);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pad = ((VISIBLE - 1) / 2) * ITEM;

  // Keep the wheel on the value when it changes from outside (e.g. day clamped by month).
  useEffect(() => {
    ref.current?.scrollTo({ y: index * ITEM, animated: false });
  }, [index, items.length]);

  const commit = (y: number) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM)));
    ref.current?.scrollTo({ y: i * ITEM, animated: true });
    const item = items[i];
    if (item && item.value !== value) onChange(item.value);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM)));
    if (i !== live) {
      setLive(i);
      fire('select');
    }
    // Web has no momentum-end event: settle after the scroll goes quiet.
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => commit(y), 140);
  };

  return (
    <View style={{ flex, height: ITEM * VISIBLE }} accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel} accessibilityValue={{ text: items[index]?.label }}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentOffset={{ x: 0, y: index * ITEM }}
        contentContainerStyle={{ paddingVertical: pad }}
        nestedScrollEnabled
      >
        {items.map((it, i) => {
          const d = Math.abs(i - live);
          return (
            <View key={String(it.value)} style={styles.item}>
              <Text
                variant={d === 0 ? 'title' : 'body.l'}
                tone={d === 0 ? 'primary' : 'tertiary'}
                style={{ opacity: d === 0 ? 1 : d === 1 ? 0.7 : 0.35, fontSize: d === 0 ? 20 : 17 }}
                onPress={() => {
                  ref.current?.scrollTo({ y: i * ITEM, animated: true });
                  onChange(it.value);
                }}
              >
                {it.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View pointerEvents="none" style={[styles.band, { top: pad, borderColor: theme.color.surface.hairlineStrong }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: { height: ITEM, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', left: 4, right: 4, height: ITEM, borderTopWidth: 1.5, borderBottomWidth: 1.5 },
});
