import { useCallback } from 'react';
import { Squad } from '../types';

// Stamina state thresholds based on Draw Steel rules:
// - Winded: stamina <= half of max (winded value = max / 2)
// - Dying: stamina <= 0
// - Death: stamina <= negative of winded value (i.e., stamina <= -(max / 2))

export interface StaminaState {
  isWinded: boolean;
  isDying: boolean;
  isDead: boolean;
  windedValue: number;
  deathThreshold: number; // The negative value at which death occurs
  currentState: 'healthy' | 'winded' | 'dying' | 'dead';
}

export const useStaminaStates = () => {
  /**
   * Calculate the winded value (half of max stamina, rounded down)
   */
  const getWindedValue = useCallback((maxStamina: number): number => {
    return Math.floor(maxStamina / 2);
  }, []);

  /**
   * Calculate the death threshold (negative of winded value)
   * Death occurs when stamina equals this value
   */
  const getDeathThreshold = useCallback((maxStamina: number): number => {
    return -getWindedValue(maxStamina);
  }, [getWindedValue]);

  /**
   * Determine the full stamina state for any entity
   * Note: For squads, we don't track negative stamina, so dying/death work differently
   */
  const getStaminaState = useCallback((currentStamina: number, maxStamina: number): StaminaState => {
    const windedValue = getWindedValue(maxStamina);
    const deathThreshold = getDeathThreshold(maxStamina);

    const isWinded = currentStamina <= windedValue && currentStamina > 0;
    const isDying = currentStamina <= 0 && currentStamina > deathThreshold;
    const isDead = currentStamina <= deathThreshold;

    let currentState: StaminaState['currentState'] = 'healthy';
    if (isDead) {
      currentState = 'dead';
    } else if (isDying) {
      currentState = 'dying';
    } else if (isWinded) {
      currentState = 'winded';
    }

    return {
      isWinded,
      isDying,
      isDead,
      windedValue,
      deathThreshold,
      currentState,
    };
  }, [getWindedValue, getDeathThreshold]);

  /**
   * Get stamina state for a squad
   * Squads don't go negative - they're removed when stamina hits 0
   * For squads: winded at <= 50% stamina, "dying" when at 0 (about to be dismissed)
   */
  const getSquadStaminaState = useCallback((squad: Squad): StaminaState => {
    const windedValue = getWindedValue(squad.maxStamina);

    const isWinded = squad.currentStamina <= windedValue && squad.currentStamina > 0;
    const isDying = squad.currentStamina <= 0;
    const isDead = squad.members.every(m => !m.isAlive);

    let currentState: StaminaState['currentState'] = 'healthy';
    if (isDead) {
      currentState = 'dead';
    } else if (isDying) {
      currentState = 'dying';
    } else if (isWinded) {
      currentState = 'winded';
    }

    return {
      isWinded,
      isDying,
      isDead,
      windedValue,
      deathThreshold: 0, // Squads die at 0
      currentState,
    };
  }, [getWindedValue]);

  /**
   * Get the color for the HP bar based on stamina state
   */
  const getStateColor = useCallback((state: StaminaState['currentState']): string => {
    switch (state) {
      case 'healthy':
        return '#4caf50'; // Green
      case 'winded':
        return '#ff9800'; // Orange
      case 'dying':
        return '#f44336'; // Red
      case 'dead':
        return '#666666'; // Gray
      default:
        return '#4caf50';
    }
  }, []);

  /**
   * Get the status label for display
   */
  const getStateLabel = useCallback((state: StaminaState['currentState']): string => {
    switch (state) {
      case 'healthy':
        return '';
      case 'winded':
        return 'WINDED';
      case 'dying':
        return 'DYING';
      case 'dead':
        return 'DEAD';
      default:
        return '';
    }
  }, []);

  return {
    getWindedValue,
    getDeathThreshold,
    getStaminaState,
    getSquadStaminaState,
    getStateColor,
    getStateLabel,
  };
};
