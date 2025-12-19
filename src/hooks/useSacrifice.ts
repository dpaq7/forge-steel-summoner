/**
 * useSacrifice - Hook for minion sacrifice mechanics
 *
 * Summoner v1.0 SRD:
 * - Sacrificing minions reduces the essence cost of summoning
 * - Base: Cost reduced by 1 per minion sacrificed
 * - Level 10 (No Matter the Cost): Each minion reduces cost by its essence value
 * - Can't sacrifice minions that used main action or maneuver this turn
 * - Can sacrifice more minions than needed to reduce cost
 */

import { useCallback } from 'react';
import { useSummonerContext } from '../context/HeroContext';
import { isSummonerHero } from '../types/hero';
import { Minion, Squad, MinionTemplate } from '../types/minion';
import { SacrificeResult } from '../types/combat';
import { calculateSacrificeCostReduction } from '../utils/calculations';

export interface SacrifiableMinion {
  minionId: string;
  squadId: string;
  templateId: string;
  canSacrifice: boolean;
  reason?: string;
}

export interface SacrificeValidation {
  canSacrifice: boolean;
  sacrifiableMinions: SacrifiableMinion[];
  maxCostReduction: number;
}

export const useSacrifice = () => {
  const { hero: genericHero, updateHero } = useSummonerContext();

  const hero = genericHero && isSummonerHero(genericHero) ? genericHero : null;

  /**
   * Get all minions that can be sacrificed
   * SRD: Can't sacrifice minions that used main action or maneuver this turn
   */
  const getSacrifiableMinions = useCallback((): SacrifiableMinion[] => {
    if (!hero) return [];

    const sacrifiable: SacrifiableMinion[] = [];

    hero.activeSquads.forEach((squad) => {
      squad.members
        .filter((m) => m.isAlive)
        .forEach((minion) => {
          const canSacrifice = !minion.hasActedThisTurn && !minion.hasMovedThisTurn;
          sacrifiable.push({
            minionId: minion.id,
            squadId: squad.id,
            templateId: minion.templateId,
            canSacrifice,
            reason: canSacrifice
              ? undefined
              : 'Minion has already acted or moved this turn',
          });
        });
    });

    return sacrifiable;
  }, [hero]);

  /**
   * Validate sacrifice for a summoning action
   */
  const validateSacrifice = useCallback(
    (minionIds: string[]): SacrificeValidation => {
      if (!hero) {
        return {
          canSacrifice: false,
          sacrifiableMinions: [],
          maxCostReduction: 0,
        };
      }

      const allSacrifiable = getSacrifiableMinions();
      const selectedMinions = allSacrifiable.filter((m) =>
        minionIds.includes(m.minionId)
      );

      // Check if all selected minions can be sacrificed
      const canSacrifice = selectedMinions.every((m) => m.canSacrifice);

      // Calculate max cost reduction
      const maxCostReduction = calculateSacrificeCostReduction(
        selectedMinions.filter((m) => m.canSacrifice).length,
        hero.level
      );

      return {
        canSacrifice,
        sacrifiableMinions: allSacrifiable,
        maxCostReduction,
      };
    },
    [hero, getSacrifiableMinions]
  );

  /**
   * Calculate cost reduction for given number of sacrifices
   */
  const getCostReduction = useCallback(
    (sacrificeCount: number): number => {
      if (!hero) return 0;
      return calculateSacrificeCostReduction(sacrificeCount, hero.level);
    },
    [hero]
  );

  /**
   * Execute sacrifice - removes minions and returns cost reduction
   */
  const executeSacrifice = useCallback(
    (minionIds: string[]): SacrificeResult => {
      if (!hero) {
        return {
          success: false,
          costReduction: 0,
          sacrificedMinionIds: [],
          errorMessage: 'No hero loaded',
        };
      }

      if (minionIds.length === 0) {
        return {
          success: true,
          costReduction: 0,
          sacrificedMinionIds: [],
        };
      }

      const validation = validateSacrifice(minionIds);
      if (!validation.canSacrifice) {
        const invalidMinion = validation.sacrifiableMinions.find(
          (m) => minionIds.includes(m.minionId) && !m.canSacrifice
        );
        return {
          success: false,
          costReduction: 0,
          sacrificedMinionIds: [],
          errorMessage: invalidMinion?.reason || 'Some minions cannot be sacrificed',
        };
      }

      // Remove sacrificed minions from squads
      const updatedSquads: Squad[] = [];
      const sacrificedMinionIds: string[] = [];

      hero.activeSquads.forEach((squad) => {
        const remainingMembers: Minion[] = [];
        let staminaLost = 0;

        squad.members.forEach((minion) => {
          if (minionIds.includes(minion.id) && minion.isAlive) {
            sacrificedMinionIds.push(minion.id);
            staminaLost += minion.maxStamina;
          } else {
            remainingMembers.push(minion);
          }
        });

        if (remainingMembers.length > 0) {
          // Update squad with remaining members
          updatedSquads.push({
            ...squad,
            members: remainingMembers,
            currentStamina: Math.max(0, squad.currentStamina - staminaLost),
            maxStamina: squad.maxStamina - staminaLost,
          });
        }
        // If no members remain, squad is removed (not added to updatedSquads)
      });

      // Calculate cost reduction
      const costReduction = calculateSacrificeCostReduction(
        sacrificedMinionIds.length,
        hero.level
      );

      // Update hero
      updateHero({
        activeSquads: updatedSquads,
      });

      return {
        success: true,
        costReduction,
        sacrificedMinionIds,
      };
    },
    [hero, validateSacrifice, updateHero]
  );

  /**
   * Mark a minion as having acted this turn (prevents sacrifice)
   */
  const markMinionActed = useCallback(
    (squadId: string, minionId: string) => {
      if (!hero) return;

      const updatedSquads = hero.activeSquads.map((squad) => {
        if (squad.id !== squadId) return squad;

        return {
          ...squad,
          members: squad.members.map((minion) =>
            minion.id === minionId
              ? { ...minion, hasActedThisTurn: true }
              : minion
          ),
        };
      });

      updateHero({ activeSquads: updatedSquads });
    },
    [hero, updateHero]
  );

  /**
   * Mark a minion as having moved this turn (prevents sacrifice)
   */
  const markMinionMoved = useCallback(
    (squadId: string, minionId: string) => {
      if (!hero) return;

      const updatedSquads = hero.activeSquads.map((squad) => {
        if (squad.id !== squadId) return squad;

        return {
          ...squad,
          members: squad.members.map((minion) =>
            minion.id === minionId
              ? { ...minion, hasMovedThisTurn: true }
              : minion
          ),
        };
      });

      updateHero({ activeSquads: updatedSquads });
    },
    [hero, updateHero]
  );

  /**
   * Reset all minion action states at start of turn
   */
  const resetMinionActions = useCallback(() => {
    if (!hero) return;

    const updatedSquads = hero.activeSquads.map((squad) => ({
      ...squad,
      hasMoved: false,
      hasActed: false,
      members: squad.members.map((minion) => ({
        ...minion,
        hasActedThisTurn: false,
        hasMovedThisTurn: false,
      })),
    }));

    updateHero({ activeSquads: updatedSquads });
  }, [hero, updateHero]);

  return {
    // Validation
    getSacrifiableMinions,
    validateSacrifice,
    getCostReduction,

    // Actions
    executeSacrifice,
    markMinionActed,
    markMinionMoved,
    resetMinionActions,
  };
};

export default useSacrifice;
