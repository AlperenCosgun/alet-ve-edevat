import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'circularshare_theme';

const COLORS = {
  light: {
    background: '#FAF9F0',
    card: '#ffffff',
    textPrimary: '#2D3142',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    primary: '#FF6B35',
    primaryHover: '#ff5715',
    teal: '#2EC4B6',
    tealHover: '#20b2bc',
    gold: '#FFBF69',
    border: '#f3f4f6',
    borderStrong: '#e5e7eb',
    mapWater: '#C5E3F0',
    mapLand: '#FAF9F0',
    mapPark: '#D2ECD5',
    mapRoad: '#FFFFFF',
    inputBg: '#FDFCF0',
  },
  dark: {
    background: '#1F2937',
    card: '#111827',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    primary: '#FF6B35',
    primaryHover: '#ff5715',
    teal: '#2EC4B6',
    tealHover: '#20b2bc',
    gold: '#FFBF69',
    border: '#374151',
    borderStrong: '#4B5563',
    mapWater: '#1E3A8A',
    mapLand: '#1F2937',
    mapPark: '#065F46',
    mapRoad: '#374151',
    inputBg: '#374151',
  }
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          setTheme(saved);
        } else {
          const systemPref = Appearance.getColorScheme();
          setTheme(systemPref === 'dark' ? 'dark' : 'light');
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  if (!isReady) return null; // Or a loading spinner

  const colors = COLORS[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
