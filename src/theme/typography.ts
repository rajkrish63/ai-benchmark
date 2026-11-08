import { Platform, TextStyle } from 'react-native';

export type TypographyVariant =
  | 'screenTitle'
  | 'sectionTitle'
  | 'body'
  | 'secondary'
  | 'caption'
  | 'microLabel'
  | 'metricValue'
  // Legacy aliases for backward compatibility:
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'bodySmall';

export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500';
  letterSpacing?: number;
  fontFamily?: string;
  fontVariant?: TextStyle['fontVariant'];
}

const fontFamily = Platform.select({
  android: 'sans-serif',
  ios: 'System',
  default: 'sans-serif',
});

export const typography: Record<TypographyVariant, TypographyStyle> = {
  // Spec Variants
  screenTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0,
    fontFamily,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0,
    fontFamily,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0,
    fontFamily,
  },
  secondary: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0,
    fontFamily,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0,
    fontFamily,
  },
  microLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
    letterSpacing: 1, // +1px tracking, never all-caps
    fontFamily,
  },
  metricValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
    fontFamily,
  },

  // Legacy mappings strictly adhering to 400/500 weights and positive tracking:
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
    fontFamily,
  },
  h1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
    letterSpacing: 0,
    fontFamily,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: 0,
    fontFamily,
  },
  h3: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0,
    fontFamily,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0,
    fontFamily,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0,
    fontFamily,
  },
};
