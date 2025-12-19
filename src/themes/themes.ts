import type { Theme, ThemeId } from './types';

// Common action card colors shared across all themes
const actionCardColors = {
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
};

// ════════════════════════════════════════════════════════════════
// THEME 1: MIDNIGHT INK
// Cool blue/slate with warm eggshell accents
// ════════════════════════════════════════════════════════════════

export const midnightInk: Theme = {
  id: 'midnight-ink',
  name: 'Midnight Ink',
  description: 'Cool blue depths with warm golden accents',
  colors: {
    // Backgrounds - Ink Black / Deep Space Blue
    bgDarkest: '#0a0f1a',
    bgDark: '#0f1524',
    bgMedium: '#1d2a49',
    bgLight: '#2c3f6d',
    bgHover: '#3a4d7a',
    bgCard: '#1f3047',

    // Text - Blue Slate lights
    textPrimary: '#eef3f6',
    textSecondary: '#9bb4ca',
    textBone: '#d4e0eb',
    textMuted: '#5882a7',

    // Borders - Dusty Denim
    borderGlow: 'rgba(198, 178, 108, 0.25)',
    borderSolid: '#394a60',
    borderBright: '#c6b26c',

    // Accent - Eggshell (warm gold)
    accentBright: '#c6b26c',
    accentGlow: '#d4c691',
    accentSoft: '#e2d9b8',
    accentDim: '#6e602b',

    // Semantic
    success: '#4caf50',
    successDim: 'rgba(76, 175, 80, 0.15)',
    successDark: '#1a2a2a',
    warning: '#ff9800',
    warningDim: 'rgba(255, 152, 0, 0.15)',
    danger: '#ef5350',
    dangerDim: 'rgba(239, 83, 80, 0.15)',
    dangerDark: '#2a1a1a',
    info: '#496ab6',

    // Special
    essence: '#496ab6',
    essenceDim: 'rgba(73, 106, 182, 0.15)',
    xp: '#b89f47',
    xpDim: 'rgba(184, 159, 71, 0.15)',

    // Effects
    shadowGlow: '0 0 10px rgba(198, 178, 108, 0.3), 0 0 20px rgba(198, 178, 108, 0.15)',
    shadowGlowStrong: '0 0 15px rgba(198, 178, 108, 0.5), 0 0 30px rgba(198, 178, 108, 0.25)',
    shadowCard: '0 2px 8px rgba(0, 0, 0, 0.5)',
    innerGlow: 'inset 0 0 20px rgba(198, 178, 108, 0.1)',
    textGlow: '0 0 10px rgba(198, 178, 108, 0.5)',
  },
  preview: {
    bg: '#0f1524',
    accent: '#c6b26c',
    text: '#eef3f6',
  },
};

// ════════════════════════════════════════════════════════════════
// THEME 2: CRIMSON VEIL
// Deep crimsons, warm oranges, and dark teal accents
// Palette: Crimson Violet, Deep Crimson, Princeton Orange, Autumn Leaf, Dark Teal
// ════════════════════════════════════════════════════════════════

export const crimsonVeil: Theme = {
  id: 'crimson-veil',
  name: 'Crimson Veil',
  description: 'Deep crimsons with warm orange highlights and teal accents',
  colors: {
    // Backgrounds - Derived from Crimson Violet (#5f0f40)
    bgDarkest: '#0d0509',    // Near black with crimson hint
    bgDark: '#1a0812',       // Very dark crimson
    bgMedium: '#2d0f1c',     // Dark crimson
    bgLight: '#3d1426',      // Medium dark crimson
    bgHover: '#4d1930',      // Elevated/hover crimson
    bgCard: '#3a1020',       // Card background

    // Text - Warm whites for readability
    textPrimary: '#fff5f0',
    textSecondary: '#e8c4b8',
    textBone: '#f5ddd5',
    textMuted: '#9a6050',

    // Borders - Crimson Violet (#5f0f40)
    borderGlow: 'rgba(251, 139, 36, 0.25)',  // Princeton Orange glow
    borderSolid: '#5f0f40',                   // Crimson Violet
    borderBright: '#fb8b24',                  // Princeton Orange

    // Accent - Princeton Orange (#fb8b24) and Autumn Leaf (#e36414)
    accentBright: '#fb8b24',   // Princeton Orange - highlights
    accentGlow: '#fca54e',     // Princeton Orange lightened
    accentSoft: '#e36414',     // Autumn Leaf - secondary
    accentDim: '#9a031e',      // Deep Crimson - muted accent

    // Semantic
    success: '#0f4c5c',        // Dark Teal
    successDim: 'rgba(15, 76, 92, 0.2)',
    successDark: '#0a343f',
    warning: '#fb8b24',        // Princeton Orange
    warningDim: 'rgba(251, 139, 36, 0.15)',
    danger: '#9a031e',         // Deep Crimson
    dangerDim: 'rgba(154, 3, 30, 0.15)',
    dangerDark: '#3d0a12',
    info: '#0f4c5c',           // Dark Teal

    // Special
    essence: '#9a031e',        // Deep Crimson
    essenceDim: 'rgba(154, 3, 30, 0.2)',
    xp: '#fb8b24',             // Princeton Orange
    xpDim: 'rgba(251, 139, 36, 0.15)',

    // Effects - Based on Princeton Orange for warmth
    shadowGlow: '0 0 10px rgba(251, 139, 36, 0.3), 0 0 20px rgba(251, 139, 36, 0.15)',
    shadowGlowStrong: '0 0 15px rgba(251, 139, 36, 0.5), 0 0 30px rgba(251, 139, 36, 0.25)',
    shadowCard: '0 2px 8px rgba(0, 0, 0, 0.5)',
    innerGlow: 'inset 0 0 20px rgba(251, 139, 36, 0.1)',
    textGlow: '0 0 10px rgba(251, 139, 36, 0.5)',
  },
  preview: {
    bg: '#1a0812',
    accent: '#fb8b24',
    text: '#fff5f0',
  },
};

