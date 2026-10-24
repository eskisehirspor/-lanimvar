import { useMemo } from 'react';
import { create } from 'zustand';

import type { TypeDirection } from '@/brand/fonts';
import type { PaletteId } from '@/brand/palettes';
import { defaultThemeConfig, type ButtonShape, type MotionSettings, type ThemeConfig } from '@/theme';
import type { ReduceMotionSetting } from '@/theme/motion';

/** Design Lab controls. Lab-only; production never imports this. */
interface LabState {
  palette: PaletteId;
  typeDirection: TypeDirection;
  buttonShape: ButtonShape;
  textScale: number;
  speed: number;
  reduceMotion: ReduceMotionSetting;
  haptics: boolean;
  dockOpen: boolean;
  set: (patch: Partial<Omit<LabState, 'set'>>) => void;
}

export const useLab = create<LabState>((set) => ({
  palette: defaultThemeConfig.palette,
  typeDirection: defaultThemeConfig.typeDirection,
  buttonShape: defaultThemeConfig.buttonShape,
  textScale: 1,
  speed: 1,
  reduceMotion: 'system',
  haptics: true,
  dockOpen: false,
  set: (patch) => set(patch),
}));

export function useLabThemeConfig(): ThemeConfig {
  const palette = useLab((s) => s.palette);
  const typeDirection = useLab((s) => s.typeDirection);
  const buttonShape = useLab((s) => s.buttonShape);
  const textScale = useLab((s) => s.textScale);
  return useMemo(() => ({ palette, typeDirection, buttonShape, textScale }), [palette, typeDirection, buttonShape, textScale]);
}

export function useLabMotion(): MotionSettings {
  const speed = useLab((s) => s.speed);
  const reduceMotion = useLab((s) => s.reduceMotion);
  const haptics = useLab((s) => s.haptics);
  return useMemo(() => ({ speed, reduceMotion, haptics }), [speed, reduceMotion, haptics]);
}
