import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export interface AppIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'ghost' | 'secondary' | 'accent';
  size?: number;
}

export const AppIconButton: React.FC<AppIconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  style,
  variant = 'ghost',
  size = 40,
}) => {
  const { theme } = useAppTheme();

  const getBackground = (pressed: boolean) => {
    if (variant === 'secondary') {
      return pressed
        ? theme.colors.surfaceRaised
        : theme.colors.surfaceCard;
    }
    if (variant === 'accent') {
      return pressed ? theme.colors.primaryPressed : theme.colors.primary;
    }
    return pressed ? theme.colors.surfaceRaised : 'transparent';
  };

  const border =
    variant === 'secondary'
      ? { borderWidth: 1, borderColor: theme.colors.border }
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: theme.radius.iconButton, // 8px
          backgroundColor: getBackground(pressed),
          opacity: disabled ? 0.38 : 1,
        },
        border,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
