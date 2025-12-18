import * as React from 'react';
import { Sparkles, Pin, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { SurgesCardProps } from '../types';

export const SurgesCard: React.FC<SurgesCardProps> = ({
  current,
  onChange,
  isInCombat,
  onUnpin,
}) => {
  return (
    <div className={`stat-card surges-card ${isInCombat && current > 0 ? 'has-surges' : ''}`}>
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <Sparkles className="stat-card-icon" />
          <span>Surges</span>
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
        <div className="surges-value-display">
          <span className="surges-current">{current}</span>
        </div>

        {/* Info */}
        <p className="surges-info">
          {isInCombat
            ? 'Spend surges on abilities or get extra damage.'
            : 'Surges reset at the start of each combat.'}
        </p>

        {/* Controls */}
        <div className="surges-controls">
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

        {/* Combat Status */}
        {isInCombat && current > 0 && (
          <div className="surges-available">
            <span className="surges-badge">Available for use!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurgesCard;
