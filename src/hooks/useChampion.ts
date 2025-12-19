/**
 * useChampion - Hook for Champion mechanics (Level 8+ feature)
 *
 * Summoner v1.0 SRD:
 * - Unlocks at Level 8
 * - Only 1 champion instance at a time
 * - Does NOT count toward 2-squad limit
 * - Different stamina rules (can regain, can gain temp)
 * - Uses summoner's recoveries
 * - Can take Heal and Defend actions
 * - Must earn a Victory to resummon after death
 * - Champion Action (Level 10): eidos cost, once per encounter
 */

import { useCallback } from 'react';
import { useSummonerContext } from '../context/HeroContext';
import { useCombatContext } from '../context/CombatContext';
import { isSummonerHero } from '../types/hero';
import { Champion, ChampionTemplate } from '../types/minion';
import { ChampionState } from '../types/combat';
import {
  generateId,
  isChampionUnlocked,
  isChampionActionUnlocked,
  calculateChampionStamina,
  calculateEssenceCost,
} from '../utils/calculations';

export interface ChampionValidationResult {
  canSummon: boolean;
  message: string;
  unlockLevel: number;
  currentLevel: number;
  requiresVictory: boolean;
  hasActiveChampion: boolean;
  essenceCost: number;
  currentEssence: number;
}

export interface ChampionActionResult {
  success: boolean;
  message: string;
}

