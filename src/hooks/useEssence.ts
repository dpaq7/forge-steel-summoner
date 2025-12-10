import { useCallback } from 'react';
import { useCombatContext } from '../context/CombatContext';
import { useSummonerContext } from '../context/SummonerContext';
import { MinionTemplate } from '../types';
import { calculateEssenceCost } from '../utils/calculations';

export const useEssence = () => {
  const { essenceState, spendEssence, gainEssence, onMinionDeath } = useCombatContext();
  const { hero } = useSummonerContext();

  const canAfford = useCallback(
    (cost: number): boolean => {
      return essenceState.currentEssence >= cost;
    },
    [essenceState.currentEssence]
  );

  const canAffordMinion = useCallback(
    (minion: MinionTemplate): boolean => {
      if (!hero) return false;
      const actualCost = calculateEssenceCost(minion.essenceCost, hero.formation);
      return canAfford(actualCost);
    },
    [hero, canAfford]
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
    return essenceState.currentEssence;
  }, [essenceState.currentEssence]);

  const getEssenceGainedThisTurn = useCallback((): number => {
    return essenceState.essenceGainedThisTurn;
  }, [essenceState.essenceGainedThisTurn]);

  const hasSpawnedSignatureMinions = useCallback((): boolean => {
    return essenceState.signatureMinionsSpawnedThisTurn;
  }, [essenceState.signatureMinionsSpawnedThisTurn]);

  const canGainMinionDeathEssence = useCallback((): boolean => {
    return !essenceState.minionDeathEssenceGainedThisRound;
  }, [essenceState.minionDeathEssenceGainedThisRound]);

  return {
    currentEssence: essenceState.currentEssence,
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
  };
};
