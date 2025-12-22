import * as React from 'react';
import {
  Heart,
  Shield,
  Zap,
  Sparkles,
  Trophy,
  BarChart3,
  Swords,
  AlertTriangle,
  Dices,
  PinOff,
} from 'lucide-react';

import { StatChip } from './StatChip';
import { TurnChip } from './TurnChip';
import { useDerivedStats } from '@/hooks/useDerivedStats';
import {
  canLevelUp,
  getLevelProgress,
  getXpRangeDisplay,
  MAX_LEVEL,
} from '@/utils/levelProgression';
import type { Hero } from '@/types/hero';
import type { HeroicResourceConfig } from '@/data/class-resources';
import type { StatCardType, TurnPhaseId } from './types';

interface StatChipsRowProps {
  hero: Hero;
  isInCombat: boolean;
  resourceConfig: HeroicResourceConfig;
  pinnedCards: Set<StatCardType>;
  onTogglePin: (type: StatCardType) => void;
  onUnpinAll: () => void;
  onStaminaChange: (value: number) => void;
  onRecoveriesChange: (value: number) => void;
  onResourceChange?: (value: number) => void;
  onSurgesChange: (value: number) => void;
  onVictoriesChange: (value: number) => void;
  onLevelUp?: () => void;
  // Turn tracking (combat only)
  turnNumber?: number;
  completedPhases?: Set<TurnPhaseId>;
}

