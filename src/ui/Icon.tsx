import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Backspace,
  Bell,
  CalendarBlank,
  Camera,
  CaretDown,
  CaretRight,
  Car,
  ChatCircle,
  Check,
  CheckCircle,
  Clock,
  ClockCounterClockwise,
  Couch,
  Crosshair,
  Door,
  DotsThree,
  House,
  Ladder,
  Lightning,
  ListChecks,
  Lock,
  LockOpen,
  MapPin,
  NavigationArrow,
  Package,
  Phone,
  Play,
  Plus,
  ShieldCheck,
  SignOut,
  Siren,
  SlidersHorizontal,
  Stairs,
  Star,
  Timer,
  Toolbox,
  User,
  Users,
  Van,
  Warning,
  WarningCircle,
  Wrench,
  X,
  type IconProps as PhosphorProps,
} from 'phosphor-react-native';
import type { ComponentType } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

/** Hand truck — missing in Phosphor; drawn on its 256 grid and stroke. */
function HandTruck({ size = 24, color = 'currentColor', weight }: PhosphorProps) {
  const w = weight === 'fill' || weight === 'bold' ? 24 : 16;
  const fill = weight === 'fill' ? color : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none">
      <Path d="M56 40h24l40 144" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M120 184l104-28" stroke={color} strokeWidth={w} strokeLinecap="round" />
      <Path d="M108 96l72-20 20 72-72 20z" stroke={color} strokeWidth={w} strokeLinejoin="round" fill={fill} />
      <Circle cx={120} cy={208} r={20} stroke={color} strokeWidth={w} fill={fill} />
    </Svg>
  );
}

/** The icon vocabulary. Adding one is a design decision, not a convenience. */
const registry = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  backspace: Backspace,
  bell: Bell,
  calendar: CalendarBlank,
  camera: Camera,
  car: Car,
  caretDown: CaretDown,
  caretRight: CaretRight,
  chat: ChatCircle,
  check: Check,
  checkCircle: CheckCircle,
  clock: Clock,
  couch: Couch,
  door: Door,
  handTruck: HandTruck,
  history: ClockCounterClockwise,
  home: House,
  ladder: Ladder,
  lightning: Lightning,
  locate: Crosshair,
  lock: Lock,
  lockOpen: LockOpen,
  mapPin: MapPin,
  more: DotsThree,
  navigate: NavigationArrow,
  package: Package,
  people: Users,
  phone: Phone,
  play: Play,
  plus: Plus,
  retry: ArrowClockwise,
  shield: ShieldCheck,
  signOut: SignOut,
  siren: Siren,
  sliders: SlidersHorizontal,
  stairs: Stairs,
  star: Star,
  tasks: ListChecks,
  timer: Timer,
  toolbox: Toolbox,
  user: User,
  van: Van,
  warning: Warning,
  warningCircle: WarningCircle,
  wrench: Wrench,
  x: X,
} satisfies Record<string, ComponentType<PhosphorProps>>;

export type IconName = keyof typeof registry;

export interface IconProps {
  name: IconName;
  size?: 's' | 'm' | 'l' | 'xl' | number;
  color?: string;
  weight?: 'regular' | 'fill' | 'bold';
}

export function Icon({ name, size = 'l', color, weight = 'regular' }: IconProps) {
  const theme = useTheme();
  const Cmp = registry[name];
  return <Cmp size={typeof size === 'number' ? size : theme.icon[size]} color={color ?? theme.color.ink.primary} weight={weight} />;
}
