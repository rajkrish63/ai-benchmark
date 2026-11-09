import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppIcon } from './ui/AppIcon';
import { AppText } from './ui/AppText';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  leftActionLabel?: string;
  onLeftAction?: () => void;
  rightActionLabel?: string;
  onRightAction?: () => void;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLogo = false,
  leftActionLabel,
  onLeftAction,
  rightActionLabel,
  onRightAction,
  rightElement,
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: theme.layout.screenHorizontal,
          paddingTop: theme.spacing[16],
          paddingBottom: theme.spacing[12],
          backgroundColor: theme.colors.bgPage,
        },
      ]}
    >
      {onLeftAction ? (
        <TouchableOpacity
          onPress={onLeftAction}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={leftActionLabel || 'Back'}
        >
          <AppIcon name="arrow_back" size={20} color={theme.colors.textPrimary} />
          {leftActionLabel && leftActionLabel !== '← Back' ? (
            <AppText variant="secondary" color="secondary" style={styles.backLabel}>
              {leftActionLabel}
            </AppText>
          ) : null}
        </TouchableOpacity>
      ) : null}

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          {showLogo ? (
            <View
              style={[
                styles.logoBadge,
                {
                  backgroundColor: theme.colors.surfaceCard,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppIcon name="bolt" size={16} color={theme.colors.primary} />
            </View>
          ) : null}
          <AppText variant="screenTitle" weight="500" color="primary">
            {title}
          </AppText>
        </View>
        {subtitle ? (
          <AppText
            variant="secondary"
            color="secondary"
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {rightElement ? (
        <View style={styles.rightAction}>{rightElement}</View>
      ) : rightActionLabel && onRightAction ? (
        <TouchableOpacity
          onPress={onRightAction}
          style={styles.rightAction}
          accessibilityRole="button"
          accessibilityLabel={rightActionLabel}
        >
          <AppText variant="secondary" color="accent" weight="500">
            {rightActionLabel}
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backLabel: {
    marginLeft: 6,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subtitle: {
    marginTop: 4,
  },
  rightAction: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
