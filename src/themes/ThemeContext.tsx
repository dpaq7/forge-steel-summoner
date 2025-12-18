import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEMES, DEFAULT_THEME, actionCardColors } from './themes';
import type { ThemeId, Theme } from './types';

interface ThemeContextValue {
  themeId: ThemeId;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'mettle-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in THEMES) {
        return saved as ThemeId;
      }
    } catch (e) {
      console.warn('Failed to load theme from storage');
    }
    return DEFAULT_THEME;
  });

  const theme = THEMES[themeId];

  // Apply theme to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const { colors } = theme;

    // Background colors
    root.style.setProperty('--bg-darkest', colors.bgDarkest);
    root.style.setProperty('--bg-dark', colors.bgDark);
    root.style.setProperty('--bg-medium', colors.bgMedium);
    root.style.setProperty('--bg-light', colors.bgLight);
    root.style.setProperty('--bg-hover', colors.bgHover);
    root.style.setProperty('--bg-card', colors.bgCard);
    root.style.setProperty('--card-bg', colors.bgCard);

    // Text colors
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-bone', colors.textBone);
    root.style.setProperty('--text-muted', colors.textMuted);

    // Border colors
    root.style.setProperty('--border-glow', colors.borderGlow);
    root.style.setProperty('--border-solid', colors.borderSolid);
    root.style.setProperty('--border-bright', colors.borderBright);
    // Legacy variable names
    root.style.setProperty('--border-dark', colors.borderSolid);
    root.style.setProperty('--border-light', colors.borderBright);

    // Accent colors
    root.style.setProperty('--accent-bright', colors.accentBright);
    root.style.setProperty('--accent-glow', colors.accentGlow);
    root.style.setProperty('--accent-soft', colors.accentSoft);
    root.style.setProperty('--accent-dim', colors.accentDim);
    // Legacy variable name
    root.style.setProperty('--accent-primary', colors.accentBright);

    // Semantic colors
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--success-dim', colors.successDim);
    root.style.setProperty('--success-dark', colors.successDark);
    root.style.setProperty('--warning', colors.warning);
    root.style.setProperty('--warning-dim', colors.warningDim);
    root.style.setProperty('--danger', colors.danger);
    root.style.setProperty('--danger-dim', colors.dangerDim);
    root.style.setProperty('--danger-dark', colors.dangerDark);
    root.style.setProperty('--info', colors.info);

    // Special colors
    root.style.setProperty('--essence', colors.essence);
    root.style.setProperty('--essence-dim', colors.essenceDim);
    root.style.setProperty('--xp', colors.xp);
    root.style.setProperty('--xp-dim', colors.xpDim);

    // Effects
    root.style.setProperty('--shadow-glow', colors.shadowGlow);
    root.style.setProperty('--shadow-glow-strong', colors.shadowGlowStrong);
    root.style.setProperty('--shadow-card', colors.shadowCard);
    root.style.setProperty('--inner-glow', colors.innerGlow);
    root.style.setProperty('--text-glow', colors.textGlow);

    // Apply action card colors (shared across themes)
    Object.entries(actionCardColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set data attribute for CSS selectors
    root.dataset.theme = themeId;

    // Persist to storage
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('Failed to save theme to storage');
    }
  }, [theme, themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    if (id in THEMES) {
      setThemeId(id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
