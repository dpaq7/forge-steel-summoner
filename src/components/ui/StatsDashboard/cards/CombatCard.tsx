import * as React from 'react';
import { Swords, Pin, Tent, Sparkles, Trophy, Footprints, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { CombatCardProps } from '../types';

export const CombatCard: React.FC<CombatCardProps> = ({
  isInCombat,
  surges,
  victories,
  speed,
  stability,
  onStartCombat,
  onEndCombat,
  onRespite,
  onSurgesChange,
  onUnpin,
}) => {
  return (
    <div className={`stat-card combat-card ${isInCombat ? 'active' : ''}`}>
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <Swords className="stat-card-icon" />
          <span>Combat</span>
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
        {/* Combat Status */}
        <div className="combat-status">
          {isInCombat ? (
            <div className="combat-active-indicator">
              <Swords className="combat-status-icon" />
              <span>IN COMBAT</span>
            </div>
          ) : (
            <div className="combat-ready-indicator">
              <span>Ready for Battle</span>
            </div>
          )}
        </div>

        {/* Quick Stats Row */}
        <div className="combat-quick-stats">
          <div className="combat-stat">
            <Sparkles className="combat-stat-icon surges" />
            <span className="combat-stat-value">{surges}</span>
            <span className="combat-stat-label">Surges</span>
          </div>
          <div className="combat-stat">
            <Trophy className="combat-stat-icon victories" />
            <span className="combat-stat-value">{victories}</span>
            <span className="combat-stat-label">Victories</span>
          </div>
          <div className="combat-stat">
            <Footprints className="combat-stat-icon speed" />
            <span className="combat-stat-value">{speed}</span>
            <span className="combat-stat-label">Speed</span>
          </div>
          <div className="combat-stat">
            <Anchor className="combat-stat-icon stability" />
            <span className="combat-stat-value">{stability}</span>
            <span className="combat-stat-label">Stability</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="combat-actions">
          {isInCombat ? (
            <Button
              variant="destructive"
              className="combat-action-btn"
              onClick={onEndCombat}
            >
              <Swords className="w-4 h-4" />
              End Combat
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                className="combat-action-btn draw-steel"
                onClick={onStartCombat}
              >
                <Swords className="w-4 h-4" />
                Draw Steel!
              </Button>
              <Button
                variant="outline"
                className="combat-action-btn respite"
                onClick={onRespite}
              >
                <Tent className="w-4 h-4" />
                Respite
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatCard;
