/** Motion constants (ms at 1×). Springs are duration-based so the Lab speed control scales them. */
export const durations = { micro: 120, standard: 220, hero: 360, reduced: 160, stagger: 55, listStagger: 40, pulse: 1400 } as const;

export interface SpringSpec {
  duration: number;
  dampingRatio: number;
}

export const springs = {
  press: { duration: 150, dampingRatio: 1 },
  snappy: { duration: 320, dampingRatio: 0.8 },
  sheet: { duration: 440, dampingRatio: 0.92 },
  hero: { duration: 540, dampingRatio: 0.76 },
  glide: { duration: 700, dampingRatio: 1 },
} as const satisfies Record<string, SpringSpec>;

export type SpringName = keyof typeof springs;

export const gestures = { pressScale: 0.97, tileScale: 0.98, shakeDistance: 7, shakeCycles: 3 } as const;

export type ReduceMotionSetting = 'system' | 'on' | 'off';
