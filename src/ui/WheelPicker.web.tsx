import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";

import {
  Column,
  Rows,
  WHEEL_ITEM,
  type WheelItem,
  type WheelPickerProps,
} from "./WheelParts";

export type { WheelItem };

/**
 * Web wheel: the browser's own scroll snapping does the physics (touch, trackpad,
 * mouse wheel). The value follows the centred row as it settles; nothing is
 * scrolled programmatically while the person is scrolling.
 */
export function WheelPicker<T extends string | number>({
  items,
  value,
  onChange,
  flex = 1,
  accessibilityLabel,
}: WheelPickerProps<T>) {
  const ref = useRef<ScrollViewInstance>(null);
  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );
  const [live, setLive] = useState(index);
  const own = useRef(false);

  useEffect(() => {
    // Only external changes (clamping, first render) move the wheel.
    if (own.current) {
      own.current = false;
      return;
    }
    ref.current?.scrollTo({ y: index * WHEEL_ITEM, animated: false });
  }, [index, items.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(
      0,
      Math.min(
        items.length - 1,
        Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM),
      ),
    );
    if (i === live) return;
    setLive(i);
    const item = items[i];
    if (item && item.value !== value) {
      own.current = true;
      onChange(item.value);
    }
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
        scrollEventThrottle={16}
        onScroll={onScroll}
        style={
          {
            scrollSnapType: "y mandatory",
            overscrollBehavior: "contain",
          } as object
        }
        contentContainerStyle={{ paddingVertical: 2 * WHEEL_ITEM }}
      >
        <Rows
          items={items}
          live={live}
          itemStyle={{ scrollSnapAlign: "center" }}
        />
      </ScrollView>
    </Column>
  );
}
