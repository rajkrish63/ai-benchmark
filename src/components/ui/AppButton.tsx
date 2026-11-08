import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  style,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useAppTheme();

  const isInteractive = !disabled && !loading;

  // Strict radius: 12px for buttons
  const buttonRadius = theme.radius.button; // 12px

  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing[8],
      paddingHorizontal: theme.spacing[12],
      minHeight: 36,
      textVariant: 'secondary' as const,
    },
    md: {
      paddingVertical: theme.spacing[12],
      paddingHorizontal: theme.spacing[16],
      minHeight: 44,
      textVariant: 'body' as const,
    },
    lg: {
      paddingVertical: theme.spacing[16],
      paddingHorizontal: theme.spacing[24],
      minHeight: 52,
      textVariant: 'sectionTitle' as const,
    },
  }[size];

  const getVariantStyles = (pressed: boolean) => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: pressed ? theme.colors.surfaceRaised : theme.colors.surfaceCard,
          borderColor: theme.colors.border,
          borderWidth: 1,
          textColor: theme.colors.textPrimary,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? theme.colors.surfaceRaised : 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: theme.colors.textSecondary,
        };
      case 'destructive':
        // Spec: Text danger on transparent, 1px danger border
        return {
          backgroundColor: pressed ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
          borderColor: theme.colors.danger,
          borderWidth: 1,
          textColor: theme.colors.danger,
        };
      case 'primary':
      default:
        // Spec: Background primary #D97757, text #000000, weight 500, radius 12px. Pressed: #B85C42.
        return {
          backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primary,
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: '#000000',
        };
    }
  };

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => {
        const variantStyle = getVariantStyles(pressed && isInteractive);
        return [
          styles.container,
          sizeStyles,
          {
            borderRadius: buttonRadius,
            backgroundColor: variantStyle.backgroundColor,
            borderColor: variantStyle.borderColor,
            borderWidth: variantStyle.borderWidth,
            opacity: disabled ? 0.38 : 1, // Spec: Disabled state: 38% opacity of the base color
          },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const variantStyle = getVariantStyles(pressed && isInteractive);

        if (loading) {
          return (
            <ActivityIndicator
              size="small"
              color={variantStyle.textColor}
            />
          );
        }

        return (
          <View style={styles.contentRow}>
            {icon ? <View style={styles.iconLeft}>{icon}</View> : null}
            <AppText
              variant={sizeStyles.textVariant}
              weight="500"
              style={[
                {
                  color: variantStyle.textColor,
                  fontWeight: '500',
                },
                labelStyle,
              ]}
            >
              {label}
            </AppText>
            {iconRight ? <View style={styles.iconRight}>{iconRight}</View> : null}
          </View>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