// ════════════════════════════════════════════════════════════════
// THEME 3: VERDANT SHADOW
// Grey graphite with green celadon/fern accents
// ════════════════════════════════════════════════════════════════

export const verdantShadow: Theme = {
  id: 'verdant-shadow',
  name: 'Verdant Shadow',
  description: 'Stone grey depths with living green accents',
  colors: {
    // Backgrounds - Graphite / Iron Grey
    bgDarkest: '#111312',
    bgDark: '#181b1a',
    bgMedium: '#313533',
    bgLight: '#49504d',
    bgHover: '#555c58',
    bgCard: '#323433',

    // Text - Grey Olive lights
    textPrimary: '#f2f3f2',
    textSecondary: '#b1b4b1',
    textBone: '#d5d8d5',
    textMuted: '#7d827d',

    // Borders - Iron Grey
    borderGlow: 'rgba(98, 208, 103, 0.25)',
    borderSolid: '#4b4e4c',
    borderBright: '#62d067',

    // Accent - Celadon (bright green)
    accentBright: '#62d067',
    accentGlow: '#89dc8d',
    accentSoft: '#b0e8b3',
    accentDim: '#237627',

    // Semantic
    success: '#3bc442',
    successDim: 'rgba(59, 196, 66, 0.15)',
    successDark: '#1a2a1a',
    warning: '#c6b26c',
    warningDim: 'rgba(198, 178, 108, 0.15)',
    danger: '#ef5350',
    dangerDim: 'rgba(239, 83, 80, 0.15)',
    dangerDark: '#2a1a1a',
    info: '#679870',

    // Special
    essence: '#679870',
    essenceDim: 'rgba(103, 152, 112, 0.15)',
    xp: '#89dc8d',
    xpDim: 'rgba(137, 220, 141, 0.15)',

    // Effects
    shadowGlow: '0 0 10px rgba(98, 208, 103, 0.3), 0 0 20px rgba(98, 208, 103, 0.15)',
    shadowGlowStrong: '0 0 15px rgba(98, 208, 103, 0.5), 0 0 30px rgba(98, 208, 103, 0.25)',
    shadowCard: '0 2px 8px rgba(0, 0, 0, 0.5)',
    innerGlow: 'inset 0 0 20px rgba(98, 208, 103, 0.1)',
    textGlow: '0 0 10px rgba(98, 208, 103, 0.5)',
  },
  preview: {
    bg: '#181b1a',
    accent: '#62d067',
    text: '#f2f3f2',
  },
};

// ════════════════════════════════════════════════════════════════
// THEME 4: TWILIGHT VIOLET
// Purple/violet with lavender grey accents
// ════════════════════════════════════════════════════════════════

