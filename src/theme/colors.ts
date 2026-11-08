export interface ColorPalette {
  // Pure Black & Orange Spec Tokens
  bgPage: string;
  surfaceCard: string;
  surfaceRaised: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryPressed: string;
  primaryTint: string;
  warning: string;
  warningTint: string;
  danger: string;
  success: string;

  // Semantic Aliases for compatibility
  background: string;
  surface: string;
  secondarySurface: string;
  surfaceElevated: string;
  textMuted: string;
  textInverse: string;
  borderSubtle: string;
  borderFocus: string;
  accent: string;
  accentSubtle: string;
  accentHover: string;
  warningSubtle: string;
  dangerSubtle: string;
  successSubtle: string;
  overlay: string;
}

// Dark-mode only app. Pure black, always.
export const pureBlackColors: ColorPalette = {
  // Spec tokens
  bgPage: '#000000',
  surfaceCard: '#0A0A0A',
  surfaceRaised: '#1A1A1A',
  border: '#262626',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#6B6B70',
  primary: '#D97757',
  primaryPressed: '#B85C42',
  primaryTint: 'rgba(215, 119, 87, 0.15)',
  warning: '#EAB308',
  warningTint: 'rgba(234, 179, 8, 0.10)',
  danger: '#EF4444',
  success: '#22C55E',

  // Aliases
  background: '#000000',
  surface: '#0A0A0A',
  secondarySurface: '#1A1A1A',
  surfaceElevated: '#1A1A1A',
  textMuted: '#6B6B70',
  textInverse: '#000000',
  borderSubtle: '#262626',
  borderFocus: '#D97757',
  accent: '#D97757',
  accentSubtle: 'rgba(215, 119, 87, 0.15)',
  accentHover: '#B85C42',
  warningSubtle: 'rgba(234, 179, 8, 0.10)',
  dangerSubtle: 'rgba(239, 68, 68, 0.15)',
  successSubtle: 'rgba(34, 197, 94, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

// Pure Black Dark-mode only app (No light theme tokens)
export const darkColors: ColorPalette = pureBlackColors;
export const lightColors: ColorPalette = pureBlackColors;
