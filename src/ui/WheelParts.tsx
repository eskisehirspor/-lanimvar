import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme";

import { Text } from "./Text";

export const WHEEL_ITEM = 46;
export const VISIBLE = 5;

export interface WheelItem<T> {
  label: string;
  value: T;
}

export interface WheelPickerProps<T> {
  items: WheelItem<T>[];
  value: T;
  onChange: (v: T) => void;
  flex?: number;
  accessibilityLabel: string;
}

export function Rows<T extends string | number>({
  items,
  live,
  itemStyle,
}: {
  items: WheelItem<T>[];
  live: number;
  itemStyle?: object;
}) {
  return (
    <>
      {items.map((it, i) => {
        const d = Math.abs(i - live);
        return (
          <View key={String(it.value)} style={[styles.item, itemStyle]}>
            <Text
              variant={d === 0 ? "title" : "body.l"}
              tone={d === 0 ? "primary" : "tertiary"}
              style={{
                opacity: d === 0 ? 1 : d === 1 ? 0.7 : 0.35,
                fontSize: d === 0 ? 20 : 17,
              }}
            >
              {it.label}
            </Text>
          </View>
        );
      })}
    </>
  );
}

export function Column<T>({
  children,
  flex,
  accessibilityLabel,
  items,
  index,
}: {
  children: React.ReactNode;
  live: number;
  items: WheelItem<T>[];
  flex: number;
  accessibilityLabel: string;
  index: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{ flex, height: WHEEL_ITEM * VISIBLE }}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: items[index]?.label }}
    >
      {children}
      <View
        pointerEvents="none"
        style={[
          styles.band,
          {
            top: ((VISIBLE - 1) / 2) * WHEEL_ITEM,
            borderColor: theme.color.surface.hairlineStrong,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: { height: WHEEL_ITEM, alignItems: "center", justifyContent: "center" },
  band: {
    position: "absolute",
    left: 4,
    right: 4,
    height: WHEEL_ITEM,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
  },
});
