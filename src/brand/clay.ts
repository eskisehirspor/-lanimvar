/**
 * Clay materials for the 3D-feel object illustrations (categories, proof, empty states).
 * Each material is a light-to-dark ramp: hi (lit face) → base → lo (turned face) → deep (contact).
 * Objects keep these colours in every scheme: they are things, not UI.
 */
export interface ClayMaterial {
  hi: string;
  base: string;
  lo: string;
  deep: string;
}

export type ClayName = 'sun' | 'ink' | 'cream' | 'brick' | 'sky' | 'leaf' | 'wood' | 'steel';

export const clay: Record<ClayName, ClayMaterial> = {
  sun: { hi: '#FFE680', base: '#FFD12E', lo: '#F2AE00', deep: '#C98600' },
  ink: { hi: '#4A5470', base: '#26304A', lo: '#141B2E', deep: '#0A1124' },
  cream: { hi: '#FFFFFF', base: '#F6F1E6', lo: '#E3D9C6', deep: '#C7B9A0' },
  brick: { hi: '#FF9E7A', base: '#EE6A43', lo: '#C94A26', deep: '#9C3517' },
  sky: { hi: '#B9E2FF', base: '#7CC2F2', lo: '#4A98D2', deep: '#2E6FA6' },
  leaf: { hi: '#A8E6A1', base: '#5BC46B', lo: '#33994A', deep: '#1F6E33' },
  wood: { hi: '#E8B98A', base: '#C98D5A', lo: '#A06838', deep: '#774822' },
  steel: { hi: '#F2F4F7', base: '#C9CED8', lo: '#9AA1AF', deep: '#6E7584' },
};

/** Soft stage tints behind objects (category cards). */
export const clayStage = {
  sun: '#FFF1BF',
  sky: '#DCEFFC',
  brick: '#FFE1D5',
  leaf: '#DDF3DA',
  cream: '#F1ECE2',
} as const;

export type ClayStage = keyof typeof clayStage;
