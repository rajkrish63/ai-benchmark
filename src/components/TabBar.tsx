import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppIcon, IconName } from './ui/AppIcon';
import { AppText } from './ui/AppText';

export type TabKey = 'Home' | 'Models' | 'History' | 'Settings';

interface TabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const tabs: { key: TabKey; label: string; icon: IconName }[] = [
    { key: 'Home', label: 'Home', icon: 'home' },
    { key: 'Models', label: 'Models', icon: 'layers' },
    { key: 'History', label: 'History', icon: 'history' },
    { key: 'Settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgPage, // Pure black #000000, never raised
          borderTopColor: theme.colors.border,  // 1px hairline #262626
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        const color = isActive ? theme.colors.primary : theme.colors.textTertiary;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={styles.tabItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
          >
            <View style={styles.iconContainer}>
              <AppIcon
                name={tab.icon}
                size={20}
                color={color}
                weight={isActive ? 'filled' : 'outlined'}
              />
            </View>
            <AppText
              variant="microLabel"
              weight="500"
              style={[
                styles.tabLabel,
                {
                  color,
                  letterSpacing: 0.5,
                },
              ]}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  iconContainer: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
  },
});
