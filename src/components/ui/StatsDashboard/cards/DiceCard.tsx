import * as React from 'react';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Pin, Trash2, Swords } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';

import type { DiceCardProps, DiceRoll } from '../types';

// Get tier color
const getTierColor = (tier?: number): string => {
  switch (tier) {
    case 1: return 'var(--danger)';
    case 2: return 'var(--warning)';
    case 3: return 'var(--success)';
    default: return 'var(--text-primary)';
  }
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatModifier = (value: number): string => {
  if (value >= 0) return `+${value}`;
  return `${value}`;
};

export const DiceCard: React.FC<DiceCardProps> = ({
  rollHistory,
  onRoll,
  onClearHistory,
  onUnpin,
}) => {
  const historyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest roll
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0;
    }
  }, [rollHistory.length]);

  return (
    <div className="stat-card dice-card">
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <Dices className="stat-card-icon" />
          <span>Dice</span>
        </div>
        <div className="dice-header-actions">
          {rollHistory.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="clear-history-btn" onClick={onClearHistory}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Clear History</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="unpin-btn" onClick={onUnpin}>
                <Pin className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Unpin</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="stat-card-content dice-content">
        {/* Dice Buttons */}
        <div className="dice-buttons">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="dice-btn power-roll"
                onClick={() => onRoll('2d10', 'Power Roll')}
              >
                <Swords className="w-3 h-3" />
                <span>2d10</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Power Roll (2d10)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="dice-btn"
                onClick={() => onRoll('d6')}
              >
                <span>d6</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Roll d6</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="dice-btn"
                onClick={() => onRoll('d3')}
              >
                <span>d3</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Roll d3</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="dice-btn"
                onClick={() => onRoll('d10', 'Save')}
              >
                <span>d10</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Roll d10 (Save)</TooltipContent>
          </Tooltip>
        </div>

        {/* Roll History - SCROLLABLE */}
        <div className="dice-history-container" ref={historyRef}>
          {rollHistory.length === 0 ? (
            <div className="no-rolls">
              <Dices className="no-rolls-icon" />
              <span className="no-rolls-text">Click a button or characteristic to roll!</span>
            </div>
          ) : (
            <div className="dice-history">
              <AnimatePresence initial={false}>
                {rollHistory.map((roll, index) => {
                  const isPowerRoll = roll.type === '2d10' || roll.type === 'power';
                  const hasModifier = roll.modifier !== undefined && roll.modifier !== 0;
                  const tierColor = getTierColor(roll.tier);

                  return (
                    <motion.div
                      key={roll.id}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`roll-entry ${isPowerRoll ? 'power-roll' : ''} ${index === 0 ? 'latest' : ''}`}
                    >
                      {/* Main Roll Display */}
                      <div className="roll-main">
                        {/* Dice Results */}
                        <span className="roll-dice">
                          {roll.results.map((r, i) => (
                            <React.Fragment key={i}>
                              <span className="roll-die">{r}</span>
                              {i < roll.results.length - 1 && (
                                <span className="roll-plus"> + </span>
                              )}
                            </React.Fragment>
                          ))}
                        </span>

                        <span className="roll-equals">=</span>
                        <span className="roll-subtotal">{roll.total}</span>

                        {/* Modifier (if present) */}
                        {hasModifier && (
                          <>
                            <span className={`roll-modifier ${roll.modifier! >= 0 ? 'positive' : 'negative'}`}>
                              {formatModifier(roll.modifier!)}
                            </span>
                            {roll.modifierName && (
                              <span className="roll-modifier-name">{roll.modifierName}</span>
                            )}
                            <span className="roll-arrow">→</span>
                            <span
                              className="roll-total roll-final"
                              style={{ color: tierColor }}
                            >
                              {roll.finalTotal}
                            </span>
                          </>
                        )}

                        {/* No modifier - show total */}
                        {!hasModifier && (
                          <span
                            className="roll-total"
                            style={{ color: tierColor }}
                          >
                            {roll.finalTotal}
                          </span>
                        )}
                      </div>

                      {/* Tier Result (power rolls only) */}
                      {roll.tierLabel && (
                        <div
                          className="roll-tier"
                          style={{ color: tierColor }}
                        >
                          {roll.tierLabel}
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="roll-meta">
                        {roll.label && (
                          <span className="roll-label">{roll.label}</span>
                        )}
                        {roll.modifierName && (
                          <span className="roll-characteristic">{roll.modifierName}</span>
                        )}
                        <span className="roll-type">{roll.type === 'power' ? '2d10' : roll.type}</span>
                        <span className="roll-time">{formatTime(roll.timestamp)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiceCard;
