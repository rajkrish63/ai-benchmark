import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export interface AppDividerProps {
  style?: ViewStyle;
  subtle?: boolean;
  vertical?: boolean;
  spacing?: number;
}

export const AppDivider: React.FC<AppDividerProps> = ({
  style,
  vertical = false,
  spacing,
}) => {
  const { theme } = useAppTheme();

  const dividerColor = theme.colors.border; // Strict hairline #262626
  const margin = spacing !== undefined ? spacing : theme.spacing[8];

  if (vertical) {
    return (
      <View
        style={[
          styles.vertical,
          {
            backgroundColor: dividerColor,
            marginHorizontal: margin,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          backgroundColor: dividerColor,
          marginVertical: margin,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
