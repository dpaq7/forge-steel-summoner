import * as React from 'react';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Swords, Pin, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import { TURN_PHASES, TurnPhaseId } from './types';

interface TurnChipProps {
  turnNumber: number;
  completedPhases: Set<TurnPhaseId>;
  isPinned: boolean;
  onTogglePin: () => void;
}

export const TurnChip: React.FC<TurnChipProps> = ({
  turnNumber,
  completedPhases,
  isPinned,
  onTogglePin,
}) => {
  // Calculate current/next phase
  const { currentPhase, progress } = useMemo(() => {
    const completedCount = completedPhases.size;
    const totalPhases = TURN_PHASES.length;

    // Find first incomplete phase
    const nextPhase = TURN_PHASES.find((p) => !completedPhases.has(p.id));

    return {
      currentPhase: nextPhase || TURN_PHASES[TURN_PHASES.length - 1],
      progress: (completedCount / totalPhases) * 100,
    };
  }, [completedPhases]);

  return (
    <div
      className={`stat-chip turn-chip ${isPinned ? 'pinned' : ''}`}
      style={{ '--chip-color': 'var(--danger)' } as React.CSSProperties}
    >
      {/* Main Chip (clickable to toggle pin) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            className="chip-main turn-chip-main"
            onClick={onTogglePin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Swords className="chip-icon" style={{ color: 'var(--danger)' }} />
            <span className="turn-chip-label">T{turnNumber}</span>
            <span className="turn-chip-phase">{currentPhase.shortLabel}</span>
            <ChevronRight className="turn-chip-arrow" />

            {isPinned && <Pin className="chip-pin-indicator" />}

            {/* Progress bar */}
            <div className="chip-progress">
              <div
                className="chip-progress-fill"
                style={{
                  width: `${progress}%`,
                  backgroundColor: 'var(--danger)',
                }}
              />
            </div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isPinned ? 'Unpin Turn Tracker' : 'Pin Turn Tracker for details'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default TurnChip;
