import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { formatTL, t } from '@/i18n';
import { useTheme } from '@/theme';
import { Chip, Icon, PriceDial, Rise, Tactile, Text } from '@/ui';

import { story, useFrame, type Point } from './frame';

/**
 * The listing the voice note became, on a sheet over a receding home. Every
 * field is already filled; the only real decision left is the price.
 */
export function Draft({ progress, ready, onCall }: { progress: SharedValue<number>; ready: boolean; onCall: (origin: Point) => void }) {
  const theme = useTheme();
  const f = useFrame();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [price, setPrice] = useState(story.price);
  const [cta, setCta] = useState({ y: 0, h: 0 });
  const sheetTop = f.top + 26;
  const sheetH = f.h - sheetTop;

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * (sheetH + 40) }] }));

  return (
    <Animated.View style={[styles.sheet, { top: sheetTop, height: sheetH, backgroundColor: c.surface.base, borderTopLeftRadius: 34, borderTopRightRadius: 34 }, theme.elevation.sheet, sheet]}>
      <View style={styles.handleZone}>
        <View style={[styles.handle, { backgroundColor: c.surface.hairlineStrong }]} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: g, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Rise play={ready} delay={80} style={styles.row}>
          <View style={styles.rowTight}>
            <View style={[styles.spark, { backgroundColor: c.brand.fill }]}>
              <Icon name="sparkle" size={14} color={c.brand.onFill} weight="fill" />
            </View>
            <Text variant="micro">{t('proto.draftKicker')}</Text>
          </View>
          <Text variant="label" tone="link">
            {t('proto.draftEdit')}
          </Text>
        </Rise>

        <Rise play={ready} delay={160}>
          <Text variant="display.l" style={{ marginTop: 14 }}>
            {t('proto.draftTitle')}
          </Text>
        </Rise>

        <Rise play={ready} delay={240} style={styles.chips}>
          <Chip icon="people" label={t('proto.needPeople')} />
          <Chip icon="stairs" label={t('proto.needStairs')} />
          <Chip icon="handTruck" label={t('proto.needTruck')} />
        </Rise>

        <Rise play={ready} delay={320} style={styles.tiles}>
          <View style={[styles.tile, { backgroundColor: c.surface.grouped }]}>
            <Text variant="micro" tone="tertiary">
              {t('proto.when')}
            </Text>
            <View style={styles.rowTight}>
              <Icon name="lightning" size={18} color={c.ink.primary} weight="fill" />
              <Text variant="title">{t('proto.whenValue')}</Text>
            </View>
          </View>
          <View style={[styles.tile, { backgroundColor: c.surface.grouped, flex: 1.5 }]}>
            <Text variant="micro" tone="tertiary">
              {t('proto.whereLabel')}
            </Text>
            <View style={styles.rowTight}>
              <Icon name="mapPin" size={18} color={c.ink.primary} weight="fill" />
              <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
                {t('proto.whereValue')}
              </Text>
            </View>
          </View>
        </Rise>
        <Rise play={ready} delay={360} style={[styles.rowTight, { marginTop: 10 }]}>
          <Icon name="lock" size={14} color={c.ink.tertiary} weight="bold" />
          <Text variant="meta" tone="tertiary" style={{ flexShrink: 1 }}>
            {t('proto.whereNote')}
          </Text>
        </Rise>

        <Rise play={ready} delay={440} style={{ marginTop: 26 }}>
          <Text variant="title" style={{ marginBottom: 6 }}>
            {t('proto.priceTitle')}
          </Text>
          <PriceDial value={price} onChange={setPrice} recommended={story.price} />
        </Rise>
        <Rise play={ready} delay={520} style={[styles.facts, { borderColor: c.surface.hairline }]}>
          <View style={styles.rowTight}>
            <Icon name="lightning" size={16} color={c.ink.primary} weight="fill" />
            <Text variant="label" style={{ fontSize: 14 }}>
              {t('proto.fastAccept', { min: story.acceptMin })}
            </Text>
          </View>
          <View style={styles.rowTight}>
            <Icon name="shield" size={16} color={c.status.success} weight="fill" />
            <Text variant="label" style={{ fontSize: 14 }}>
              {t('proto.payLater')}
            </Text>
          </View>
        </Rise>
      </ScrollView>

      <View style={{ paddingHorizontal: g, paddingBottom: f.bottom + 12, paddingTop: 8 }} onLayout={(e) => setCta({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}>
        <Tactile
          haptic="success"
          onPress={() => onCall({ x: f.w - g - 30, y: sheetTop + cta.y + 8 + 32 })}
          style={[styles.cta, { backgroundColor: c.surface.inverse }]}
          accessibilityLabel={t('proto.call')}
        >
          <View>
            <Text variant="button" tone="onInverse" style={{ fontSize: 17 }}>
              {t('proto.call')}
            </Text>
            <Text variant="meta" tone="onInverseSecondary">
              {formatTL(price)}
            </Text>
          </View>
          <View style={[styles.ctaDisc, { backgroundColor: c.brand.fill }]}>
            <Icon name="arrowRight" size={22} color={c.brand.onFill} weight="bold" />
          </View>
        </Tactile>
      </View>
    </Animated.View>
  );
}

/** Home sinks back while the sheet is up: the classic depth of a modal card. */
export function useRecede(progress: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    borderRadius: progress.value * 30,
    transform: [{ scale: 1 - progress.value * 0.07 }, { translateY: progress.value * 12 }],
  }));
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 12 },
  handle: { width: 38, height: 5, borderRadius: 2.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spark: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  facts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, paddingTop: 16, borderTopWidth: 1 },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 18 },
  tile: { flex: 1, borderRadius: 18, padding: 14, gap: 8 },
  cta: { height: 68, borderRadius: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 26, paddingRight: 8 },
  ctaDisc: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
