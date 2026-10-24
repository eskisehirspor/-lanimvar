import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { withAlpha } from '@/theme/contrast';
import { useMotion, useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Map world, in viewBox units. A schematic Eskişehir-like grid with the Porsuk crossing it. */
export const MAP_W = 400;
export const MAP_H = 440;
const MAJOR_X = [128, 286];
const MAJOR_Y = [156, 318];
const MINOR_X = [52, 206, 360];
const MINOR_Y = [70, 238, 396];
/** The destination (the customer's door) and where the area circle centres (offset on purpose). */
export const MAP_DEST: [number, number] = [286, 112];
const AREA_CENTER: [number, number] = [262, 138];
/** The Tasker's route along the streets to the door. */
export const MAP_ROUTE: [number, number][] = [
  [52, 396],
  [52, 318],
  [128, 318],
  [128, 156],
  [286, 156],
  [286, 112],
];

export type MapMode = 'plain' | 'approx' | 'exact' | 'route';
export type Project = (x: number, y: number) => { left: number; top: number };

function routeD(pts: [number, number][]) {
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
}

/** Blocks between streets, deterministic, with one park. */
function useBlocks() {
  const xs = [0, ...[...MAJOR_X, ...MINOR_X].sort((a, b) => a - b), MAP_W];
  const ys = [0, ...[...MAJOR_Y, ...MINOR_Y].sort((a, b) => a - b), MAP_H];
  const blocks: { x: number; y: number; w: number; h: number; park: boolean; key: string }[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i]! + 7;
      const y0 = ys[j]! + 7;
      const w = xs[i + 1]! - xs[i]! - 14;
      const h = ys[j + 1]! - ys[j]! - 14;
      if (w < 10 || h < 10) continue;
      blocks.push({ x: x0, y: y0, w, h, park: i === 2 && j === 4, key: `${i}-${j}` });
    }
  }
  return blocks;
}

export interface MapCanvasProps {
  mode?: MapMode;
  height?: number;
  /** 0..1 position of the Tasker along MAP_ROUTE (route mode). */
  progress?: SharedValue<number>;
  /** Extra overlay positioned in map coordinates. */
  overlay?: (project: Project) => ReactNode;
  rounded?: boolean;
}

/**
 * Schematic map until a provider is chosen — with the right behaviour already:
 * approx = a soft area and no pin; exact = the area collapses into a pin;
 * route = the Tasker travelling the streets to the door.
 */
