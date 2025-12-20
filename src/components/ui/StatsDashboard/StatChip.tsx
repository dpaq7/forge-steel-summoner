import * as React from 'react';
import { motion } from 'motion/react';
import { Minus, Plus, Pin, ArrowUp } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { StatChipProps } from './types';

export const StatChip: React.FC<StatChipProps> = ({
  id,
  icon: Icon,
  label,
  value,
  maxValue,
  displayValue,
  secondaryText,
  color,
  isPinned,
  onTogglePin,
  onChange,
  onAction,
  actionTooltip,
  disabled = false,
  minValue = 0,
  showProgress = false,
  highlight = false,
}) => {
  const hasControls = onChange !== undefined;
  const canDecrease = hasControls && value > minValue;
  const canIncrease = hasControls && (maxValue === undefined || value < maxValue);

  // Display string
  const display =
    displayValue ?? (maxValue !== undefined ? `${value}/${maxValue}` : `${value}`);

  // Progress percentage
  const progress = showProgress && maxValue ? (value / maxValue) * 100 : undefined;

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDecrease && onChange) {
      onChange(-1);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canIncrease && onChange) {
      onChange(1);
    }
  };

  return (
    <div
      className={`stat-chip ${isPinned ? 'pinned' : ''} ${highlight ? 'highlight' : ''} ${disabled ? 'disabled' : ''}`}
      style={{ '--chip-color': color } as React.CSSProperties}
    >
      {/* Decrease Button */}
      {hasControls && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="chip-control chip-decrease"
              onClick={handleDecrease}
              disabled={!canDecrease}
              aria-label={`Decrease ${label}`}
            >
              <Minus className="w-3 h-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">−1 {label}</TooltipContent>
        </Tooltip>
      )}

      {/* Main Chip (clickable to toggle pin) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            className="chip-main"
            onClick={onTogglePin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="chip-icon" style={{ color }} />
            <div className="chip-content">
              <span className="chip-value">{display}</span>
              {secondaryText && (
                <span className="chip-secondary">{secondaryText}</span>
              )}
            </div>

            {isPinned && <Pin className="chip-pin-indicator" />}

            {/* Progress bar */}
            {progress !== undefined && (
              <div className="chip-progress">
                <div
                  className="chip-progress-fill"
                  style={{ width: `${progress}%`, backgroundColor: color }}
                />
              </div>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isPinned ? `Unpin ${label}` : `Pin ${label} for details`}
        </TooltipContent>
      </Tooltip>

      {/* Action Button (e.g., Level Up) */}
      {onAction && (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              className="chip-action"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <ArrowUp className="w-3 h-3" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {actionTooltip || 'Action'}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Increase Button */}
      {hasControls && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="chip-control chip-increase"
              onClick={handleIncrease}
              disabled={!canIncrease}
              aria-label={`Increase ${label}`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">+1 {label}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default StatChip;
