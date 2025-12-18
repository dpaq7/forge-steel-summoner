import * as React from 'react';
import { Heart, Pin, Minus, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { StaminaCardProps } from '../types';

export const StaminaCard: React.FC<StaminaCardProps> = ({
  current,
  max,
  tempStamina = 0,
  winded,
  onChange,
  onUnpin,
}) => {
  const percentage = (current / max) * 100;
  const isWinded = current <= winded;
  const isCritical = percentage < 10;

  return (
    <div
      className={`stat-card stamina-card ${isWinded ? 'winded' : ''} ${isCritical ? 'critical' : ''}`}
    >
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <Heart className="stat-card-icon" />
          <span>Stamina</span>
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
        <div className="stamina-value-display">
          <span className="stamina-current">{current}</span>
          <span className="stamina-divider">/</span>
          <span className="stamina-max">{max}</span>
        </div>

        {/* Progress Bar with Winded Marker */}
        <div className="stamina-bar-wrapper">
          <div className="stamina-progress">
            <div
              className="stamina-progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div
            className="winded-marker"
            style={{ left: `${(winded / max) * 100}%` }}
            title={`Winded threshold: ${winded}`}
          />
        </div>

        {/* Controls */}
        <div className="stamina-controls">
          <div className="control-group">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(Math.max(0, current - 5))}
              disabled={current <= 0}
              className="adjust-btn"
            >
              −5
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onChange(Math.max(0, current - 1))}
              disabled={current <= 0}
              className="adjust-btn"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          <div className="control-group">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onChange(Math.min(max, current + 1))}
              disabled={current >= max}
              className="adjust-btn"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(Math.min(max, current + 5))}
              disabled={current >= max}
              className="adjust-btn"
            >
              +5
            </Button>
          </div>
        </div>

        {/* Status Row */}
        <div className="stamina-status">
          <div className="status-item">
            <span className="status-label">Winded</span>
            <span className="status-value">{winded}</span>
          </div>

          {tempStamina > 0 && (
            <div className="status-item temp">
              <span className="status-label">Temp</span>
              <span className="status-value">+{tempStamina}</span>
            </div>
          )}

          {isWinded && (
            <div className="winded-badge">
              <AlertTriangle className="w-3 h-3" />
              WINDED
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaminaCard;