export const StatChipsRow: React.FC<StatChipsRowProps> = ({
  hero,
  isInCombat,
  resourceConfig,
  pinnedCards,
  onTogglePin,
  onUnpinAll,
  onStaminaChange,
  onRecoveriesChange,
  onResourceChange,
  onSurgesChange,
  onVictoriesChange,
  onLevelUp,
  turnNumber = 1,
  completedPhases = new Set(),
}) => {
  const showResource = onResourceChange !== undefined;

  // Get derived stats (includes equipment bonuses)
  const { maxStamina, maxRecoveries, equipmentStamina } = useDerivedStats();

  // Use derived max values, falling back to stored values if no derived stats
  const effectiveMaxStamina = maxStamina || hero.stamina.max;
  const effectiveMaxRecoveries = maxRecoveries || hero.recoveries.max;

  // Level progression calculations
  const heroLevel = hero.level || 1;
  const heroXp = hero.xp || 0;
  const isLevelUpAvailable = canLevelUp(heroLevel, heroXp);
  const levelProgress = getLevelProgress(heroLevel, heroXp);
  const xpDisplay = getXpRangeDisplay(heroLevel, heroXp);
  const isMaxLevel = heroLevel >= MAX_LEVEL;

  return (
    <div className="stat-chips-row">
      {/* Stamina */}
      <StatChip
        id="stamina"
        icon={Heart}
        label={equipmentStamina > 0 ? `Stamina (+${equipmentStamina})` : "Stamina"}
        value={hero.stamina.current}
        maxValue={effectiveMaxStamina}
        color="var(--danger)"
        isPinned={pinnedCards.has('stamina')}
        onTogglePin={() => onTogglePin('stamina')}
        onChange={(delta) => {
          const newVal = Math.max(
            0,
            Math.min(effectiveMaxStamina, hero.stamina.current + delta)
          );
          onStaminaChange(newVal);
        }}
        minValue={0}
        showProgress
      />

      {/* Recoveries */}
      <StatChip
        id="recoveries"
        icon={Shield}
        label="Recoveries"
        value={hero.recoveries.current}
        maxValue={effectiveMaxRecoveries}
        color="var(--success)"
        isPinned={pinnedCards.has('recoveries')}
        onTogglePin={() => onTogglePin('recoveries')}
        onChange={(delta) => {
          const newVal = Math.max(
            0,
            Math.min(effectiveMaxRecoveries, hero.recoveries.current + delta)
          );
          onRecoveriesChange(newVal);
        }}
        minValue={0}
      />

      {/* Heroic Resource */}
      {showResource && (
        <StatChip
          id="heroicResource"
          icon={Zap}
          label={resourceConfig.name}
          value={hero.heroicResource?.current ?? 0}
          color={resourceConfig.color}
          isPinned={pinnedCards.has('heroicResource')}
          onTogglePin={() => onTogglePin('heroicResource')}
          onChange={(delta) => {
            const current = hero.heroicResource?.current ?? 0;
            const newVal = Math.max(resourceConfig.minValue, current + delta);
            onResourceChange(newVal);
          }}
          minValue={resourceConfig.minValue}
        />
      )}

      {/* Surges */}
      <StatChip
        id="surges"
        icon={Sparkles}
        label="Surges"
        value={hero.surges}
        color="var(--warning)"
        isPinned={pinnedCards.has('surges')}
        onTogglePin={() => onTogglePin('surges')}
        onChange={(delta) => {
          const newVal = Math.max(0, hero.surges + delta);
          onSurgesChange(newVal);
        }}
        minValue={0}
        highlight={isInCombat && hero.surges > 0}
      />

      {/* Victories with XP Progress */}
      <StatChip
        id="victories"
        icon={Trophy}
        label="Victories"
        value={levelProgress}
        maxValue={100}
        displayValue={`${hero.victories}`}
        secondaryText={`XP: ${xpDisplay}`}
        color="var(--xp)"
        isPinned={pinnedCards.has('victories')}
        onTogglePin={() => onTogglePin('victories')}
        onChange={(delta) => {
          const newVal = Math.max(0, hero.victories + delta);
          onVictoriesChange(newVal);
        }}
        onAction={isLevelUpAvailable && onLevelUp ? onLevelUp : undefined}
        actionTooltip={isLevelUpAvailable ? `Level up to Level ${heroLevel + 1}!` : undefined}
        minValue={0}
        showProgress={!isMaxLevel}
        highlight={isLevelUpAvailable}
      />

      {/* Conditions */}
      <StatChip
        id="conditions"
        icon={AlertTriangle}
        label="Conditions"
        value={hero.activeConditions.length}
        displayValue={hero.activeConditions.length > 0 ? `${hero.activeConditions.length}` : 'None'}
        color={hero.activeConditions.length > 0 ? 'var(--warning)' : 'var(--text-muted)'}
        isPinned={pinnedCards.has('conditions')}
        onTogglePin={() => onTogglePin('conditions')}
        highlight={hero.activeConditions.length > 0}
        // No onChange - conditions are managed in the card
      />

      {/* Turn Tracker - ONLY visible during combat */}
      {isInCombat && (
        <TurnChip
          turnNumber={turnNumber}
          completedPhases={completedPhases}
          isPinned={pinnedCards.has('turn')}
          onTogglePin={() => onTogglePin('turn')}
        />
      )}

      {/* Characteristics (no +/- controls) */}
      <StatChip
        id="characteristics"
        icon={BarChart3}
        label="Stats"
        value={0}
        displayValue={`MGT ${hero.characteristics.might >= 0 ? '+' : ''}${hero.characteristics.might}`}
        color="var(--accent-primary)"
        isPinned={pinnedCards.has('characteristics')}
        onTogglePin={() => onTogglePin('characteristics')}
        // No onChange - characteristics are read-only here
      />

      {/* Combat (no +/- controls) */}
      <StatChip
        id="combat"
        icon={Swords}
        label="Combat"
        value={0}
        displayValue={isInCombat ? 'Active' : 'Ready'}
        color={isInCombat ? 'var(--danger)' : 'var(--text-muted)'}
        isPinned={pinnedCards.has('combat')}
        onTogglePin={() => onTogglePin('combat')}
        highlight={isInCombat}
        // No onChange - combat is controlled via header buttons
      />

      {/* Dice Roller */}
      <StatChip
        id="dice"
        icon={Dices}
        label="Dice"
        value={0}
        displayValue="Roll"
        color="var(--warning)"
        isPinned={pinnedCards.has('dice')}
        onTogglePin={() => onTogglePin('dice')}
        // No onChange - dice is controlled in the card
      />

      {/* Unpin All - only show when multiple cards are pinned */}
      {pinnedCards.size > 1 && (
        <button className="unpin-all-chip" onClick={onUnpinAll} title="Unpin all cards">
          <PinOff className="w-3 h-3" />
          <span>Unpin All</span>
        </button>
      )}
    </div>
  );
};

export default StatChipsRow;
