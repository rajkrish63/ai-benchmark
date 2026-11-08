import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../ui/AppText';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  rightActionLabel?: string;
  onRightAction?: () => void;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  rightActionLabel,
  onRightAction,
  rightElement,
  children,
  style,
  contentStyle,
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.section,
        {
          marginBottom: theme.layout.sectionSpacing,
          paddingHorizontal: theme.layout.screenHorizontal,
        },
        style,
      ]}
    >
      {title || subtitle || rightActionLabel || rightElement ? (
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            {title ? (
              <AppText variant="sectionTitle" weight="500" color="primary">
                {title}
              </AppText>
            ) : null}
            {subtitle ? (
              <AppText
                variant="secondary"
                color="secondary"
                style={{ marginTop: theme.spacing[4] }}
              >
                {subtitle}
              </AppText>
            ) : null}
          </View>

          {rightElement ? (
            <View style={styles.right}>{rightElement}</View>
          ) : rightActionLabel && onRightAction ? (
            <TouchableOpacity
              onPress={onRightAction}
              accessibilityRole="button"
              accessibilityLabel={rightActionLabel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="secondary" color="accent" weight="500">
                {rightActionLabel}
              </AppText>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <View style={contentStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleBlock: {
    flex: 1,
  },
  right: {
    marginLeft: 8,
  },
});
