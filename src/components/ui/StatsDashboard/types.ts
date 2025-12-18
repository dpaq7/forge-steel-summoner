import type { Hero, HeroClass } from '@/types/hero';
import type { Characteristics, ConditionId, ActiveCondition } from '@/types/common';
import type { HeroicResourceConfig } from '@/data/class-resources';

// ════════════════════════════════════════════════════════════════
// CONDITION END TYPES
// ════════════════════════════════════════════════════════════════

/**
 * How a condition ends
 * - 'eot': Automatically ends at end of turn
 * - 'roll': Must roll 6+ on d10 at end of turn (save ends)
 * - 'manual': No automatic end, must be removed manually
 */
export type ConditionEndType = 'eot' | 'roll' | 'manual';

/**
 * Display information for end types
 */
export const END_TYPE_CONFIG: Record<ConditionEndType, {
  label: string;
  shortLabel: string;
  description: string;
  color: string;
}> = {
  eot: {
    label: 'End of Turn',
    shortLabel: 'EoT',
    description: 'Condition automatically ends at end of your turn',
    color: 'var(--success)',
  },
  roll: {
    label: 'Save Ends',
    shortLabel: 'Roll',
    description: 'Roll 6+ on d10 at end of turn to remove',
    color: 'var(--warning)',
  },
  manual: {
    label: 'Manual',
    shortLabel: '—',
    description: 'Remove manually when condition ends',
    color: 'var(--text-muted)',
  },
};

// All available stat card types
export type StatCardType =
  | 'stamina'
  | 'recoveries'
  | 'heroicResource'
  | 'surges'
  | 'victories'
  | 'conditions'
  | 'characteristics'
  | 'combat'
  | 'dice'
  | 'turn'; // Turn Tracker - only visible during combat

// Turn phase definitions
export type TurnPhaseId =
  | 'claim'
  | 'move'
  | 'maneuver'
  | 'action'
  | 'triggered'
  | 'end';

export interface TurnPhase {
  id: TurnPhaseId;
  label: string;
  shortLabel: string;
  description: string;
  tip: string;
}

export const TURN_PHASES: TurnPhase[] = [
  {
    id: 'claim',
    label: 'Claim Turn',
    shortLabel: 'Claim',
    description: 'Claim your turn in the initiative order',
    tip: 'You can claim your turn at any point during the round',
  },
  {
    id: 'move',
    label: 'Move',
    shortLabel: 'Move',
    description: 'Move up to your speed',
    tip: 'You can split your movement before and after your action',
  },
  {
    id: 'maneuver',
    label: 'Maneuver',
    shortLabel: 'Maneuver',
    description: 'Take a maneuver (Aid, Catch Breath, Hide, etc.)',
    tip: 'Maneuvers are minor actions that support your main action',
  },
  {
    id: 'action',
    label: 'Main Action',
    shortLabel: 'Action',
    description: 'Take your main action (Attack, Ability, etc.)',
    tip: 'Your primary action for the turn - attacks, abilities, or other major actions',
  },
  {
    id: 'triggered',
    label: 'Triggered Action',
    shortLabel: 'Triggered',
    description: 'Use triggered actions and free triggered actions',
    tip: 'Reactions and free actions that trigger from specific conditions',
  },
  {
    id: 'end',
    label: 'End Turn',
    shortLabel: 'End',
    description: 'End your turn and process conditions',
    tip: 'Ends your turn, removes EoT conditions, and rolls saves',
  },
];

// Dice roll types
export type DiceType = '2d10' | 'd10' | 'd6' | 'd3' | 'power';

// Characteristic identifiers
export type CharacteristicId = 'might' | 'agility' | 'reason' | 'intuition' | 'presence';

// Characteristic display info
export interface CharacteristicInfo {
  id: CharacteristicId;
  abbr: string;
  name: string;
  description: string;
}

export const CHARACTERISTICS: CharacteristicInfo[] = [
  {
    id: 'might',
    abbr: 'MGT',
    name: 'Might',
    description: 'Physical power, melee attacks, feats of strength',
  },
  {
    id: 'agility',
    abbr: 'AGI',
    name: 'Agility',
    description: 'Speed, reflexes, ranged attacks, dodging',
  },
  {
    id: 'reason',
    abbr: 'REA',
    name: 'Reason',
    description: 'Logic, knowledge, crafting, investigation',
  },
  {
    id: 'intuition',
    abbr: 'INT',
    name: 'Intuition',
    description: 'Perception, insight, awareness, instinct',
  },
  {
    id: 'presence',
    abbr: 'PRE',
    name: 'Presence',
    description: 'Charisma, intimidation, persuasion, leadership',
  },
];

