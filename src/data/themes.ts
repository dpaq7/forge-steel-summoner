import { ThemeDefinition } from '../types/theme';

// Obsidian Depths - Default dark theme with purple accents
const obsidianTheme: ThemeDefinition = {
  id: 'obsidian',
  name: 'Obsidian Depths',
  description: 'Arcane mystery & shadow',
  previewColors: {
    bg: '#0d0d12',
    primary: '#8b5cf6',
    secondary: '#22d3ee',
  },
  cssVariables: {
    // Backgrounds
    '--bg-darkest': '#0a0a0f',
    '--bg-dark': '#0d0d12',
    '--bg-medium': '#1a1a24',
    '--bg-light': '#252532',
    '--bg-hover': '#2d2d3d',

    // Accents - Deep Amethyst
    '--accent-bright': '#8b5cf6',
    '--accent-glow': '#a78bfa',
    '--accent-soft': '#c4b5fd',
    '--accent-dim': '#6d28d9',

    // Text
    '--text-primary': '#e8e6f0',
    '--text-secondary': '#a8a4b8',
    '--text-bone': '#d4c8e0',
    '--text-muted': '#6b6880',

    // Borders
    '--border-glow': 'rgba(139, 92, 246, 0.25)',
    '--border-solid': '#3d3d4d',
    '--border-bright': '#a78bfa',

    // Status colors
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#8b5cf6',
    '--essence-dim': 'rgba(139, 92, 246, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',

    // Effects
    '--shadow-glow': '0 0 10px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(139, 92, 246, 0.1)',
    '--text-glow': '0 0 10px rgba(139, 92, 246, 0.5)',

    // Action card colors
    '--action-main-bg': '#1a1a2a',
    '--action-main-border': '#4a5ac2',
    '--action-main-accent': '#6478f6',
    '--action-main-glow': 'rgba(100, 120, 246, 0.3)',
    '--action-main-header': '#2a2a4a',

    '--action-maneuver-bg': '#1a2a1a',
    '--action-maneuver-border': '#7cb342',
    '--action-maneuver-accent': '#9ccc65',
    '--action-maneuver-glow': 'rgba(156, 204, 101, 0.3)',
    '--action-maneuver-header': '#2a3a2a',

    '--action-triggered-bg': '#2a2a1a',
    '--action-triggered-border': '#ff9800',
    '--action-triggered-accent': '#ffb74d',
    '--action-triggered-glow': 'rgba(255, 183, 77, 0.3)',
    '--action-triggered-header': '#3a3a1a',

    '--action-free-bg': '#2a1a2a',
    '--action-free-border': '#e91e63',
    '--action-free-accent': '#f06292',
    '--action-free-glow': 'rgba(240, 98, 146, 0.3)',
    '--action-free-header': '#3a2a3a',

    '--action-heroic-bg': '#2a1a3a',
    '--action-heroic-border': '#9c27b0',
    '--action-heroic-accent': '#ba68c8',
    '--action-heroic-glow': 'rgba(186, 104, 200, 0.3)',
    '--action-heroic-header': '#3a2a4a',

    '--action-signature-bg': '#1a2a3a',
    '--action-signature-border': '#22d3ee',
    '--action-signature-accent': '#67e8f9',
    '--action-signature-glow': 'rgba(103, 232, 249, 0.3)',
    '--action-signature-header': '#1a3a4a',

    '--action-villain-bg': '#2a1a1a',
    '--action-villain-border': '#b71c1c',
    '--action-villain-accent': '#ef5350',
    '--action-villain-glow': 'rgba(239, 83, 80, 0.3)',
    '--action-villain-header': '#3a1a1a',

    '--action-utility-bg': '#1a1a2a',
    '--action-utility-border': '#607d8b',
    '--action-utility-accent': '#90a4ae',
    '--action-utility-glow': 'rgba(144, 164, 174, 0.3)',
    '--action-utility-header': '#2a2a3a',
  },
};

