import type { ClayStage } from '@/brand/clay';
import type { ClayObjectName, IconName } from '@/ui';

/** How each pricing category looks (object, stage tint, small icon). Unknown keys fall back. */
const looks: Record<string, { object: ClayObjectName; stage: ClayStage; icon: IconName }> = {
  heavy: { object: 'couch', stage: 'sun', icon: 'couch' },
  moving: { object: 'boxes', stage: 'brick', icon: 'van' },
  assembly: { object: 'drill', stage: 'sky', icon: 'toolbox' },
  shopping: { object: 'bag', stage: 'leaf', icon: 'package' },
  cleaning: { object: 'spray', stage: 'cream', icon: 'sparkle' },
  repair: { object: 'key', stage: 'sun', icon: 'wrench' },
  football: { object: 'ball', stage: 'leaf', icon: 'people' },
  okey: { object: 'tiles', stage: 'cream', icon: 'people' },
  games: { object: 'tiles', stage: 'sky', icon: 'people' },
  sport: { object: 'ball', stage: 'sun', icon: 'people' },
  queue: { object: 'hourglass', stage: 'sky', icon: 'timer' },
  athome: { object: 'key', stage: 'cream', icon: 'home' },
  parcel: { object: 'boxes', stage: 'sun', icon: 'package' },
  dogwalk: { object: 'paw', stage: 'brick', icon: 'people' },
  petsit: { object: 'paw', stage: 'sun', icon: 'home' },
  plants: { object: 'plant', stage: 'leaf', icon: 'home' },
  snow: { object: 'spray', stage: 'sky', icon: 'home' },
  garden: { object: 'plant', stage: 'sun', icon: 'home' },
  carwash: { object: 'spray', stage: 'cream', icon: 'car' },
  tech: { object: 'laptop', stage: 'sky', icon: 'toolbox' },
  event: { object: 'balloon', stage: 'brick', icon: 'sparkle' },
  photo: { object: 'camera', stage: 'cream', icon: 'camera' },
  tutor: { object: 'laptop', stage: 'sun', icon: 'tasks' },
};

export function categoryLook(key: string) {
  return looks[key] ?? { object: 'boxes' as const, stage: 'cream' as const, icon: 'package' as const };
}
