// Class-specific theme definitions for all 10 Draw Steel hero classes
// Each class has a unique color palette reflecting its fantasy and role

import { HeroClass } from '../types/hero';

export interface ClassTheme {
  id: HeroClass;
  themeId: string; // For storage
  name: string;
  description: string;
  previewColors: {
    bg: string;
    primary: string;
    secondary: string;
  };
  cssVariables: Record<string, string>;
}

// Censor - Divine Judgment (Gold and White)
const censorTheme: ClassTheme = {
  id: 'censor',
  themeId: 'class-censor',
  name: 'Divine Judgment',
  description: 'Gold and white divine radiance',
  previewColors: {
    bg: '#1a1408',
    primary: '#ffd700',
    secondary: '#ff6b35',
  },
  cssVariables: {
    '--bg-darkest': '#0a0806',
    '--bg-dark': '#1a1408',
    '--bg-medium': '#2d2410',
    '--bg-light': '#4a3d1a',
    '--bg-hover': '#5a4d2a',
    '--accent-bright': '#ffd700',
    '--accent-glow': '#ffed4a',
    '--accent-soft': '#fff3b0',
    '--accent-dim': '#8b7355',
    '--text-primary': '#f5f0e0',
    '--text-secondary': '#c4b898',
    '--text-bone': '#e8dcc0',
    '--text-muted': '#8a7a5a',
    '--border-glow': 'rgba(255, 215, 0, 0.25)',
    '--border-solid': '#6b5a2a',
    '--border-bright': '#ffd700',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#ff6b35', // Wrath - fiery orange
    '--essence-dim': 'rgba(255, 107, 53, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(255, 215, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(255, 215, 0, 0.1)',
    '--text-glow': '0 0 10px rgba(255, 215, 0, 0.5)',
  },
};

// Conduit - Holy Light (Soft Blue and White)
const conduitTheme: ClassTheme = {
  id: 'conduit',
  themeId: 'class-conduit',
  name: 'Holy Light',
  description: 'Soft blue and white divine healing',
  previewColors: {
    bg: '#0a1520',
    primary: '#87ceeb',
    secondary: '#e8d44c',
  },
  cssVariables: {
    '--bg-darkest': '#040810',
    '--bg-dark': '#0a1520',
    '--bg-medium': '#152535',
    '--bg-light': '#25405a',
    '--bg-hover': '#35506a',
    '--accent-bright': '#87ceeb',
    '--accent-glow': '#b0e0ff',
    '--accent-soft': '#e0f0ff',
    '--accent-dim': '#4a6a8a',
    '--text-primary': '#f0f5ff',
    '--text-secondary': '#a8b8d0',
    '--text-bone': '#d4e0f0',
    '--text-muted': '#6a7a9a',
    '--border-glow': 'rgba(135, 206, 235, 0.25)',
    '--border-solid': '#3a5a7a',
    '--border-bright': '#87ceeb',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#e8d44c', // Piety - golden light
    '--essence-dim': 'rgba(232, 212, 76, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(135, 206, 235, 0.3), 0 0 20px rgba(135, 206, 235, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(135, 206, 235, 0.5), 0 0 30px rgba(135, 206, 235, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(135, 206, 235, 0.1)',
    '--text-glow': '0 0 10px rgba(135, 206, 235, 0.5)',
  },
};

// Elementalist - Primal Forces (Pink/Magenta elemental energy)
const elementalistTheme: ClassTheme = {
  id: 'elementalist',
  themeId: 'class-elementalist',
  name: 'Primal Forces',
  description: 'Shifting elemental energy',
  previewColors: {
    bg: '#150a15',
    primary: '#ff6b9d',
    secondary: '#a87de8',
  },
  cssVariables: {
    '--bg-darkest': '#080508',
    '--bg-dark': '#150a15',
    '--bg-medium': '#2a1a2a',
    '--bg-light': '#4a2a4a',
    '--bg-hover': '#5a3a5a',
    '--accent-bright': '#ff6b9d',
    '--accent-glow': '#ff8fb3',
    '--accent-soft': '#ffb3cc',
    '--accent-dim': '#8a4a6a',
    '--text-primary': '#f5f0f5',
    '--text-secondary': '#c4b0c4',
    '--text-bone': '#e0d0e0',
    '--text-muted': '#8a6a8a',
    '--border-glow': 'rgba(255, 107, 157, 0.25)',
    '--border-solid': '#6a3a5a',
    '--border-bright': '#ff6b9d',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#a87de8', // Essence - purple magic
    '--essence-dim': 'rgba(168, 125, 232, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(255, 107, 157, 0.3), 0 0 20px rgba(255, 107, 157, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(255, 107, 157, 0.5), 0 0 30px rgba(255, 107, 157, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(255, 107, 157, 0.1)',
    '--text-glow': '0 0 10px rgba(255, 107, 157, 0.5)',
  },
};