// Verdant Hollow - Forest/Nature theme with green/gold accents
const verdantTheme: ThemeDefinition = {
  id: 'verdant',
  name: 'Verdant Hollow',
  description: 'Forest magic & nature',
  previewColors: {
    bg: '#0f1410',
    primary: '#10b981',
    secondary: '#f59e0b',
  },
  cssVariables: {
    // Backgrounds
    '--bg-darkest': '#0a0f0c',
    '--bg-dark': '#0f1410',
    '--bg-medium': '#1a211c',
    '--bg-light': '#242d26',
    '--bg-hover': '#2d382f',

    // Accents - Emerald
    '--accent-bright': '#10b981',
    '--accent-glow': '#34d399',
    '--accent-soft': '#6ee7b7',
    '--accent-dim': '#059669',

    // Text
    '--text-primary': '#e8f0e8',
    '--text-secondary': '#a4b8a8',
    '--text-bone': '#d4e0c8',
    '--text-muted': '#6b806e',

    // Borders
    '--border-glow': 'rgba(16, 185, 129, 0.25)',
    '--border-solid': '#3d4d3f',
    '--border-bright': '#34d399',

    // Status colors
    '--success': '#22c55e',
    '--success-dim': 'rgba(34, 197, 94, 0.15)',
    '--success-dark': '#1a2a1a',
    '--danger': '#ef4444',
    '--danger-dim': 'rgba(239, 68, 68, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#f59e0b',
    '--warning-dim': 'rgba(245, 158, 11, 0.15)',
    '--essence': '#10b981',
    '--essence-dim': 'rgba(16, 185, 129, 0.15)',
    '--xp': '#eab308',
    '--xp-dim': 'rgba(234, 179, 8, 0.15)',

    // Effects
    '--shadow-glow': '0 0 10px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 20, 10, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(16, 185, 129, 0.1)',
    '--text-glow': '0 0 10px rgba(16, 185, 129, 0.5)',

    // Action card colors
    '--action-main-bg': '#1a2a2a',
    '--action-main-border': '#4a90c2',
    '--action-main-accent': '#64b5f6',
    '--action-main-glow': 'rgba(100, 181, 246, 0.3)',
    '--action-main-header': '#2a4a4a',

    '--action-maneuver-bg': '#1a2a1a',
    '--action-maneuver-border': '#10b981',
    '--action-maneuver-accent': '#34d399',
    '--action-maneuver-glow': 'rgba(52, 211, 153, 0.3)',
    '--action-maneuver-header': '#2a3a2a',

    '--action-triggered-bg': '#2a2a1a',
    '--action-triggered-border': '#f59e0b',
    '--action-triggered-accent': '#fbbf24',
    '--action-triggered-glow': 'rgba(251, 191, 36, 0.3)',
    '--action-triggered-header': '#3a3a1a',

    '--action-free-bg': '#2a1a2a',
    '--action-free-border': '#e91e63',
    '--action-free-accent': '#f06292',
    '--action-free-glow': 'rgba(240, 98, 146, 0.3)',
    '--action-free-header': '#3a2a2a',

    '--action-heroic-bg': '#1a2a2a',
    '--action-heroic-border': '#10b981',
    '--action-heroic-accent': '#34d399',
    '--action-heroic-glow': 'rgba(52, 211, 153, 0.3)',
    '--action-heroic-header': '#2a3a3a',

    '--action-signature-bg': '#1a2a1a',
    '--action-signature-border': '#34d399',
    '--action-signature-accent': '#6ee7b7',
    '--action-signature-glow': 'rgba(110, 231, 183, 0.3)',
    '--action-signature-header': '#2a3a2a',

    '--action-villain-bg': '#2a1a1a',
    '--action-villain-border': '#b71c1c',
    '--action-villain-accent': '#ef5350',
    '--action-villain-glow': 'rgba(239, 83, 80, 0.3)',
    '--action-villain-header': '#3a1a1a',

    '--action-utility-bg': '#1a2a2a',
    '--action-utility-border': '#607d8b',
    '--action-utility-accent': '#90a4ae',
    '--action-utility-glow': 'rgba(144, 164, 174, 0.3)',
    '--action-utility-header': '#2a3a3a',
  },
};

