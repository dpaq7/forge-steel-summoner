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
 * Summoner v1.0 SRD:
 * - Base: 8 minions
 * - Level 4+: +4 (12 total)
 * - Level 7+: +4 (16 total)
 * - Level 10: +4 (20 total)
 * - Horde Formation: +4 additional
 */
export const calculateMaxMinions = (formation: Formation, level: number = 1): number => {
  let max = 8;

  // Minion Improvement bonuses at levels 4, 7, and 10
  if (level >= 4) max += 4;
  if (level >= 7) max += 4;
  if (level >= 10) max += 4;

  // Horde formation allows +4 more
  if (formation === 'horde') {
    max += 4;
  }

  return max;
};

/**
 * Calculate number of signature minions spawned at turn start
 * Summoner v1.0 SRD:
 * - Base: 3 minions
 * - Level 7+ (Minion Improvement): +1 (4 total)
 * - Horde Formation: +1 additional
 */
export const calculateSignatureMinionsPerTurn = (
  formation: Formation,
  level: number = 1
): number => {
  let count = 3;

  // Level 7 Minion Improvement: +1 free summon
  if (level >= 7) count += 1;

  // Horde formation: +1 additional
  if (formation === 'horde') count += 1;

  return count;
};

/**
 * Calculate essence gained per turn
 * Summoner SRD: Always +2 essence per turn (no level upgrades)
 * Note: Unlike Elementalist, Summoner does NOT get level-based upgrades to essence gain
 */
export const calculateEssencePerTurn = (_level: number): number => {
  return 2; // SRD: Always +2, no level upgrades
};

/**
 * Calculate essence gained from minion death
 * Summoner SRD: +1 essence when any minion dies within Summoner's Range
 * Note: No level upgrades - always +1 (limit once per round)
 */
export const calculateMinionDeathEssence = (_level: number): number => {
  return 1; // SRD: Always +1, once per round
};

/**
 * Calculate free signature minions summoned at combat start
 * Summoner v1.0 SRD:
 * - Base: 2 signature minions
 * - Level 10 (Minion Improvement): +2 per 2 Victories
 */
export const calculateCombatStartMinions = (level: number, victories: number): number => {
  let count = 2;

  // Level 10 bonus: +2 per 2 Victories
  if (level >= 10) {
    count += Math.floor(victories / 2) * 2;
  }

  return count;
};

/**
 * Calculate minion stamina bonus from level (Minion Improvement feature)
 * Summoner v1.0 SRD:
 * These bonuses are cumulative and applied at levels 4, 7, and 10.
 *
 * @param essenceCost - The minion's essence cost (1=signature, 3, 5, 7)
 * @param level - The summoner's level
 * @returns Total stamina bonus to add to base stamina
 */
export const calculateMinionLevelStaminaBonus = (
  essenceCost: number,
  level: number
): number => {
  // Signature minions (1 essence): +1 at L4, +1 at L7, +1 at L10
  if (essenceCost === 1) {
    let bonus = 0;
    if (level >= 4) bonus += 1;
    if (level >= 7) bonus += 1;
    if (level >= 10) bonus += 1;
    return bonus;
  }

  // 3-essence minions: +3 at L4, +3 at L7, +3 at L10
  if (essenceCost === 3) {
    let bonus = 0;
    if (level >= 4) bonus += 3;
    if (level >= 7) bonus += 3;
    if (level >= 10) bonus += 3;
    return bonus;
  }

  // 5-essence minions: +2 at L4, +2 at L7, +2 at L10
  if (essenceCost === 5) {
    let bonus = 0;
    if (level >= 4) bonus += 2;
    if (level >= 7) bonus += 2;
    if (level >= 10) bonus += 2;
    return bonus;
  }

  // 7-essence minions: +5 at L7, +5 at L10 (no L4 bonus)
  if (essenceCost === 7) {
    let bonus = 0;
    if (level >= 7) bonus += 5;
    if (level >= 10) bonus += 5;
    return bonus;
  }

  return 0;
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

// =============================================================================
// SACRIFICE MECHANICS (Summoner v1.0 SRD)
// =============================================================================

/**
 * Calculate sacrifice cost reduction
 * Summoner v1.0 SRD:
 * - Base: Each sacrificed minion reduces cost by 1
 * - Level 10 (No Matter the Cost): Each minion reduces cost by its essence value
 *
 * Note: Can only sacrifice signature minions (1 essence each), so pre-L10
 * each sacrifice reduces cost by 1. At L10, each signature reduces by 1 too.
 * For non-signature minions being sacrificed (if ever allowed), this would
 * return the minion's essence cost instead.
 *
 * @param minionsToSacrifice - Number of minions being sacrificed
 * @param level - Summoner's level
 * @param minionEssenceCosts - Array of essence costs for each sacrificed minion (default: all 1s)
 */
export const calculateSacrificeCostReduction = (
  minionsToSacrifice: number,
  level: number,
  minionEssenceCosts: number[] = []
): number => {
  if (minionsToSacrifice <= 0) return 0;

  // Fill with 1s (signature minion cost) if not provided
  const costs = minionEssenceCosts.length > 0
    ? minionEssenceCosts
    : Array(minionsToSacrifice).fill(1);

  // Level 10 (No Matter the Cost): Full essence value per minion
  if (level >= 10) {
    return costs.reduce((sum, cost) => sum + cost, 0);
  }

  // Before Level 10: 1 per minion regardless of essence cost
  return minionsToSacrifice;
};

// =============================================================================
// CHAMPION MECHANICS (Summoner v1.0 SRD)
// =============================================================================

/**
 * Check if champion is unlocked
 * Summoner v1.0 SRD: Champion unlocks at Level 8
 */
export const isChampionUnlocked = (level: number): boolean => {
  return level >= 8;
};

/**
 * Check if Champion Action is unlocked (Level 10)
 * Summoner v1.0 SRD: Champion Action costs eidos, once per encounter
 */
export const isChampionActionUnlocked = (level: number): boolean => {
  return level >= 10;
};

/**
 * Calculate champion stamina (includes level-based bonus)
 * Champions get the same stamina improvements as 9-essence minions
 */
export const calculateChampionStamina = (
  baseStamina: number,
  level: number,
  formation: Formation
): number => {
  // Formation bonus (Elite: +3)
  const formationBonus = calculateMinionBonusStamina(formation);
  // Level-based bonus (same as 9-essence minions - treating as 7-essence tier)
  const levelBonus = calculateMinionLevelStaminaBonus(7, level);

  return baseStamina + formationBonus + levelBonus;
};

// =============================================================================
// OUT-OF-COMBAT MECHANICS (Summoner v1.0 SRD)
// =============================================================================

/**
 * Maximum free minions outside combat
 */
export const OUT_OF_COMBAT_MAX_MINIONS = 4;

/**
 * Check if a non-signature minion can be summoned outside combat
 * Summoner v1.0 SRD: Other minions require Victories >= essence cost
 *
 * @param essenceCost - The minion's essence cost
 * @param victories - Current number of Victories
 */
export const canSummonOutOfCombat = (
  essenceCost: number,
  victories: number,
  isSignature: boolean
): boolean => {
  // Signature minions are always freely summonable
  if (isSignature || essenceCost === 1) return true;

  // Other minions require Victories >= essence cost
  return victories >= essenceCost;
};
