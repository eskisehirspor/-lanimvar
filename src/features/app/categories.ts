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
};

export function categoryLook(key: string) {
  return looks[key] ?? { object: 'boxes' as const, stage: 'cream' as const, icon: 'package' as const };
}
