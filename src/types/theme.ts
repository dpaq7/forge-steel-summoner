// Theme type definitions

export type ThemeId = 'obsidian' | 'verdant' | 'crimson';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  previewColors: {
    bg: string;
    primary: string;
    secondary: string;
  };
  cssVariables: Record<string, string>;
}

export interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  themes: ThemeDefinition[];
}
