import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Swords,
  Pin,
  RotateCcw,
  Check,
  Flag,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
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

import { CONDITIONS, performSavingThrow, SAVEABLE_CONDITIONS } from '@/data/conditions';
import { TURN_PHASES, TurnPhaseId } from '../types';
import type { TurnCardProps } from '../types';
import type { ConditionId, ActiveCondition } from '@/types/common';

interface SaveResult {
  conditionId: ConditionId;
  roll: number;
  success: boolean;
}

export const TurnCard: React.FC<TurnCardProps> = ({
  turnNumber,
  completedPhases,
  conditions,
  onTogglePhase,
  onEndTurn,
  onResetTurn,
  onRemoveCondition,
  onUnpin,
}) => {
  const [showEndTurnDialog, setShowEndTurnDialog] = useState(false);
  const [saveResults, setSaveResults] = useState<SaveResult[]>([]);

  // Get current/next phase
  const currentPhase =
    TURN_PHASES.find((p) => !completedPhases.has(p.id)) || TURN_PHASES[0];

  // Get saveable conditions (conditions that need roll at end of turn)
  const saveableConditions = conditions.filter((c) => {
    const def = CONDITIONS[c.conditionId];
    return def?.saveEnds;
  });
  const hasSaveableConditions = saveableConditions.length > 0;

  // Handle phase click
  const handlePhaseClick = (phaseId: TurnPhaseId) => {
    if (phaseId === 'end') {
      handleEndTurnClick();
    } else {
      onTogglePhase(phaseId);
    }
  };

  // Handle end turn click
  const handleEndTurnClick = () => {
    if (hasSaveableConditions) {
      // Roll saves for all saveable conditions
      const results = saveableConditions.map((condition) => {
        const { roll, success } = performSavingThrow();
        return {
          conditionId: condition.conditionId,
          roll,
          success,
        };
      });
      setSaveResults(results);
      setShowEndTurnDialog(true);
    } else {
      // No conditions to process, just end turn
      onEndTurn();
    }
  };

  // Confirm end turn
  const confirmEndTurn = () => {
    // Remove conditions for successful saves
    saveResults
      .filter((r) => r.success)
      .forEach((r) => onRemoveCondition(r.conditionId));

    // Reset and close
    setSaveResults([]);
    setShowEndTurnDialog(false);
    onEndTurn();
  };

  return (
    <>
      <div className="stat-card turn-card">
        {/* Header */}
        <div className="stat-card-header">
          <div className="stat-card-title">
            <Swords className="stat-card-icon" />
            <span>Turn Tracker</span>
          </div>
          <div className="turn-header-actions">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="reset-turn-btn" onClick={onResetTurn}>
                  <RotateCcw className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Reset Turn</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="unpin-btn" onClick={onUnpin}>
                  <Pin className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Unpin</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Content */}
        <div className="stat-card-content turn-card-content">
          {/* Turn Number */}
          <div className="turn-number-display">
            <span className="turn-label">Turn</span>
            <span className="turn-number">{turnNumber}</span>
          </div>

          {/* Phase Flow */}
          <div className="turn-phases-flow">
            {TURN_PHASES.map((phase, index) => {
              const isCompleted = completedPhases.has(phase.id);
              const isCurrent = phase.id === currentPhase.id;
              const isEnd = phase.id === 'end';

              return (
                <React.Fragment key={phase.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        className={`phase-box ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isEnd ? 'end-phase' : ''}`}
                        onClick={() => handlePhaseClick(phase.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="phase-label">{phase.shortLabel}</span>
                        {isCompleted && !isEnd && <Check className="phase-icon" />}
                        {isEnd && <Flag className="phase-icon" />}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <div className="phase-tooltip">
                        <strong>{phase.label}</strong>
                        <p>{phase.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {index < TURN_PHASES.length - 1 && (
                    <ChevronRight className="phase-arrow" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Current Phase Info */}
          <div className="current-phase-info">
            <span className="current-phase-label">Current:</span>
            <span className="current-phase-name">{currentPhase.label}</span>
          </div>

          {/* Phase Tip */}
          <div className="phase-tip">
            <AlertCircle className="tip-icon" />
            <span>{currentPhase.tip}</span>
          </div>

          {/* Conditions Warning */}
          {hasSaveableConditions && (
            <div className="conditions-warning">
              <span className="warning-text">
                {saveableConditions.length} save
                {saveableConditions.length > 1 ? 's' : ''} at end of turn
              </span>
            </div>
          )}
        </div>
      </div>

      {/* End Turn Dialog */}
      <AlertDialog open={showEndTurnDialog} onOpenChange={setShowEndTurnDialog}>
        <AlertDialogContent className="end-turn-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>End Turn {turnNumber}</AlertDialogTitle>
            <AlertDialogDescription>
              Processing saving throws at end of turn...
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="end-turn-conditions">
            {/* Save Results */}
            {saveResults.length > 0 && (
              <div className="condition-group">
                <h4 className="condition-group-title roll">
                  Save Rolls (6+ on d10)
                </h4>
                <div className="condition-results">
                  {saveResults.map(({ conditionId, roll, success }) => {
                    const def = CONDITIONS[conditionId];
                    return (
                      <div
                        key={conditionId}
                        className={`condition-result ${success ? 'success' : 'failure'}`}
                      >
                        <span className="condition-result-icon">{def?.icon}</span>
                        <span className="condition-result-name">{def?.name}</span>
                        <span className="condition-result-roll">🎲 {roll}</span>
                        <span className="condition-result-status">
                          {success ? '✓ Saved!' : '✗ Persists'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {saveResults.length === 0 && (
              <p className="no-conditions-message">No conditions to process.</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSaveResults([]);
                setShowEndTurnDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndTurn}>
              Confirm End Turn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TurnCard;