export function MapCanvas({ mode = 'plain', height = 300, progress, overlay, rounded }: MapCanvasProps) {
  const theme = useTheme();
  const motion = useMotion();
  const c = theme.color;
  const blocks = useBlocks();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const exact = mode === 'exact' || mode === 'route';
  const e = useSharedValue(exact ? 1 : 0);

  useEffect(() => {
    e.set(motion.reduced ? withTiming(exact ? 1 : 0, motion.fade()) : withSpring(exact ? 1 : 0, motion.spring('hero')));
  }, [exact, motion, e]);

  const scale = size.w ? Math.max(size.w / MAP_W, size.h / MAP_H) : 1;
  const offX = (size.w - MAP_W * scale) / 2;
  const offY = (size.h - MAP_H * scale) / 2;
  const project: Project = (x, y) => ({ left: x * scale + offX, top: y * scale + offY });

  const areaProps = useAnimatedProps(() => ({ r: 78 * (1 - e.value) + 6 * e.value, opacity: 1 - e.value }));
  const pinStyle = useAnimatedStyle(() => ({ opacity: e.value, transform: [{ translateY: motion.reduced ? 0 : -16 * (1 - e.value) }, { scale: 0.7 + 0.3 * e.value }] }));
  const dest = project(...MAP_DEST);

  return (
    <View
      style={[styles.wrap, { height, backgroundColor: c.map.land, borderRadius: rounded ? theme.radii.panel : 0 }]}
      onLayout={(ev) => setSize({ w: ev.nativeEvent.layout.width, h: ev.nativeEvent.layout.height })}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice">
        <Rect x={0} y={0} width={MAP_W} height={MAP_H} fill={c.map.land} />
        {blocks.map((b) => (
          <Rect key={b.key} x={b.x} y={b.y} width={b.w} height={b.h} rx={5} fill={b.park ? c.map.park : c.map.block} />
        ))}
        {/* Porsuk */}
        <Path d="M-20 276 C 60 250, 110 300, 190 268 S 320 214, 420 236" stroke={c.map.water} strokeWidth={26} fill="none" strokeLinecap="round" />
        {MINOR_X.map((x) => (
          <Rect key={`mx${x}`} x={x - 4} y={0} width={8} height={MAP_H} fill={c.map.road} />
        ))}
        {MINOR_Y.map((y) => (
          <Rect key={`my${y}`} x={0} y={y - 4} width={MAP_W} height={8} fill={c.map.road} />
        ))}
        {MAJOR_X.map((x) => (
          <Rect key={`Mx${x}`} x={x - 8} y={0} width={16} height={MAP_H} fill={c.map.road} />
        ))}
        {MAJOR_Y.map((y) => (
          <Rect key={`My${y}`} x={0} y={y - 8} width={MAP_W} height={16} fill={c.map.road} />
        ))}
        {mode === 'route' ? (
          <G>
            <Path d={routeD(MAP_ROUTE)} stroke={c.map.routeCasing} strokeWidth={11} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            <Path d={routeD(MAP_ROUTE)} stroke={c.map.route} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          </G>
        ) : null}
        <AnimatedCircle
          cx={AREA_CENTER[0]}
          cy={AREA_CENTER[1]}
          fill={withAlpha(c.brand.dot, 0.22)}
          stroke={c.brand.dotOutline}
          strokeWidth={1.5}
          strokeDasharray="5 6"
          animatedProps={areaProps}
        />
      </Svg>

      {size.w ? (
        <>
          <Animated.View style={[styles.pin, { left: dest.left - 18, top: dest.top - 46 }, pinStyle]} pointerEvents="none">
            <View style={[styles.pinHead, { backgroundColor: c.surface.inverse, borderColor: c.surface.panel }]}>
              <View style={[styles.pinDot, { backgroundColor: c.brand.dot }]} />
            </View>
            <View style={[styles.pinTail, { borderTopColor: c.surface.inverse }]} />
          </Animated.View>
          {mode === 'route' && progress ? <RouteMarker progress={progress} scale={scale} offX={offX} offY={offY} /> : null}
          {overlay?.(project)}
        </>
      ) : null}
    </View>
  );
}

const SEGS = MAP_ROUTE.slice(1).map(([x, y], i) => Math.hypot(x - MAP_ROUTE[i]![0], y - MAP_ROUTE[i]![1]));
const TOTAL = SEGS.reduce((s, v) => s + v, 0);

function RouteMarker({ progress, scale, offX, offY }: { progress: SharedValue<number>; scale: number; offX: number; offY: number }) {
  const theme = useTheme();
  const c = theme.color;
  const style = useAnimatedStyle(() => {
    let d = Math.max(0, Math.min(1, progress.value)) * TOTAL;
    let x = MAP_ROUTE[0]![0];
    let y = MAP_ROUTE[0]![1];
    for (let i = 0; i < SEGS.length; i++) {
      const len = SEGS[i]!;
      const [ax, ay] = MAP_ROUTE[i]!;
      const [bx, by] = MAP_ROUTE[i + 1]!;
      if (d <= len) {
        x = ax + (bx - ax) * (d / len);
        y = ay + (by - ay) * (d / len);
        break;
      }
      d -= len;
      x = bx;
      y = by;
    }
    return { transform: [{ translateX: x * scale + offX - 17 }, { translateY: y * scale + offY - 17 }] };
  });
  return (
    <Animated.View style={[styles.marker, { backgroundColor: c.surface.inverse, borderColor: c.surface.panel }, theme.elevation.floating, style]} pointerEvents="none">
      <View style={[styles.markerDot, { backgroundColor: c.brand.dot }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', width: '100%' },
  pin: { position: 'absolute', width: 36, alignItems: 'center' },
  pinHead: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  pinDot: { width: 12, height: 12, borderRadius: 6 },
  pinTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  marker: { position: 'absolute', left: 0, top: 0, width: 34, height: 34, borderRadius: 17, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  markerDot: { width: 10, height: 10, borderRadius: 5 },
});
