// Generalized Hero type for all Draw Steel classes
// Supports all 10 classes via discriminated unions

import { Ancestry, Career, Culture, Kit, Item, Characteristics, ActiveCondition } from './common';
import { Ability, Feature } from './abilities';
import { Portfolio, Squad, Fixture } from './minion';
import { ProgressionChoices } from './progression';
import { ActiveProject, InventoryItem } from './projects';
import { EquippedItem } from './equipment';

// All 10 Draw Steel hero classes
export type HeroClass =
  | 'censor'
  | 'conduit'
  | 'elementalist'
  | 'fury'
  | 'null'
  | 'shadow'
  | 'summoner'
  | 'tactician'
  | 'talent'
  | 'troubadour';

// Heroic resource types per class
export type HeroicResourceType =
  | 'wrath'      // Censor
  | 'piety'      // Conduit
  | 'essence'    // Elementalist, Summoner
  | 'ferocity'   // Fury
  | 'discipline' // Null
  | 'insight'    // Shadow
  | 'focus'      // Tactician
  | 'clarity'    // Talent
  | 'drama';     // Troubadour

// Shared stamina pool interface
export interface StaminaPool {
  current: number;
  max: number;
  winded: number;
}

// Shared recovery pool interface
export interface RecoveryPool {
  current: number;
  max: number;
  value: number;
}

// Base heroic resource interface
export interface HeroicResource<T extends HeroicResourceType = HeroicResourceType> {
  type: T;
  current: number;
}

// Extended heroic resource for Elementalist (has persistent reduction)
export interface ElementalistResource extends HeroicResource<'essence'> {
  persistent: number; // Essence locked by persistent abilities
}

// Extended heroic resource for Summoner (has max per turn)
export interface SummonerResource extends HeroicResource<'essence'> {
  maxPerTurn: number;
}

// Extended heroic resource for Talent (can go negative)
export interface TalentResource extends HeroicResource<'clarity'> {
  minimum: number; // Can go to -(1+Reason)
}

// =================================================================
// SUBCLASS TYPES PER CLASS
// =================================================================

// Censor Orders (subclass)
export type CensorOrder = 'inquisitor' | 'templar' | 'zealot';

// Conduit Domains
export type ConduitDomain =
  | 'creation'
  | 'death'
  | 'fate'
  | 'knowledge'
  | 'love'
  | 'nature'
  | 'protection'
  | 'storm'
  | 'sun'
  | 'trickery'
  | 'war';

// Elementalist Elements
export type ElementalistElement = 'earth' | 'fire' | 'green' | 'void';

// Fury Aspects
export type FuryAspect = 'berserker' | 'reaver' | 'stormwight';

// Null Traditions
export type NullTradition = 'chronopath' | 'cloister' | 'manticore';

// Shadow Colleges
export type ShadowCollege =
  | 'black-ash'
  | 'caustic-alchemy'
  | 'harlequin-mask'
  | 'woven-darkness';

// Summoner Circles (already defined, re-export for consistency)
export type SummonerCircle = 'blight' | 'graves' | 'spring' | 'storms';

// Tactician Doctrines
export type TacticianDoctrine = 'insurgent' | 'mastermind' | 'vanguard';

// Talent Traditions
export type TalentTradition = 'empath' | 'metamorph' | 'telekinetic';

// Troubadour Classes
export type TroubadourClass = 'dancer' | 'duelist' | 'wordsmith';

// =================================================================
// CLASS-SPECIFIC STATE TYPES
// =================================================================

// Censor judgment tracking
export interface JudgmentState {
  targetId: string | null;
  targetName: string | null;
}

// Conduit prayer tracking
export interface PrayState {
  hasPrayedThisTurn: boolean;
  lastPrayResult: 'piety' | 'domain' | 'damage' | null;
}

// Elementalist persistent abilities
export interface PersistentAbility {
  abilityId: string;
  abilityName: string;
  essenceLocked: number;
  activeSince: number;
}

// Troubadour routines
export interface Routine {
  id: string;
  name: string;
  effect: string;
}

// Troubadour scene partners (for negotiation)
export interface ScenePartner {
  id: string;
  name: string;
  bondedAt: number;
}

// Summoner formations (re-export)
export type Formation = 'horde' | 'platoon' | 'elite' | 'leader';

export interface QuickCommand {
  id: string;
  name: string;
  description: string;
  formation: Formation;
}

// =================================================================
// BASE HERO INTERFACE (shared by all classes)
// =================================================================

export interface HeroBase {
  id: string;
  name: string;
  level: number; // 1-10
  heroClass: HeroClass;

  // Background
  ancestry: Ancestry;
  culture: Culture;
  career: Career;

  // Core characteristics
  characteristics: Characteristics;

  // Combat stats
  stamina: StaminaPool;
  recoveries: RecoveryPool;
  speed: number;
  stability: number;

  // Universal resources
  surges: number;
  heroTokens: number;
  victories: number;
  xp: number;
  wealth: number;
  gold: number;
  renown: number;

  // Abilities & features
  abilities: Ability[];
  features: Feature[];

  // Skills & languages
  skills: string[];
  languages: string[];

  // Equipment
  kit: Kit;
  items: Item[];
  equippedItems: EquippedItem[];
  inventory: InventoryItem[];

