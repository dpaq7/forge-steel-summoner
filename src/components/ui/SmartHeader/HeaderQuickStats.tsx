import * as React from 'react';
import { useCallback } from 'react';
import { motion } from 'motion/react';
import { Heart, Shield, Trophy, Flame, Sparkles, Minus, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import type { QuickStatsProps } from './types';

interface ExtendedQuickStatsProps extends QuickStatsProps {
  onStaminaChange?: (newValue: number) => void;
}

export const HeaderQuickStats: React.FC<ExtendedQuickStatsProps> = ({
  stamina,
  recoveries,
  recoveryValue,
  heroicResource,
  surges,
  victories,
  isInCombat,
  onResourceChange,
  onCatchBreath,
  onVictoriesChange,
  onStaminaChange,
}) => {
  const staminaPercent = (stamina.current / stamina.max) * 100;
  const isLowHealth = staminaPercent < 25;
  const isCriticalHealth = staminaPercent < 10;

  // Catch Breath logic
  const isDying = stamina.current <= 0;
  const hasRecoveries = recoveries.current > 0;
  const canCatchBreath = !isDying && hasRecoveries;

  // Stamina adjustment handlers
  const handleStaminaDecrease = useCallback(() => {
    if (onStaminaChange && stamina.current > 0) {
      onStaminaChange(stamina.current - 1);
    }
  }, [stamina.current, onStaminaChange]);

  const handleStaminaIncrease = useCallback(() => {
    if (onStaminaChange && stamina.current < stamina.max) {
      onStaminaChange(stamina.current + 1);
    }
  }, [stamina.current, stamina.max, onStaminaChange]);

  const handleCatchBreath = useCallback(() => {
    if (canCatchBreath && onCatchBreath) {
      onCatchBreath(recoveryValue);
    }
  }, [canCatchBreath, onCatchBreath, recoveryValue]);

  // Resource adjustment handlers
  const handleResourceUp = useCallback(() => {
    if (onResourceChange) {
      onResourceChange(heroicResource.current + 1);
    }
  }, [heroicResource.current, onResourceChange]);

  const handleResourceDown = useCallback(() => {
    if (onResourceChange && heroicResource.current > heroicResource.minValue) {
      onResourceChange(heroicResource.current - 1);
    }
  }, [heroicResource.current, heroicResource.minValue, onResourceChange]);

  // Victories adjustment handlers
  const handleVictoriesUp = useCallback(() => {
    if (onVictoriesChange && victories < 12) {
      onVictoriesChange(victories + 1);
    }
  }, [victories, onVictoriesChange]);

  const handleVictoriesDown = useCallback(() => {
    if (onVictoriesChange && victories > 0) {
      onVictoriesChange(victories - 1);
    }
  }, [victories, onVictoriesChange]);

  return (
    <div className="quick-stats">
      {/* Stamina Pill with +/- Buttons */}
      <motion.div
        className={`stat-pill stamina-pill ${isLowHealth ? 'low' : ''} ${isCriticalHealth ? 'critical' : ''}`}
        animate={
          isCriticalHealth
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(239, 68, 68, 0)',
                  '0 0 8px 2px rgba(239, 68, 68, 0.5)',
                  '0 0 0 0 rgba(239, 68, 68, 0)',
                ],
              }
            : {}
        }
        transition={isCriticalHealth ? { repeat: Infinity, duration: 1.5 } : {}}
      >
        {/* Decrease Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="stat-adjust-btn"
              onClick={handleStaminaDecrease}
              disabled={stamina.current <= 0}
              aria-label="Decrease stamina"
            >
              <Minus className="w-3 h-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Decrease Stamina</TooltipContent>
        </Tooltip>

        {/* Stamina Display */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="stamina-display">
              <Heart className="stat-icon stamina-icon" />
              <div className="stat-progress-container">
                <div
                  className="stat-progress-fill stamina-fill"
                  style={{ width: `${staminaPercent}%` }}
                />
              </div>
              <span className="stat-value">
                {stamina.current}/{stamina.max}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="stat-tooltip">
              <strong>Stamina</strong>
              <p>
                {stamina.current} / {stamina.max}
              </p>
              {isLowHealth && <p className="warning">Low health!</p>}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Increase Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="stat-adjust-btn"
              onClick={handleStaminaIncrease}
              disabled={stamina.current >= stamina.max}
              aria-label="Increase stamina"
            >
              <Plus className="w-3 h-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Increase Stamina</TooltipContent>
        </Tooltip>
      </motion.div>

      {/* Recoveries with Catch Breath */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="stat-pill recoveries-pill">
            <Shield className="stat-icon recoveries-icon" />
            <span className="stat-value">
              {recoveries.current}/{recoveries.max}
            </span>
            <button
              className={`mini-action-btn cb-btn ${canCatchBreath ? '' : 'disabled'}`}
              onClick={handleCatchBreath}
              disabled={!canCatchBreath}
              title={canCatchBreath ? `Catch Breath (+${recoveryValue})` : 'Cannot catch breath'}
            >
              CB
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="stat-tooltip">
            <strong>Recoveries</strong>
            <p>
              {recoveries.current} / {recoveries.max}
            </p>
            <p className="subtext">Recovery Value: {recoveryValue}</p>
            {canCatchBreath && <p className="action">Click CB to heal</p>}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Heroic Resource with +/- controls */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="stat-pill resource-pill"
            style={{ '--resource-color': heroicResource.color } as React.CSSProperties}
          >
            <Sparkles className="stat-icon resource-icon" />
            <span className="stat-label">{heroicResource.abbreviation}</span>
            <span className="stat-value">{heroicResource.current}</span>
            <div className="mini-arrows">
              <button
                className="mini-arrow-btn"
                onClick={handleResourceUp}
                title={`Add ${heroicResource.name}`}
              >
                +
              </button>
              <button
                className="mini-arrow-btn"
                onClick={handleResourceDown}
                disabled={heroicResource.current <= heroicResource.minValue}
                title={`Remove ${heroicResource.name}`}
              >
                -
              </button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="stat-tooltip">
            <strong>{heroicResource.name}</strong>
            <p>{heroicResource.current}</p>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Surges (show always in combat, otherwise if > 0) */}
      {(isInCombat || surges > 0) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className="stat-pill surges-pill"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 500 }}
            >
              <Flame className="stat-icon surges-icon" />
              <span className="stat-value">{surges}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="stat-tooltip">
              <strong>Surges</strong>
              <p>{surges} available</p>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Victories with +/- controls */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="stat-pill victories-pill">
            <Trophy className="stat-icon victories-icon" />
            <span className="stat-value">{victories}</span>
            <div className="mini-arrows horizontal">
              <button
                className="mini-arrow-btn"
                onClick={handleVictoriesDown}
                disabled={victories <= 0}
                title="Remove Victory"
              >
                -
              </button>
              <button
                className="mini-arrow-btn"
                onClick={handleVictoriesUp}
                disabled={victories >= 12}
                title="Add Victory"
              >
                +
              </button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="stat-tooltip">
            <strong>Victories</strong>
            <p>{victories} earned</p>
            <p className="subtext">Convert to XP during Respite</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default HeaderQuickStats;
