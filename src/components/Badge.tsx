import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppText } from './ui/AppText';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  showDot?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  showDot = false,
  size = 'md',
  style,
}) => {
  const { theme } = useAppTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primaryTint,
          text: theme.colors.primary,
          border: 'rgba(217, 119, 87, 0.30)',
          dot: theme.colors.primary,
        };
      case 'success':
        return {
          bg: theme.colors.primaryTint,
          text: theme.colors.primary,
          border: 'rgba(217, 119, 87, 0.30)',
          dot: theme.colors.success,
        };
      case 'warning':
        return {
          bg: theme.colors.warningTint,
          text: theme.colors.warning,
          border: 'rgba(234, 179, 8, 0.30)',
          dot: theme.colors.warning,
        };
      case 'danger':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          text: theme.colors.danger,
          border: 'rgba(239, 68, 68, 0.30)',
          dot: theme.colors.danger,
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.surfaceRaised,
          text: theme.colors.textSecondary,
          border: theme.colors.border,
          dot: theme.colors.textTertiary,
        };
    }
  };

  const colors = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderRadius: theme.radius.badge, // 6px
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 8,
        },
        style,
      ]}
    >
      {showDot ? (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: colors.dot,
            },
          ]}
        />
      ) : null}
      <AppText
        variant="microLabel"
        weight="500"
        style={[
          styles.label,
          {
            color: colors.text,
            fontSize: isSm ? 10 : 11,
            letterSpacing: 0.3,
          },
        ]}
      >
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },
  label: {
    includeFontPadding: false,
  },
});
