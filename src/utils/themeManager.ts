// Theme manager utility for applying and switching themes
// Supports hero-specific overrides and class default themes

import { HeroClass } from '../types/hero';
import { createScopedLogger } from './logger';

const log = createScopedLogger('ThemeManager');
import { ThemeDefinition, ThemeId } from '../types/theme';
import {
  allThemes,
  classThemes,
  getThemeById,
  getDefaultThemeForClass,
  getCreatorTheme,
  mcdmTheme,
} from '../data/themes';

const THEME_STORAGE_KEY = 'mettle-active-theme';
const THEME_OVERRIDE_KEY = 'mettle-theme-override';

interface ThemePreference {
  heroId: string;
  themeId: string;
}

// Apply CSS variables from a theme to the document root
function applyThemeVariables(cssVariables: Record<string, string>): void {
  const root = document.documentElement;

  Object.entries(cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Apply a theme's colors to CSS custom properties
 */
export function applyTheme(theme: ThemeDefinition): void {
  applyThemeVariables(theme.cssVariables);
  localStorage.setItem(THEME_STORAGE_KEY, theme.id);

  // Set data attribute for CSS targeting
  document.documentElement.dataset.theme = theme.id;
}

/**
 * Apply the MCDM creator theme (for character creation)
 */
export function applyCreatorTheme(): void {
  applyTheme(getCreatorTheme());
}

/**
 * Apply theme for a specific hero
 * Checks for user override first, then falls back to class default
 */
export function applyThemeForHero(heroId: string, heroClass: HeroClass): void {
  // Check for user override
  const override = getThemeOverride(heroId);

  if (override) {
    const theme = getThemeById(override);
    if (theme) {
      applyTheme(theme);
      return;
    }
  }

  // Fall back to class default
  const defaultTheme = getDefaultThemeForClass(heroClass);
  applyTheme(defaultTheme);
}

/**
 * Get user's theme override for a hero
 */
export function getThemeOverride(heroId: string): string | null {
  try {
    const stored = localStorage.getItem(THEME_OVERRIDE_KEY);
    if (!stored) return null;

    const preferences: ThemePreference[] = JSON.parse(stored);
    const pref = preferences.find((p) => p.heroId === heroId);
    return pref?.themeId || null;
  } catch {
    return null;
  }
}

/**
 * Set user's theme override for a hero
 */
export function setThemeOverride(heroId: string, themeId: string): void {
  try {
    const stored = localStorage.getItem(THEME_OVERRIDE_KEY);
    let preferences: ThemePreference[] = stored ? JSON.parse(stored) : [];

    // Remove existing preference for this hero
    preferences = preferences.filter((p) => p.heroId !== heroId);

    // Add new preference
    preferences.push({ heroId, themeId });

    localStorage.setItem(THEME_OVERRIDE_KEY, JSON.stringify(preferences));
  } catch (error) {
    log.error('Failed to save theme preference', error);
  }
}

/**
 * Clear theme override for a hero (revert to class default)
 */
export function clearThemeOverride(heroId: string): void {
  try {
    const stored = localStorage.getItem(THEME_OVERRIDE_KEY);
    if (!stored) return;

    let preferences: ThemePreference[] = JSON.parse(stored);
    preferences = preferences.filter((p) => p.heroId !== heroId);

    localStorage.setItem(THEME_OVERRIDE_KEY, JSON.stringify(preferences));
  } catch (error) {
    log.error('Failed to clear theme preference', error);
  }
}

/**
 * Get the current theme ID for a hero (override or default)
 */
export function getCurrentThemeId(heroId: string, heroClass: HeroClass): ThemeId {
  const override = getThemeOverride(heroId);
  if (override) return override as ThemeId;
  return getDefaultThemeForClass(heroClass).id;
}

/**
 * Load and apply the saved theme (or MCDM theme if none saved)
 */
export function loadSavedTheme(): void {
  const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);

  if (!savedThemeId) {
    applyCreatorTheme();
    return;
  }

  const theme = getThemeById(savedThemeId);
  if (theme) {
    applyTheme(theme);
    return;
  }

  // Fall back to MCDM theme
  applyCreatorTheme();
}

/**
 * Apply a theme by ID
 */
export function applyThemeById(themeId: string): void {
  const theme = getThemeById(themeId);
  if (theme) {
    applyTheme(theme);
  } else {
    log.warn(`Theme not found: ${themeId}`);
  }
}

/**
 * Get the current saved theme ID
 */
export function getCurrentSavedThemeId(): string | null {
  return localStorage.getItem(THEME_STORAGE_KEY);
}

/**
 * Check if a hero is using their default class theme (no override)
 */
export function isUsingDefaultTheme(heroId: string, heroClass: HeroClass): boolean {
  const override = getThemeOverride(heroId);
  if (!override) return true;
  return override === getDefaultThemeForClass(heroClass).id;
}

/**
 * Get all selectable themes for the picker (excludes MCDM theme)
 */
export function getSelectableThemes(): ThemeDefinition[] {
  return classThemes;
}

/**
 * Get all themes including MCDM
 */
export function getAllThemes(): ThemeDefinition[] {
  return allThemes;
}

/**
 * Reset all theme preferences to defaults
 * Useful for recovering from corrupted theme data
 */
export function resetAllThemePreferences(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
    localStorage.removeItem(THEME_OVERRIDE_KEY);
    applyCreatorTheme();
  } catch (error) {
    log.error('Failed to reset theme preferences', error);
  }
}

/**
 * Safely validate and repair theme data in localStorage
 * Returns true if data was valid or successfully repaired
 */
export function validateAndRepairThemeData(): boolean {
  try {
    // Check active theme
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedThemeId) {
      const theme = getThemeById(savedThemeId);
      if (!theme) {
        log.warn(`Invalid saved theme ID: ${savedThemeId}, resetting...`);
        localStorage.removeItem(THEME_STORAGE_KEY);
      }
    }

    // Check theme overrides
    const overridesJson = localStorage.getItem(THEME_OVERRIDE_KEY);
    if (overridesJson) {
      try {
        const overrides = JSON.parse(overridesJson);
        if (!Array.isArray(overrides)) {
          log.warn('Theme overrides is not an array, resetting...');
          localStorage.removeItem(THEME_OVERRIDE_KEY);
        } else {
          // Filter out invalid entries
          const validOverrides = overrides.filter((entry: unknown) => {
            if (typeof entry !== 'object' || entry === null) return false;
            const e = entry as Record<string, unknown>;
            return typeof e.heroId === 'string' && typeof e.themeId === 'string';
          });

          if (validOverrides.length !== overrides.length) {
            log.warn('Some theme overrides were invalid, cleaning up...');
            localStorage.setItem(THEME_OVERRIDE_KEY, JSON.stringify(validOverrides));
          }
        }
      } catch {
        log.warn('Theme overrides JSON is corrupted, resetting...');
        localStorage.removeItem(THEME_OVERRIDE_KEY);
      }
    }

    return true;
  } catch (error) {
    log.error('Failed to validate theme data', error);
    return false;
  }
}

// Re-export useful items from themes.ts
export { getThemeById, getDefaultThemeForClass, getCreatorTheme, mcdmTheme };
