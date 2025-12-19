import { useCallback } from 'react';
import { useCombatContext } from '../context/CombatContext';
import { useSummonerContext } from '../context/HeroContext';
import { isSummonerHero } from '../types/hero';
import { MinionTemplate } from '../types';
import { calculateEssenceCost } from '../utils/calculations';
import {
  validateSummon,
  SummonValidationResult,
  SummonOptions,
  getShortFailureReason,
  countActiveMinions,
  getMaxMinions,
} from '../utils/summonerValidation';

export const useEssence = () => {
  const { essenceState, spendEssence, gainEssence, onMinionDeath } = useCombatContext();
  const { hero: genericHero } = useSummonerContext();

  // Essence mechanics are primarily for Summoners
  const hero = genericHero && isSummonerHero(genericHero) ? genericHero : null;

  // SINGLE SOURCE OF TRUTH: Always read essence from hero.heroicResource.current
  // This ensures StatChip and Minions tab are always in sync
  const currentEssence = hero?.heroicResource?.current ?? essenceState.currentEssence ?? 0;

  const canAfford = useCallback(
    (cost: number): boolean => {
      return currentEssence >= cost;
    },
    [currentEssence]
  );

  /**
   * Full validation check for summoning a minion
   * Returns detailed validation result with constraint info
   */
  const validateMinionSummon = useCallback(
    (minion: MinionTemplate, options: SummonOptions = {}): SummonValidationResult => {
      if (!hero) {
        return {
          canSummon: false,
          message: 'No hero loaded',
          details: {
            currentEssence: 0,
            requiredEssence: minion.essenceCost,
            currentMinions: 0,
            maxMinions: 8,
            currentSquads: 0,
            maxSquads: 2,
            minionsToSummon: minion.minionsPerSummon ?? 1,
            isFreeSummon: false,
          },
        };
      }
      return validateSummon(hero, minion, options);
    },
    [hero]
  );

  /**
   * Simple boolean check - can we summon this minion?
   * For backward compatibility with existing code
   */
  const canAffordMinion = useCallback(
    (minion: MinionTemplate): boolean => {
      if (!hero) return false;
      const result = validateSummon(hero, minion);
      return result.canSummon;
    },
    [hero]
  );

  /**
   * Get short reason string for UI display when summon is blocked
   */
  const getSummonBlockReason = useCallback(
    (minion: MinionTemplate, options: SummonOptions = {}): string => {
      if (!hero) return 'No hero';
      const result = validateSummon(hero, minion, options);
      return getShortFailureReason(result);
    },
    [hero]
  );

  const getActualCost = useCallback(
    (minion: MinionTemplate): number => {
      if (!hero) return minion.essenceCost;
      return calculateEssenceCost(minion.essenceCost, hero.formation);
    },
    [hero]
  );

  const spendForMinion = useCallback(
    (minion: MinionTemplate): boolean => {
      if (!hero) return false;
      const actualCost = calculateEssenceCost(minion.essenceCost, hero.formation);
      return spendEssence(actualCost);
    },
    [hero, spendEssence]
  );

  const getCurrentEssence = useCallback((): number => {
    return currentEssence;
  }, [currentEssence]);

  const getEssenceGainedThisTurn = useCallback((): number => {
    return essenceState.essenceGainedThisTurn;
  }, [essenceState.essenceGainedThisTurn]);

  const hasSpawnedSignatureMinions = useCallback((): boolean => {
    return essenceState.signatureMinionsSpawnedThisTurn;
  }, [essenceState.signatureMinionsSpawnedThisTurn]);

  const canGainMinionDeathEssence = useCallback((): boolean => {
    return !essenceState.minionDeathEssenceGainedThisRound;
  }, [essenceState.minionDeathEssenceGainedThisRound]);

  /**
   * Get current minion count and max for UI display
   */
  const getMinionCounts = useCallback(() => {
    if (!hero) return { current: 0, max: 8 };
    return {
      current: countActiveMinions(hero.activeSquads),
      max: getMaxMinions(hero.formation, hero.level),
    };
  }, [hero]);

  /**
   * Get current squad count for UI display
   */
  const getSquadCount = useCallback((): number => {
    if (!hero) return 0;
    return hero.activeSquads?.length ?? 0;
  }, [hero]);

  return {
    currentEssence, // Uses hero.heroicResource.current as single source of truth
    essenceGainedThisTurn: essenceState.essenceGainedThisTurn,
    canAfford,
    canAffordMinion,
    getActualCost,
    spendEssence,
    spendForMinion,
    gainEssence,
    getCurrentEssence,
    getEssenceGainedThisTurn,
    hasSpawnedSignatureMinions,
    onMinionDeath,
    canGainMinionDeathEssence,
    // New validation functions
    validateMinionSummon,
    getSummonBlockReason,
    getMinionCounts,
    getSquadCount,
  };
};
