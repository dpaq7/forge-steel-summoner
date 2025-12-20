// Draw Steel Conditions Data
// Based on SRD condition rules

import type { ConditionEndType } from '@/types/common';

export type ConditionId =
  | 'bleeding'
  | 'burning'
  | 'charmed'
  | 'dazed'
  | 'frightened'
  | 'grabbed'
  | 'invisible'
  | 'petrified'
  | 'prone'
  | 'restrained'
  | 'slowed'
  | 'taunted'
  | 'weakened';

export interface ConditionDefinition {
  id: ConditionId;
  name: string;
  icon: string; // Emoji icon
  description: string;
  primaryEffect: string;
  saveEnds: boolean;
  saveRequired: string; // Description of how to end
  affectsActions: boolean; // True if this condition triggers on certain actions
  actionTriggers?: ('main' | 'triggered' | 'might_roll' | 'agility_roll' | 'power_roll')[];
}

export const CONDITIONS: Record<ConditionId, ConditionDefinition> = {
  bleeding: {
    id: 'bleeding',
    name: 'Bleeding',
    icon: '🩸',
    description: 'You are losing blood or vital essence rapidly.',
    primaryEffect: 'Take 1d6 + level damage when using a main action, triggered action, or making a Power Roll using Might or Agility.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: true,
    actionTriggers: ['main', 'triggered', 'might_roll', 'agility_roll'],
  },
  burning: {
    id: 'burning',
    name: 'Burning',
    icon: '🔥',
    description: 'You are on fire and taking ongoing damage.',
    primaryEffect: 'Take fire damage at the start of each of your turns. The damage amount is determined by the source.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: false,
  },
  charmed: {
    id: 'charmed',
    name: 'Charmed',
    icon: '💕',
    description: 'You are magically influenced to view another creature favorably.',
    primaryEffect: 'Cannot attack or target the charmer with harmful abilities. The charmer has an edge on social interactions with you.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: false,
  },
  dazed: {
    id: 'dazed',
    name: 'Dazed',
    icon: '💫',
    description: 'Your senses are scrambled and you struggle to act.',
    primaryEffect: 'Limited to ONE of: Move Action, Maneuver, or Main Action. Cannot use triggered actions, free triggered actions, or free maneuvers.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: false,
  },
  frightened: {
    id: 'frightened',
    name: 'Frightened',
    icon: '😨',
    description: 'You are overcome with fear of a specific source.',
    primaryEffect: 'Bane on ability rolls against the fear source. Cannot willingly move closer to the source.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: false,
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    icon: '👻',
    description: 'You cannot be seen by normal means.',
    primaryEffect: 'You have concealment against all creatures. Creatures have a bane on attacks against you. You have an edge on attacks against creatures that cannot see you.',
    saveEnds: false,
    saveRequired: 'Effect ends based on ability duration or when you attack',
    affectsActions: false,
  },
  petrified: {
    id: 'petrified',
    name: 'Petrified',
    icon: '🪨',
    description: 'You have been turned to stone.',
    primaryEffect: 'You are incapacitated and cannot move, speak, or take any actions. You have immunity to all damage. You do not age while petrified.',
    saveEnds: true,
    saveRequired: 'Specific magic or effect to reverse',
    affectsActions: false,
  },
  grabbed: {
    id: 'grabbed',
    name: 'Grabbed',
    icon: '✊',
    description: 'A creature or effect is holding you in place.',
    primaryEffect: 'Speed 0. Bane on abilities that don\'t target the grab source.',
    saveEnds: false,
    saveRequired: 'Escape Grab maneuver or break adjacency',
    affectsActions: false,
  },
  prone: {
    id: 'prone',
    name: 'Prone',
    icon: '🔻',
    description: 'You are flat on the ground.',
    primaryEffect: 'Strikes you make take a bane. Melee abilities against you gain an edge.',
    saveEnds: false,
    saveRequired: 'Stand Up maneuver',
    affectsActions: false,
  },
  restrained: {
    id: 'restrained',
    name: 'Restrained',
    icon: '⛓️',
    description: 'You are bound or entangled and cannot move freely.',
    primaryEffect: 'Speed 0. Cannot use Stand Up or be force moved. Bane on Ability Rolls and Might/Agility tests.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: false,
  },
  slowed: {
    id: 'slowed',
    name: 'Slowed',
    icon: '🐌',
    description: 'Your movement is impaired.',
    primaryEffect: 'Speed reduced to 2 (minimum). Cannot shift.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: false,
  },
  taunted: {
    id: 'taunted',
    name: 'Taunted',
    icon: '😤',
    description: 'A creature has drawn your ire and demands your attention.',
    primaryEffect: 'Double bane on ability rolls that do not target the taunt source.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: false,
  },
  weakened: {
    id: 'weakened',
    name: 'Weakened',
    icon: '💔',
    description: 'Your strength is sapped.',
    primaryEffect: 'Bane on ALL Power Rolls.',
    saveEnds: true,
    saveRequired: 'd10 roll of 6+ at end of turn',
    affectsActions: false,
  },
};

// Get all conditions as an array
export const ALL_CONDITIONS = Object.values(CONDITIONS);

// Get conditions that can be saved against
export const SAVEABLE_CONDITIONS = ALL_CONDITIONS.filter(c => c.saveEnds);

// Get conditions that affect actions
export const ACTION_AFFECTING_CONDITIONS = ALL_CONDITIONS.filter(c => c.affectsActions);

// Helper to perform a saving throw (d10, 6+ succeeds)
export const performSavingThrow = (): { roll: number; success: boolean } => {
  const roll = Math.floor(Math.random() * 10) + 1;
  return { roll, success: roll >= 6 };
};

// Calculate bleeding damage (1d6 + level)
export const calculateBleedingDamage = (level: number): { roll: number; total: number } => {
  const roll = Math.floor(Math.random() * 6) + 1;
  return { roll, total: roll + level };
};

/**
 * Get the default end type for a condition based on its nature
 * - Conditions that typically save-end default to 'roll'
 * - Conditions that need specific actions to end default to 'manual'
 */
export const getDefaultEndType = (conditionId: ConditionId): ConditionEndType => {
  const condition = CONDITIONS[conditionId];

  if (!condition) return 'manual';

  // Conditions that save-end (roll 6+ on d10) should default to 'roll'
  if (condition.saveEnds) {
    return 'roll';
  }

  // Conditions that require specific actions (grabbed, prone) default to 'manual'
  return 'manual';
};
