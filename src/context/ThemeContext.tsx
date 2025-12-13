import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeId, ThemeContextType } from '../types/theme';
import { themes, getThemeById } from '../data/themes';

const THEME_STORAGE_KEY = 'summoner_theme';
const DEFAULT_THEME: ThemeId = 'obsidian';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      // Validate that saved value is a valid theme ID
      if (saved && themes.some(t => t.id === saved)) {
        return saved as ThemeId;
      }
    } catch {
      // localStorage unavailable
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    const theme = getThemeById(currentTheme);
    if (theme) {
      const root = document.documentElement;

      // Apply theme CSS variables
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Set data attribute for potential CSS targeting
      root.setAttribute('data-theme', currentTheme);

      // Persist selection
      try {
        localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
      } catch {
        // localStorage unavailable
      }
    }
  }, [currentTheme]);

  const setTheme = (themeId: ThemeId) => {
    // Validate theme ID
    if (themes.some(t => t.id === themeId)) {
      setCurrentTheme(themeId);
    } else {
      console.warn(`Invalid theme ID: ${themeId}`);
      setCurrentTheme(DEFAULT_THEME);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
