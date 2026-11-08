import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  highlight?: boolean;
  selected?: boolean;
  secondary?: boolean;
  onPress?: () => void;
  padding?: number;
  accessibilityLabel?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  highlight = false,
  selected = false,
  secondary = false,
  onPress,
  padding,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  const containerPadding = padding !== undefined ? padding : theme.spacing[16];
  const isSelected = highlight || selected;

  const cardStyle: ViewStyle = {
    backgroundColor: isSelected
      ? theme.colors.primaryTint
      : secondary
      ? theme.colors.surfaceRaised
      : theme.colors.surfaceCard,
    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.card, // 12px
    padding: containerPadding,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          cardStyle,
          pressed && { opacity: 0.75 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
