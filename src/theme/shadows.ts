import { ViewStyle } from 'react-native';

const noShadow: ViewStyle = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

export const shadows = {
  none: noShadow,
  sm: noShadow,
  md: noShadow,
  lg: noShadow,
  xl: noShadow,
  card: noShadow,
  modal: noShadow,
} as const;

export type ShadowKey = keyof typeof shadows;
