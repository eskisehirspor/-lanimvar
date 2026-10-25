import type { ReactNode } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { ClayName } from '@/brand/clay';
import { useTheme } from '@/theme';

export type ClayObjectName = 'couch' | 'boxes' | 'drill' | 'bag' | 'spray' | 'key';

/**
 * Soft 3D "clay" objects: lit from the top-left, a turned face in shadow and a
 * contact shadow on the floor. One object per category; drawn, not photographed.
 */
export function ClayObject({ name, size = 120 }: { name: ClayObjectName; size?: number }) {
  const theme = useTheme();
  const m = theme.illustration.clay;
  const ink = theme.illustration.ink;
  // Gradient ids are shared between instances on web; identical definitions make that harmless.
  const v = (n: ClayName) => `url(#clay-v-${n})`;
  const d = (n: ClayName) => `url(#clay-d-${n})`;
  const used: ClayName[] = ['sun', 'ink', 'cream', 'brick', 'sky', 'leaf', 'wood', 'steel'];

  const shadow = <Ellipse cx={60} cy={106} rx={44} ry={6} fill="url(#clay-floor)" />;
  const art: Record<ClayObjectName, ReactNode> = {
    couch: (
      <G>
        {shadow}
        <Rect x={20} y={92} width={7} height={12} rx={2} fill={m.wood.lo} />
        <Rect x={93} y={92} width={7} height={12} rx={2} fill={m.wood.lo} />
        <Rect x={18} y={34} width={84} height={44} rx={16} fill={v('sun')} />
        <Path d="M60 40 V72" stroke={m.sun.lo} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
        <Rect x={16} y={66} width={88} height={28} rx={11} fill={d('sun')} />
        <Rect x={22} y={68} width={36} height={6} rx={3} fill={m.sun.hi} opacity={0.8} />
        <Rect x={62} y={68} width={36} height={6} rx={3} fill={m.sun.hi} opacity={0.8} />
        <Rect x={6} y={54} width={24} height={42} rx={12} fill={v('sun')} />
        <Rect x={90} y={54} width={24} height={42} rx={12} fill={d('sun')} />
        <Rect x={10} y={57} width={9} height={18} rx={4.5} fill={m.sun.hi} opacity={0.9} />
        <G transform="rotate(-14 38 52)">
          <Rect x={27} y={42} width={24} height={22} rx={7} fill={v('brick')} />
          <Path d="M31 48 H47" stroke={m.brick.hi} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        </G>
      </G>
    ),
    boxes: (
      <G>
        {shadow}
        <Path d="M18 60 L40 50 L100 50 L78 60 Z" fill={m.wood.hi} />
        <Rect x={18} y={60} width={60} height={42} fill={v('wood')} />
        <Path d="M78 60 L100 50 L100 92 L78 102 Z" fill={m.wood.lo} />
        <Path d="M44 55 L66 55" stroke={m.cream.lo} strokeWidth={6} />
        <Rect x={44} y={60} width={8} height={42} fill={m.cream.lo} opacity={0.75} />
        <Rect x={24} y={74} width={16} height={12} rx={2} fill={m.cream.base} />
        <Path d="M28 82 L32 77 L36 82" stroke={ink} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M34 36 L50 28 L86 28 L70 36 Z" fill={m.brick.hi} />
        <Rect x={34} y={36} width={36} height={24} fill={v('brick')} />
        <Path d="M70 36 L86 28 L86 52 L70 60 Z" fill={m.brick.lo} />
        <Rect x={48} y={36} width={6} height={24} fill={m.brick.hi} opacity={0.55} />
      </G>
    ),
    drill: (
      <G>
        {shadow}
        <G transform="rotate(10 50 76)">
          <Rect x={38} y={52} width={22} height={42} rx={9} fill={d('brick')} />
          <Rect x={41} y={58} width={5} height={28} rx={2.5} fill={m.brick.hi} opacity={0.6} />
        </G>
        <Rect x={30} y={90} width={42} height={14} rx={5} fill={v('ink')} />
        <Rect x={34} y={92} width={20} height={3} rx={1.5} fill={m.ink.hi} />
        <Rect x={22} y={32} width={66} height={30} rx={13} fill={v('brick')} />
        <Rect x={28} y={36} width={40} height={6} rx={3} fill={m.brick.hi} opacity={0.85} />
        <Circle cx={34} cy={47} r={5} fill={m.ink.base} />
        <Rect x={86} y={38} width={13} height={18} rx={4} fill={v('steel')} />
        <Rect x={98} y={44.5} width={18} height={5} rx={2} fill={d('steel')} />
        <Rect x={58} y={60} width={6} height={10} rx={2} fill={m.ink.base} />
      </G>
    ),
    bag: (
      <G>
        {shadow}
        <G transform="rotate(-18 50 40)">
          <Rect x={40} y={8} width={14} height={56} rx={7} fill={v('wood')} />
          <Path d="M43 18 L51 14 M43 28 L51 24 M43 38 L51 34" stroke={m.wood.lo} strokeWidth={2} strokeLinecap="round" />
        </G>
        <Ellipse cx={74} cy={34} rx={9} ry={18} fill={v('leaf')} transform="rotate(22 74 34)" />
        <Ellipse cx={84} cy={38} rx={7} ry={15} fill={d('leaf')} transform="rotate(40 84 38)" />
        <Circle cx={62} cy={46} r={11} fill={v('brick')} />
        <Circle cx={58} cy={42} r={3} fill={m.brick.hi} />
        <Path d="M28 50 L92 50 L96 104 L24 104 Z" fill={v('cream')} />
        <Path d="M80 50 L92 50 L96 104 L84 104 Z" fill={m.cream.lo} />
        <Rect x={26} y={48} width={68} height={10} rx={2} fill={m.cream.lo} />
        <Rect x={26} y={48} width={68} height={3} rx={1.5} fill={m.cream.hi} />
        <Circle cx={52} cy={78} r={10} fill={m.sun.base} />
        <Path d="M47 78 L51 82 L58 74" stroke={ink} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </G>
    ),
    spray: (
      <G>
        {shadow}
        <Circle cx={100} cy={30} r={3} fill={m.sky.hi} />
        <Circle cx={108} cy={38} r={2.2} fill={m.sky.hi} />
        <Circle cx={104} cy={22} r={1.8} fill={m.sky.hi} />
        <Circle cx={112} cy={28} r={1.5} fill={m.sky.hi} />
        <Path d="M46 30 L80 26 L90 32 L88 38 L56 40 Z" fill={v('ink')} />
        <Rect x={86} y={28} width={8} height={7} rx={2} fill={m.ink.lo} />
        <Path d="M56 40 L52 54 L60 56 Z" fill={m.ink.lo} />
        <Rect x={50} y={38} width={20} height={14} rx={3} fill={v('cream')} />
        <Rect x={38} y={50} width={44} height={56} rx={14} fill={v('sky')} />
        <Rect x={70} y={54} width={10} height={48} rx={5} fill={m.sky.lo} opacity={0.6} />
        <Rect x={43} y={56} width={6} height={36} rx={3} fill={m.sky.hi} opacity={0.9} />
        <Rect x={44} y={70} width={32} height={22} rx={5} fill={m.cream.base} />
        <Path d="M54 86 C54 76 62 74 66 74 C66 80 62 86 54 86 Z" fill={m.leaf.base} />
      </G>
    ),
    key: (
      <G>
        {shadow}
        <Circle cx={44} cy={52} r={24} fill={v('sun')} />
        <Circle cx={44} cy={52} r={9} fill={m.sun.lo} />
        <Circle cx={36} cy={42} r={6} fill={m.sun.hi} opacity={0.8} />
        <Rect x={62} y={46} width={44} height={12} rx={5} fill={d('sun')} />
        <Rect x={86} y={56} width={8} height={12} rx={2} fill={m.sun.lo} />
        <Rect x={98} y={56} width={8} height={16} rx={2} fill={m.sun.lo} />
      </G>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        {used.map((n) => (
          <LinearGradient key={`v${n}`} id={`clay-v-${n}`} x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0" stopColor={m[n].hi} />
            <Stop offset="0.55" stopColor={m[n].base} />
            <Stop offset="1" stopColor={m[n].lo} />
          </LinearGradient>
        ))}
        {used.map((n) => (
          <LinearGradient key={`d${n}`} id={`clay-d-${n}`} x1="0" y1="0" x2="0.2" y2="1">
            <Stop offset="0" stopColor={m[n].base} />
            <Stop offset="1" stopColor={m[n].deep} />
          </LinearGradient>
        ))}
        <RadialGradient id="clay-floor" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={ink} stopOpacity={0.28} />
          <Stop offset="1" stopColor={ink} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {art[name]}
    </Svg>
  );
}
