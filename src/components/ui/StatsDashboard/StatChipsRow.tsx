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
} from 'lucide-react';

import { StatChip } from './StatChip';
import { TurnChip } from './TurnChip';
import type { Hero } from '@/types/hero';
import type { HeroicResourceConfig } from '@/data/class-resources';
import type { StatCardType, TurnPhaseId } from './types';

interface StatChipsRowProps {
  hero: Hero;
  isInCombat: boolean;
  resourceConfig: HeroicResourceConfig;
  pinnedCards: Set<StatCardType>;
  onTogglePin: (type: StatCardType) => void;
  onStaminaChange: (value: number) => void;
  onRecoveriesChange: (value: number) => void;
  onResourceChange?: (value: number) => void;
  onSurgesChange: (value: number) => void;
  onVictoriesChange: (value: number) => void;
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
  onStaminaChange,
  onRecoveriesChange,
  onResourceChange,
  onSurgesChange,
  onVictoriesChange,
  turnNumber = 1,
  completedPhases = new Set(),
}) => {
  const showResource = onResourceChange !== undefined;

  return (
    <div className="stat-chips-row">
      {/* Stamina */}
      <StatChip
        id="stamina"
        icon={Heart}
        label="Stamina"
        value={hero.stamina.current}
        maxValue={hero.stamina.max}
        color="var(--danger)"
        isPinned={pinnedCards.has('stamina')}
        onTogglePin={() => onTogglePin('stamina')}
        onChange={(delta) => {
          const newVal = Math.max(
            0,
            Math.min(hero.stamina.max, hero.stamina.current + delta)
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
        maxValue={hero.recoveries.max}
        color="var(--success)"
        isPinned={pinnedCards.has('recoveries')}
        onTogglePin={() => onTogglePin('recoveries')}
        onChange={(delta) => {
          const newVal = Math.max(
            0,
            Math.min(hero.recoveries.max, hero.recoveries.current + delta)
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

      {/* Victories */}
      <StatChip
        id="victories"
        icon={Trophy}
        label="Victories"
        value={hero.victories}
        color="var(--xp)"
        isPinned={pinnedCards.has('victories')}
        onTogglePin={() => onTogglePin('victories')}
        onChange={(delta) => {
          const newVal = Math.max(0, hero.victories + delta);
          onVictoriesChange(newVal);
        }}
        minValue={0}
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
    </div>
  );
};

export default StatChipsRow;
