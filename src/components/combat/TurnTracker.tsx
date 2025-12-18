import * as React from 'react';
import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/shadcn/alert-dialog';
import { TooltipProvider } from '@/components/ui/shadcn/tooltip';

import { TurnPhaseChip } from './TurnPhaseChip';
import { TURN_PHASES, TurnPhase as TurnPhaseType } from './turnTypes';
import { CONDITIONS, performSavingThrow } from '@/data/conditions';
import type { ActiveCondition, ConditionId } from '@/types/common';
import './TurnTracker.css';

interface SaveResult {
  conditionId: ConditionId;
  conditionName: string;
  conditionIcon: string;
  roll: number;
  success: boolean;
}

interface TurnTrackerProps {
  isInCombat: boolean;
  turnNumber: number;
  conditions: ActiveCondition[];
  onEndTurn: () => void;
  onRemoveCondition: (conditionId: ConditionId) => void;
}

export const TurnTracker: React.FC<TurnTrackerProps> = ({
  isInCombat,
  turnNumber,
  conditions,
  onEndTurn,
  onRemoveCondition,
}) => {
  const [completedPhases, setCompletedPhases] = useState<Set<TurnPhaseType>>(
    new Set()
  );
  const [showEndTurnDialog, setShowEndTurnDialog] = useState(false);
  const [saveResults, setSaveResults] = useState<SaveResult[]>([]);

  // Toggle phase completion
  const togglePhase = useCallback((phaseId: TurnPhaseType) => {
    if (phaseId === 'endTurn') {
      // Handle end turn specially
      handleEndTurnClick();
      return;
    }

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

  // Handle end turn click
  const handleEndTurnClick = () => {
    // Get conditions that require saves (saveEnds: true)
    const saveableConditions = conditions.filter((c) => {
      const def = CONDITIONS[c.conditionId];
      return def?.saveEnds;
    });

    if (saveableConditions.length > 0) {
      // Show dialog to process conditions
      setShowEndTurnDialog(true);

      // Pre-roll for all save conditions
      const results: SaveResult[] = saveableConditions.map((condition) => {
        const def = CONDITIONS[condition.conditionId];
        const { roll, success } = performSavingThrow();
        return {
          conditionId: condition.conditionId,
          conditionName: def?.name || condition.conditionId,
          conditionIcon: def?.icon || '?',
          roll,
          success,
        };
      });
      setSaveResults(results);
    } else {
      // No conditions to process, just end turn
      processEndTurn([]);
    }
  };

  // Process end of turn
  const processEndTurn = (results: SaveResult[]) => {
    // Remove conditions that were successfully saved against
    results
      .filter((r) => r.success)
      .forEach((r) => onRemoveCondition(r.conditionId));

    // Reset turn phases
    setCompletedPhases(new Set());
    setSaveResults([]);
    setShowEndTurnDialog(false);

    // Notify parent
    onEndTurn();
  };

  // Reset turn manually
  const resetTurn = () => {
    setCompletedPhases(new Set());
  };

  if (!isInCombat) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="turn-tracker">
        <div className="turn-tracker-header">
          <span className="turn-number">Turn {turnNumber}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="reset-turn-btn" onClick={resetTurn}>
                <RotateCcw className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Reset Turn</TooltipContent>
          </Tooltip>
        </div>

        <div className="turn-phases">
          {TURN_PHASES.map((phase, index) => (
            <React.Fragment key={phase.id}>
              <TurnPhaseChip
                phase={phase}
                isCompleted={completedPhases.has(phase.id)}
                onClick={() => togglePhase(phase.id)}
                isEndTurn={phase.id === 'endTurn'}
              />
              {index < TURN_PHASES.length - 1 && (
                <div className="phase-connector" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* End Turn Dialog */}
      <AlertDialog open={showEndTurnDialog} onOpenChange={setShowEndTurnDialog}>
        <AlertDialogContent className="end-turn-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>End Turn</AlertDialogTitle>
            <AlertDialogDescription>
              Processing saving throws for conditions...
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="end-turn-conditions">
            {/* Roll Conditions */}
            {saveResults.length > 0 && (
              <div className="condition-group">
                <h4 className="condition-group-title">
                  Save Rolls (6+ on d10)
                </h4>
                <div className="condition-results">
                  {saveResults.map(
                    ({ conditionId, conditionName, conditionIcon, roll, success }) => (
                      <div
                        key={conditionId}
                        className={`condition-result ${success ? 'success' : 'failure'}`}
                      >
                        <span className="condition-result-icon">
                          {conditionIcon}
                        </span>
                        <span className="condition-result-name">
                          {conditionName}
                        </span>
                        <span className="condition-result-roll">
                          🎲 {roll}
                        </span>
                        <span className="condition-result-status">
                          {success ? '✓ Saved!' : '✗ Persists'}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {saveResults.length === 0 && (
              <p className="no-conditions-message">No conditions to process.</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEndTurnDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => processEndTurn(saveResults)}>
              Confirm End Turn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default TurnTracker;