  // Status
  activeConditions: ActiveCondition[];
  notes: string;
  portraitUrl: string | null;

  // Progression tracking
  progressionChoices: ProgressionChoices;
  activeProjects: ActiveProject[];
}

// =================================================================
// CLASS-SPECIFIC HERO INTERFACES
// =================================================================

export interface CensorHero extends HeroBase {
  heroClass: 'censor';
  heroicResource: HeroicResource<'wrath'>;
  judgment: JudgmentState;
  subclass?: CensorOrder;
}

export interface ConduitHero extends HeroBase {
  heroClass: 'conduit';
  heroicResource: HeroicResource<'piety'>;
  domain: ConduitDomain;
  prayState: PrayState;
}

export interface ElementalistHero extends HeroBase {
  heroClass: 'elementalist';
  heroicResource: ElementalistResource;
  element: ElementalistElement;
  mantleActive: boolean;
  persistentAbilities: PersistentAbility[];
}

export interface FuryHero extends HeroBase {
  heroClass: 'fury';
  heroicResource: HeroicResource<'ferocity'>;
  growingFerocityTier: number;
  aspect?: FuryAspect;
}

export interface NullHero extends HeroBase {
  heroClass: 'null';
  heroicResource: HeroicResource<'discipline'>;
  nullFieldActive: boolean;
  nullFieldRadius: number;
  tradition?: NullTradition;
}

export interface ShadowHero extends HeroBase {
  heroClass: 'shadow';
  heroicResource: HeroicResource<'insight'>;
  college: ShadowCollege;
  isHidden: boolean;
}

export interface SummonerHeroV2 extends HeroBase {
  heroClass: 'summoner';
  heroicResource: SummonerResource;
  circle: SummonerCircle;
  formation: Formation;
  quickCommand: QuickCommand;
  portfolio: Portfolio;
  activeSquads: Squad[];
  fixture: Fixture | null;
  minionPortraits: Record<string, string | null>;
  fixturePortrait: string | null;
  inactiveMinions: string[];
}

export interface TacticianHero extends HeroBase {
  heroClass: 'tactician';
  heroicResource: HeroicResource<'focus'>;
  markedTargets: string[];
  secondaryKit: Kit | null; // Field Arsenal allows two kits
  doctrine?: TacticianDoctrine;
}

export interface TalentHero extends HeroBase {
  heroClass: 'talent';
  heroicResource: TalentResource;
  isStrained: boolean; // true when clarity < 0
  tradition?: TalentTradition;
}

export interface TroubadourHero extends HeroBase {
  heroClass: 'troubadour';
  heroicResource: HeroicResource<'drama'>;
  activeRoutine: Routine | null;
  scenePartners: ScenePartner[];
  heroPartners: string[]; // Hero IDs bonded for Equal Billing
  class?: TroubadourClass;
}

// =================================================================
// UNION TYPE FOR ALL HEROES
// =================================================================

export type Hero =
  | CensorHero
  | ConduitHero
  | ElementalistHero
  | FuryHero
  | NullHero
  | ShadowHero
  | SummonerHeroV2
  | TacticianHero
  | TalentHero
  | TroubadourHero;

// =================================================================
// TYPE GUARDS
// =================================================================

export function isCensorHero(hero: Hero): hero is CensorHero {
  return hero.heroClass === 'censor';
}

export function isConduitHero(hero: Hero): hero is ConduitHero {
  return hero.heroClass === 'conduit';
}

export function isElementalistHero(hero: Hero): hero is ElementalistHero {
  return hero.heroClass === 'elementalist';
}

export function isFuryHero(hero: Hero): hero is FuryHero {
  return hero.heroClass === 'fury';
}

export function isNullHero(hero: Hero): hero is NullHero {
  return hero.heroClass === 'null';
}

export function isShadowHero(hero: Hero): hero is ShadowHero {
  return hero.heroClass === 'shadow';
}

export function isSummonerHero(hero: Hero): hero is SummonerHeroV2 {
  return hero.heroClass === 'summoner';
}

export function isTacticianHero(hero: Hero): hero is TacticianHero {
  return hero.heroClass === 'tactician';
}

export function isTalentHero(hero: Hero): hero is TalentHero {
  return hero.heroClass === 'talent';
}

export function isTroubadourHero(hero: Hero): hero is TroubadourHero {
  return hero.heroClass === 'troubadour';
}

// =================================================================
// UTILITY TYPES
// =================================================================

// Get heroic resource type for a class
export type HeroicResourceForClass<T extends HeroClass> =
  T extends 'censor' ? 'wrath' :
  T extends 'conduit' ? 'piety' :
  T extends 'elementalist' ? 'essence' :
  T extends 'fury' ? 'ferocity' :
  T extends 'null' ? 'discipline' :
  T extends 'shadow' ? 'insight' :
  T extends 'summoner' ? 'essence' :
  T extends 'tactician' ? 'focus' :
  T extends 'talent' ? 'clarity' :
  T extends 'troubadour' ? 'drama' :
  never;

// Circle to Portfolio mapping (for Summoner)
export const circleToPortfolio: Record<SummonerCircle, 'demon' | 'elemental' | 'fey' | 'undead'> = {
  blight: 'demon',
  graves: 'undead',
  spring: 'fey',
  storms: 'elemental',
};
