import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { createTheme, type Theme, type ThemeConfig } from './createTheme';
import type { ReduceMotionSetting } from './motion';

export interface MotionSettings {
  speed: number;
  reduceMotion: ReduceMotionSetting;
  haptics: boolean;
}

export const defaultMotionSettings: MotionSettings = { speed: 1, reduceMotion: 'system', haptics: true };

interface ThemeContextValue {
  theme: Theme;
  motion: MotionSettings & { reduced: boolean };
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ config, motion = defaultMotionSettings, children }: { config: ThemeConfig; motion?: MotionSettings; children: ReactNode }) {
  const systemReduced = useReducedMotion();
  const { palette, typeDirection, buttonShape, textScale } = config;
  const theme = useMemo(() => createTheme({ palette, typeDirection, buttonShape, textScale }), [palette, typeDirection, buttonShape, textScale]);
  const reduced = motion.reduceMotion === 'system' ? systemReduced : motion.reduceMotion === 'on';
  const value = useMemo(() => ({ theme, motion: { ...motion, reduced } }), [theme, motion, reduced]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeProvider eksik');
  return ctx;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}

export function useMotionSettings() {
  return useThemeContext().motion;
}