// Fury - Blood Rage (Deep Crimson and Black)
const furyTheme: ClassTheme = {
  id: 'fury',
  themeId: 'class-fury',
  name: 'Blood Rage',
  description: 'Deep crimson and black fury',
  previewColors: {
    bg: '#1a0808',
    primary: '#ff3333',
    secondary: '#ff4444',
  },
  cssVariables: {
    '--bg-darkest': '#0a0404',
    '--bg-dark': '#1a0808',
    '--bg-medium': '#2a1010',
    '--bg-light': '#4a1a1a',
    '--bg-hover': '#5a2a2a',
    '--accent-bright': '#ff3333',
    '--accent-glow': '#ff5555',
    '--accent-soft': '#ff8888',
    '--accent-dim': '#8a3333',
    '--text-primary': '#f5f0f0',
    '--text-secondary': '#c4b0b0',
    '--text-bone': '#e0d0d0',
    '--text-muted': '#8a6a6a',
    '--border-glow': 'rgba(255, 51, 51, 0.25)',
    '--border-solid': '#5a2020',
    '--border-bright': '#ff3333',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#ff3333',
    '--danger-dim': 'rgba(255, 51, 51, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#ff4444', // Ferocity - blood red
    '--essence-dim': 'rgba(255, 68, 68, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(255, 51, 51, 0.3), 0 0 20px rgba(255, 51, 51, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(255, 51, 51, 0.5), 0 0 30px rgba(255, 51, 51, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(255, 51, 51, 0.1)',
    '--text-glow': '0 0 10px rgba(255, 51, 51, 0.5)',
  },
};

// Null - Void Discipline (Steel Blue and Gray)
const nullTheme: ClassTheme = {
  id: 'null',
  themeId: 'class-null',
  name: 'Void Discipline',
  description: 'Steel blue and gray austerity',
  previewColors: {
    bg: '#0c1214',
    primary: '#7ec8e3',
    secondary: '#7ec8e3',
  },
  cssVariables: {
    '--bg-darkest': '#060808',
    '--bg-dark': '#0c1214',
    '--bg-medium': '#1a2428',
    '--bg-light': '#2a3a40',
    '--bg-hover': '#3a4a50',
    '--accent-bright': '#7ec8e3',
    '--accent-glow': '#a0d8ef',
    '--accent-soft': '#c0e8ff',
    '--accent-dim': '#4a6a7a',
    '--text-primary': '#f0f5f5',
    '--text-secondary': '#a8b8c0',
    '--text-bone': '#d0e0e8',
    '--text-muted': '#6a7a80',
    '--border-glow': 'rgba(126, 200, 227, 0.25)',
    '--border-solid': '#3a5058',
    '--border-bright': '#7ec8e3',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#7ec8e3', // Discipline - calm blue
    '--essence-dim': 'rgba(126, 200, 227, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(126, 200, 227, 0.3), 0 0 20px rgba(126, 200, 227, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(126, 200, 227, 0.5), 0 0 30px rgba(126, 200, 227, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(126, 200, 227, 0.1)',
    '--text-glow': '0 0 10px rgba(126, 200, 227, 0.5)',
  },
};

