import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

export type IllustrationName = 'moving' | 'couch' | 'assembly' | 'repair' | 'delivery';

/**
 * Category illustrations: flat, two-tone, drawn on one 120×96 grid with a
 * 3pt ink line. Brand colour is the object; ink is the drawing; a soft
 * ground shadow anchors it. Warmth without stock photography.
 */
export function Illustration({ name, size = 96 }: { name: IllustrationName; size?: number }) {
  const theme = useTheme();
  const c = theme.color;
  const { ink, paper } = theme.illustration;
  const fill = c.brand.fill;
  const line = { stroke: ink, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const shadow = <Ellipse cx={60} cy={86} rx={44} ry={5} fill={ink} opacity={0.12} />;
  const art: Record<IllustrationName, ReactNode> = {
    couch: (
      <G>
        {shadow}
        <Rect x={22} y={26} width={76} height={30} rx={12} fill={fill} {...line} />
        <Rect x={14} y={46} width={92} height={28} rx={10} fill={fill} {...line} />
        <Rect x={10} y={40} width={18} height={34} rx={8} fill={paper} {...line} />
        <Rect x={92} y={40} width={18} height={34} rx={8} fill={paper} {...line} />
        <Line x1={60} y1={50} x2={60} y2={74} {...line} />
        <Line x1={22} y1={74} x2={22} y2={82} {...line} />
        <Line x1={98} y1={74} x2={98} y2={82} {...line} />
      </G>
    ),
    moving: (
      <G>
        {shadow}
        <Rect x={30} y={44} width={50} height={38} rx={3} fill={fill} {...line} />
        <Rect x={38} y={16} width={38} height={28} rx={3} fill={paper} {...line} />
        <Line x1={55} y1={44} x2={55} y2={58} {...line} />
        <Line x1={57} y1={16} x2={57} y2={26} {...line} />
        <Path d="M92 18 L92 80 L76 80" fill="none" {...line} />
        <Circle cx={90} cy={82} r={6} fill={paper} {...line} />
      </G>
    ),
    assembly: (
      <G>
        {shadow}
        <Rect x={18} y={14} width={52} height={70} rx={3} fill={paper} {...line} />
        <Line x1={18} y1={38} x2={70} y2={38} {...line} />
        <Line x1={18} y1={60} x2={70} y2={60} {...line} />
        <Rect x={28} y={22} width={12} height={16} rx={2} fill={fill} {...line} />
        <Path d="M78 46 L104 46 L104 58 L92 58 L92 80 L84 80 L84 58 L78 58 Z" fill={fill} {...line} />
        <Line x1={104} y1={52} x2={112} y2={52} {...line} />
      </G>
    ),
    repair: (
      <G>
        {shadow}
        <Path d="M30 72 L66 36 M58 28 a14 14 0 1 0 20 20 l-8 -8 l4 -8 l8 -4 l8 8 a14 14 0 0 0 -32 -8 z" fill={fill} {...line} />
        <Path d="M24 66 l12 12 l-6 6 a6 6 0 0 1 -8 0 l-4 -4 a6 6 0 0 1 0 -8 z" fill={paper} {...line} />
        <Path d="M86 60 l10 0 l5 9 l-5 9 l-10 0 l-5 -9 z" fill={paper} {...line} />
        <Circle cx={91} cy={69} r={3} fill={ink} />
      </G>
    ),
    delivery: (
      <G>
        {shadow}
        <Path d="M26 40 L60 26 L94 40 L94 74 L60 86 L26 74 Z" fill={fill} {...line} />
        <Path d="M26 40 L60 54 L94 40 M60 54 L60 86" fill="none" {...line} />
        <Path d="M43 33 L77 47" fill="none" {...line} />
      </G>
    ),
  };
  return (
    <Svg width={size * 1.25} height={size} viewBox="0 0 120 96" accessibilityElementsHidden>
      {art[name]}
    </Svg>
  );
}

/** Camera framing: four corner brackets around whatever is being captured. */
export function Viewfinder({ children, color, height = 220 }: { children?: ReactNode; color?: string; height?: number }) {
  const theme = useTheme();
  const col = color ?? theme.color.ink.primary;
  const corner = (pos: object, rot: string) => <View style={[styles.corner, pos, { borderColor: col, transform: [{ rotate: rot }] }]} />;
  return (
    <View style={[styles.finder, { height }]}>
      {children}
      {corner({ top: 0, left: 0 }, '0deg')}
      {corner({ top: 0, right: 0 }, '90deg')}
      {corner({ bottom: 0, right: 0 }, '180deg')}
      {corner({ bottom: 0, left: 0 }, '270deg')}
    </View>
  );
}

const styles = StyleSheet.create({
  finder: { alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 28, height: 28, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
});
