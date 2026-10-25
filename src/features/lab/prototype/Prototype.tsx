import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { SchemeProvider, useMotion, useTheme } from '@/theme';
import { CircleReveal, easeReveal, Icon, Tactile } from '@/ui';

import { Accepted } from './Accepted';
import { Done } from './Done';
import { Draft, useRecede } from './Draft';
import { FrameContext, sceneIndex, scenes, useFrame, type Frame, type Point, type Scene } from './frame';
import { Home } from './Home';
import { Intro } from './Intro';
import { Live } from './Live';
import { Searching } from './Searching';

/**
 * The Şimdi Lazım story as one continuous, touchable surface: intro → home →
 * voice → listing → search → accepted → tracking → done. Every transition is
 * spatial (the next moment grows out of the thing you touched). Fixtures only.
 */
export function Prototype() {
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const frame: Frame = { w: size.w, h: size.h, top: Math.max(insets.top, 22), bottom: Math.max(insets.bottom, 14) };
  return (
    <View style={styles.root} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w ? (
        <FrameContext value={frame}>
          <Story />
        </FrameContext>
      ) : null}
    </View>
  );
}

function Story() {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const [scene, setScene] = useState<Scene>('intro');
  const [run, setRun] = useState(0);
  const [homePlay, setHomePlay] = useState(false);
  const [origins, setOrigins] = useState<{ search: Point; accept: Point; done: Point }>({ search: { x: 0, y: 0 }, accept: { x: 0, y: 0 }, done: { x: 0, y: 0 } });
  const f = useFrame();
  const frame = { w: f.w, h: f.h };
  const frameW = f.w;
  const frameH = f.h;
  const i = sceneIndex(scene);
  const at = (s: Scene) => sceneIndex(s);

  const draftP = useSharedValue(0);
  const searchP = useSharedValue(0);
  const acceptP = useSharedValue(0);
  const liftP = useSharedValue(0);
  const doneP = useSharedValue(0);

  const reveal = (ms: number) => (motion.reduced ? motion.fade() : motion.timing(ms, easeReveal));

  /** Jump straight to a moment (progress bar, restart): no transition, fresh state. */
  const jump = (to: Scene) => {
    const k = sceneIndex(to);
    draftP.set(k >= at('draft') && k <= at('searching') ? 1 : 0);
    searchP.set(k >= at('searching') ? 1 : 0);
    acceptP.set(k >= at('accepted') ? 1 : 0);
    liftP.set(k >= at('live') ? 1 : 0);
    doneP.set(k >= at('done') ? 1 : 0);
    if (to === 'searching') setOrigins((o) => ({ ...o, search: { x: frameW / 2, y: frameH - 80 } }));
    setRun((r) => r + 1);
    setHomePlay(to !== 'intro');
    setScene(to);
  };


  const recede = useRecede(draftP);
  const scrim = useAnimatedStyle(() => ({ opacity: draftP.value * 0.45 }));
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: -liftP.value * frameH }] }));

  const chromeOnDark = scene === 'searching' || scene === 'intro';
  const chromeColor = scene === 'accepted' ? c.brand.onFill : chromeOnDark ? c.ink.onInverse : c.ink.primary;

  return (
    <View key={run} style={StyleSheet.absoluteFill}>
      {i <= at('searching') ? (
        <Animated.View style={[StyleSheet.absoluteFill, styles.clip, recede]}>
          <Home
            play={homePlay || i >= at('home')}
            onDraft={() => {
              setScene('draft');
              draftP.set(motion.reduced ? withTiming(1, motion.fade()) : withSpring(1, motion.spring('sheet')));
            }}
          />
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.surface.scrim }, scrim]} />
        </Animated.View>
      ) : null}

      {i >= at('home') && i <= at('searching') ? (
        <Draft
          progress={draftP}
          ready={i >= at('draft')}
          onCall={(p) => {
            setOrigins((o) => ({ ...o, search: p }));
            setScene('searching');
            searchP.set(withTiming(1, reveal(1000)));
          }}
        />
      ) : null}

      {i >= at('searching') && i <= at('accepted') ? (
        <SchemeProvider scheme="night">
          <CircleReveal progress={searchP} origin={origins.search} frame={frame}>
            <Searching
              active={i === at('searching')}
              onAccepted={(p) => {
                setOrigins((o) => ({ ...o, accept: p }));
                setScene('accepted');
                acceptP.set(withTiming(1, reveal(900)));
              }}
            />
          </CircleReveal>
        </SchemeProvider>
      ) : null}

      {i >= at('accepted') ? (
        <Live
          active={i >= at('live')}
          onArrived={(p) => {
            setOrigins((o) => ({ ...o, done: p }));
            setScene('done');
            doneP.set(withTiming(1, reveal(1000)));
          }}
        />
      ) : null}

      {i >= at('accepted') && i <= at('live') ? (
        <Animated.View style={[StyleSheet.absoluteFill, lift]} pointerEvents={i === at('accepted') ? 'auto' : 'none'}>
          <CircleReveal progress={acceptP} origin={origins.accept} frame={frame}>
            <Accepted
              active={i === at('accepted')}
              onNext={() => {
                if (scene !== 'accepted') return;
                setScene('live');
                liftP.set(withTiming(1, reveal(950)));
              }}
            />
          </CircleReveal>
        </Animated.View>
      ) : null}

      {i === at('done') ? (
        <CircleReveal progress={doneP} origin={origins.done} frame={frame}>
          <Done active onRestart={() => jump('intro')} onClose={() => router.replace('/lab')} />
        </CircleReveal>
      ) : null}

      {scene === 'intro' ? <Intro onLift={() => setHomePlay(true)} onDone={() => setScene('home')} /> : <Chrome scene={scene} color={chromeColor} onJump={jump} />}
    </View>
  );
}

/** Story progress, like a stories bar: tap a segment to jump there. */
function Chrome({ scene, color, onJump }: { scene: Scene; color: string; onJump: (s: Scene) => void }) {
  const f = useFrame();
  const steps = scenes.filter((s) => s !== 'intro');
  const k = steps.indexOf(scene as (typeof steps)[number]);
  return (
    <View style={[styles.chrome, { top: Math.max(4, f.top - 16) }]} pointerEvents="box-none">
      {steps.map((s, idx) => (
        <Tactile key={s} haptic="select" pressScale={1} onPress={() => onJump(s)} hitSlop={{ top: 12, bottom: 12 }} style={styles.seg} accessibilityLabel={`${idx + 1}`}>
          <View style={[styles.segBar, { backgroundColor: color, opacity: idx <= k ? 0.9 : 0.2 }]} />
        </Tactile>
      ))}
      <Tactile haptic="select" onPress={() => router.replace('/lab')} hitSlop={10} style={styles.close} accessibilityLabel={t('proto.close')}>
        <Icon name="x" size={14} color={color} weight="bold" />
      </Tactile>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  clip: { overflow: 'hidden' },
  chrome: { position: 'absolute', left: 20, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  seg: { flex: 1, height: 14, justifyContent: 'center' },
  segBar: { height: 3, borderRadius: 1.5 },
  close: { width: 26, height: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
});
