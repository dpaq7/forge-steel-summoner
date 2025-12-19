import { useCallback } from 'react';
import { useSummonerContext } from '../context/HeroContext';
import { useCombatContext } from '../context/CombatContext';
import { Squad, Minion, MinionTemplate, GridPosition } from '../types';
import { isSummonerHero, SummonerHeroV2 } from '../types/hero';
import {
  generateId,
  calculateMinionBonusStamina,
  calculateMinionLevelStaminaBonus,
} from '../utils/calculations';

// SRD: Overflow damage to summoner when squad wiped = 2 + Level
const calculateOverflowDamage = (level: number) => 2 + level;

export const useSquads = () => {
  const { hero: genericHero, updateHero } = useSummonerContext();
  const { onMinionDeath } = useCombatContext();

  // This hook is only for Summoner heroes
  const hero = genericHero && isSummonerHero(genericHero) ? genericHero : null;

  const createSquad = useCallback(
    (template: MinionTemplate): Squad => {
      if (!hero) throw new Error('No hero loaded');

      // Formation bonus (Elite: +3)
      const formationBonus = calculateMinionBonusStamina(hero.formation);
      // Level-based bonus (Minion Improvement at L4, L7, L10)
      const levelBonus = calculateMinionLevelStaminaBonus(template.essenceCost, hero.level);

      // Create minion members and calculate total pool
      const members: Minion[] = [];
      let totalStamina = 0;

      for (let i = 0; i < template.minionsPerSummon; i++) {
        const baseStamina = Array.isArray(template.stamina)
          ? template.stamina[i] || template.stamina[0]
          : template.stamina;
        const minionMaxStamina = baseStamina + formationBonus + levelBonus;
        totalStamina += minionMaxStamina;

        members.push({
          id: generateId(),
          templateId: template.id,
          isAlive: true,
          maxStamina: minionMaxStamina,
          conditions: [],
        });
      }

      return {
        id: generateId(),
        templateId: template.id,
        members,
        currentStamina: totalStamina,
        maxStamina: totalStamina,
        hasMoved: false,
        hasActed: false,
      };
    },
    [hero]
  );

  const addSquad = useCallback(
    (squad: Squad) => {
      if (!hero) return;

      updateHero({
        activeSquads: [...hero.activeSquads, squad],
      });
    },
    [hero, updateHero]
  );

  const removeSquad = useCallback(
    (squadId: string) => {
      if (!hero) return;

      updateHero({
        activeSquads: hero.activeSquads.filter((s) => s.id !== squadId),
      });
    },
    [hero, updateHero]
  );

  const updateSquad = useCallback(
    (squadId: string, updates: Partial<Squad>) => {
      if (!hero) return;

      updateHero({
        activeSquads: hero.activeSquads.map((squad) =>
          squad.id === squadId ? { ...squad, ...updates } : squad
        ),
      });
    },
    [hero, updateHero]
  );

  const removeMinionFromSquad = useCallback(
    (squadId: string, minionId: string) => {
      if (!hero) return;

      const squad = hero.activeSquads.find((s) => s.id === squadId);
      if (!squad) return;

      const newMembers = squad.members.filter((m) => m.id !== minionId);

      if (newMembers.length === 0) {
        // Squad is empty, remove it
        removeSquad(squadId);
      } else {
        updateSquad(squadId, { members: newMembers });
      }
    },
    [hero, removeSquad, updateSquad]
  );

  const updateMinion = useCallback(
    (squadId: string, minionId: string, updates: Partial<Minion>) => {
      if (!hero) return;

      const squad = hero.activeSquads.find((s) => s.id === squadId);
      if (!squad) return;

      const newMembers = squad.members.map((minion) =>
        minion.id === minionId ? { ...minion, ...updates } : minion
      );

      updateSquad(squadId, { members: newMembers });
    },
    [hero, updateSquad]
  );

  /**
   * SRD Damage Handling:
   * - Damage reduces the shared stamina pool
   * - When cumulative damage equals a minion's max HP, that minion dies
   * - Overflow damage (if squad wiped) goes to summoner as (2 + Level)
   * - Returns overflow damage amount (0 if no overflow)
   */
  const damageSquad = useCallback(
    (squadId: string, damage: number): { overflowDamage: number; minionsKilled: number } => {
      if (!hero) return { overflowDamage: 0, minionsKilled: 0 };

      const squad = hero.activeSquads.find((s) => s.id === squadId);
      if (!squad) return { overflowDamage: 0, minionsKilled: 0 };

      let remainingDamage = damage;
      let newStamina = squad.currentStamina;
      let minionsKilled = 0;
      const newMembers = [...squad.members];

      // Apply damage to the pool
      newStamina -= damage;

      // Calculate how many minions should die based on damage thresholds
      // SRD: When pool reduction equals 1 minion's max HP, that minion dies
      let accumulatedDamage = squad.maxStamina - newStamina;
      let staminaThreshold = 0;

      for (let i = 0; i < newMembers.length; i++) {
        const minion = newMembers[i];
        if (!minion.isAlive) continue;

        staminaThreshold += minion.maxStamina;

        if (accumulatedDamage >= staminaThreshold) {
          // This minion dies
          newMembers[i] = { ...minion, isAlive: false };
          minionsKilled++;
          onMinionDeath(); // Trigger essence gain
        }
      }

      // Calculate overflow damage
      let overflowDamage = 0;
      if (newStamina < 0) {
        // Squad is wiped, apply overflow to summoner (unless Leader formation)
        if (hero.formation !== 'leader') {
          overflowDamage = calculateOverflowDamage(hero.level);
        }
        newStamina = 0;
      }

      // Check if all minions are dead
      const allDead = newMembers.every((m) => !m.isAlive);

      if (allDead) {
        // Remove the squad entirely
        removeSquad(squadId);
      } else {
        // Update the squad with new stamina and member states
        updateSquad(squadId, {
          currentStamina: Math.max(0, newStamina),
          members: newMembers,
        });
      }

      // Apply overflow damage to summoner (allow negative for dying state)
      if (overflowDamage > 0) {
        const newSummonerStamina = hero.stamina.current - overflowDamage;
        updateHero({
          stamina: {
            ...hero.stamina,
            current: newSummonerStamina,
          },
        });
      }

      return { overflowDamage, minionsKilled };
    },
    [hero, updateHero, updateSquad, removeSquad, onMinionDeath]
  );

  /**
   * Heal the squad's stamina pool
   * Cannot exceed max stamina
   */
  const healSquad = useCallback(
    (squadId: string, amount: number) => {
      if (!hero) return;

      const squad = hero.activeSquads.find((s) => s.id === squadId);
      if (!squad) return;

      const newStamina = Math.min(squad.maxStamina, squad.currentStamina + amount);
      updateSquad(squadId, { currentStamina: newStamina });
    },
    [hero, updateSquad]
  );

  /**
   * Get the count of alive minions in a squad
   */
  const getAliveCount = useCallback(
    (squadId: string): number => {
      if (!hero) return 0;

      const squad = hero.activeSquads.find((s) => s.id === squadId);
      if (!squad) return 0;

      return squad.members.filter((m) => m.isAlive).length;
    },
    [hero]
  );

  const mergeSquads = useCallback(
    (sourceSquadId: string, targetSquadId: string) => {
      if (!hero) return;

      const sourceSquad = hero.activeSquads.find((s) => s.id === sourceSquadId);
      const targetSquad = hero.activeSquads.find((s) => s.id === targetSquadId);

      if (!sourceSquad || !targetSquad) return;

      // Can only merge squads of the same type
      if (sourceSquad.templateId !== targetSquad.templateId) {
        console.error('Cannot merge squads of different types');
        return;
      }

      // Merge members and combine stamina pools
      const mergedMembers = [...targetSquad.members, ...sourceSquad.members];
      const mergedCurrentStamina = targetSquad.currentStamina + sourceSquad.currentStamina;
      const mergedMaxStamina = targetSquad.maxStamina + sourceSquad.maxStamina;

      // Update target squad with merged data
      updateSquad(targetSquadId, {
        members: mergedMembers,
        currentStamina: mergedCurrentStamina,
        maxStamina: mergedMaxStamina,
      });

      // Remove source squad
      removeSquad(sourceSquadId);
    },
    [hero, updateSquad, removeSquad]
  );

  const moveSquad = useCallback(
    (squadId: string, destination: GridPosition) => {
      updateSquad(squadId, { hasMoved: true });
      // In a full implementation, you'd update positions here
    },
    [updateSquad]
  );

  const squadFreeStrike = useCallback(
    (squadId: string, targetId: string) => {
      // Mark squad as having acted
      updateSquad(squadId, { hasActed: true });
      // In a full implementation, you'd resolve the attack here
    },
    [updateSquad]
  );

  return {
    createSquad,
    addSquad,
    removeSquad,
    updateSquad,
    removeMinionFromSquad,
    updateMinion,
    mergeSquads,
    moveSquad,
    squadFreeStrike,
    damageSquad,
    healSquad,
    getAliveCount,
  };
};
