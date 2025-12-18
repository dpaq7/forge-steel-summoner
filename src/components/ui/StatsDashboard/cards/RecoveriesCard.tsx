import * as React from 'react';
import { Shield, Pin, Minus, Plus, Wind } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { RecoveriesCardProps } from '../types';

export const RecoveriesCard: React.FC<RecoveriesCardProps> = ({
  current,
  max,
  value,
  currentStamina,
  maxStamina,
  onChange,
  onCatchBreath,
  onUnpin,
}) => {
  const canCatchBreath = current > 0 && currentStamina < maxStamina;

  // Render diamonds
  const renderDiamonds = () => {
    const diamonds = [];
    for (let i = 0; i < max; i++) {
      diamonds.push(
        <span
          key={i}
          className={`recovery-diamond ${i < current ? 'filled' : 'empty'}`}
        >
          ◆
        </span>
      );
    }
    return diamonds;
  };

  return (
    <div className="stat-card recoveries-card">
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <Shield className="stat-card-icon" />
          <span>Recoveries</span>
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
        {/* Diamond Display */}
        <div className="recoveries-diamonds-display">{renderDiamonds()}</div>

        {/* Value */}
        <div className="recoveries-value-display">
          <span className="recoveries-current">{current}</span>
          <span className="recoveries-divider">/</span>
          <span className="recoveries-max">{max}</span>
        </div>

        {/* Controls */}
        <div className="recoveries-controls">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(Math.max(0, current - 1))}
            disabled={current <= 0}
            className="adjust-btn"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <div className="recovery-value-info">
            <span className="recovery-value-label">Recovery Value</span>
            <span className="recovery-value-amount">{value}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(Math.min(max, current + 1))}
            disabled={current >= max}
            className="adjust-btn"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Catch Breath Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="catch-breath-btn"
              onClick={() => onCatchBreath(value)}
              disabled={!canCatchBreath}
            >
              <Wind className="w-4 h-4" />
              Catch Breath
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Spend 1 Recovery to heal {value} Stamina
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default RecoveriesCard;
