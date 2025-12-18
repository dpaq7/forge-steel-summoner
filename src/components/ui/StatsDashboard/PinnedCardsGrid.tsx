import * as React from 'react';
import { motion } from 'motion/react';
import { PinOff } from 'lucide-react';

import { StaminaCard } from './cards/StaminaCard';
import { RecoveriesCard } from './cards/RecoveriesCard';
import { HeroicResourceCard } from './cards/HeroicResourceCard';
import { SurgesCard } from './cards/SurgesCard';
import { VictoriesCard } from './cards/VictoriesCard';
import { CharacteristicsCard } from './cards/CharacteristicsCard';
import { CombatCard } from './cards/CombatCard';

import type { Hero } from '@/types/hero';
import type { HeroicResourceConfig } from '@/data/class-resources';
import type { StatCardType } from './types';

interface PinnedCardsGridProps {
  pinnedCards: StatCardType[];
  hero: Hero;
  isInCombat: boolean;
  resourceConfig: HeroicResourceConfig;
  onUnpin: (type: StatCardType) => void;
  onUnpinAll: () => void;
  onStaminaChange: (value: number) => void;
  onRecoveriesChange: (value: number) => void;
  onCatchBreath: (healAmount: number) => void;
  onResourceChange?: (value: number) => void;
  onSurgesChange: (value: number) => void;
  onVictoriesChange: (value: number) => void;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;
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
  onUnpinAll,
  onStaminaChange,
  onRecoveriesChange,
  onCatchBreath,
  onResourceChange,
  onSurgesChange,
  onVictoriesChange,
  onStartCombat,
  onEndCombat,
  onRespite,
}) => {
  return (
    <motion.div
      className="pinned-cards-area"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      {pinnedCards.length > 1 && (
        <div className="pinned-cards-header">
          <span className="pinned-count">{pinnedCards.length} pinned</span>
          <button className="unpin-all-btn" onClick={onUnpinAll}>
            <PinOff className="w-3 h-3" />
            Unpin All
          </button>
        </div>
      )}

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
                max={hero.stamina.max}
                tempStamina={0}
                winded={hero.stamina.winded}
                onChange={onStaminaChange}
                onUnpin={() => onUnpin('stamina')}
              />
            )}

            {type === 'recoveries' && (
              <RecoveriesCard
                current={hero.recoveries.current}
                max={hero.recoveries.max}
                value={hero.recoveries.value}
                currentStamina={hero.stamina.current}
                maxStamina={hero.stamina.max}
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

            {type === 'characteristics' && (
              <CharacteristicsCard
                characteristics={hero.characteristics}
                speed={hero.speed}
                stability={hero.stability}
                onUnpin={() => onUnpin('characteristics')}
              />
            )}

            {type === 'combat' && (
              <CombatCard
                isInCombat={isInCombat}
                surges={hero.surges}
                victories={hero.victories}
                speed={hero.speed}
                stability={hero.stability}
                onStartCombat={onStartCombat}
                onEndCombat={onEndCombat}
                onRespite={onRespite}
                onSurgesChange={onSurgesChange}
                onUnpin={() => onUnpin('combat')}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PinnedCardsGrid;