// Shadow - Midnight Veil (Deep Purple and Black)
const shadowTheme: ClassTheme = {
  id: 'shadow',
  themeId: 'class-shadow',
  name: 'Midnight Veil',
  description: 'Deep purple and black shadows',
  previewColors: {
    bg: '#0a0810',
    primary: '#9966ff',
    secondary: '#66ff66',
  },
  cssVariables: {
    '--bg-darkest': '#050408',
    '--bg-dark': '#0a0810',
    '--bg-medium': '#15101f',
    '--bg-light': '#251a35',
    '--bg-hover': '#352a45',
    '--accent-bright': '#9966ff',
    '--accent-glow': '#b388ff',
    '--accent-soft': '#d4b8ff',
    '--accent-dim': '#5a3a8a',
    '--text-primary': '#f0f0f5',
    '--text-secondary': '#b0a8c4',
    '--text-bone': '#d8d0e8',
    '--text-muted': '#7a6a9a',
    '--border-glow': 'rgba(153, 102, 255, 0.25)',
    '--border-solid': '#3a2a5a',
    '--border-bright': '#9966ff',
    '--success': '#66ff66', // Insight green for success
    '--success-dim': 'rgba(102, 255, 102, 0.15)',
    '--success-dark': '#1a2a1a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#66ff66', // Insight - bright green
    '--essence-dim': 'rgba(102, 255, 102, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(153, 102, 255, 0.3), 0 0 20px rgba(153, 102, 255, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(153, 102, 255, 0.5), 0 0 30px rgba(153, 102, 255, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(153, 102, 255, 0.1)',
    '--text-glow': '0 0 10px rgba(153, 102, 255, 0.5)',
  },
};

// Summoner - Verdant Depths (Existing cyan/teal theme)
const summonerTheme: ClassTheme = {
  id: 'summoner',
  themeId: 'class-summoner',
  name: 'Verdant Depths',
  description: 'Cyan and teal summoning magic',
  previewColors: {
    bg: '#0a1a18',
    primary: '#00e6c3',
    secondary: '#a87de8',
  },
  cssVariables: {
    '--bg-darkest': '#050d0b',
    '--bg-dark': '#0a1a18',
    '--bg-medium': '#1a3a32',
    '--bg-light': '#2d5a4a',
    '--bg-hover': '#3d5a4d',
    '--accent-bright': '#00e6c3',
    '--accent-glow': '#4aeadc',
    '--accent-soft': '#7fffd4',
    '--accent-dim': '#3d8b7a',
    '--text-primary': '#e8f0f0',
    '--text-secondary': '#a8c4c0',
    '--text-bone': '#d4e8e0',
    '--text-muted': '#6a8a84',
    '--border-glow': 'rgba(74, 234, 220, 0.25)',
    '--border-solid': '#3d6b5a',
    '--border-bright': '#4aeadc',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#a87de8', // Essence - purple
    '--essence-dim': 'rgba(168, 125, 232, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(74, 234, 220, 0.3), 0 0 20px rgba(74, 234, 220, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(74, 234, 220, 0.5), 0 0 30px rgba(74, 234, 220, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(74, 234, 220, 0.1)',
    '--text-glow': '0 0 10px rgba(74, 234, 220, 0.5)',
  },
};

// Tactician - Strategic Command (Military Green and Gold)
const tacticianTheme: ClassTheme = {
  id: 'tactician',
  themeId: 'class-tactician',
  name: 'Strategic Command',
  description: 'Military green and gold',
  previewColors: {
    bg: '#0c140c',
    primary: '#8fbc8f',
    secondary: '#ffd700',
  },
  cssVariables: {
    '--bg-darkest': '#060806',
    '--bg-dark': '#0c140c',
    '--bg-medium': '#1a281a',
    '--bg-light': '#2a402a',
    '--bg-hover': '#3a503a',
    '--accent-bright': '#8fbc8f',
    '--accent-glow': '#a8d8a8',
    '--accent-soft': '#c8f0c8',
    '--accent-dim': '#4a6a4a',
    '--text-primary': '#f0f5f0',
    '--text-secondary': '#a8c0a8',
    '--text-bone': '#d4e8d4',
    '--text-muted': '#6a8a6a',
    '--border-glow': 'rgba(143, 188, 143, 0.25)',
    '--border-solid': '#3a5a3a',
    '--border-bright': '#8fbc8f',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a1a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#ffd700', // Focus - gold
    '--essence-dim': 'rgba(255, 215, 0, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(143, 188, 143, 0.3), 0 0 20px rgba(143, 188, 143, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(143, 188, 143, 0.5), 0 0 30px rgba(143, 188, 143, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(143, 188, 143, 0.1)',
    '--text-glow': '0 0 10px rgba(143, 188, 143, 0.5)',
  },
};