export interface DiceRoll {
  id: string;
  type: DiceType;
  results: number[];
  total: number;           // Sum of dice only
  modifier?: number;       // Characteristic modifier
  modifierName?: string;   // e.g., "Might", "Agility"
  finalTotal: number;      // total + modifier (or just total if no modifier)
  tier?: number;           // Power roll tier (1-3)
  tierLabel?: string;      // "Tier 1", "Tier 2", etc.
  timestamp: number;
  label?: string;          // Optional label like "Power Roll", "Damage", etc.
}

// Props for the main dashboard
export interface StatsDashboardProps {
  hero: Hero | null;
  isInCombat: boolean;

  // Combat actions
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;

  // Stamina
  onStaminaChange: (value: number) => void;

  // Recoveries
  onRecoveriesChange: (value: number) => void;
  onCatchBreath: (healAmount: number) => void;

  // Heroic Resource
  resourceConfig: HeroicResourceConfig;
  onResourceChange?: (value: number) => void;

  // Surges
  onSurgesChange: (value: number) => void;

  // Victories
  onVictoriesChange: (value: number) => void;

  // Conditions
  onAddCondition: (conditionId: ConditionId) => void;
  onRemoveCondition: (conditionId: ConditionId) => void;
  onUpdateConditionEndType: (conditionId: ConditionId, endType: ConditionEndType) => void;

  // Character Management
  onManageCharacters: () => void;
  onCreateCharacter: () => void;
  onImportCharacter?: () => void;
  onExportCharacter?: () => void;
  onDuplicateCharacter?: () => void;

  // Dice
  rollHistory?: DiceRoll[];
  onRoll?: (type: DiceType, label?: string) => void;
  onClearRollHistory?: () => void;
  onRollCharacteristic?: (characteristicId: CharacteristicId, modifier: number) => void;

  // Turn tracking (combat only)
  turnNumber?: number;
  completedPhases?: Set<TurnPhaseId>;
  onTogglePhase?: (phaseId: TurnPhaseId) => void;
  onEndTurn?: () => void;
  onResetTurn?: () => void;

  // Portrait
  onPortraitChange?: (portraitUrl: string | null) => void;

  // Other
  onShowAbout: () => void;
  onLevelUp: () => void;
}

// Props for individual stat chips
export interface StatChipProps {
  id: StatCardType;
  icon: React.ElementType;
  label: string;
  value: number;
  maxValue?: number;
  displayValue?: string; // Custom display (e.g., "+2" for characteristics)
  color: string;
  isPinned: boolean;
  onTogglePin: () => void;
  onChange?: (delta: number) => void; // For +/- controls
  disabled?: boolean;
  minValue?: number;
  showProgress?: boolean;
  highlight?: boolean;
}

// Props for detail cards
export interface BaseCardProps {
  onUnpin: () => void;
}

export interface StaminaCardProps extends BaseCardProps {
  current: number;
  max: number;
  tempStamina: number;
  winded: number;
  onChange: (value: number) => void;
}

export interface RecoveriesCardProps extends BaseCardProps {
  current: number;
  max: number;
  value: number; // Recovery value
  currentStamina: number;
  maxStamina: number;
  onChange: (value: number) => void;
  onCatchBreath: (healAmount: number) => void;
}

export interface HeroicResourceCardProps extends BaseCardProps {
  name: string;
  current: number;
  minValue: number;
  color: string;
  heroClass: HeroClass;
  heroLevel: number;
  onChange: (value: number) => void;
}

export interface SurgesCardProps extends BaseCardProps {
  current: number;
  onChange: (value: number) => void;
  isInCombat: boolean;
}

export interface VictoriesCardProps extends BaseCardProps {
  current: number;
  xp: number;
  onChange: (value: number) => void;
}

export interface CharacteristicsCardProps extends BaseCardProps {
  characteristics: Characteristics;
  speed: number;
  stability: number;
  onRollCharacteristic: (characteristicId: CharacteristicId, modifier: number) => void;
}

export interface CombatCardProps extends BaseCardProps {
  isInCombat: boolean;
  surges: number;
  victories: number;
  speed: number;
  stability: number;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;
  onSurgesChange: (value: number) => void;
}

export interface ConditionsCardProps extends BaseCardProps {
  conditions: ActiveCondition[];
  onAddCondition: (conditionId: ConditionId) => void;
  onRemoveCondition: (conditionId: ConditionId) => void;
  onUpdateConditionEndType: (conditionId: ConditionId, endType: ConditionEndType) => void;
}

export interface DiceCardProps extends BaseCardProps {
  rollHistory: DiceRoll[];
  onRoll: (type: DiceType, label?: string) => void;
  onClearHistory: () => void;
}

// Turn card props
export interface TurnCardProps extends BaseCardProps {
  turnNumber: number;
  completedPhases: Set<TurnPhaseId>;
  conditions: ActiveCondition[];
  onTogglePhase: (phaseId: TurnPhaseId) => void;
  onEndTurn: () => void;
  onResetTurn: () => void;
  onRemoveCondition: (conditionId: ConditionId) => void;
}

// Re-export for convenience
export type { ConditionId, ActiveCondition };
