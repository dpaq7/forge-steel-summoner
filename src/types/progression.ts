// Character Progression Types - SRD Section 6

import { Characteristic } from './common';
import { SummonerCircle } from './summoner';

export interface FeatureChoice {
  id: string;
  name: string;
  description: string;
  // For abilities that have mechanical effects
  effect?: string;
}

export interface LevelFeature {
  id: string;
  name: string;
  description: string;
  type: 'automatic' | 'choice';
  // For choice features
  choices?: FeatureChoice[];
  // Category for grouping (e.g., 'ward', '7-essence', 'circle-upgrade')
  category?: string;
}

export interface StatChanges {
  reason?: number; // Set Reason to this value
  minionCap?: number; // Add to minion cap
  allStats?: number; // Add to all characteristics
  essencePerTurn?: number; // Set essence per turn to this value
  freeSummonCount?: number; // Add to free summon count per turn
  signatureStaminaBonus?: number; // Add to signature minion stamina
  threeEssenceStaminaBonus?: number; // Add to 3-cost minion stamina
  fiveEssenceStaminaBonus?: number; // Add to 5-cost minion stamina
}

export interface LevelProgression {
  level: number;
  features: LevelFeature[];
  statChanges?: StatChanges;
}

// Ward types for Kit upgrades (Level 3 and 9)
export type WardType = 'conjured' | 'emergency' | 'howling' | 'snare';

export interface Ward {
  id: WardType;
  name: string;
  description: string;
}

// 7-Essence ability choices (Level 3)
export interface SevenEssenceAbility {
  id: string;
  name: string;
  description: string;
  cost: 7;
}

// 9-Essence ability choices (Level 6) - Champion abilities
export interface NineEssenceAbility {
  id: string;
  name: string;
  description: string;
  cost: 9;
}

// 11-Essence ability choices (Level 9)
export interface ElevenEssenceAbility {
  id: string;
  name: string;
  description: string;
  cost: 11;
}

// Circle-specific upgrades (Level 5)
export interface CircleUpgrade {
  id: string;
  circle: SummonerCircle;
  name: string;
  description: string;
}

// Stored character progression choices
export interface ProgressionChoices {
  // Level 3 choices
  ward?: WardType;
  sevenEssenceAbility?: string;

  // Level 4 choice
  statBoost?: Characteristic;

  // Level 5 choice
  circleUpgrade?: string;

  // Level 6 choice
  nineEssenceAbility?: string;

  // Level 9 choices
  secondWard?: WardType;
  elevenEssenceAbility?: string;
}
