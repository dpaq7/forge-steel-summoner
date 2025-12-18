import * as React from 'react';
import { motion } from 'motion/react';
import { Check, Flag } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { TurnPhaseConfig } from './turnTypes';

interface TurnPhaseChipProps {
  phase: TurnPhaseConfig;
  isCompleted: boolean;
  onClick: () => void;
  isEndTurn?: boolean;
}

export const TurnPhaseChip: React.FC<TurnPhaseChipProps> = ({
  phase,
  isCompleted,
  onClick,
  isEndTurn = false,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          className={`turn-phase ${isCompleted ? 'completed' : ''} ${isEndTurn ? 'end-turn' : ''}`}
          onClick={onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="phase-label">{phase.shortLabel}</span>
          {isCompleted && !isEndTurn && <Check className="phase-check" />}
          {isEndTurn && <Flag className="phase-flag" />}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="phase-tooltip">
          <strong>{phase.label}</strong>
          <p>{phase.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default TurnPhaseChip;
