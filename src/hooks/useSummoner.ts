import { useCallback } from 'react';
import { useSummonerContext } from '../context/SummonerContext';
import {
  calculateMaxStamina,
  calculateWindedThreshold,
  calculateRecoveryValue,
  calculateMaxRecoveries,
  calculateSpeed,
  calculateStability,
  calculateSummonerRange,
  calculateMaxMinions,
} from '../utils/calculations';

export const useSummoner = () => {
  const { hero, updateHero } = useSummonerContext();

  const dealDamage = useCallback(
    (amount: number) => {
      if (!hero) return;

      // Allow negative stamina for dying state (death occurs at -winded value)
      const newCurrent = hero.stamina.current - amount;
      updateHero({
        stamina: {
          ...hero.stamina,
          current: newCurrent,
        },
      });
    },
    [hero, updateHero]
  );

  const healDamage = useCallback(
    (amount: number) => {
      if (!hero) return;

      const newCurrent = Math.min(hero.stamina.max, hero.stamina.current + amount);
      updateHero({
        stamina: {
          ...hero.stamina,
          current: newCurrent,
        },
      });
    },
    [hero, updateHero]
  );

  const useRecovery = useCallback(() => {
    if (!hero || hero.recoveries.current <= 0) return;

    const healAmount = hero.recoveries.value;
    const newStamina = Math.min(hero.stamina.max, hero.stamina.current + healAmount);

    updateHero({
      stamina: {
        ...hero.stamina,
        current: newStamina,
      },
      recoveries: {
        ...hero.recoveries,
        current: hero.recoveries.current - 1,
      },
    });
  }, [hero, updateHero]);

  const restoreRecoveries = useCallback(() => {
    if (!hero) return;

    updateHero({
      recoveries: {
        ...hero.recoveries,
        current: hero.recoveries.max,
      },
    });
  }, [hero, updateHero]);

  const levelUp = useCallback(() => {
    if (!hero || hero.level >= 10) return;

    const newLevel = hero.level + 1;
    const newMaxStamina = calculateMaxStamina({ ...hero, level: newLevel });
    const newRecoveryValue = calculateRecoveryValue({ ...hero, level: newLevel });
    const newMaxRecoveries = calculateMaxRecoveries(hero.circle);

    updateHero({
      level: newLevel,
      stamina: {
        current: newMaxStamina,
        max: newMaxStamina,
        winded: calculateWindedThreshold(newMaxStamina),
      },
      recoveries: {
        current: newMaxRecoveries,
        max: newMaxRecoveries,
        value: newRecoveryValue,
      },
    });
  }, [hero, updateHero]);

  const getStats = useCallback(() => {
    if (!hero) return null;

    return {
      maxStamina: hero.stamina.max,
      winded: hero.stamina.winded,
      recoveryValue: hero.recoveries.value,
      speed: calculateSpeed(hero.kit),
      stability: calculateStability(hero.kit),
      summonerRange: calculateSummonerRange(hero),
      maxMinions: calculateMaxMinions(hero.formation),
    };
  }, [hero]);

  return {
    dealDamage,
    healDamage,
    useRecovery,
    restoreRecoveries,
    levelUp,
    getStats,
  };
};
