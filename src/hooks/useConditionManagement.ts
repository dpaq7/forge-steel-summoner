import { useCallback } from 'react';
import type { ConditionId, ConditionEndType } from '@/types/common';
import { getDefaultEndType } from '@/data/conditions';
import type { Hero } from '@/types';

interface UseConditionManagementProps {
  hero: Hero | null;
  updateHero: (updates: Partial<Hero>) => void;
}

/**
 * Custom hook for managing conditions on a hero
 */
export function useConditionManagement({ hero, updateHero }: UseConditionManagementProps) {
  /**
   * Add a condition to the hero
   */
  const handleAddCondition = useCallback(
    (conditionId: ConditionId) => {
      if (!hero) return;
      // Check if condition already exists
      if (hero.activeConditions.some((c) => c.conditionId === conditionId)) return;

      updateHero({
        activeConditions: [
          ...hero.activeConditions,
          {
            conditionId,
            appliedAt: Date.now(),
            endType: getDefaultEndType(conditionId),
          },
        ],
      });
    },
    [hero, updateHero]
  );

  /**
   * Remove a condition from the hero
   */
  const handleRemoveCondition = useCallback(
    (conditionId: ConditionId) => {
      if (!hero) return;
      updateHero({
        activeConditions: hero.activeConditions.filter((c) => c.conditionId !== conditionId),
      });
    },
    [hero, updateHero]
  );

  /**
   * Update the end type of a condition
   */
  const handleUpdateConditionEndType = useCallback(
    (conditionId: ConditionId, endType: ConditionEndType) => {
      if (!hero) return;
      updateHero({
        activeConditions: hero.activeConditions.map((c) =>
          c.conditionId === conditionId ? { ...c, endType } : c
        ),
      });
    },
    [hero, updateHero]
  );

  return {
    handleAddCondition,
    handleRemoveCondition,
    handleUpdateConditionEndType,
  };
}

export default useConditionManagement;
