import Svg, { Circle, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

/** The İ reduced to its essentials: a heavy stem and the signal dot. */
export function Mark({ size, color, dotColor }: { size: number; color?: string; dotColor?: string }) {
  const theme = useTheme();
  const w = 14;
  const r = w * 0.58;
  const gap = w * 0.42;
  const stem = 40;
  const total = r * 2 + gap + stem;
  return (
    <Svg width={(size * w * 1.3) / total} height={size} viewBox={`${-w * 0.15} 0 ${w * 1.3} ${total}`}>
      <Circle cx={w / 2} cy={r} r={r} fill={dotColor ?? theme.color.brand.dot} />
      <Rect x={0} y={r * 2 + gap} width={w} height={stem} rx={1.2} fill={color ?? theme.color.ink.primary} />
    </Svg>
  );
}
