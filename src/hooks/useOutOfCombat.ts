/**
 * useOutOfCombat - Hook for out-of-combat Summoner mechanics
 *
 * Summoner v1.0 SRD:
 * - Max 4 free minions outside combat
 * - Signature minions: freely summonable
 * - Other minions: require Victories >= essence cost
 * - Abilities outside combat: free but once per ability until Victory or respite
 * - When combat begins: existing minions are dismissed after finishing tasks
 */

import { useCallback } from 'react';
import { useSummonerContext } from '../context/HeroContext';
import { useCombatContext } from '../context/CombatContext';
import { isSummonerHero } from '../types/hero';
import { MinionTemplate } from '../types/minion';
import { OutOfCombatState, OutOfCombatMinion } from '../types/combat';
import { generateId, OUT_OF_COMBAT_MAX_MINIONS, canSummonOutOfCombat } from '../utils/calculations';

export interface OutOfCombatSummonResult {
  success: boolean;
  message: string;
  minionId?: string;
}

export interface OutOfCombatAbilityResult {
  success: boolean;
  message: string;
}

export const useOutOfCombat = () => {
  const { hero: genericHero, updateHero } = useSummonerContext();
  const { isInCombat } = useCombatContext();

  const hero = genericHero && isSummonerHero(genericHero) ? genericHero : null;

  /**
   * Get the default out-of-combat state for new heroes
   */
  const getDefaultOutOfCombatState = useCallback((): OutOfCombatState => ({
    activeMinions: [],
    usedAbilities: {},
    shouldDismissOnCombatStart: true,
  }), []);

  /**
   * Get current out-of-combat state
   */
  const getOutOfCombatState = useCallback((): OutOfCombatState => {
    if (!hero) return getDefaultOutOfCombatState();
    return hero.outOfCombatState || getDefaultOutOfCombatState();
  }, [hero, getDefaultOutOfCombatState]);

  /**
   * Check if a minion can be summoned outside combat
   */
  const canSummonMinionOutOfCombat = useCallback(
    (template: MinionTemplate): { canSummon: boolean; reason: string } => {
      if (!hero) {
        return { canSummon: false, reason: 'No hero loaded' };
      }

      if (isInCombat) {
        return { canSummon: false, reason: 'Cannot use out-of-combat summon during combat' };
      }

      const state = getOutOfCombatState();

      // Check minion limit
      if (state.activeMinions.length >= OUT_OF_COMBAT_MAX_MINIONS) {
        return {
          canSummon: false,
          reason: `Maximum ${OUT_OF_COMBAT_MAX_MINIONS} minions outside combat`,
        };
      }

      // Check if minion type can be summoned
      const isSignature = template.essenceCost === 1;
      if (!canSummonOutOfCombat(template.essenceCost, hero.victories, isSignature)) {
        return {
          canSummon: false,
          reason: `Requires ${template.essenceCost} Victories to summon (have ${hero.victories})`,
        };
      }

      return { canSummon: true, reason: 'Can summon' };
    },
    [hero, isInCombat, getOutOfCombatState]
  );

  /**
   * Summon a minion outside combat
   */
  const summonMinionOutOfCombat = useCallback(
    (template: MinionTemplate, task?: string): OutOfCombatSummonResult => {
      if (!hero) {
        return { success: false, message: 'No hero loaded' };
      }

      const validation = canSummonMinionOutOfCombat(template);
      if (!validation.canSummon) {
        return { success: false, message: validation.reason };
      }

      const state = getOutOfCombatState();
      const newMinion: OutOfCombatMinion = {
        id: generateId(),
        templateId: template.id,
        name: template.name,
        essenceCost: template.essenceCost,
        task,
      };

      updateHero({
        outOfCombatState: {
          ...state,
          activeMinions: [...state.activeMinions, newMinion],
        },
      });

      return {
        success: true,
        message: `${template.name} summoned${task ? ` for ${task}` : ''}`,
        minionId: newMinion.id,
      };
    },
    [hero, canSummonMinionOutOfCombat, getOutOfCombatState, updateHero]
  );

  /**
   * Dismiss a minion outside combat
   */
  const dismissMinionOutOfCombat = useCallback(
    (minionId: string) => {
      if (!hero) return;

      const state = getOutOfCombatState();
      updateHero({
        outOfCombatState: {
          ...state,
          activeMinions: state.activeMinions.filter((m) => m.id !== minionId),
        },
      });
    },
    [hero, getOutOfCombatState, updateHero]
  );

  /**
   * Dismiss all out-of-combat minions (called when combat starts)
   */
  const dismissAllOutOfCombatMinions = useCallback(() => {
    if (!hero) return;

    const state = getOutOfCombatState();
    updateHero({
      outOfCombatState: {
        ...state,
        activeMinions: [],
      },
    });
  }, [hero, getOutOfCombatState, updateHero]);

  /**
   * Check if an ability can be used outside combat
   */
  const canUseAbilityOutOfCombat = useCallback(
    (abilityId: string): { canUse: boolean; reason: string } => {
      if (!hero) {
        return { canUse: false, reason: 'No hero loaded' };
      }

      if (isInCombat) {
        return { canUse: false, reason: 'Use normal ability rules during combat' };
      }

      const state = getOutOfCombatState();
      if (state.usedAbilities[abilityId]) {
        return {
          canUse: false,
          reason: 'Ability already used since last Victory or respite',
        };
      }

      return { canUse: true, reason: 'Ability available (free outside combat)' };
    },
    [hero, isInCombat, getOutOfCombatState]
  );

  /**
   * Use an ability outside combat (marks it as used)
   */
  const useAbilityOutOfCombat = useCallback(
    (abilityId: string): OutOfCombatAbilityResult => {
      if (!hero) {
        return { success: false, message: 'No hero loaded' };
      }

      const validation = canUseAbilityOutOfCombat(abilityId);
      if (!validation.canUse) {
        return { success: false, message: validation.reason };
      }

      const state = getOutOfCombatState();
      updateHero({
        outOfCombatState: {
          ...state,
          usedAbilities: {
            ...state.usedAbilities,
            [abilityId]: true,
          },
        },
      });

      return { success: true, message: 'Ability used (free outside combat)' };
    },
    [hero, canUseAbilityOutOfCombat, getOutOfCombatState, updateHero]
  );

  /**
   * Reset ability usage (called on Victory or respite)
   */
  const resetAbilityUsage = useCallback(() => {
    if (!hero) return;

    const state = getOutOfCombatState();
    updateHero({
      outOfCombatState: {
        ...state,
        usedAbilities: {},
      },
    });
  }, [hero, getOutOfCombatState, updateHero]);

  /**
   * Called when a Victory is earned - resets ability usage
   */
  const onVictoryEarned = useCallback(() => {
    resetAbilityUsage();
  }, [resetAbilityUsage]);

  /**
   * Called during respite - resets everything
   */
  const onRespite = useCallback(() => {
    if (!hero) return;

    updateHero({
      outOfCombatState: {
        activeMinions: [],
        usedAbilities: {},
        shouldDismissOnCombatStart: true,
      },
    });
  }, [hero, updateHero]);

  /**
   * Update a minion's task
   */
  const updateMinionTask = useCallback(
    (minionId: string, task: string) => {
      if (!hero) return;

      const state = getOutOfCombatState();
      updateHero({
        outOfCombatState: {
          ...state,
          activeMinions: state.activeMinions.map((m) =>
            m.id === minionId ? { ...m, task } : m
          ),
        },
      });
    },
    [hero, getOutOfCombatState, updateHero]
  );

  return {
    // State
    outOfCombatState: getOutOfCombatState(),
    maxMinions: OUT_OF_COMBAT_MAX_MINIONS,
    currentMinionCount: getOutOfCombatState().activeMinions.length,
    isInCombat,

    // Minion management
    canSummonMinionOutOfCombat,
    summonMinionOutOfCombat,
    dismissMinionOutOfCombat,
    dismissAllOutOfCombatMinions,
    updateMinionTask,

    // Ability management
    canUseAbilityOutOfCombat,
    useAbilityOutOfCombat,
    resetAbilityUsage,

    // Lifecycle
    onVictoryEarned,
    onRespite,

    // Utility
    getDefaultOutOfCombatState,
  };
};

export default useOutOfCombat;
