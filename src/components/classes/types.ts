// Shared types for all class views
import type { Hero, HeroClass, HeroBase } from '@/types/hero';
import type { ActiveCondition, ConditionId } from '@/types/common';
import type { DiceType } from '@/components/ui/StatsDashboard/types';

// All heroic classes
export const HERO_CLASSES: HeroClass[] = [
  'censor',
  'conduit',
  'elementalist',
  'fury',
  'null',
  'shadow',
  'tactician',
  'talent',
  'troubadour',
  'summoner',
];

// Class display information
export interface ClassInfo {
  id: HeroClass;
  name: string;
  heroicResource: string;
  resourceDescription: string;
  primaryColor: string;
  icon: string;
}

export const CLASS_INFO: Record<HeroClass, ClassInfo> = {
  censor: {
    id: 'censor',
    name: 'Censor',
    heroicResource: 'Wrath',
    resourceDescription: 'Divine authority to pronounce judgment on foes',
    primaryColor: 'var(--class-censor)',
    icon: '\u2696\uFE0F',
  },
  conduit: {
    id: 'conduit',
    name: 'Conduit',
    heroicResource: 'Piety',
    resourceDescription: 'Divine connection for healing and blessings',
    primaryColor: 'var(--class-conduit)',
    icon: '\u2728',
  },
  elementalist: {
    id: 'elementalist',
    name: 'Elementalist',
    heroicResource: 'Essence',
    resourceDescription: 'Harness and shape elemental forces',
    primaryColor: 'var(--class-elementalist)',
    icon: '\uD83D\uDD2E',
  },
  fury: {
    id: 'fury',
    name: 'Fury',
    heroicResource: 'Ferocity',
    resourceDescription: 'Growing rage that unlocks powerful abilities',
    primaryColor: 'var(--class-fury)',
    icon: '\uD83D\uDD25',
  },
  null: {
    id: 'null',
    name: 'Null',
    heroicResource: 'Discipline',
    resourceDescription: 'Psychic power for mental manipulation',
    primaryColor: 'var(--class-null)',
    icon: '\uD83E\uDDE0',
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    heroicResource: 'Insight',
    resourceDescription: 'Darkness manipulation and stealth',
    primaryColor: 'var(--class-shadow)',
    icon: '\uD83C\uDF11',
  },
  tactician: {
    id: 'tactician',
    name: 'Tactician',
    heroicResource: 'Focus',
    resourceDescription: 'Strategic commands and tactical advantage',
    primaryColor: 'var(--class-tactician)',
    icon: '\uD83C\uDFAF',
  },
  talent: {
    id: 'talent',
    name: 'Talent',
    heroicResource: 'Clarity',
    resourceDescription: 'Mental discipline and psionic focus',
    primaryColor: 'var(--class-talent)',
    icon: '\uD83D\uDC8E',
  },
  troubadour: {
    id: 'troubadour',
    name: 'Troubadour',
    heroicResource: 'Drama',
    resourceDescription: 'Performance energy for inspiration',
    primaryColor: 'var(--class-troubadour)',
    icon: '\uD83C\uDFAD',
  },
  summoner: {
    id: 'summoner',
    name: 'Summoner',
    heroicResource: 'Essence',
    resourceDescription: 'Summon and command loyal minions',
    primaryColor: 'var(--class-summoner)',
    icon: '\uD83D\uDC41\uFE0F',
  },
};

// Base props that all class views receive
export interface BaseClassViewProps {
  hero: Hero;
  isInCombat: boolean;

  // Turn tracking
  turnNumber: number;
  onEndTurn: () => void;

  // Conditions
  conditions: ActiveCondition[];
  onRemoveCondition: (conditionId: ConditionId) => void;

  // Dice rolling
  onRoll?: (type: DiceType, label?: string) => void;

  // Class resource updates
  onUpdateHero: (updates: Partial<HeroBase>) => void;
}

// Generic resource tracker props
export interface ResourceTrackerProps {
  current: number;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  isInCombat: boolean;
  label?: string;
}
