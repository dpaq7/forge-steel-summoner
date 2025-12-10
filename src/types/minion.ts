// Minion, Portfolio, and Squad types

import { Characteristics, Condition, GridPosition, Size, Immunity, Weakness } from './common';
import { Ability, MinionTrait, FixtureTrait, Feature } from './abilities';

export type PortfolioType = 'demon' | 'elemental' | 'fey' | 'undead';

export type MinionRole =
  | 'artillery'
  | 'ambusher'
  | 'brute'
  | 'controller'
  | 'defender'
  | 'harrier'
  | 'hexer'
  | 'support';

export interface MinionTemplate {
  id: string;
  name: string;
  essenceCost: number; // 1, 3, 5, 7, or 9
  minionsPerSummon: number; // How many appear per Call Forth

  // Minion stats
  size: Size;
  speed: number;
  stamina: number | number[]; // Single value or array for multiple minions
  stability: number;
  freeStrike: number;

  // Characteristics
  characteristics: Characteristics;

  // Combat info
  role: MinionRole;
  keywords: string[]; // 'Abyssal', 'Demon', 'Fey', 'Elemental', 'Undead', etc.
  immunities: Immunity[];
  weaknesses: Weakness[];
  movementModes: string[]; // 'Fly', 'Hover', 'Climb', 'Swim', 'Burrow', 'Teleport'
  freeStrikeDamageType: string;

  // Abilities & traits
  traits: MinionTrait[];
  signatureAbility?: Ability; // For minions with signature strikes
}

export interface Minion {
  id: string;
  templateId: string;
  isAlive: boolean; // SRD: Minions die when pool damage equals their max HP
  maxStamina: number; // Individual minion's max HP (for death threshold calculation)
  conditions: Condition[];
  position?: GridPosition; // Optional for tactical tracking
}

export interface Squad {
  id: string;
  templateId: string; // Reference to MinionTemplate
  members: Minion[];

  // SRD: Squad shares a single Stamina pool
  currentStamina: number;
  maxStamina: number;

  // Squad-level state
  hasMoved: boolean;
  hasActed: boolean;
}

export interface FixtureTemplate {
  id: string;
  name: string;
  portfolioType: PortfolioType;
  role: string; // 'Relic Artillery', 'Hazard Support', 'Hazard Ambusher', 'Fortification Defender'

  baseStamina: number; // Usually 20 + level
  size: number; // Usually 2, becomes 3 at level 9

  // Fixture traits
  traits: FixtureTrait[];

  // Level advancement features
  level5Feature: Feature;
  level9Feature: Feature;
}

export interface Fixture {
  templateId: string;
  currentStamina: number;
  position?: GridPosition;
  isActive: boolean;
}

export interface ChampionTemplate {
  id: string;
  name: string;
  portfolioType: PortfolioType;
  description: string;
  // Champion-specific stats and abilities would go here
}

export interface Portfolio {
  type: PortfolioType;
  signatureMinions: MinionTemplate[]; // 2 chosen at creation, 1 essence each
  unlockedMinions: MinionTemplate[]; // 3-essence, 5-essence, 7-essence, 9-essence tiers
  fixture: FixtureTemplate; // Portfolio-specific fixture
  champion: ChampionTemplate | null; // Level 8+ feature
}

// Squad operations interface
export interface SquadActions {
  moveSquad(squadId: string, destination: GridPosition): void;
  squadFreeStrike(squadId: string, targetId: string): void;
  squadSignatureAbility(squadId: string, targetId: string): void;
  addMinionToSquad(squadId: string, minion: Minion): void;
  removeMinionFromSquad(squadId: string, minionId: string): void;
  mergeSquads(sourceSquadId: string, targetSquadId: string): void;
}
