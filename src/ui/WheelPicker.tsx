import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";

import { useHaptics } from "@/lib/haptics";

import {
  Column,
  Rows,
  VISIBLE,
  WHEEL_ITEM,
  type WheelItem,
  type WheelPickerProps,
} from "./WheelParts";

export type { WheelItem };

/**
 * A scrolling wheel column (native). The OS snaps rows to the centre band; the
 * value is committed only when the scroll has fully stopped, so nothing ever
 * fights the finger. Web uses WheelPicker.web.tsx (CSS scroll snap).
 */
export function WheelPicker<T extends string | number>({
  items,
  value,
  onChange,
  flex = 1,
  accessibilityLabel,
}: WheelPickerProps<T>) {
  const fire = useHaptics();
  const ref = useRef<ScrollViewInstance>(null);
  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );
  const [live, setLive] = useState(index);
  const dragging = useRef(false);

  // Follow outside changes (e.g. the day clamped by a shorter month) when idle.
  useEffect(() => {
    if (!dragging.current)
      ref.current?.scrollTo({ y: index * WHEEL_ITEM, animated: false });
  }, [index, items.length]);

  const at = (y: number) =>
    Math.max(0, Math.min(items.length - 1, Math.round(y / WHEEL_ITEM)));
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = at(e.nativeEvent.contentOffset.y);
    if (i !== live) {
      setLive(i);
      fire("select");
    }
  };
  const commit = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    dragging.current = false;
    const item = items[at(e.nativeEvent.contentOffset.y)];
    if (item && item.value !== value) onChange(item.value);
  };

  return (
    <Column
      live={live}
      items={items}
      flex={flex}
      accessibilityLabel={accessibilityLabel}
      index={index}
    >
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollBeginDrag={() => (dragging.current = true)}
        onMomentumScrollEnd={commit}
        onScrollEndDrag={(e) => {
          // No momentum (slow release): the drag end is the stop.
          if (Math.abs(e.nativeEvent.velocity?.y ?? 0) < 0.05) commit(e);
        }}
        contentOffset={{ x: 0, y: index * WHEEL_ITEM }}
        contentContainerStyle={{
          paddingVertical: ((VISIBLE - 1) / 2) * WHEEL_ITEM,
        }}
        nestedScrollEnabled
      >
        <Rows items={items} live={live} />
      </ScrollView>
    </Column>
  );
}
