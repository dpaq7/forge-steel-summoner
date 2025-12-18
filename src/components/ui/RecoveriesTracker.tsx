import React, { useCallback } from 'react';
import { Shield, Plus, Minus, Wind } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';
import './RecoveriesTracker.css';

interface RecoveriesTrackerProps {
  current: number;
  max: number;
  value: number; // Recovery value (how much stamina is restored)
  currentStamina: number;
  maxStamina: number;
  onCurrentChange: (value: number) => void;
  onCatchBreath?: () => void;
  className?: string;
}

/**
 * Recoveries Tracker component matching Draw Steel character sheet.
 * Single connected box with diamonds, +/- controls, and Catch Breath button.
 */
const RecoveriesTracker: React.FC<RecoveriesTrackerProps> = ({
  current,
  max,
  value,
  currentStamina,
  maxStamina,
  onCurrentChange,
  onCatchBreath,
  className = '',
}) => {
  const canCatchBreath = current > 0 && currentStamina < maxStamina;

  const handleIncrement = useCallback(() => {
    if (current < max) onCurrentChange(current + 1);
  }, [current, max, onCurrentChange]);

  const handleDecrement = useCallback(() => {
    if (current > 0) onCurrentChange(current - 1);
  }, [current, onCurrentChange]);

  const handleCatchBreath = useCallback(() => {
    if (canCatchBreath && onCatchBreath) {
      onCatchBreath();
    }
  }, [canCatchBreath, onCatchBreath]);

  // Generate recovery diamonds
  const renderDiamonds = () => {
    const diamonds = [];
    for (let i = 0; i < max; i++) {
      diamonds.push(
        <span
          key={i}
          className={`recovery-diamond ${i < current ? 'filled' : 'empty'}`}
          aria-hidden="true"
        >
          ◆
        </span>
      );
    }
    return diamonds;
  };

  return (
    <div className={`recoveries-tracker ${className}`}>
      {/* Header */}
      <div className="recoveries-header">
        <Shield className="recoveries-icon" />
        <span className="recoveries-label">Recoveries</span>
      </div>

      {/* Main Content Box */}
      <div className="recoveries-box">
        {/* Controls Row */}
        <div className="recoveries-controls">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="recoveries-adjust-btn"
                onClick={handleDecrement}
                disabled={current <= 0}
                aria-label="Decrease recoveries"
                type="button"
              >
                <Minus className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Decrease Recoveries</TooltipContent>
          </Tooltip>

          {/* Diamonds Display */}
          <div className="recoveries-diamonds">{renderDiamonds()}</div>

          {/* Numeric Value */}
          <span className="recoveries-value">
            {current}/{max}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="recoveries-adjust-btn"
                onClick={handleIncrement}
                disabled={current >= max}
                aria-label="Increase recoveries"
                type="button"
              >
                <Plus className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Increase Recoveries</TooltipContent>
          </Tooltip>
        </div>

        {/* Recovery Value Display */}
        <div className="recovery-value-row">
          <span className="recovery-value-label">Recovery Value:</span>
          <span className="recovery-value-amount">{value}</span>
        </div>

        {/* Catch Breath Button */}
        {onCatchBreath && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="catch-breath-btn"
                onClick={handleCatchBreath}
                disabled={!canCatchBreath}
              >
                <Wind className="w-4 h-4 mr-1.5" />
                Catch Breath
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="catch-breath-tooltip">
                <strong>Catch Breath</strong>
                <p>Spend 1 Recovery to heal {value} Stamina</p>
                {!canCatchBreath && current <= 0 && (
                  <p className="warning">No recoveries remaining</p>
                )}
                {!canCatchBreath && currentStamina >= maxStamina && (
                  <p className="warning">Already at full Stamina</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default RecoveriesTracker;
