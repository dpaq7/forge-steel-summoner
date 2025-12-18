import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Pin, Dices, Footprints, Anchor } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import { CHARACTERISTICS } from '../types';
import type { CharacteristicsCardProps, CharacteristicId } from '../types';

// Format modifier with sign
const formatModifier = (value: number): string => {
  if (value >= 0) return `+${value}`;
  return `${value}`;
};

export const CharacteristicsCard: React.FC<CharacteristicsCardProps> = ({
  characteristics,
  speed,
  stability,
  onRollCharacteristic,
  onUnpin,
}) => {
  const [rollingChar, setRollingChar] = useState<CharacteristicId | null>(null);

  // Get modifier value by characteristic ID
  const getModifier = (charId: CharacteristicId): number => {
    switch (charId) {
      case 'might': return characteristics.might;
      case 'agility': return characteristics.agility;
      case 'reason': return characteristics.reason;
      case 'intuition': return characteristics.intuition;
      case 'presence': return characteristics.presence;
      default: return 0;
    }
  };

  // Handle characteristic click
  const handleCharacteristicClick = (charId: CharacteristicId) => {
    const modifier = getModifier(charId);

    // Visual feedback
    setRollingChar(charId);
    setTimeout(() => setRollingChar(null), 600);

    // Trigger roll
    onRollCharacteristic(charId, modifier);
  };

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
      <div className="stat-card-content characteristics-content">
        {/* Primary Characteristics - Clickable */}
        <div className="characteristics-grid clickable">
          {CHARACTERISTICS.map((char) => {
            const modifier = getModifier(char.id);
            const isRolling = rollingChar === char.id;

            return (
              <Tooltip key={char.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    className={`characteristic-box ${isRolling ? 'rolling' : ''} ${modifier >= 0 ? 'positive' : 'negative'}`}
                    onClick={() => handleCharacteristicClick(char.id)}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isRolling ? {
                      rotate: [0, -8, 8, -8, 8, 0],
                      transition: { duration: 0.4 }
                    } : {}}
                  >
                    <span className={`characteristic-value ${modifier >= 0 ? 'positive' : 'negative'}`}>
                      {formatModifier(modifier)}
                    </span>
                    <span className="characteristic-abbr">{char.abbr}</span>

                    {/* Roll indicator */}
                    <div className="characteristic-roll-indicator">
                      <Dices className="roll-icon" />
                    </div>

                    {/* Rolling animation overlay */}
                    <AnimatePresence>
                      {isRolling && (
                        <motion.div
                          className="rolling-overlay"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.5 }}
                        >
                          <Dices className="rolling-dice" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="characteristic-tooltip">
                  <div className="char-tooltip-content">
                    <strong>{char.name}</strong>
                    <p>{char.description}</p>
                    <span className="char-tooltip-hint">
                      Click to roll 2d10 {formatModifier(modifier)}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Secondary Stats */}
        <div className="secondary-stats">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="secondary-stat">
                <Footprints className="secondary-icon" />
                <span className="secondary-label">Speed</span>
                <span className="secondary-value">{speed}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Squares you can move with a move action
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="secondary-stat">
                <Anchor className="secondary-icon" />
                <span className="secondary-label">Stability</span>
                <span className="secondary-value">{stability}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Resistance to forced movement
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default CharacteristicsCard;
