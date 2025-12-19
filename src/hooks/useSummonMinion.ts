/**
 * useSummonMinion - Centralized hook for minion summoning
 *
 * Handles:
 * - Full validation before summoning
 * - Free summons at turn/combat start
 * - Paid summons via Call Forth
 * - Squad creation and management
 * - Essence spending
 */

import { useCallback } from 'react';
import { useSummonerContext } from '../context/HeroContext';
import { useCombatContext } from '../context/CombatContext';
import { isSummonerHero } from '../types/hero';
import { MinionTemplate, Squad, Minion } from '../types';
import {
  generateId,
  calculateMinionBonusStamina,
  calculateEssenceCost,
  calculateMinionLevelStaminaBonus,
} from '../utils/calculations';
import {
  validateSummon,
  SummonValidationResult,
  SummonOptions,
  findCompatibleSquad,
  countActiveMinions,
  getMaxMinions,
  getFreeSummonCount,
  isSignatureMinion,
} from '../utils/summonerValidation';

export interface SummonResult {
  success: boolean;
  validation: SummonValidationResult;
  squadId?: string;
  minionsCreated?: number;
  essenceSpent?: number;
  wasFreeSummon?: boolean;
}

export const useSummonMinion = () => {
  const { hero: genericHero, updateHero } = useSummonerContext();
  const { spendEssence, essenceState } = useCombatContext();

  const hero = genericHero && isSummonerHero(genericHero) ? genericHero : null;

  /**
   * Create a single minion instance from template
   * Includes formation bonus (Elite: +3) and level-based bonus (Minion Improvement)
   */
  const createMinion = useCallback((template: MinionTemplate, index: number = 0): Minion => {
    if (!hero) throw new Error('No hero loaded');

    // Formation bonus (Elite: +3)
    const formationBonus = calculateMinionBonusStamina(hero.formation);
    // Level-based bonus (Minion Improvement at L4, L7, L10)
    const levelBonus = calculateMinionLevelStaminaBonus(template.essenceCost, hero.level);

    const baseStamina = Array.isArray(template.stamina)
      ? template.stamina[index] ?? template.stamina[0]
      : template.stamina;

    return {
      id: generateId(),
      templateId: template.id,
      isAlive: true,
      maxStamina: baseStamina + formationBonus + levelBonus,
      conditions: [],
    };
  }, [hero]);

  /**
   * Create a new squad from minions
   */
  const createSquadFromMinions = useCallback((template: MinionTemplate, minions: Minion[]): Squad => {
    const totalStamina = minions.reduce((sum, m) => sum + m.maxStamina, 0);

    return {
      id: generateId(),
      templateId: template.id,
      members: minions,
      currentStamina: totalStamina,
      maxStamina: totalStamina,
      hasMoved: false,
      hasActed: false,
    };
  }, []);

  /**
   * Summon a minion with full validation
   *
   * @param template - The minion template to summon
   * @param options - Optional parameters (targetSquadId, isFreeSummon, sacrificeCount)
   * @returns SummonResult with success status and details
   */
  const summonMinion = useCallback((
    template: MinionTemplate,
    options: SummonOptions = {}
  ): SummonResult => {
    if (!hero) {
      return {
        success: false,
        validation: {
          canSummon: false,
          message: 'No hero loaded',
          details: {
            currentEssence: 0,
            requiredEssence: template.essenceCost,
            currentMinions: 0,
            maxMinions: 8,
            currentSquads: 0,
            maxSquads: 2,
            minionsToSummon: template.minionsPerSummon ?? 1,
            isFreeSummon: false,
          },
        },
      };
    }

    // Validate the summon
    const validation = validateSummon(hero, template, options);

    if (!validation.canSummon) {
      return {
        success: false,
        validation,
      };
    }

    // Calculate actual cost
    const { isFreeSummon = false, sacrificeCount = 0 } = options;
    const formationAdjustedCost = calculateEssenceCost(template.essenceCost, hero.formation);
    const adjustedCost = Math.max(0, formationAdjustedCost - sacrificeCount);
    const effectiveCost = isFreeSummon ? 0 : adjustedCost;

    // Create minions
    const minionsToCreate = template.minionsPerSummon ?? 1;
    const newMinions: Minion[] = [];

    for (let i = 0; i < minionsToCreate; i++) {
      newMinions.push(createMinion(template, i));
    }

    // Determine target squad
    const activeSquads = [...(hero.activeSquads ?? [])];
    let targetSquadId = options.targetSquadId;
    let createdNewSquad = false;

    // If no target specified, try to find a compatible existing squad
    if (!targetSquadId) {
      const compatibleSquad = findCompatibleSquad(activeSquads, template.id, minionsToCreate);
      if (compatibleSquad) {
        targetSquadId = compatibleSquad.id;
      }
    }

    // Update squads
    if (targetSquadId) {
      // Add to existing squad
      const squadIndex = activeSquads.findIndex(s => s.id === targetSquadId);
      if (squadIndex >= 0) {
        const squad = activeSquads[squadIndex];
        const additionalStamina = newMinions.reduce((sum, m) => sum + m.maxStamina, 0);

        activeSquads[squadIndex] = {
          ...squad,
          members: [...squad.members, ...newMinions],
          currentStamina: squad.currentStamina + additionalStamina,
          maxStamina: squad.maxStamina + additionalStamina,
        };
      }
    } else {
      // Create new squad
      const newSquad = createSquadFromMinions(template, newMinions);
      activeSquads.push(newSquad);
      targetSquadId = newSquad.id;
      createdNewSquad = true;
    }

    // Spend essence (if not free summon)
    if (!isFreeSummon && effectiveCost > 0) {
      spendEssence(effectiveCost);
    }

    // Update hero with new squads
    updateHero({
      activeSquads,
    });

    return {
      success: true,
      validation,
      squadId: targetSquadId,
      minionsCreated: minionsToCreate,
      essenceSpent: effectiveCost,
      wasFreeSummon: isFreeSummon,
    };
  }, [hero, createMinion, createSquadFromMinions, spendEssence, updateHero]);

  /**
   * Get summoning status for UI display
   */
  const getSummoningStatus = useCallback(() => {
    if (!hero) {
      return {
        currentMinions: 0,
        maxMinions: 8,
        currentSquads: 0,
        maxSquads: 2,
        currentEssence: 0,
        canSummonMore: false,
      };
    }

    const currentMinions = countActiveMinions(hero.activeSquads);
    const maxMinions = getMaxMinions(hero.formation, hero.level);
    const currentSquads = hero.activeSquads?.length ?? 0;
    const currentEssence = hero.heroicResource?.current ?? 0;

    return {
      currentMinions,
      maxMinions,
      currentSquads,
      maxSquads: 2,
      currentEssence,
      canSummonMore: currentMinions < maxMinions && (currentSquads < 2 || currentMinions > 0),
    };
  }, [hero]);

  /**
   * Check if free summons are available for signature minions
   */
  const getFreeSummonInfo = useCallback((isCombatStart: boolean = false) => {
    if (!hero) {
      return {
        available: false,
        count: 0,
        usedThisTurn: false,
      };
    }

    const maxFree = getFreeSummonCount(hero.level, hero.formation, isCombatStart);

    return {
      available: !essenceState.signatureMinionsSpawnedThisTurn,
      count: maxFree,
      usedThisTurn: essenceState.signatureMinionsSpawnedThisTurn,
    };
  }, [hero, essenceState.signatureMinionsSpawnedThisTurn]);

  /**
   * Validate a minion summon without executing
   */
  const validateMinionSummon = useCallback((
    template: MinionTemplate,
    options: SummonOptions = {}
  ): SummonValidationResult => {
    if (!hero) {
      return {
        canSummon: false,
        message: 'No hero loaded',
        details: {
          currentEssence: 0,
          requiredEssence: template.essenceCost,
          currentMinions: 0,
          maxMinions: 8,
          currentSquads: 0,
          maxSquads: 2,
          minionsToSummon: template.minionsPerSummon ?? 1,
          isFreeSummon: false,
        },
      };
    }
    return validateSummon(hero, template, options);
  }, [hero]);

  return {
    summonMinion,
    validateMinionSummon,
    getSummoningStatus,
    getFreeSummonInfo,
    isSignatureMinion,
  };
};

export default useSummonMinion;
