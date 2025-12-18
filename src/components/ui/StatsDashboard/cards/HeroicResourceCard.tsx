import * as React from 'react';
import { Zap, Pin, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { HeroicResourceCardProps } from '../types';

export const HeroicResourceCard: React.FC<HeroicResourceCardProps> = ({
  name,
  current,
  minValue,
  color,
  heroClass,
  heroLevel,
  onChange,
  onUnpin,
}) => {
  const canDecrease = current > minValue;

  // Get class-specific flavor text
  const getFlavorText = () => {
    switch (heroClass) {
      case 'fury':
        return 'Your rage builds with each strike and wound taken.';
      case 'talent':
        return current < 0
          ? 'You are Strained. Your power strains your mind.'
          : 'Your psionic focus sharpens your abilities.';
      case 'null':
        return 'Your mental discipline controls the battlefield.';
      case 'summoner':
      case 'elementalist':
        return 'Essence fuels your magical abilities.';
      case 'censor':
        return 'Divine wrath empowers your judgment.';
      case 'conduit':
        return 'Your piety channels divine power.';
      case 'tactician':
        return 'Focus enables tactical brilliance.';
      case 'shadow':
        return 'Insight reveals hidden truths.';
      case 'troubadour':
        return 'Drama amplifies your performances.';
      default:
        return 'Your heroic resource fuels your abilities.';
    }
  };

  return (
    <div className="stat-card resource-card" style={{ '--resource-color': color } as React.CSSProperties}>
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <Zap className="stat-card-icon" style={{ color }} />
          <span>{name}</span>
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
        <div className="resource-value-display" style={{ color }}>
          <span className="resource-current">{current}</span>
        </div>

        {/* Flavor Text */}
        <p className="resource-flavor">{getFlavorText()}</p>

        {/* Controls */}
        <div className="resource-controls">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(current - 5)}
            disabled={current - 5 < minValue}
            className="adjust-btn"
          >
            −5
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(current - 1)}
            disabled={!canDecrease}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(current + 5)}
            className="adjust-btn"
          >
            +5
          </Button>
        </div>

        {/* Talent Strained Warning */}
        {heroClass === 'talent' && current < 0 && (
          <div className="strained-warning">
            <span className="strained-badge">STRAINED</span>
            <span className="strained-text">Clarity below 0</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroicResourceCard;
