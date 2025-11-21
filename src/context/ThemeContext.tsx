import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemColorScheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setColorScheme(systemColorScheme);
    } else {
      setColorScheme(themeMode as ColorSchemeName);
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const prefData = await AsyncStorage.getItem('app_preferences');
      if (prefData) {
        const preferences = JSON.parse(prefData);
        if (preferences.theme) {
          setThemeModeState(preferences.theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      const prefData = await AsyncStorage.getItem('app_preferences');
      const preferences = prefData ? JSON.parse(prefData) : {};
      preferences.theme = mode;
      await AsyncStorage.setItem('app_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
