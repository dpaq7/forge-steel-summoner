import { useCallback } from 'react';
import { useSummonerContext } from '../context/SummonerContext';
import { MinionTemplate } from '../types';
import { calculateEssenceCost } from '../utils/calculations';

// Level requirements for minion tiers based on portfolio progression:
// Level 1: Select 2 Signature (1-Ess) + 2 x 3-Essence minions
// Level 2: Gain access to 5-Essence minions (select one)
// Level 5: Gain access to 7-Essence minions (select one)
// Level 8: Gain access to Champion (9-Essence)
const MINION_LEVEL_REQUIREMENTS: Record<number, number> = {
  1: 1,  // Signature minions - Level 1
  3: 1,  // 3-essence minions - Level 1
  5: 2,  // 5-essence minions - Level 2
  7: 5,  // 7-essence minions - Level 5
  9: 8,  // Champion - Level 8
};

export const usePortfolio = () => {
  const { hero } = useSummonerContext();

  const getSignatureMinions = useCallback((): MinionTemplate[] => {
    if (!hero) return [];
    return hero.portfolio.signatureMinions;
  }, [hero]);

  const getUnlockedMinions = useCallback((): MinionTemplate[] => {
    if (!hero) return [];
    return hero.portfolio.unlockedMinions;
  }, [hero]);

  const getAllAvailableMinions = useCallback((): MinionTemplate[] => {
    if (!hero) return [];
    return [...hero.portfolio.signatureMinions, ...hero.portfolio.unlockedMinions];
  }, [hero]);

  const getMinionsByEssenceCost = useCallback(
    (cost: number): MinionTemplate[] => {
      if (!hero) return [];
      return getAllAvailableMinions().filter((m) => m.essenceCost === cost);
    },
    [hero, getAllAvailableMinions]
  );

  const getAffordableMinions = useCallback(
    (availableEssence: number): MinionTemplate[] => {
      if (!hero) return [];
      return getAllAvailableMinions().filter((minion) => {
        const actualCost = calculateEssenceCost(minion.essenceCost, hero.formation);
        return actualCost <= availableEssence;
      });
    },
    [hero, getAllAvailableMinions]
  );

  const getMinionById = useCallback(
    (id: string): MinionTemplate | undefined => {
      if (!hero) return undefined;
      return getAllAvailableMinions().find((m) => m.id === id);
    },
    [hero, getAllAvailableMinions]
  );

  const getActualEssenceCost = useCallback(
    (minion: MinionTemplate): number => {
      if (!hero) return minion.essenceCost;
      return calculateEssenceCost(minion.essenceCost, hero.formation);
    },
    [hero]
  );

  const getFixture = useCallback(() => {
    if (!hero) return null;
    return hero.portfolio.fixture;
  }, [hero]);

  const getChampion = useCallback(() => {
    if (!hero) return null;
    return hero.portfolio.champion;
  }, [hero]);

  // Check if a minion is available based on hero level
  const isMinionUnlockedByLevel = useCallback(
    (minion: MinionTemplate): boolean => {
      if (!hero) return false;
      const requiredLevel = MINION_LEVEL_REQUIREMENTS[minion.essenceCost] || 1;
      return hero.level >= requiredLevel;
    },
    [hero]
  );

  // Get the required level for a minion
  const getRequiredLevel = useCallback(
    (minion: MinionTemplate): number => {
      return MINION_LEVEL_REQUIREMENTS[minion.essenceCost] || 1;
    },
    []
  );

  // Check if a minion is a signature minion
  const isSignatureMinion = useCallback(
    (minion: MinionTemplate): boolean => {
      return minion.essenceCost === 1;
    },
    []
  );

  return {
    getSignatureMinions,
    getUnlockedMinions,
    getAllAvailableMinions,
    getMinionsByEssenceCost,
    getAffordableMinions,
    getMinionById,
    getActualEssenceCost,
    getFixture,
    getChampion,
    isMinionUnlockedByLevel,
    getRequiredLevel,
    isSignatureMinion,
  };
};
