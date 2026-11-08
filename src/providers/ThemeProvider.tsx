import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { AppTheme, darkTheme, ThemeMode } from '../theme';

interface ThemeContextValue {
  theme: AppTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loadSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Dark-mode only app. Pure black OLED, always.
  const theme: AppTheme = darkTheme;
  const isDark = true;
  const themeMode: ThemeMode = 'dark';

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      await updateSettings({ theme_mode: mode });
    },
    [updateSettings]
  );

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeMode,
      isDark,
      setThemeMode,
    }),
    [theme, themeMode, isDark, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
