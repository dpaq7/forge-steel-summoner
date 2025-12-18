import { useCallback } from 'react';
import { useSummonerContext } from '../context/HeroContext';
import { ActiveCondition, ConditionId } from '../types/common';
import { CONDITIONS, performSavingThrow, calculateBleedingDamage, ConditionDefinition, getDefaultEndType } from '../data/conditions';

export interface SaveResult {
  conditionId: ConditionId;
  conditionName: string;
  roll: number;
  success: boolean;
  removed: boolean;
}

export interface BleedingDamageResult {
  roll: number;
  total: number;
  trigger: string;
}

export const useConditions = () => {
  const { hero, updateHero } = useSummonerContext();

  /**
   * Add a condition to the hero
   */
  const addCondition = useCallback(
    (conditionId: ConditionId, sourceId?: string, sourceName?: string, duration?: number) => {
      if (!hero) return;

      // Check if already has this condition
      const existing = hero.activeConditions?.find(c => c.conditionId === conditionId);
      if (existing) {
        // Update existing condition (refresh duration if applicable)
        const updated = hero.activeConditions.map(c =>
          c.conditionId === conditionId
            ? { ...c, sourceId, sourceName, duration, appliedAt: Date.now() }
            : c
        );
        updateHero({ activeConditions: updated });
      } else {
        // Add new condition
        const newCondition: ActiveCondition = {
          conditionId,
          sourceId,
          sourceName,
          duration,
          appliedAt: Date.now(),
          endType: getDefaultEndType(conditionId),
        };
        updateHero({
          activeConditions: [...(hero.activeConditions || []), newCondition],
        });
      }
    },
    [hero, updateHero]
  );

  /**
   * Remove a condition from the hero
   */
  const removeCondition = useCallback(
    (conditionId: ConditionId) => {
      if (!hero) return;

      updateHero({
        activeConditions: (hero.activeConditions || []).filter(c => c.conditionId !== conditionId),
      });
    },
    [hero, updateHero]
  );

  /**
   * Check if hero has a specific condition
   */
  const hasCondition = useCallback(
    (conditionId: ConditionId): boolean => {
      if (!hero) return false;
      return (hero.activeConditions || []).some(c => c.conditionId === conditionId);
    },
    [hero]
  );

  /**
   * Get active condition details
   */
  const getCondition = useCallback(
    (conditionId: ConditionId): ActiveCondition | undefined => {
      if (!hero) return undefined;
      return (hero.activeConditions || []).find(c => c.conditionId === conditionId);
    },
    [hero]
  );

  /**
   * Get all active conditions
   */
  const getActiveConditions = useCallback((): ActiveCondition[] => {
    if (!hero) return [];
    return hero.activeConditions || [];
  }, [hero]);

  /**
   * Get condition definition by ID
   */
  const getConditionDef = useCallback((conditionId: ConditionId): ConditionDefinition => {
    return CONDITIONS[conditionId];
  }, []);

  /**
   * Attempt a saving throw against a condition
   * Returns the result and removes the condition if successful
   */
  const attemptSave = useCallback(
    (conditionId: ConditionId): SaveResult => {
      const conditionDef = CONDITIONS[conditionId];
      const { roll, success } = performSavingThrow();

      const result: SaveResult = {
        conditionId,
        conditionName: conditionDef.name,
        roll,
        success,
        removed: false,
      };

      // Only remove if save succeeds and condition can be saved against
      if (success && conditionDef.saveEnds) {
        removeCondition(conditionId);
        result.removed = true;
      }

      return result;
    },
    [removeCondition]
  );

  /**
   * Process end-of-turn saves for all saveable conditions
   */
  const processEndOfTurnSaves = useCallback((): SaveResult[] => {
    if (!hero) return [];

    const results: SaveResult[] = [];
    const saveableConditions = (hero.activeConditions || []).filter(
      c => CONDITIONS[c.conditionId].saveEnds
    );

    for (const condition of saveableConditions) {
      const result = attemptSave(condition.conditionId);
      results.push(result);
    }

    return results;
  }, [hero, attemptSave]);

  /**
   * Check if bleeding damage should trigger for an action type
   */
  const shouldTriggerBleeding = useCallback(
    (actionType: 'main' | 'triggered' | 'might_roll' | 'agility_roll'): boolean => {
      if (!hasCondition('bleeding')) return false;

      const bleedingDef = CONDITIONS.bleeding;
      return bleedingDef.actionTriggers?.includes(actionType) || false;
    },
    [hasCondition]
  );

  /**
   * Calculate and apply bleeding damage
   */
  const applyBleedingDamage = useCallback(
    (trigger: string): BleedingDamageResult | null => {
      if (!hero || !hasCondition('bleeding')) return null;

      const { roll, total } = calculateBleedingDamage(hero.level);

      // Apply damage to hero stamina
      updateHero({
        stamina: {
          ...hero.stamina,
          current: hero.stamina.current - total,
        },
      });

      return { roll, total, trigger };
    },
    [hero, hasCondition, updateHero]
  );

  /**
   * Check if any conditions affect power rolls (for edge/bane display)
   */
  const getPowerRollModifiers = useCallback((): { edges: string[]; banes: string[] } => {
    if (!hero) return { edges: [], banes: [] };

    const edges: string[] = [];
    const banes: string[] = [];

    for (const condition of hero.activeConditions || []) {
      switch (condition.conditionId) {
        case 'weakened':
          banes.push('Weakened: Bane on all Power Rolls');
          break;
        case 'frightened':
          banes.push(`Frightened: Bane vs ${condition.sourceName || 'fear source'}`);
          break;
        case 'taunted':
          banes.push(`Taunted: Double bane on abilities not targeting ${condition.sourceName || 'taunt source'}`);
          break;
        case 'grabbed':
          banes.push(`Grabbed: Bane on abilities not targeting ${condition.sourceName || 'grabber'}`);
          break;
        case 'restrained':
          banes.push('Restrained: Bane on Ability Rolls and Might/Agility tests');
          break;
        case 'prone':
          banes.push('Prone: Bane on strikes');
          break;
      }
    }

    return { edges, banes };
  }, [hero]);

  return {
    addCondition,
    removeCondition,
    hasCondition,
    getCondition,
    getActiveConditions,
    getConditionDef,
    attemptSave,
    processEndOfTurnSaves,
    shouldTriggerBleeding,
    applyBleedingDamage,
    getPowerRollModifiers,
  };
};
