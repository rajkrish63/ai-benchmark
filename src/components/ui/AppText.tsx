import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { TypographyVariant } from '../../theme';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'inverse';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: TextStyle['textAlign'];
  weight?: '400' | '500' | TextStyle['fontWeight'];
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  style,
  children,
  ...rest
}) => {
  const { theme } = useAppTheme();

  const textColor = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    muted: theme.colors.textTertiary,
    accent: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    inverse: theme.colors.textInverse,
  }[color];

  const typographyStyle = theme.typography[variant] || theme.typography.body;

  // Strict 400/500 rule: Clamp any weights higher than 500 down to 500 (Never 600/700)
  let resolvedWeight: '400' | '500' = typographyStyle.fontWeight || '400';
  if (weight) {
    if (weight === '600' || weight === '700' || weight === '800' || weight === '900' || weight === 'bold') {
      resolvedWeight = '500';
    } else if (weight === '500') {
      resolvedWeight = '500';
    } else {
      resolvedWeight = '400';
    }
  }

  return (
    <Text
      allowFontScaling={true}
      style={[
        styles.base,
        typographyStyle,
        {
          color: textColor,
          textAlign: align,
          fontWeight: resolvedWeight,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