export const useChampion = () => {
  const { hero: genericHero, updateHero } = useSummonerContext();
  const { essenceState, spendEssence, isInCombat } = useCombatContext();

  const hero = genericHero && isSummonerHero(genericHero) ? genericHero : null;

  /**
   * Get the default champion state for new heroes
   */
  const getDefaultChampionState = useCallback((): ChampionState => ({
    canSummon: true,
    summonedThisEncounter: false,
    championActionUsed: false,
    requiresVictoryToResummon: false,
  }), []);

  /**
   * Validate if a champion can be summoned
   */
  const validateChampionSummon = useCallback((): ChampionValidationResult => {
    const baseResult = {
      unlockLevel: 8,
      currentLevel: hero?.level ?? 1,
      requiresVictory: false,
      hasActiveChampion: false,
      essenceCost: 9,
      currentEssence: essenceState.currentEssence,
    };

    if (!hero) {
      return {
        ...baseResult,
        canSummon: false,
        message: 'No hero loaded',
      };
    }

    // Check level requirement
    if (!isChampionUnlocked(hero.level)) {
      return {
        ...baseResult,
        canSummon: false,
        message: `Champion unlocks at Level 8 (current: ${hero.level})`,
      };
    }

    // Check if champion already active
    if (hero.activeChampion && hero.activeChampion.isAlive) {
      return {
        ...baseResult,
        canSummon: false,
        hasActiveChampion: true,
        message: 'Champion is already active',
      };
    }

    // Check if Victory required to resummon
    const championState = hero.championState || getDefaultChampionState();
    if (championState.requiresVictoryToResummon) {
      return {
        ...baseResult,
        canSummon: false,
        requiresVictory: true,
        message: 'Must earn a Victory before resummoning champion',
      };
    }

    // Check essence cost
    const template = hero.portfolio.champion;
    if (!template) {
      return {
        ...baseResult,
        canSummon: false,
        message: 'No champion template available in portfolio',
      };
    }

    const essenceCost = calculateEssenceCost(template.essenceCost, hero.formation);
    if (essenceState.currentEssence < essenceCost) {
      return {
        ...baseResult,
        essenceCost,
        canSummon: false,
        message: `Insufficient essence: need ${essenceCost}, have ${essenceState.currentEssence}`,
      };
    }

    return {
      ...baseResult,
      essenceCost,
      canSummon: true,
      message: 'Champion can be summoned',
    };
  }, [hero, essenceState.currentEssence, getDefaultChampionState]);

  /**
   * Summon the champion
   */
  const summonChampion = useCallback((): ChampionActionResult => {
    if (!hero) {
      return { success: false, message: 'No hero loaded' };
    }

    const validation = validateChampionSummon();
    if (!validation.canSummon) {
      return { success: false, message: validation.message };
    }

    const template = hero.portfolio.champion as ChampionTemplate;
    const essenceCost = calculateEssenceCost(template.essenceCost, hero.formation);

    // Spend essence
    if (!spendEssence(essenceCost)) {
      return { success: false, message: 'Failed to spend essence' };
    }

    // Create champion instance
    const championStamina = calculateChampionStamina(
      template.stamina,
      hero.level,
      hero.formation
    );

    const champion: Champion = {
      templateId: template.id,
      isAlive: true,
      currentStamina: championStamina,
      maxStamina: championStamina,
      temporaryStamina: 0,
      conditions: [],
      hasMoved: false,
      hasActed: false,
      hasUsedManeuver: false,
    };

    // Update hero state
    const newChampionState: ChampionState = {
      ...hero.championState,
      summonedThisEncounter: true,
      canSummon: false,
    };

    updateHero({
      activeChampion: champion,
      championState: newChampionState,
    });

    return { success: true, message: `${template.name} summoned!` };
  }, [hero, validateChampionSummon, spendEssence, updateHero]);

  /**
   * Damage the champion
   */
  const damageChampion = useCallback((damage: number): { championDied: boolean } => {
    if (!hero || !hero.activeChampion || !hero.activeChampion.isAlive) {
      return { championDied: false };
    }

    const champion = hero.activeChampion;
    let remainingDamage = damage;

    // First reduce temporary stamina
    if (champion.temporaryStamina > 0) {
      if (remainingDamage <= champion.temporaryStamina) {
        updateHero({
          activeChampion: {
            ...champion,
            temporaryStamina: champion.temporaryStamina - remainingDamage,
          },
        });
        return { championDied: false };
      } else {
        remainingDamage -= champion.temporaryStamina;
      }
    }

    // Then reduce current stamina
    const newStamina = champion.currentStamina - remainingDamage;

    if (newStamina <= 0) {
      // Champion dies - requires Victory to resummon
      updateHero({
        activeChampion: {
          ...champion,
          isAlive: false,
          currentStamina: 0,
          temporaryStamina: 0,
        },
        championState: {
          ...hero.championState,
          requiresVictoryToResummon: true,
        },
      });
      return { championDied: true };
    }

    updateHero({
      activeChampion: {
        ...champion,
        currentStamina: newStamina,
        temporaryStamina: 0,
      },
    });

    return { championDied: false };
  }, [hero, updateHero]);

  /**
   * Heal the champion (champions CAN regain stamina unlike regular minions)
   */
  const healChampion = useCallback((amount: number) => {
    if (!hero || !hero.activeChampion || !hero.activeChampion.isAlive) {
      return;
    }

    const champion = hero.activeChampion;
    const newStamina = Math.min(champion.maxStamina, champion.currentStamina + amount);

    updateHero({
      activeChampion: {
        ...champion,
        currentStamina: newStamina,
      },
    });
  }, [hero, updateHero]);

  /**
   * Give temporary stamina to champion (champions CAN gain temp stamina)
   */
  const giveTemporaryStamina = useCallback((amount: number) => {
    if (!hero || !hero.activeChampion || !hero.activeChampion.isAlive) {
      return;
    }

    const champion = hero.activeChampion;
    updateHero({
      activeChampion: {
        ...champion,
        temporaryStamina: champion.temporaryStamina + amount,
      },
    });
  }, [hero, updateHero]);

  /**
   * Use a recovery on the champion (uses summoner's recoveries)
   */
  const useRecoveryOnChampion = useCallback((): boolean => {
    if (!hero || !hero.activeChampion || !hero.activeChampion.isAlive) {
      return false;
    }

    if (hero.recoveries.current <= 0) {
      return false;
    }

    const champion = hero.activeChampion;
    const healAmount = hero.recoveries.value;
    const newStamina = Math.min(champion.maxStamina, champion.currentStamina + healAmount);

    updateHero({
      activeChampion: {
        ...champion,
        currentStamina: newStamina,
      },
      recoveries: {
        ...hero.recoveries,
        current: hero.recoveries.current - 1,
      },
    });

    return true;
  }, [hero, updateHero]);

  /**
   * Use Champion Action (Level 10 feature)
   */
  const useChampionAction = useCallback((): ChampionActionResult => {
    if (!hero) {
      return { success: false, message: 'No hero loaded' };
    }

    if (!isChampionActionUnlocked(hero.level)) {
      return { success: false, message: 'Champion Action unlocks at Level 10' };
    }

    if (!hero.activeChampion || !hero.activeChampion.isAlive) {
      return { success: false, message: 'No active champion' };
    }

    const championState = hero.championState || getDefaultChampionState();
    if (championState.championActionUsed) {
      return { success: false, message: 'Champion Action already used this encounter' };
    }

    // TODO: Check for eidos resource when implemented

    updateHero({
      championState: {
        ...championState,
        championActionUsed: true,
      },
    });

    return { success: true, message: 'Champion Action activated!' };
  }, [hero, updateHero, getDefaultChampionState]);

  /**
   * Called when summoner earns a Victory - allows champion resummon
   */
  const onVictoryEarned = useCallback(() => {
    if (!hero) return;

    const championState = hero.championState || getDefaultChampionState();
    if (championState.requiresVictoryToResummon) {
      updateHero({
        championState: {
          ...championState,
          requiresVictoryToResummon: false,
          canSummon: true,
        },
      });
    }
  }, [hero, updateHero, getDefaultChampionState]);

  /**
   * Reset champion state for new encounter
   */
  const resetForNewEncounter = useCallback(() => {
    if (!hero) return;

    const championState = hero.championState || getDefaultChampionState();

    updateHero({
      activeChampion: null,
      championState: {
        ...championState,
        summonedThisEncounter: false,
        championActionUsed: false,
        canSummon: !championState.requiresVictoryToResummon,
      },
    });
  }, [hero, updateHero, getDefaultChampionState]);

  /**
   * Reset champion actions at start of turn
   */
  const resetChampionActions = useCallback(() => {
    if (!hero || !hero.activeChampion) return;

    updateHero({
      activeChampion: {
        ...hero.activeChampion,
        hasMoved: false,
        hasActed: false,
        hasUsedManeuver: false,
      },
    });
  }, [hero, updateHero]);

  return {
    // State
    champion: hero?.activeChampion ?? null,
    championState: hero?.championState ?? getDefaultChampionState(),
    isChampionUnlocked: hero ? isChampionUnlocked(hero.level) : false,
    isChampionActionUnlocked: hero ? isChampionActionUnlocked(hero.level) : false,

    // Validation
    validateChampionSummon,

    // Actions
    summonChampion,
    damageChampion,
    healChampion,
    giveTemporaryStamina,
    useRecoveryOnChampion,
    useChampionAction,

    // Lifecycle
    onVictoryEarned,
    resetForNewEncounter,
    resetChampionActions,

    // Utility
    getDefaultChampionState,
  };
};

export default useChampion;
