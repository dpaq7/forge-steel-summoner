/**
 * Hook that combines hero state with derived stats
 *
 * This provides a unified interface for components that need to display
 * stats that are calculated from class + kit + equipment combined.
 */

import { useMemo } from 'react';
import { useHeroContext } from '../context/HeroContext';
import { calculateDerivedStats } from '../utils/statCalculator';
import type { DerivedStats } from '../types/items';
import type { Hero } from '../types/hero';

export interface UseDerivedStatsResult {
  hero: Hero | null;
  derivedStats: DerivedStats | null;

  // Convenience accessors for common stats
  maxStamina: number;
  windedThreshold: number;
  recoveryValue: number;
  maxRecoveries: number;
  speed: number;
  stability: number;

  // Equipment bonus breakdown (for UI indicators)
  hasEquipmentBonuses: boolean;
  equipmentStamina: number;
  equipmentSpeed: number;
  equipmentStability: number;
  equipmentDamage: number;
}

/**
 * Get derived stats for the current hero
 *
 * This hook should be used by components that need to display stats
 * that combine class base + kit + equipment bonuses.
 */
export function useDerivedStats(): UseDerivedStatsResult {
  const { hero } = useHeroContext();

  const derivedStats = useMemo(() => {
    if (!hero) return null;
    return calculateDerivedStats(hero);
  }, [hero]);

  return useMemo(() => {
    // Default values when no hero
    if (!hero || !derivedStats) {
      return {
        hero: null,
        derivedStats: null,
        maxStamina: 0,
        windedThreshold: 0,
        recoveryValue: 0,
        maxRecoveries: 0,
        speed: 5,
        stability: 0,
        hasEquipmentBonuses: false,
        equipmentStamina: 0,
        equipmentSpeed: 0,
        equipmentStability: 0,
        equipmentDamage: 0,
      };
    }

    const equipBonus = derivedStats.equipmentBonuses;
    const hasEquipmentBonuses =
      equipBonus.stamina !== 0 ||
      equipBonus.speed !== 0 ||
      equipBonus.stability !== 0 ||
      equipBonus.meleeDamage !== 0 ||
      equipBonus.rangedDamage !== 0 ||
      equipBonus.magicDamage !== 0;

    const totalEquipDamage =
      equipBonus.meleeDamage + equipBonus.rangedDamage + equipBonus.magicDamage;

    return {
      hero,
      derivedStats,
      maxStamina: derivedStats.maxStamina,
      windedThreshold: derivedStats.windedThreshold,
      recoveryValue: derivedStats.recoveryValue,
      maxRecoveries: derivedStats.maxRecoveries,
      speed: derivedStats.speed,
      stability: derivedStats.stability,
      hasEquipmentBonuses,
      equipmentStamina: equipBonus.stamina,
      equipmentSpeed: equipBonus.speed,
      equipmentStability: equipBonus.stability,
      equipmentDamage: totalEquipDamage / 3, // Average for display
    };
  }, [hero, derivedStats]);
}

/**
 * Calculate derived stats for a hero (without hook)
 * Useful for one-off calculations or passing to child components
 */
export function getDerivedStatsForHero(hero: Hero): DerivedStats {
  return calculateDerivedStats(hero);
}
