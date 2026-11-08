import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppText } from './ui/AppText';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  showLabel?: boolean;
  subtext?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 6,
  showLabel = false,
  subtext,
  style,
}) => {
  const { theme } = useAppTheme();
  const clamped = isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress));

  // Signal color: Claude orange #D97757
  const fillColor = color || theme.colors.primary;

  return (
    <View style={[styles.container, style]}>
      {showLabel || subtext ? (
        <View style={styles.labelRow}>
          {subtext ? (
            <AppText variant="caption" color="secondary">
              {subtext}
            </AppText>
          ) : (
            <View />
          )}
          {showLabel ? (
            <AppText variant="caption" weight="500" color="primary">
              {Math.round(clamped)}%
            </AppText>
          ) : null}
        </View>
      ) : null}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.colors.surfaceRaised, // #1A1A1A
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.pill,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: fillColor,
              borderRadius: theme.radius.pill,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