// Crimson Veil - Blood/Undead theme with red/bone accents
const crimsonTheme: ThemeDefinition = {
  id: 'crimson',
  name: 'Crimson Veil',
  description: 'Blood & bone, undead',
  previewColors: {
    bg: '#120a0a',
    primary: '#dc2626',
    secondary: '#d4c4a8',
  },
  cssVariables: {
    // Backgrounds
    '--bg-darkest': '#0a0808',
    '--bg-dark': '#120a0a',
    '--bg-medium': '#1f1414',
    '--bg-light': '#2a1c1c',
    '--bg-hover': '#3d2626',

    // Accents - Blood Red
    '--accent-bright': '#dc2626',
    '--accent-glow': '#ef4444',
    '--accent-soft': '#fca5a5',
    '--accent-dim': '#b91c1c',

    // Text
    '--text-primary': '#f5f0f0',
    '--text-secondary': '#c4b8b8',
    '--text-bone': '#d4c4a8',
    '--text-muted': '#8a7a7a',

    // Borders
    '--border-glow': 'rgba(220, 38, 38, 0.25)',
    '--border-solid': '#4d3636',
    '--border-bright': '#ef4444',

    // Status colors
    '--success': '#22c55e',
    '--success-dim': 'rgba(34, 197, 94, 0.15)',
    '--success-dark': '#1a2a1a',
    '--danger': '#dc2626',
    '--danger-dim': 'rgba(220, 38, 38, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#f59e0b',
    '--warning-dim': 'rgba(245, 158, 11, 0.15)',
    '--essence': '#dc2626',
    '--essence-dim': 'rgba(220, 38, 38, 0.15)',
    '--xp': '#f59e0b',
    '--xp-dim': 'rgba(245, 158, 11, 0.15)',

    // Effects
    '--shadow-glow': '0 0 10px rgba(220, 38, 38, 0.3), 0 0 20px rgba(220, 38, 38, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(220, 38, 38, 0.5), 0 0 30px rgba(220, 38, 38, 0.25)',
    '--shadow-card': '0 2px 8px rgba(20, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(220, 38, 38, 0.1)',
    '--text-glow': '0 0 10px rgba(220, 38, 38, 0.5)',

    // Action card colors
    '--action-main-bg': '#1a1a2a',
    '--action-main-border': '#4a90c2',
    '--action-main-accent': '#64b5f6',
    '--action-main-glow': 'rgba(100, 181, 246, 0.3)',
    '--action-main-header': '#2a2a3a',

    '--action-maneuver-bg': '#1a2a1a',
    '--action-maneuver-border': '#7cb342',
    '--action-maneuver-accent': '#9ccc65',
    '--action-maneuver-glow': 'rgba(156, 204, 101, 0.3)',
    '--action-maneuver-header': '#2a3a2a',

    '--action-triggered-bg': '#2a2a1a',
    '--action-triggered-border': '#ff9800',
    '--action-triggered-accent': '#ffb74d',
    '--action-triggered-glow': 'rgba(255, 183, 77, 0.3)',
    '--action-triggered-header': '#3a3a1a',

    '--action-free-bg': '#2a1a1a',
    '--action-free-border': '#dc2626',
    '--action-free-accent': '#ef4444',
    '--action-free-glow': 'rgba(239, 68, 68, 0.3)',
    '--action-free-header': '#3a2a2a',

    '--action-heroic-bg': '#2a1a1a',
    '--action-heroic-border': '#dc2626',
    '--action-heroic-accent': '#ef4444',
    '--action-heroic-glow': 'rgba(239, 68, 68, 0.3)',
    '--action-heroic-header': '#3a1a1a',

    '--action-signature-bg': '#2a1a1a',
    '--action-signature-border': '#d4c4a8',
    '--action-signature-accent': '#e8dcc4',
    '--action-signature-glow': 'rgba(212, 196, 168, 0.3)',
    '--action-signature-header': '#3a2a2a',

    '--action-villain-bg': '#2a1a1a',
    '--action-villain-border': '#dc2626',
    '--action-villain-accent': '#ef4444',
    '--action-villain-glow': 'rgba(239, 68, 68, 0.3)',
    '--action-villain-header': '#3a1a1a',

    '--action-utility-bg': '#1a1a1a',
    '--action-utility-border': '#607d8b',
    '--action-utility-accent': '#90a4ae',
    '--action-utility-glow': 'rgba(144, 164, 174, 0.3)',
    '--action-utility-header': '#2a2a2a',
  },
};

// Default cyan theme (current theme)
export const defaultTheme: ThemeDefinition = {
  id: 'obsidian' as const, // We'll map this as the default
  name: 'Emerald Depths',
  description: 'Default cyan glow',
  previewColors: {
    bg: '#0a1a18',
    primary: '#00e6c3',
    secondary: '#4aeadc',
  },
  cssVariables: {
    // Original theme - no changes needed as it's already in theme.css
  },
};

export const themes: ThemeDefinition[] = [
  obsidianTheme,
  verdantTheme,
  crimsonTheme,
];

export const getThemeById = (id: string): ThemeDefinition | undefined => {
  return themes.find(theme => theme.id === id);
};
