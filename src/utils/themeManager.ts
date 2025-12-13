// Theme manager utility for applying and switching themes
// Supports both legacy themes and class-specific themes

import { HeroClass } from '../types/hero';
import { classThemes, defaultClassTheme, ClassTheme } from '../data/class-themes';
import { themes as legacyThemes, getThemeById } from '../data/themes';
import { ThemeDefinition } from '../types/theme';

const THEME_STORAGE_KEY = 'mettle-active-theme';
const THEME_MODE_KEY = 'mettle-theme-mode'; // 'auto' | 'manual'

export type ThemeMode = 'auto' | 'manual';

// Apply CSS variables from a theme to the document root
function applyThemeVariables(cssVariables: Record<string, string>): void {
  const root = document.documentElement;

  Object.entries(cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Apply a class-specific theme
export function applyClassTheme(heroClass: HeroClass): void {
  const theme = classThemes[heroClass];
  if (!theme) {
    console.warn(`No theme found for class: ${heroClass}`);
    return;
  }

  applyThemeVariables(theme.cssVariables);
  localStorage.setItem(THEME_STORAGE_KEY, theme.themeId);
}

// Apply a legacy theme by ID
export function applyLegacyTheme(themeId: string): void {
  const theme = getThemeById(themeId);
  if (!theme) {
    console.warn(`No legacy theme found with ID: ${themeId}`);
    return;
  }

  applyThemeVariables(theme.cssVariables);
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

// Apply the default theme (summoner/cyan)
export function applyDefaultTheme(): void {
  applyThemeVariables(defaultClassTheme.cssVariables);
  localStorage.setItem(THEME_STORAGE_KEY, defaultClassTheme.themeId);
}

// Load and apply the saved theme (or default if none saved)
export function loadSavedTheme(): void {
  const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);

  if (!savedThemeId) {
    applyDefaultTheme();
    return;
  }

  // Try to find as class theme first
  const classTheme = Object.values(classThemes).find((t) => t.themeId === savedThemeId);
  if (classTheme) {
    applyThemeVariables(classTheme.cssVariables);
    return;
  }

  // Try to find as legacy theme
  const legacyTheme = getThemeById(savedThemeId);
  if (legacyTheme) {
    applyThemeVariables(legacyTheme.cssVariables);
    return;
  }

  // Fall back to default
  applyDefaultTheme();
}

// Get the current theme mode setting
export function getThemeMode(): ThemeMode {
  const mode = localStorage.getItem(THEME_MODE_KEY);
  return mode === 'manual' ? 'manual' : 'auto';
}

// Set the theme mode
export function setThemeMode(mode: ThemeMode): void {
  localStorage.setItem(THEME_MODE_KEY, mode);
}

// Get the class theme for a hero class
export function getThemeForClass(heroClass: HeroClass): ClassTheme {
  return classThemes[heroClass];
}

// Get the current saved theme ID
export function getCurrentThemeId(): string | null {
  return localStorage.getItem(THEME_STORAGE_KEY);
}

// Check if a theme is a class theme
export function isClassTheme(themeId: string): boolean {
  return themeId.startsWith('class-');
}

// Extract hero class from class theme ID
export function getClassFromThemeId(themeId: string): HeroClass | null {
  if (!isClassTheme(themeId)) return null;
  const classId = themeId.replace('class-', '') as HeroClass;
  return classThemes[classId] ? classId : null;
}

// Get all available themes (both class and legacy)
export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  previewColors: { bg: string; primary: string; secondary: string };
  isClassTheme: boolean;
  heroClass?: HeroClass;
}

export function getAllThemeOptions(): ThemeOption[] {
  const classOptions: ThemeOption[] = Object.values(classThemes).map((theme) => ({
    id: theme.themeId,
    name: theme.name,
    description: theme.description,
    previewColors: theme.previewColors,
    isClassTheme: true,
    heroClass: theme.id,
  }));

  const legacyOptions: ThemeOption[] = legacyThemes.map((theme) => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    previewColors: theme.previewColors,
    isClassTheme: false,
  }));

  return [...classOptions, ...legacyOptions];
}

// Auto-apply theme based on hero class if in auto mode
export function autoApplyThemeForHero(heroClass: HeroClass | null): void {
  const mode = getThemeMode();

  if (mode === 'auto' && heroClass) {
    applyClassTheme(heroClass);
  }
}

// Apply a theme by ID (works for both class and legacy themes)
export function applyThemeById(themeId: string): void {
  // Try class theme first
  const classTheme = Object.values(classThemes).find((t) => t.themeId === themeId);
  if (classTheme) {
    applyThemeVariables(classTheme.cssVariables);
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    return;
  }

  // Try legacy theme
  const legacyTheme = getThemeById(themeId);
  if (legacyTheme) {
    applyThemeVariables(legacyTheme.cssVariables);
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    return;
  }

  console.warn(`Theme not found: ${themeId}`);
}
