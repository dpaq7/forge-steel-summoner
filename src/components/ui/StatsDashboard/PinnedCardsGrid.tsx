import * as React from 'react';
import { motion } from 'motion/react';

import { StaminaCard } from './cards/StaminaCard';
import { RecoveriesCard } from './cards/RecoveriesCard';
import { HeroicResourceCard } from './cards/HeroicResourceCard';
import { SurgesCard } from './cards/SurgesCard';
import { VictoriesCard } from './cards/VictoriesCard';
import { ConditionsCard } from './cards/ConditionsCard';
import { CharacteristicsCard } from './cards/CharacteristicsCard';
import { CombatCard } from './cards/CombatCard';
import { DiceCard } from './cards/DiceCard';
import { TurnCard } from './cards/TurnCard';
import { useDerivedStats } from '@/hooks/useDerivedStats';

import type { Hero } from '@/types/hero';
import type { ConditionId } from '@/types/common';
import type { HeroicResourceConfig } from '@/data/class-resources';
import type { StatCardType, DiceRoll, DiceType, TurnPhaseId, CharacteristicId, ConditionEndType } from './types';

interface PinnedCardsGridProps {
  pinnedCards: StatCardType[];
  hero: Hero;
  isInCombat: boolean;
  resourceConfig: HeroicResourceConfig;
  onUnpin: (type: StatCardType) => void;
  onStaminaChange: (value: number) => void;
  onRecoveriesChange: (value: number) => void;
  onCatchBreath: (healAmount: number) => void;
  onResourceChange?: (value: number) => void;
  onSurgesChange: (value: number) => void;
  onVictoriesChange: (value: number) => void;
  onAddCondition: (conditionId: ConditionId) => void;
  onRemoveCondition: (conditionId: ConditionId) => void;
  onUpdateConditionEndType: (conditionId: ConditionId, endType: ConditionEndType) => void;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;
  // Dice props
  rollHistory: DiceRoll[];
  onRoll: (type: DiceType, label?: string) => void;
  onClearRollHistory: () => void;
  onRollCharacteristic: (characteristicId: CharacteristicId, modifier: number) => void;
  // Turn tracking props (combat only)
  turnNumber?: number;
  completedPhases?: Set<TurnPhaseId>;
  onTogglePhase?: (phaseId: TurnPhaseId) => void;
  onEndTurn?: () => void;
  onResetTurn?: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const PinnedCardsGrid: React.FC<PinnedCardsGridProps> = ({
  pinnedCards,
  hero,
  isInCombat,
  resourceConfig,
  onUnpin,
  onStaminaChange,
  onRecoveriesChange,
  onCatchBreath,
  onResourceChange,
  onSurgesChange,
  onVictoriesChange,
  onAddCondition,
  onRemoveCondition,
  onUpdateConditionEndType,
  onStartCombat,
  onEndCombat,
  onRespite,
  rollHistory,
  onRoll,
  onClearRollHistory,
  onRollCharacteristic,
  turnNumber = 1,
  completedPhases = new Set(),
  onTogglePhase,
  onEndTurn,
  onResetTurn,
}) => {
  // Get derived stats with equipment bonuses applied
  const { maxStamina, windedThreshold, recoveryValue, maxRecoveries, speed, stability } = useDerivedStats();

  // Use derived stats or fall back to hero values
  const effectiveMaxStamina = maxStamina || hero.stamina.max;
  const effectiveWinded = windedThreshold || hero.stamina.winded;
  const effectiveMaxRecoveries = maxRecoveries || hero.recoveries.max;
  const effectiveRecoveryValue = recoveryValue || hero.recoveries.value;
  const effectiveSpeed = speed || hero.speed;
  const effectiveStability = stability || hero.stability;

  return (
    <motion.div
      className="pinned-cards-area"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Cards Grid */}
      <div className="pinned-cards-grid">
        {pinnedCards.map((type) => (
          <motion.div
            key={type}
            layout
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {type === 'stamina' && (
              <StaminaCard
                current={hero.stamina.current}
                max={effectiveMaxStamina}
                tempStamina={0}
                winded={effectiveWinded}
                onChange={onStaminaChange}
                onUnpin={() => onUnpin('stamina')}
              />
            )}

            {type === 'recoveries' && (
              <RecoveriesCard
                current={hero.recoveries.current}
                max={effectiveMaxRecoveries}
                value={effectiveRecoveryValue}
                currentStamina={hero.stamina.current}
                maxStamina={effectiveMaxStamina}
                onChange={onRecoveriesChange}
                onCatchBreath={onCatchBreath}
                onUnpin={() => onUnpin('recoveries')}
              />
            )}

            {type === 'heroicResource' && onResourceChange && (
              <HeroicResourceCard
                name={resourceConfig.name}
                current={hero.heroicResource?.current ?? 0}
                minValue={resourceConfig.minValue}
                color={resourceConfig.color}
                heroClass={hero.heroClass}
                heroLevel={hero.level}
                onChange={onResourceChange}
                onUnpin={() => onUnpin('heroicResource')}
              />
            )}

            {type === 'surges' && (
              <SurgesCard
                current={hero.surges}
                onChange={onSurgesChange}
                isInCombat={isInCombat}
                onUnpin={() => onUnpin('surges')}
              />
            )}

            {type === 'victories' && (
              <VictoriesCard
                current={hero.victories}
                xp={hero.xp || 0}
                onChange={onVictoriesChange}
                onUnpin={() => onUnpin('victories')}
              />
            )}

            {type === 'conditions' && (
              <ConditionsCard
                conditions={hero.activeConditions}
                onAddCondition={onAddCondition}
                onRemoveCondition={onRemoveCondition}
                onUpdateConditionEndType={onUpdateConditionEndType}
                onUnpin={() => onUnpin('conditions')}
              />
            )}

            {type === 'characteristics' && (
              <CharacteristicsCard
                characteristics={hero.characteristics}
                speed={effectiveSpeed}
                stability={effectiveStability}
                onRollCharacteristic={onRollCharacteristic}
                onUnpin={() => onUnpin('characteristics')}
              />
            )}

            {type === 'combat' && (
              <CombatCard
                isInCombat={isInCombat}
                surges={hero.surges}
                victories={hero.victories}
                speed={effectiveSpeed}
                stability={effectiveStability}
                onStartCombat={onStartCombat}
                onEndCombat={onEndCombat}
                onRespite={onRespite}
                onSurgesChange={onSurgesChange}
                onUnpin={() => onUnpin('combat')}
              />
            )}

            {type === 'dice' && (
              <DiceCard
                rollHistory={rollHistory}
                onRoll={onRoll}
                onClearHistory={onClearRollHistory}
                onUnpin={() => onUnpin('dice')}
              />
            )}

            {/* Turn Card - ONLY renders during combat */}
            {type === 'turn' && isInCombat && onTogglePhase && onEndTurn && onResetTurn && (
              <TurnCard
                turnNumber={turnNumber}
                completedPhases={completedPhases}
                conditions={hero.activeConditions}
                onTogglePhase={onTogglePhase}
                onEndTurn={onEndTurn}
                onResetTurn={onResetTurn}
                onRemoveCondition={onRemoveCondition}
                onUnpin={() => onUnpin('turn')}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PinnedCardsGrid;
