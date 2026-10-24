/**
 * Brand identity: the ONLY place the working brand name and taglines live.
 * Product copy references the name through `{{brand}}` in i18n.
 */
import brand from './brand.json';

export const identity = {
  name: brand.name,
  /** Pre-uppercased with Turkish rules (İ, not I). Never derive with toUpperCase(). */
  nameUpper: brand.nameUpper,
  taglines: {
    promise: 'İşini bekletme. Hallet.',
    customer: 'Yapılacak işin mi var? Birine ver.',
    tasker: 'Boş musun? Bugün para kazan.',
    positioning: "Eskişehir'de günlük işlerin Uber'i.",
  },
} as const;
