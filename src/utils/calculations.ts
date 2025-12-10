import { SummonerHero, Formation, Kit, SummonerCircle } from '../types';

/**
 * Calculate max stamina for a Summoner hero
 * Base: 15 (Summoner class base per SRD)
 * Kit: varies by kit
 * Level: +6 per level (starting at level 2)
 */
export const calculateMaxStamina = (hero: Partial<SummonerHero>): number => {
  const baseClassStamina = 15; // Summoner base (SRD: Level 1 = 15)
  const kitStamina = hero.kit?.stamina || 0;
  const level = hero.level || 1;
  // Level 1 gets base stamina, level 2+ gets +6 per level
  const levelBonus = level >= 2 ? level * 6 : 0;
  return baseClassStamina + kitStamina + levelBonus;
};

/**
 * Calculate winded threshold (half of max stamina, rounded down)
 */
export const calculateWindedThreshold = (maxStamina: number): number => {
  return Math.floor(maxStamina / 2);
};

/**
 * Calculate recovery value (1/3 of max stamina, rounded down)
 * Draw Steel: Recovery value = 1/3 of max stamina
 */
export const calculateRecoveryValue = (hero: Partial<SummonerHero>): number => {
  return Math.floor(calculateMaxStamina(hero) / 3);
};

/**
 * Calculate summoner's range for minion summoning
 * Formula: 5 + Reason (SRD specification)
 */
export const calculateSummonerRange = (hero: Partial<SummonerHero>): number => {
  const reason = hero.characteristics?.reason || 2; // Default Reason is 2
  return 5 + reason;
};

/**
 * Calculate maximum number of minions based on formation and level
 * Base: 8
 * Level 4+: +4 (12 total)
 * Horde: +4 (16 total at level 4+)
 */
export const calculateMaxMinions = (formation: Formation, level: number = 1): number => {
  let max = 8;
  if (level >= 4) {
    max += 4; // Level 4 grants +4 minion cap
  }
  if (formation === 'horde') {
    max += 4; // Horde formation allows +4 more
  }
  return max;
};

/**
 * Calculate number of signature minions spawned per turn
 * Base: 3
 * Horde: 4
 */
export const calculateSignatureMinionsPerTurn = (formation: Formation): number => {
  return formation === 'horde' ? 4 : 3;
};

/**
 * Calculate essence gained per turn based on level
 * Level 1-5: 5 essence
 * Level 6-8: 6 essence
 * Level 9-10: 7 essence
 */
export const calculateEssencePerTurn = (level: number): number => {
  if (level >= 9) return 7;
  if (level >= 6) return 6;
  return 5;
};

/**
 * Calculate maximum recoveries
 * Base: 8 (SRD specification)
 * Circle of Spring: +2 recoveries (Pixie Dust feature)
 */
export const calculateMaxRecoveries = (circle?: SummonerCircle): number => {
  const baseRecoveries = 8; // SRD: Summoners have 8 recoveries
  const circleBonus = circle === 'spring' ? 2 : 0; // Pixie Dust feature
  return baseRecoveries + circleBonus;
};

/**
 * Calculate speed from kit
 */
export const calculateSpeed = (kit: Kit | undefined): number => {
  return kit?.speed || 5;
};

/**
 * Calculate stability from kit
 */
export const calculateStability = (kit: Kit | undefined): number => {
  return kit?.stability || 0;
};

/**
 * Get kit stamina bonus
 */
export const getKitStamina = (kit: Kit | undefined): number => {
  return kit?.stamina || 0;
};

/**
 * Calculate essence cost with formation modifications
 * Elite formation reduces essence costs by 1 for minions costing 5+
 */
export const calculateEssenceCost = (
  baseCost: number,
  formation: Formation
): number => {
  if (formation === 'elite' && baseCost >= 5) {
    return Math.max(1, baseCost - 1);
  }
  return baseCost;
};

/**
 * Calculate minion bonus stamina from formation
 * Elite formation grants +3 stamina to all minions (SRD)
 */
export const calculateMinionBonusStamina = (formation: Formation): number => {
  return formation === 'elite' ? 3 : 0;
};

/**
 * Calculate minion characteristic bonus from formation
 * Elite formation grants +1 to all characteristics
 */
export const calculateMinionCharacteristicBonus = (formation: Formation): number => {
  return formation === 'elite' ? 1 : 0;
};

/**
 * Calculate minion free strike bonus from formation
 * Platoon formation grants +1 to all free strikes
 */
export const calculateMinionFreeStrikeBonus = (formation: Formation): number => {
  return formation === 'platoon' ? 1 : 0;
};

/**
 * Calculate fixture stamina based on level
 * Base: 20 + level
 */
export const calculateFixtureStamina = (level: number): number => {
  return 20 + level;
};

/**
 * Calculate fixture size based on level
 * Base: 2
 * Level 9+: 3
 */
export const calculateFixtureSize = (level: number): number => {
  return level >= 9 ? 3 : 2;
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