// Talent - Psionic Surge (Violet and Electric)
const talentTheme: ClassTheme = {
  id: 'talent',
  themeId: 'class-talent',
  name: 'Psionic Surge',
  description: 'Violet and electric psionic energy',
  previewColors: {
    bg: '#100810',
    primary: '#da70d6',
    secondary: '#da70d6',
  },
  cssVariables: {
    '--bg-darkest': '#080408',
    '--bg-dark': '#100810',
    '--bg-medium': '#201020',
    '--bg-light': '#351a35',
    '--bg-hover': '#452a45',
    '--accent-bright': '#da70d6',
    '--accent-glow': '#e890e4',
    '--accent-soft': '#f0b0f0',
    '--accent-dim': '#7a3a7a',
    '--text-primary': '#f5f0f5',
    '--text-secondary': '#c4b0c4',
    '--text-bone': '#e8d8e8',
    '--text-muted': '#8a6a8a',
    '--border-glow': 'rgba(218, 112, 214, 0.25)',
    '--border-solid': '#5a3a5a',
    '--border-bright': '#da70d6',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#da70d6', // Clarity - orchid
    '--essence-dim': 'rgba(218, 112, 214, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(218, 112, 214, 0.3), 0 0 20px rgba(218, 112, 214, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(218, 112, 214, 0.5), 0 0 30px rgba(218, 112, 214, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(218, 112, 214, 0.1)',
    '--text-glow': '0 0 10px rgba(218, 112, 214, 0.5)',
  },
};

// Troubadour - Grand Stage (Royal Purple and Theatrical Gold)
const troubadourTheme: ClassTheme = {
  id: 'troubadour',
  themeId: 'class-troubadour',
  name: 'Grand Stage',
  description: 'Royal purple and theatrical gold',
  previewColors: {
    bg: '#140c14',
    primary: '#daa520',
    secondary: '#ff69b4',
  },
  cssVariables: {
    '--bg-darkest': '#080608',
    '--bg-dark': '#140c14',
    '--bg-medium': '#281828',
    '--bg-light': '#402840',
    '--bg-hover': '#503850',
    '--accent-bright': '#daa520',
    '--accent-glow': '#f0c040',
    '--accent-soft': '#ffe080',
    '--accent-dim': '#8a6a20',
    '--text-primary': '#f5f0f5',
    '--text-secondary': '#c4b0c4',
    '--text-bone': '#e8dcc8',
    '--text-muted': '#8a6a8a',
    '--border-glow': 'rgba(218, 165, 32, 0.25)',
    '--border-solid': '#5a4028',
    '--border-bright': '#daa520',
    '--success': '#34d399',
    '--success-dim': 'rgba(52, 211, 153, 0.15)',
    '--success-dark': '#1a2a2a',
    '--danger': '#f87171',
    '--danger-dim': 'rgba(248, 113, 113, 0.15)',
    '--danger-dark': '#2a1a1a',
    '--warning': '#fbbf24',
    '--warning-dim': 'rgba(251, 191, 36, 0.15)',
    '--essence': '#ff69b4', // Drama - hot pink
    '--essence-dim': 'rgba(255, 105, 180, 0.15)',
    '--xp': '#fbbf24',
    '--xp-dim': 'rgba(251, 191, 36, 0.15)',
    '--shadow-glow': '0 0 10px rgba(218, 165, 32, 0.3), 0 0 20px rgba(218, 165, 32, 0.15)',
    '--shadow-glow-strong': '0 0 15px rgba(218, 165, 32, 0.5), 0 0 30px rgba(218, 165, 32, 0.25)',
    '--shadow-card': '0 2px 8px rgba(0, 0, 0, 0.5)',
    '--inner-glow': 'inset 0 0 20px rgba(218, 165, 32, 0.1)',
    '--text-glow': '0 0 10px rgba(218, 165, 32, 0.5)',
  },
};

// Export all class themes
export const classThemes: Record<HeroClass, ClassTheme> = {
  censor: censorTheme,
  conduit: conduitTheme,
  elementalist: elementalistTheme,
  fury: furyTheme,
  null: nullTheme,
  shadow: shadowTheme,
  summoner: summonerTheme,
  tactician: tacticianTheme,
  talent: talentTheme,
  troubadour: troubadourTheme,
};

// Get theme by class
export function getClassTheme(heroClass: HeroClass): ClassTheme {
  return classThemes[heroClass];
}

// Get all class themes as array
export function getAllClassThemes(): ClassTheme[] {
  return Object.values(classThemes);
}

// Default theme (shown before character selection) - uses Summoner theme
export const defaultClassTheme = summonerTheme;
