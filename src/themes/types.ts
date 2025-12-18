// Theme type definitions for the 5-theme color system

export type ThemeId =
  | 'midnight-ink'
  | 'crimson-veil'
  | 'verdant-shadow'
  | 'twilight-violet'
  | 'ancient-parchment';

export interface ThemeColors {
  // Backgrounds (darkest to lightest)
  bgDarkest: string;
  bgDark: string;
  bgMedium: string;
  bgLight: string;
  bgHover: string;
  bgCard: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textBone: string;
  textMuted: string;

  // Borders
  borderGlow: string;
  borderSolid: string;
  borderBright: string;

  // Accent (primary interactive color)
  accentBright: string;
  accentGlow: string;
  accentSoft: string;
  accentDim: string;

  // Semantic colors
  success: string;
  successDim: string;
  successDark: string;
  warning: string;
  warningDim: string;
  danger: string;
  dangerDim: string;
  dangerDark: string;
  info: string;

  // Special
  essence: string;
  essenceDim: string;
  xp: string;
  xpDim: string;

  // Effects
  shadowGlow: string;
  shadowGlowStrong: string;
  shadowCard: string;
  innerGlow: string;
  textGlow: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: ThemeColors;
  // Preview colors for theme selector
  preview: {
    bg: string;
    accent: string;
    text: string;
  };
}
