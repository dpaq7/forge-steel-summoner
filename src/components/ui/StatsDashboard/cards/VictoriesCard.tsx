import * as React from 'react';
import { Trophy, Pin, Minus, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { VictoriesCardProps } from '../types';

export const VictoriesCard: React.FC<VictoriesCardProps> = ({
  current,
  xp,
  onChange,
  onUnpin,
}) => {
  return (
    <div className="stat-card victories-card">
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <Trophy className="stat-card-icon" />
          <span>Victories</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="unpin-btn" onClick={onUnpin}>
              <Pin className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Unpin</TooltipContent>
        </Tooltip>
      </div>

      {/* Content */}
      <div className="stat-card-content">
        {/* Large Value Display */}
        <div className="victories-value-display">
          <span className="victories-current">{current}</span>
        </div>

        {/* XP Display */}
        <div className="xp-display">
          <Star className="xp-icon" />
          <span className="xp-value">{xp} XP</span>
        </div>

        {/* Info */}
        <p className="victories-info">
          Victories convert to XP during Respite.
        </p>

        {/* Controls */}
        <div className="victories-controls">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(Math.max(0, current - 1))}
            disabled={current <= 0}
            className="adjust-btn"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(current + 1)}
            className="adjust-btn"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Pending XP */}
        {current > 0 && (
          <div className="pending-xp">
            <span className="pending-badge">+{current} XP pending</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VictoriesCard;
