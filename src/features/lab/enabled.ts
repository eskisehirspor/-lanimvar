/** The Design Lab is a dev tool, never production navigation (dev builds, or EXPO_PUBLIC_DESIGN_LAB=1). */
export const designLabEnabled: boolean = __DEV__ || process.env.EXPO_PUBLIC_DESIGN_LAB === '1';
