import { useEffect, useEffectEvent } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { t } from '@/i18n';
import { useMotion, useTheme } from '@/theme';
import { Avatar, easeReveal, Grain, Icon, Rise, RotatingBadge, Text } from '@/ui';

import { story, useFrame } from './frame';

/**
 * The answer, at full volume: the screen floods with signal yellow and the
 * name slides in like a headline. Holds for a beat, then lifts to tracking.
 */
export function Accepted({ active, onNext }: { active: boolean; onNext: () => void }) {
  const theme = useTheme();
  const motion = useMotion();
  const f = useFrame();
  const c = theme.color;
  const g = theme.layout.gutter;
  const next = useEffectEvent(onNext);
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const pop = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    const cfg = motion.reduced ? motion.fade() : motion.timing(900, easeReveal);
    a.set(withDelay(motion.ms(160), withTiming(1, cfg)));
    b.set(withDelay(motion.ms(280), withTiming(1, cfg)));
    pop.set(withDelay(motion.ms(380), motion.reduced ? withTiming(1, motion.fade()) : withSpring(1, { duration: motion.ms(620), dampingRatio: 0.5 })));
    const id = setTimeout(() => next(), motion.ms(3000));
    return () => clearTimeout(id);
  }, [active, motion, a, b, pop]);

  const reduced = motion.reduced;
  // The name must fit on one line at poster size, whatever its length.
  const nameSize = Math.min(96, Math.floor((f.w - g * 2) / (story.tasker.name.length * 0.7)));
  const lineA = useAnimatedStyle(() => ({ opacity: reduced ? a.value : 1, transform: [{ translateX: reduced ? 0 : (1 - a.value) * -f.w }] }));
  const lineB = useAnimatedStyle(() => ({ opacity: reduced ? b.value : 1, transform: [{ translateX: reduced ? 0 : (1 - b.value) * f.w }] }));
  const avatar = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value), transform: [{ scale: pop.value }, { rotate: `${(1 - pop.value) * -20}deg` }] }));

  return (
    <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.brand.fill }]} onPress={onNext} accessibilityRole="button" accessibilityLabel={t('proto.acceptedB')}>
      <Grain opacity={0.13} />
      <View style={{ paddingTop: f.top + 40, paddingHorizontal: g }}>
        <Animated.View style={avatar}>
          <Avatar initials={story.tasker.initials} size={72} tone="inverse" verified />
        </Animated.View>
        <Animated.View style={[{ marginTop: 26 }, lineA]}>
          <Text variant="display.hero" tone="onFill" numberOfLines={1} style={{ fontSize: nameSize, lineHeight: nameSize * 0.95, letterSpacing: -nameSize * 0.045 }}>
            {story.tasker.name}
          </Text>
        </Animated.View>
        <Animated.View style={lineB}>
          <Text variant="display.hero" serif tone="onFill" style={{ fontSize: 100, lineHeight: 96 }}>
            {t('proto.acceptedB')}
          </Text>
        </Animated.View>
        <Rise play={active} delay={700}>
          <Text variant="body.l" tone="onFill" style={{ marginTop: 14, opacity: 0.78 }}>
            {t('proto.acceptedMeta', { rating: story.tasker.rating, tasks: story.tasker.tasks })}
          </Text>
        </Rise>
      </View>

      <Rise play={active} delay={820} style={[styles.bottom, { left: g, right: g, bottom: f.bottom + 26 }]}>
        <View>
          <Text variant="micro" tone="onFill" style={{ opacity: 0.7 }}>
            {t('proto.etaLabel')}
          </Text>
          <View style={styles.eta}>
            <Text variant="numeric.mega" tone="onFill" style={{ fontSize: 150, lineHeight: 136, letterSpacing: -8 }}>
              {String(story.eta)}
            </Text>
            <Text variant="display.l" tone="onFill" style={{ marginBottom: 22, marginLeft: 6 }}>
              {t('proto.min')}
            </Text>
          </View>
        </View>
        <RotatingBadge text={`${t('proto.badgeNow')} · ${t('proto.liveKicker')} · `} size={112} color={c.brand.onFill} fontSize={10.5} period={12000}>
          <View style={[styles.badgeCore, { backgroundColor: c.brand.onFill }]}>
            <Icon name="arrowRight" size={20} color={c.brand.fill} weight="bold" />
          </View>
        </RotatingBadge>
      </Rise>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottom: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  eta: { flexDirection: 'row', alignItems: 'flex-end' },
  badgeCore: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
