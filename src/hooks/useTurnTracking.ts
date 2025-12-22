import { useState, useCallback } from 'react';
import type { TurnPhaseId } from '@/components/ui/StatsDashboard/types';

/**
 * Custom hook for turn and phase tracking in combat
 */
export function useTurnTracking() {
  const [turnNumber, setTurnNumber] = useState(1);
  const [completedPhases, setCompletedPhases] = useState<Set<TurnPhaseId>>(new Set());

  /**
   * Toggle a phase's completion status
   */
  const handleTogglePhase = useCallback((phaseId: TurnPhaseId) => {
    setCompletedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  }, []);

  /**
   * End the current turn and advance to the next
   */
  const handleEndTurn = useCallback(() => {
    setTurnNumber((prev) => prev + 1);
    setCompletedPhases(new Set());
  }, []);

  /**
   * Reset the current turn's phases without advancing turn number
   */
  const handleResetTurn = useCallback(() => {
    setCompletedPhases(new Set());
  }, []);

  /**
   * Reset everything (for when combat ends)
   */
  const resetTurnTracking = useCallback(() => {
    setTurnNumber(1);
    setCompletedPhases(new Set());
  }, []);

  return {
    turnNumber,
    completedPhases,
    handleTogglePhase,
    handleEndTurn,
    handleResetTurn,
    resetTurnTracking,
  };
}

export default useTurnTracking;
