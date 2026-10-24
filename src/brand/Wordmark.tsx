import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

import type { TypeDirection } from './fonts';
import { wordmarkPaths } from './generated/wordmarkPaths';
import { identity } from './identity';

/**
 * İLANIM VAR as a logo: outlines set once from the display face (HarfBuzz
 * kerned), the İ's dot replaced by the brand dot. Renders identically everywhere.
 */
export function Wordmark({ capHeight = 20, direction, color, dotColor }: { capHeight?: number; direction?: TypeDirection; color?: string; dotColor?: string }) {
  const theme = useTheme();
  const d = wordmarkPaths[direction ?? theme.config.typeDirection];
  const top = -(d.dot.gap + d.dot.r * 2);
  const vbH = d.capHeight - top;
  const k = capHeight / d.capHeight;
  return (
    <Svg width={d.advance * k} height={vbH * k} viewBox={`0 ${top} ${d.advance} ${vbH}`} accessibilityRole="image" accessibilityLabel={identity.name}>
      <Path d={d.path} fill={color ?? theme.color.ink.primary} />
      <Circle cx={d.dot.cx} cy={-(d.dot.gap + d.dot.r)} r={d.dot.r} fill={dotColor ?? theme.color.brand.dot} />
    </Svg>
  );
}
