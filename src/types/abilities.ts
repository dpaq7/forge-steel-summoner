// Ability and Feature types for Draw Steel

import { Characteristic } from './common';

export type ActionType =
  | 'action'
  | 'maneuver'
  | 'freeManeuver'
  | 'triggered'
  | 'freeTriggered';

export interface PowerRoll {
  characteristic: Characteristic;
  tier1: string; // "R damage"
  tier2: string; // "2 + R damage"
  tier3: string; // "4 + R damage"
}

export interface Ability {
  id: string;
  name: string;
  flavorText?: string;

  // Action economy
  actionType: ActionType;
  essenceCost?: number;

  // Keywords
  keywords: string[]; // 'Magic', 'Ranged', 'Strike', 'Melee', 'Weapon', etc.

  // Targeting
  distance: string; // 'Melee 3', 'Ranged 10', 'Self', 'Summoner's Range', etc.
  target: string; // 'One creature', 'All allies in burst 3', etc.

  // Power roll (if applicable)
  powerRoll?: PowerRoll;

  // Effect text
  effect: string;

  // Special costs/triggers
  trigger?: string; // For triggered actions
  spendEssence?: string; // "Spend 1 Essence: ..."
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  levelRequired?: number;
}

export interface MinionTrait {
  name: string;
  description: string;
}

export interface FixtureTrait {
  name: string;
  description: string;
}
