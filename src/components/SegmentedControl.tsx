import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppText } from './ui/AppText';

export interface SegmentedControlProps<T> {
  label?: string;
  options: T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  formatOption?: (value: T) => string;
  style?: ViewStyle;
}

export function SegmentedControl<T extends string | number>({
  label,
  options,
  selectedValue,
  onSelect,
  formatOption,
  style,
}: SegmentedControlProps<T>) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <AppText
          variant="secondary"
          weight="500"
          color="secondary"
          style={styles.label}
        >
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.optionsRow,
          {
            backgroundColor: theme.colors.surfaceCard, // #0A0A0A
            borderColor: theme.colors.border,          // 1px #262626
            borderRadius: theme.radius.segmented,      // 10px
          },
        ]}
      >
        {options.map((opt) => {
          const isSelected = opt === selectedValue;
          return (
            <Pressable
              key={String(opt)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(opt)}
              style={({ pressed }) => [
                styles.optionButton,
                {
                  borderRadius: 6, // Nested radius: 10 - 4 = 6px
                  backgroundColor: isSelected ? theme.colors.surfaceRaised : 'transparent',
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <AppText
                variant="secondary"
                weight={isSelected ? '500' : '400'}
                style={{
                  color: isSelected ? theme.colors.textPrimary : theme.colors.textTertiary,
                }}
              >
                {formatOption ? formatOption(opt) : String(opt)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 4,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
});
