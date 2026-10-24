import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';

import { useHaptics } from '@/lib/haptics';
import { formatTL, groupThousands, t } from '@/i18n';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

const SPACING = 11;

export interface PriceDialProps {
  value: number;
  onChange: (v: number) => void;
  recommended: number;
  min?: number;
  max?: number;
  step?: number;
  floorRatio?: number;
}

/**
 * Price as a physical dial: a ruler that glides under a fixed needle with
 * momentum, a tick of haptics every 50 TL, the recommendation marked on the
 * scale. The number above fills the width. Low prices warn, never block.
 */
export function PriceDial({ value, onChange, recommended, min = 200, max = 2500, step = 10, floorRatio = 0.8 }: PriceDialProps) {
  const theme = useTheme();
  const fire = useHaptics();
  const c = theme.color;
  const ref = useRef<ScrollViewInstance>(null);
  const [width, setWidth] = useState(0);
  const last = useRef(value);
  const count = Math.round((max - min) / step) + 1;
  const low = value < recommended * floorRatio;

  const onScroll = (x: number) => {
    const v = Math.max(min, Math.min(max, min + Math.round(x / SPACING) * step));
    if (v === last.current) return;
    if (Math.floor(v / 50) !== Math.floor(last.current / 50)) fire('select');
    last.current = v;
    onChange(v);
  };

  return (
    <View style={{ gap: theme.space[4] }}>
      <View style={styles.center}>
        <View style={styles.amount}>
          <Text variant="numeric.mega" style={{ fontVariant: ['tabular-nums'] }}>
            {groupThousands(value)}
          </Text>
          <Text variant="display.m" tone="tertiary" style={{ marginBottom: theme.type['numeric.mega'].lineHeight * 0.12, marginLeft: 6 }}>
            TL
          </Text>
        </View>
        <View style={styles.hint}>
          {low ? (
            <View style={styles.row}>
              <Icon name="warningCircle" size="s" color={c.status.attention} weight="fill" />
              <Text variant="meta" tone="attention" emphasis>
                {t('price.belowFloor')}
              </Text>
            </View>
          ) : (
            <Text variant="meta" tone="tertiary">{`${t('price.recommended')} ${formatTL(recommended)} · Eskişehir’de benzer işler`}</Text>
          )}
        </View>
      </View>

      <View
        style={styles.dial}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width ? (
          <ScrollView
            ref={ref}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SPACING}
            decelerationRate="fast"
            scrollEventThrottle={16}
            contentOffset={{ x: ((value - min) / step) * SPACING, y: 0 }}
            // contentOffset is iOS-only; position explicitly once content exists.
            onContentSizeChange={() => ref.current?.scrollTo({ x: ((last.current - min) / step) * SPACING, animated: false })}
            onScroll={(e) => onScroll(e.nativeEvent.contentOffset.x)}
            contentContainerStyle={{ paddingHorizontal: width / 2, alignItems: 'flex-end', height: 76 }}
            accessibilityRole="adjustable"
            accessibilityLabel={`${t('price.budget')} ${formatTL(value)}`}
          >
            {Array.from({ length: count }, (_, i) => {
              const v = min + i * step;
              const major = v % 100 === 0;
              const mid = v % 50 === 0;
              const isRec = v === recommended;
              return (
                <View key={v} style={[styles.tickWrap, { width: SPACING }]}>
                  {isRec ? <View style={[styles.rec, { backgroundColor: c.brand.dot, borderColor: c.brand.dotOutline }]} /> : null}
                  {major ? (
                    <Text variant="tab" tone="tertiary" style={styles.tickLabel}>
                      {groupThousands(v)}
                    </Text>
                  ) : null}
                  <View style={{ width: major ? 2 : 1.5, height: major ? 30 : mid ? 22 : 14, borderRadius: 1, backgroundColor: major ? c.ink.secondary : c.surface.hairlineStrong }} />
                </View>
              );
            })}
          </ScrollView>
        ) : null}
        <View pointerEvents="none" style={[styles.needle, { left: width / 2 - 2 }]}>
          <View style={[styles.needleHead, { backgroundColor: c.brand.dot, borderColor: c.brand.dotOutline }]} />
          <View style={[styles.needleLine, { backgroundColor: c.ink.primary }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 4 },
  amount: { flexDirection: 'row', alignItems: 'flex-end' },
  hint: { minHeight: 20, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dial: { height: 96, justifyContent: 'flex-end' },
  tickWrap: { alignItems: 'center', justifyContent: 'flex-end', height: 76, overflow: 'visible' },
  tickLabel: { position: 'absolute', top: 6, left: -30, right: -30, textAlign: 'center' },
  rec: { position: 'absolute', top: 2, width: 9, height: 9, borderRadius: 4.5, borderWidth: 1.5 },
  needle: { position: 'absolute', bottom: 0, width: 4, alignItems: 'center' },
  needleHead: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, marginBottom: 2 },
  needleLine: { width: 4, height: 50, borderRadius: 2 },
});
