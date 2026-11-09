import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppText } from './ui/AppText';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  highlightColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subtext,
  highlightColor,
  style,
}) => {
  const { theme } = useAppTheme();

  // Spec: Key metrics default to primary orange #D97757
  const valColor = highlightColor || theme.colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceCard, // #0A0A0A
          borderColor: theme.colors.border,          // 1px #262626
          borderRadius: theme.radius.card,           // 12px
          padding: theme.spacing[12],
        },
        style,
      ]}
    >
      <AppText
        variant="caption"
        weight="400"
        color="tertiary"
        style={styles.label}
      >
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <AppText
          variant="metricValue"
          weight="500"
          style={[
            styles.valueText,
            {
              color: valColor,
            },
          ]}
        >
          {value}
        </AppText>
        {unit ? (
          <AppText
            variant="caption"
            weight="400"
            color="secondary"
            style={styles.unitText}
          >
            {unit}
          </AppText>
        ) : null}
      </View>
      {subtext ? (
        <AppText
          variant="caption"
          color="tertiary"
          style={styles.subtext}
        >
          {subtext}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    flex: 1,
  },
  label: {
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueText: {
    fontSize: 20,
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0,
  },
  unitText: {
    marginLeft: 4,
  },
  subtext: {
    marginTop: 4,
  },
});
