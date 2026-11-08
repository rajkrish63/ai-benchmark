import { ColorPalette, darkColors, pureBlackColors } from './colors';
import { motion } from './motion';
import { radius } from './radius';
import { shadows } from './shadows';
import { layout, spacing } from './spacing';
import { typography } from './typography';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppTheme {
  isDark: boolean;
  colors: ColorPalette;
  typography: typeof typography;
  spacing: typeof spacing;
  layout: typeof layout;
  radius: typeof radius;
  shadows: typeof shadows;
  motion: typeof motion;
}

// Dark-mode only app. Pure black OLED, always.
export const darkTheme: AppTheme = {
  isDark: true,
  colors: darkColors,
  typography,
  spacing,
  layout,
  radius,
  shadows,
  motion,
};

// Aliased to darkTheme - no light theme tokens
export const lightTheme: AppTheme = {
  isDark: true,
  colors: pureBlackColors,
  typography,
  spacing,
  layout,
  radius,
  shadows,
  motion,
};
