/**
 * Class Mechanics Data
 * Reference data for Draw Steel heroic class mechanics
 */

import { HeroClass, Formation, SummonerCircle } from '../types/hero';

// Resource gain rules per class
export interface ResourceGainTrigger {
  condition: string;
  amount: number | string; // Can be a number or dice notation like "1d3"
}

export interface ResourceGainRule {
  startOfTurn: {
    amount: number | null;
    dice: string | null; // e.g., "1d3"
  };
  triggers: ResourceGainTrigger[];
  levelAdvancement?: Record<number, string>;
}

export const resourceGainRules: Record<HeroClass, ResourceGainRule> = {
  censor: {
    startOfTurn: { amount: 2, dice: null },
    triggers: [
      { condition: 'First time/round you deal damage to judged target', amount: 1 },
      { condition: 'First time/round judged target deals damage to you', amount: 1 },
    ],
    levelAdvancement: {
      4: 'Wrath Beyond Wrath: +2 per trigger instead of +1',
      7: 'Focused Wrath: +3 at start of turn',
      10: 'Wrath of the Gods: +4 at start of turn',
    },
  },
  conduit: {
    startOfTurn: { amount: null, dice: '1d3' },
    triggers: [
      { condition: 'Prayer action (5-6 on d6)', amount: 2 },
      { condition: 'Domain-specific trigger (varies)', amount: 1 },
    ],
  },
  elementalist: {
    startOfTurn: { amount: 2, dice: null },
    triggers: [
      { condition: 'First time/round you or a creature within 10 squares takes damage that is not untyped or holy', amount: 1 },
    ],
  },
  fury: {
    startOfTurn: { amount: null, dice: '1d3' },
    triggers: [
      { condition: 'First time/round you take damage', amount: 1 },
      { condition: 'First time/encounter you become winded or dying', amount: '1d3' },
    ],
  },
  null: {
    startOfTurn: { amount: 2, dice: null },
    triggers: [
      { condition: 'First time/round enemy in Null Field uses main action', amount: 1 },
      { condition: 'When Director spends Malice', amount: 1 },
    ],
  },
  shadow: {
    startOfTurn: { amount: null, dice: '1d3' },
    triggers: [
      { condition: 'First time/round you deal damage with 1+ surges', amount: 1 },
    ],
  },
  summoner: {
    startOfTurn: { amount: 2, dice: null },
    triggers: [
      { condition: 'First time/round a minion dies unwillingly', amount: 1 },
    ],
  },
  tactician: {
    startOfTurn: { amount: 2, dice: null },
    triggers: [
      { condition: 'First time/round you or an ally damages a creature marked by you', amount: 1 },
      { condition: 'First time/round an ally within 10 squares uses a heroic ability', amount: 1 },
    ],
  },
  talent: {
    startOfTurn: { amount: null, dice: '1d3' },
    triggers: [
      { condition: 'First time/round you force move a creature', amount: 1 },
    ],
    levelAdvancement: {
      7: 'Lucid Mind: +1d3+1 at start of turn instead of 1d3',
      10: 'Clear Mind: +3 Clarity on force move instead of +1',
    },
  },
  troubadour: {
    startOfTurn: { amount: null, dice: '1d3' },
    triggers: [
      { condition: '3+ heroes act on same turn', amount: 2 },
      { condition: 'A hero becomes winded', amount: 2 },
      { condition: 'Natural 19-20 on power roll', amount: 3 },
      { condition: 'A hero dies', amount: 10 },
    ],
  },
};

// Growing Ferocity tiers for Fury
export interface FerocityTier {
  threshold: number;
  benefit: string;
  minLevel: number;
}

export const ferocityTiers: FerocityTier[] = [
  { threshold: 3, benefit: 'Push/pull/slide distance +1', minLevel: 1 },
  { threshold: 6, benefit: '+1 surge when you deal damage', minLevel: 1 },
  { threshold: 9, benefit: 'Double edge on maneuvers', minLevel: 1 },
  { threshold: 12, benefit: 'Reach +1 on melee abilities', minLevel: 4 },
  { threshold: 15, benefit: 'Speed +2', minLevel: 7 },
  { threshold: 18, benefit: '+1 additional surge on damage', minLevel: 10 },
];

// Formation bonuses for Summoner
export const formationBonuses: Record<Formation, string> = {
  horde: 'Minions deal +1 damage',
  platoon: 'Minions have +2 speed',
  elite: 'Minions have +3 Stamina and +1 Stability',
  leader: 'You can take excess damage instead of minions dying',
};

// Circle to Portfolio mapping for Summoner
export const circleToPortfolio: Record<SummonerCircle, string> = {
  blight: 'Demon',
  graves: 'Undead',
  spring: 'Fey',
  storms: 'Elemental',
};

// Potency characteristic mapping per class
export const potencyCharacteristic: Record<HeroClass, string> = {
  censor: 'Presence',
  conduit: 'Intuition',
  elementalist: 'Reason',
  fury: 'Might',
  null: 'Intuition',
  shadow: 'Agility',
  summoner: 'Presence',
  tactician: 'Reason',
  talent: 'Reason',
  troubadour: 'Presence',
};

// Class resource names
export const classResourceNames: Record<HeroClass, string> = {
  censor: 'Wrath',
  conduit: 'Piety',
  elementalist: 'Essence',
  fury: 'Ferocity',
  null: 'Discipline',
  shadow: 'Insight',
  summoner: 'Essence',
  tactician: 'Focus',
  talent: 'Clarity',
  troubadour: 'Drama',
};

// Class signature mechanics
export const classSignatureMechanics: Record<HeroClass, { name: string; description: string }> = {
  censor: {
    name: 'Judgment',
    description: 'Mark an enemy. Gain Wrath when interacting with your judged target.',
  },
  conduit: {
    name: 'Prayer',
    description: 'Maneuver to roll 1d6: risk damage for bonus Piety or domain effects.',
  },
  elementalist: {
    name: 'Persistent Magic',
    description: 'Lock Essence to maintain ongoing magical effects.',
  },
  fury: {
    name: 'Growing Ferocity',
    description: 'Passive bonuses unlock as your Ferocity increases.',
  },
  null: {
    name: 'Null Field',
    description: 'Aura that reduces enemy Potency by 1 within its radius.',
  },
  shadow: {
    name: 'Hidden',
    description: 'While hidden, gain edge on attacks and cannot be targeted.',
  },
  summoner: {
    name: 'Minion Commands',
    description: 'Summon and command minions from your portfolio.',
  },
  tactician: {
    name: 'Mark',
    description: 'Mark enemies to grant allies Edge on attacks against them.',
  },
  talent: {
    name: 'Strain',
    description: 'Clarity can go negative, causing damage at end of turn.',
  },
  troubadour: {
    name: 'Routines',
    description: 'Activate routines to provide ongoing benefits to nearby allies.',
  },
};
