import * as React from 'react';
import { BarChart3, Pin, Footprints, Anchor } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { CharacteristicsCardProps } from '../types';

const CHARACTERISTIC_LABELS: Record<string, { abbr: string; full: string }> = {
  might: { abbr: 'MGT', full: 'Might' },
  agility: { abbr: 'AGI', full: 'Agility' },
  reason: { abbr: 'REA', full: 'Reason' },
  intuition: { abbr: 'INT', full: 'Intuition' },
  presence: { abbr: 'PRE', full: 'Presence' },
};

export const CharacteristicsCard: React.FC<CharacteristicsCardProps> = ({
  characteristics,
  speed,
  stability,
  onUnpin,
}) => {
  const formatValue = (val: number) => (val >= 0 ? `+${val}` : `${val}`);

  return (
    <div className="stat-card characteristics-card">
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <BarChart3 className="stat-card-icon" />
          <span>Characteristics</span>
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
        {/* Characteristics Grid */}
        <div className="characteristics-grid">
          {Object.entries(characteristics).map(([key, value]) => {
            const label = CHARACTERISTIC_LABELS[key];
            if (!label) return null;

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div className={`characteristic-item ${value > 0 ? 'positive' : value < 0 ? 'negative' : ''}`}>
                    <span className="characteristic-abbr">{label.abbr}</span>
                    <span className="characteristic-value">{formatValue(value)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label.full}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Secondary Stats */}
        <div className="secondary-stats">
          <div className="secondary-stat">
            <Footprints className="secondary-icon" />
            <span className="secondary-label">Speed</span>
            <span className="secondary-value">{speed}</span>
          </div>
          <div className="secondary-stat">
            <Anchor className="secondary-icon" />
            <span className="secondary-label">Stability</span>
            <span className="secondary-value">{stability}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacteristicsCard;
