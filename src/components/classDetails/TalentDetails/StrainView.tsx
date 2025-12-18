import React, { useCallback } from 'react';
import { useSummonerContext } from '../../../context/HeroContext';
import { useCombatContext } from '../../../context/CombatContext';
import { isTalentHero, TalentHero, TalentTradition } from '../../../types/hero';
import { ClarityGauge } from './ClarityGauge';
import { StrainDamagePreview } from './StrainDamagePreview';
import { TurnTracker } from '../../combat/TurnTracker';
import type { ConditionId } from '@/types/common';
import './StrainView.css';

// Tradition descriptions from Draw Steel rules
const TRADITION_INFO: Record<TalentTradition, { name: string; description: string }> = {
  chronopathy: {
    name: 'Chronopathy',
    description: 'Seer of time who perceives past and future, accelerating allies.',
  },
  telekinesis: {
    name: 'Telekinesis',
    description: 'Master of psychic force who moves objects and creatures with thought.',
  },
  telepathy: {
    name: 'Telepathy',
    description: 'Mind-reader who communicates silently and projects psychic attacks.',
  },
};

// Level features from Draw Steel rules
interface LevelFeature {
  level: number;
  name: string;
  description: string;
}

const LEVEL_FEATURES: LevelFeature[] = [
  {
    level: 4,
    name: 'Mind Recovery',
    description: 'When you are Strained, you can spend a Recovery to gain 3 Clarity instead of regaining Stamina.',
  },
  {
    level: 7,
    name: 'Lucid Mind',
    description: 'At the start of your turn, you gain 1d3 + 1 Clarity (instead of 1d3).',
  },
  {
    level: 10,
    name: 'Vision',
    description: 'You gain access to the Vision epic resource, allowing you to see possibilities others cannot.',
  },
  {
    level: 10,
    name: 'Clear Mind',
    description: 'The first time per round a creature is force moved, you gain 3 Clarity (instead of 1).',
  },
];

/**
 * StrainView - Main view for Talent class's Strain tab
 * Displays Clarity gauge, strain damage preview, tradition, and level features
 */
export const StrainView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();
  const { isInCombat, combatTurnNumber, onEndTurn } = useCombatContext();

  // Handle condition removal for TurnTracker
  const handleRemoveCondition = useCallback((conditionId: ConditionId) => {
    if (!hero) return;
    updateHero({
      activeConditions: hero.activeConditions.filter((c) => c.conditionId !== conditionId),
    });
  }, [hero, updateHero]);

  // Type guard - only render for Talent heroes
  if (!hero || !isTalentHero(hero)) {
    return (
      <div className="strain-view strain-view--empty">
        <p>This view is only available for Talent heroes.</p>
      </div>
    );
  }

  const talentHero = hero as TalentHero;
  const { heroicResource, isStrained, subclass: tradition, level, characteristics } = talentHero;

  // Calculate minimum clarity: -(1 + Reason score)
  const reasonScore = characteristics?.reason ?? 2;
  const minimumClarity = -(1 + reasonScore);

  // Get current clarity (can be negative)
  const currentClarity = heroicResource?.current ?? 0;

  // Calculate strain damage (if negative)
  const strainDamage = currentClarity < 0 ? Math.abs(currentClarity) : 0;

  // Handle clarity change
  const handleClarityChange = useCallback((newValue: number) => {
    const newIsStrained = newValue < 0;
    updateHero({
      heroicResource: {
        ...heroicResource,
        current: newValue,
      },
      isStrained: newIsStrained,
    } as Partial<TalentHero>);
  }, [heroicResource, updateHero]);

  return (
    <div className="strain-view">
      {/* Turn Tracker - Only visible in combat */}
      <TurnTracker
        isInCombat={isInCombat}
        turnNumber={combatTurnNumber}
        conditions={hero.activeConditions}
        onEndTurn={onEndTurn}
        onRemoveCondition={handleRemoveCondition}
      />

      <header className="strain-view__header">
        <h1 className="strain-view__title">Strain</h1>
        <p className="strain-view__subtitle">
          Manage your Clarity and monitor your Strained condition
        </p>
      </header>

      <div className="strain-view__content">
        {/* Main Clarity Gauge */}
        <section className="strain-view__section strain-view__section--gauge">
          <ClarityGauge
            current={currentClarity}
            minimum={minimumClarity}
            maximum={10}
            onChange={handleClarityChange}
          />
        </section>

        {/* Strain Damage Preview (only when strained) */}
        {strainDamage > 0 && (
          <section className="strain-view__section strain-view__section--warning">
            <StrainDamagePreview negativeClarityAmount={strainDamage} />
          </section>
        )}

        {/* Strain Mechanics Info */}
        <section className="strain-view__section strain-view__section--mechanics">
          <h2 className="strain-view__section-title">Strain Mechanics</h2>
          <div className="strain-view__mechanics-card">
            <div className="strain-view__mechanic">
              <span className="strain-view__mechanic-label">Clarity Gain (per turn):</span>
              <span className="strain-view__mechanic-value">
                {level >= 7 ? '1d3 + 1' : '1d3'}
              </span>
            </div>
            <div className="strain-view__mechanic">
              <span className="strain-view__mechanic-label">Force Move Trigger:</span>
              <span className="strain-view__mechanic-value">
                +{level >= 10 ? '3' : '1'} Clarity
              </span>
            </div>
            <div className="strain-view__mechanic">
              <span className="strain-view__mechanic-label">Negative Limit:</span>
              <span className="strain-view__mechanic-value">
                {minimumClarity} (1 + Reason: {reasonScore})
              </span>
            </div>
          </div>
        </section>

        {/* Tradition Display */}
        {tradition && (
          <section className="strain-view__section strain-view__section--tradition">
            <h2 className="strain-view__section-title">Tradition</h2>
            <div className="strain-view__tradition-card">
              <h3 className="strain-view__tradition-name">
                {TRADITION_INFO[tradition].name}
              </h3>
              <p className="strain-view__tradition-description">
                {TRADITION_INFO[tradition].description}
              </p>
            </div>
          </section>
        )}

        {/* Level Features */}
        <section className="strain-view__section strain-view__section--features">
          <h2 className="strain-view__section-title">Level Features</h2>
          <div className="strain-view__features-list">
            {LEVEL_FEATURES.map((feature) => {
              const isUnlocked = level >= feature.level;
              return (
                <div
                  key={feature.name}
                  className={`strain-view__feature ${isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="strain-view__feature-header">
                    <span className="strain-view__feature-level">L{feature.level}</span>
                    <span className="strain-view__feature-name">{feature.name}</span>
                    {!isUnlocked && (
                      <span className="strain-view__feature-locked-badge">Locked</span>
                    )}
                  </div>
                  <p className="strain-view__feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StrainView;
