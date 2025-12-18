import React, { useState, useMemo, useCallback } from 'react';
import { useSummonerContext } from '../../../context/HeroContext';
import { useCombatContext } from '../../../context/CombatContext';
import { isFuryHero, FuryHero, FuryAspect, FuryForm } from '../../../types/hero';
import { rollDie } from '../../../utils/dice';
import {
  getTiersForAspect,
  getActiveTiers,
  getNextTier,
  getLockedTiers,
} from '../../../data/fury/growing-ferocity';
import { furyAspects } from '../../../data/fury/subclasses';
import { stormwightKits } from '../../../data/fury/stormwight-kits';
import { TurnTracker } from '../../combat/TurnTracker';
import type { ConditionId } from '@/types/common';
import './FerocityTrackerView.css';

/**
 * FerocityTrackerView - Main view for Fury class's Ferocity tab
 * Displays Growing Ferocity tiers, Ferocity tracking, and Stormwight form management
 */
export const FerocityTrackerView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();
  const { isInCombat, combatTurnNumber, onEndTurn } = useCombatContext();
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Handle condition removal for TurnTracker
  const handleRemoveCondition = useCallback((conditionId: ConditionId) => {
    if (!hero) return;
    updateHero({
      activeConditions: hero.activeConditions.filter((c) => c.conditionId !== conditionId),
    });
  }, [hero, updateHero]);

  // Type guard - only render for Fury heroes
  if (!hero || !isFuryHero(hero)) {
    return (
      <div className="ferocity-tracker ferocity-tracker--empty">
        <p>This view is only available for Fury heroes.</p>
      </div>
    );
  }

  const furyHero = hero as FuryHero;
  const currentFerocity = furyHero.heroicResource?.current ?? 0;
  const level = furyHero.level;

  // Get aspect from furyState or subclass, with fallback
  const aspect: FuryAspect = furyHero.furyState?.aspect || furyHero.subclass || 'berserker';

  // Provide defaults for furyState if not present (migration support)
  const furyState = furyHero.furyState ?? {
    aspect,
    stormwightKit: undefined,
    primordialStorm: undefined,
    currentForm: 'humanoid' as FuryForm,
    growingFerocity: {
      tookDamageThisRound: false,
      becameWindedThisEncounter: false,
      becameDyingThisEncounter: false,
    },
    primordialPower: 0,
  };

  // Calculate ferocity gain based on level
  const ferocityGainDice = level >= 7 ? '1d3+1' : '1d3';
  const damageGain = level >= 10 ? 3 : level >= 4 ? 2 : 1;

  // Get tier data
  const allTiers = useMemo(() => getTiersForAspect(aspect), [aspect]);
  const activeTiers = useMemo(
    () => getActiveTiers(aspect, currentFerocity, level),
    [aspect, currentFerocity, level]
  );
  const nextTier = useMemo(
    () => getNextTier(aspect, currentFerocity, level),
    [aspect, currentFerocity, level]
  );
  const lockedTiers = useMemo(() => getLockedTiers(aspect, level), [aspect, level]);

  // Aspect info
  const aspectInfo = furyAspects[aspect];
  const stormwightKit = furyState.stormwightKit;
  const kitInfo = stormwightKit ? stormwightKits[stormwightKit] : null;

  // Roll for start-of-turn ferocity
  const handleRollFerocity = useCallback(() => {
    setIsRolling(true);
    const roll = rollDie(3);
    const bonus = level >= 7 ? 1 : 0;
    const total = roll + bonus;
    setLastRoll(total);

    updateHero({
      heroicResource: {
        ...furyHero.heroicResource,
        current: currentFerocity + total,
      },
    } as Partial<FuryHero>);

    setTimeout(() => setIsRolling(false), 500);
  }, [level, currentFerocity, furyHero.heroicResource, updateHero]);

  // Manual adjust ferocity
  const handleAdjustFerocity = useCallback((delta: number) => {
    const newValue = Math.max(0, currentFerocity + delta);
    updateHero({
      heroicResource: {
        ...furyHero.heroicResource,
        current: newValue,
      },
    } as Partial<FuryHero>);
  }, [currentFerocity, furyHero.heroicResource, updateHero]);

  // Damage trigger
  const handleDamageTrigger = useCallback(() => {
    if (furyState.growingFerocity?.tookDamageThisRound) return;

    updateHero({
      heroicResource: {
        ...furyHero.heroicResource,
        current: currentFerocity + damageGain,
      },
      furyState: {
        ...furyState,
        growingFerocity: {
          ...furyState.growingFerocity,
          tookDamageThisRound: true,
        },
      },
    } as Partial<FuryHero>);
  }, [furyState, damageGain, currentFerocity, furyHero.heroicResource, updateHero]);

  // Winded/Dying trigger
  const handleWindedDyingTrigger = useCallback(() => {
    const roll = rollDie(3);
    setLastRoll(roll);
    updateHero({
      heroicResource: {
        ...furyHero.heroicResource,
        current: currentFerocity + roll,
      },
    } as Partial<FuryHero>);
  }, [currentFerocity, furyHero.heroicResource, updateHero]);

  // Reset round tracking
  const handleNewRound = useCallback(() => {
    updateHero({
      furyState: {
        ...furyState,
        growingFerocity: {
          ...furyState.growingFerocity,
          tookDamageThisRound: false,
        },
      },
    } as Partial<FuryHero>);
    setLastRoll(null);
  }, [furyState, updateHero]);

  // Reset encounter tracking
  const handleNewEncounter = useCallback(() => {
    updateHero({
      heroicResource: {
        ...furyHero.heroicResource,
        current: furyHero.victories || 0, // Reset to victories
      },
      furyState: {
        ...furyState,
        growingFerocity: {
          tookDamageThisRound: false,
          becameWindedThisEncounter: false,
          becameDyingThisEncounter: false,
        },
      },
    } as Partial<FuryHero>);
    setLastRoll(null);
  }, [furyState, furyHero.heroicResource, furyHero.victories, updateHero]);

  // Form toggle (Stormwight only)
  const handleFormChange = useCallback((form: FuryForm) => {
    if (aspect !== 'stormwight') return;
    updateHero({
      furyState: {
        ...furyState,
        currentForm: form,
      },
    } as Partial<FuryHero>);
  }, [aspect, furyState, updateHero]);

  // Update Primordial Power (L10)
  const handleAdjustPrimordialPower = useCallback((delta: number) => {
    const newValue = Math.max(0, (furyState.primordialPower || 0) + delta);
    updateHero({
      furyState: {
        ...furyState,
        primordialPower: newValue,
      },
    } as Partial<FuryHero>);
  }, [furyState, updateHero]);

  return (
    <div className="ferocity-tracker">
      {/* Turn Tracker - Only visible in combat */}
      <TurnTracker
        isInCombat={isInCombat}
        turnNumber={combatTurnNumber}
        conditions={hero.activeConditions}
        onEndTurn={onEndTurn}
        onRemoveCondition={handleRemoveCondition}
      />

      {/* Aspect Header */}
      <div className="aspect-header">
        <h2>{aspectInfo.name}</h2>
        <p className="aspect-desc">{aspectInfo.description}</p>
        {aspect === 'stormwight' && kitInfo && (
          <div className="kit-info">
            <span className="kit-name">{kitInfo.name}</span>
            <span className="primordial-storm">
              Primordial Storm: {kitInfo.primordialStormName} ({kitInfo.primordialStorm})
            </span>
          </div>
        )}
      </div>

      {/* Ferocity Counter */}
      <div className="ferocity-counter">
        <button
          className="adjust-btn decrease"
          onClick={() => handleAdjustFerocity(-1)}
          disabled={currentFerocity <= 0}
        >
          -
        </button>
        <div className="ferocity-value">
          <span className="value">{currentFerocity}</span>
          <span className="label">Ferocity</span>
        </div>
        <button
          className="adjust-btn increase"
          onClick={() => handleAdjustFerocity(1)}
        >
          +
        </button>
      </div>

      {/* Ferocity Gain Actions */}
      <div className="ferocity-actions">
        <button
          className={`action-btn roll-btn ${isRolling ? 'rolling' : ''}`}
          onClick={handleRollFerocity}
        >
          <span className="btn-label">Start of Turn</span>
          <span className="btn-detail">{ferocityGainDice}</span>
          {lastRoll !== null && <span className="last-roll">+{lastRoll}</span>}
        </button>

        <button
          className="action-btn damage-btn"
          onClick={handleDamageTrigger}
          disabled={furyState.growingFerocity?.tookDamageThisRound}
        >
          <span className="btn-label">Took Damage</span>
          <span className="btn-detail">+{damageGain} (1/round)</span>
        </button>

        <button
          className="action-btn winded-btn"
          onClick={handleWindedDyingTrigger}
        >
          <span className="btn-label">Winded/Dying</span>
          <span className="btn-detail">+1d3 (1/encounter)</span>
        </button>

        <button className="action-btn reset-btn" onClick={handleNewRound}>
          New Round
        </button>

        <button className="action-btn encounter-btn" onClick={handleNewEncounter}>
          New Encounter
        </button>
      </div>

      {/* Stormwight Form Tracker */}
      {aspect === 'stormwight' && (
        <div className="form-tracker">
          <h3>Current Form</h3>
          <div className="form-options">
            {(['humanoid', 'animal', 'hybrid'] as FuryForm[]).map((form) => (
              <button
                key={form}
                className={`form-option ${furyState.currentForm === form ? 'active' : ''}`}
                onClick={() => handleFormChange(form)}
              >
                {form === 'animal' && kitInfo ? kitInfo.animalForm : form.charAt(0).toUpperCase() + form.slice(1)}
              </button>
            ))}
          </div>
          {furyState.currentForm !== 'humanoid' && kitInfo && (
            <p className="form-benefits">
              {furyState.currentForm === 'animal'
                ? kitInfo.animalFormBenefits
                : kitInfo.hybridFormBenefits}
            </p>
          )}
        </div>
      )}

      {/* Growing Ferocity Section */}
      <div className="growing-ferocity-section">
        <h3>Growing Ferocity</h3>

        {/* Progress bar to next tier */}
        {nextTier && (
          <div className="tier-progress">
            <div className="progress-label">
              Next: {nextTier.name} (Ferocity {nextTier.ferocityRequired})
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (currentFerocity / nextTier.ferocityRequired) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Tiers Grid */}
        <div className="tiers-grid">
          {allTiers.map((tier) => {
            const isActive = activeTiers.some((t) => t.id === tier.id);
            const isLocked = lockedTiers.some((t) => t.id === tier.id);
            const isNext = nextTier?.id === tier.id;

            return (
              <div
                key={tier.id}
                className={`tier-card ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${isNext ? 'next' : ''}`}
              >
                <div className="tier-header">
                  <span className="tier-threshold">{tier.ferocityRequired}+</span>
                  <span className="tier-name">{tier.name}</span>
                  {isLocked && <span className="lock-badge">L{tier.levelRequired}+</span>}
                </div>
                <p className="tier-benefit">{tier.benefit}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primordial Power (Level 10) */}
      {level >= 10 && (
        <div className="primordial-power-section">
          <h3>Primordial Power</h3>
          <p className="epic-label">Can be spent as Ferocity or to end effects</p>
          <div className="epic-resource">
            <button
              className="adjust-btn decrease"
              onClick={() => handleAdjustPrimordialPower(-1)}
              disabled={(furyState.primordialPower || 0) <= 0}
            >
              -
            </button>
            <span className="epic-value">{furyState.primordialPower || 0}</span>
            <button
              className="adjust-btn increase"
              onClick={() => handleAdjustPrimordialPower(1)}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Ferocity Gain Reminder */}
      <div className="gain-reminder">
        <h4>Ferocity Gain</h4>
        <ul>
          <li>
            Start of turn: <strong>{ferocityGainDice}</strong>
          </li>
          <li>
            First damage per round: <strong>+{damageGain}</strong>
          </li>
          <li>
            Become winded/dying (1/encounter): <strong>+1d3</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FerocityTrackerView;