export const twilightViolet: Theme = {
  id: 'twilight-violet',
  name: 'Twilight Violet',
  description: 'Mystical purple depths with soft lavender highlights',
  colors: {
    // Backgrounds - Midnight Violet / Vintage Grape
    bgDarkest: '#190b12',
    bgDark: '#240f1a',
    bgMedium: '#471f34',
    bgLight: '#6b2e4e',
    bgHover: '#7b3e5e',
    bgCard: '#372b3b',

    // Text - Lavender Grey lights
    textPrimary: '#f0f1f5',
    textSecondary: '#a2a9c3',
    textBone: '#cdd0df',
    textMuted: '#656f9a',

    // Borders - Vintage Grape
    borderGlow: 'rgba(194, 112, 154, 0.25)',
    borderSolid: '#524158',
    borderBright: '#c2709a',

    // Accent - Midnight Violet brights
    accentBright: '#c2709a',
    accentGlow: '#d194b4',
    accentSoft: '#e0b8ce',
    accentDim: '#6b2e4e',

    // Semantic
    success: '#4caf50',
    successDim: 'rgba(76, 175, 80, 0.15)',
    successDark: '#1a2a2a',
    warning: '#ffab40',
    warningDim: 'rgba(255, 171, 64, 0.15)',
    danger: '#ef5350',
    dangerDim: 'rgba(239, 83, 80, 0.15)',
    dangerDark: '#2a1a1a',
    info: '#848cae',

    // Special
    essence: '#886c93',
    essenceDim: 'rgba(136, 108, 147, 0.15)',
    xp: '#d194b4',
    xpDim: 'rgba(209, 148, 180, 0.15)',

    // Effects
    shadowGlow: '0 0 10px rgba(194, 112, 154, 0.3), 0 0 20px rgba(194, 112, 154, 0.15)',
    shadowGlowStrong: '0 0 15px rgba(194, 112, 154, 0.5), 0 0 30px rgba(194, 112, 154, 0.25)',
    shadowCard: '0 2px 8px rgba(0, 0, 0, 0.5)',
    innerGlow: 'inset 0 0 20px rgba(194, 112, 154, 0.1)',
    textGlow: '0 0 10px rgba(194, 112, 154, 0.5)',
  },
  preview: {
    bg: '#240f1a',
    accent: '#c2709a',
    text: '#f0f1f5',
  },
};

// ════════════════════════════════════════════════════════════════
// THEME 5: ANCIENT PARCHMENT
// Warm gunmetal/taupe with bone/parchment accents
// ════════════════════════════════════════════════════════════════

export const ancientParchment: Theme = {
  id: 'ancient-parchment',
  name: 'Ancient Parchment',
  description: 'Aged warmth with weathered parchment tones',
  colors: {
    // Backgrounds - Gunmetal / Shadow Grey
    bgDarkest: '#121112',
    bgDark: '#1a191a',
    bgMedium: '#343135',
    bgLight: '#4e4a4f',
    bgHover: '#5e5a5f',
    bgCard: '#392c3a',

    // Text - Bone / Parchment lights
    textPrimary: '#f5f4ef',
    textSecondary: '#c3bda2',
    textBone: '#dcd7c5',
    textMuted: '#9c9163',

    // Borders - Taupe Grey
    borderGlow: 'rgba(173, 167, 133, 0.25)',
    borderSolid: '#50494f',
    borderBright: '#ada785',

    // Accent - Parchment (warm gold/tan)
    accentBright: '#ada785',
    accentGlow: '#c2bda3',
    accentSoft: '#d7d3c1',
    accentDim: '#5c573d',

    // Semantic
    success: '#679870',
    successDim: 'rgba(103, 152, 112, 0.15)',
    successDark: '#1a2a2a',
    warning: '#c6b26c',
    warningDim: 'rgba(198, 178, 108, 0.15)',
    danger: '#ef5350',
    dangerDim: 'rgba(239, 83, 80, 0.15)',
    dangerDark: '#2a1a1a',
    info: '#8e6e91',

    // Special
    essence: '#8e6e91',
    essenceDim: 'rgba(142, 110, 145, 0.15)',
    xp: '#c2bda3',
    xpDim: 'rgba(194, 189, 163, 0.15)',

    // Effects
    shadowGlow: '0 0 10px rgba(173, 167, 133, 0.3), 0 0 20px rgba(173, 167, 133, 0.15)',
    shadowGlowStrong: '0 0 15px rgba(173, 167, 133, 0.5), 0 0 30px rgba(173, 167, 133, 0.25)',
    shadowCard: '0 2px 8px rgba(0, 0, 0, 0.5)',
    innerGlow: 'inset 0 0 20px rgba(173, 167, 133, 0.1)',
    textGlow: '0 0 10px rgba(173, 167, 133, 0.5)',
  },
  preview: {
    bg: '#1a191a',
    accent: '#ada785',
    text: '#f5f4ef',
  },
};

// ════════════════════════════════════════════════════════════════
// THEME COLLECTION
// ════════════════════════════════════════════════════════════════

export const THEMES: Record<ThemeId, Theme> = {
  'midnight-ink': midnightInk,
  'crimson-veil': crimsonVeil,
  'verdant-shadow': verdantShadow,
  'twilight-violet': twilightViolet,
  'ancient-parchment': ancientParchment,
};

export const THEME_LIST: Theme[] = Object.values(THEMES);

export const DEFAULT_THEME: ThemeId = 'midnight-ink';

// Export action card colors for use in theme application
export { actionCardColors };
