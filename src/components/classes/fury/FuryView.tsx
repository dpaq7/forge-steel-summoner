import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isFuryHero, FuryHero, FuryAspect, FuryForm } from '@/types/hero';
import {
  getTiersForAspect,
  getActiveTiers,
  getNextTier,
} from '@/data/fury/growing-ferocity';
import { furyAspects } from '@/data/fury/subclasses';
import { stormwightKits } from '@/data/fury/stormwight-kits';
import type { BaseClassViewProps } from '../types';
import './FuryView.css';

export const FuryView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  onUpdateHero,
}) => {
  if (!isFuryHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for FuryView</p>
      </div>
    );
  }

  const furyHero = hero as FuryHero;
  const ferocity = furyHero.heroicResource?.current ?? 0;
  const level = furyHero.level;
  const aspect: FuryAspect = furyHero.furyState?.aspect || furyHero.subclass || 'berserker';

  const furyState = furyHero.furyState ?? {
    aspect,
    currentForm: 'humanoid' as FuryForm,
    growingFerocity: {
      tookDamageThisRound: false,
      becameWindedThisEncounter: false,
      becameDyingThisEncounter: false,
    },
    primordialPower: 0,
  };

  // Tier data
  const allTiers = useMemo(() => getTiersForAspect(aspect), [aspect]);
  const activeTiers = useMemo(
    () => getActiveTiers(aspect, ferocity, level),
    [aspect, ferocity, level]
  );
  const nextTier = useMemo(
    () => getNextTier(aspect, ferocity, level),
    [aspect, ferocity, level]
  );

  const aspectInfo = furyAspects[aspect];
  const stormwightKit = furyState.stormwightKit;
  const kitInfo = stormwightKit ? stormwightKits[stormwightKit] : null;

  const handleFerocityChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, ferocity + delta);
      onUpdateHero({
        heroicResource: {
          ...furyHero.heroicResource,
          current: newValue,
        },
      } as Partial<FuryHero>);
    },
    [ferocity, furyHero.heroicResource, onUpdateHero]
  );

  const handleFormChange = useCallback(
    (form: FuryForm) => {
      if (aspect !== 'stormwight') return;
      onUpdateHero({
        furyState: {
          ...furyState,
          currentForm: form,
        },
      } as Partial<FuryHero>);
    },
    [aspect, furyState, onUpdateHero]
  );

  return (
    <BaseClassView
      heroClass="fury"
      hero={hero}
      isInCombat={isInCombat}
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
      onUpdateHero={onUpdateHero}
    >
      {/* Ferocity Tracker */}
      <div className="resource-tracker ferocity-tracker">
        <span className="resource-tracker-label">Ferocity</span>
        <div className="resource-display">
          <span className="resource-current">{ferocity}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handleFerocityChange(-1)} disabled={ferocity <= 0}>
            -
          </button>
          <button onClick={() => handleFerocityChange(1)}>+</button>
        </div>
      </div>

      {/* Aspect Display */}
      <div className="aspect-display">
        <span className="aspect-name">{aspectInfo?.name || aspect}</span>
        {aspect === 'stormwight' && kitInfo && (
          <span className="kit-name">{kitInfo.name}</span>
        )}
      </div>

      {/* Stormwight Form Tracker */}
      {aspect === 'stormwight' && (
        <div className="class-feature-section">
          <h4 className="class-feature-title">Current Form</h4>
          <div className="form-options">
            {(['humanoid', 'animal', 'hybrid'] as FuryForm[]).map((form) => (
              <button
                key={form}
                className={`form-option ${furyState.currentForm === form ? 'active' : ''}`}
                onClick={() => handleFormChange(form)}
              >
                {form === 'animal' && kitInfo
                  ? kitInfo.animalForm
                  : form.charAt(0).toUpperCase() + form.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Growing Ferocity Tiers */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Growing Ferocity</h4>
        {nextTier && (
          <div className="tier-progress">
            <span className="tier-progress-label">
              Next: {nextTier.name} ({nextTier.ferocityRequired})
            </span>
            <div className="tier-progress-bar">
              <div
                className="tier-progress-fill"
                style={{
                  width: `${Math.min(100, (ferocity / nextTier.ferocityRequired) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        <div className="tier-display">
          {allTiers.slice(0, 4).map((tier) => {
            const isActive = activeTiers.some((t) => t.id === tier.id);
            const isNext = nextTier?.id === tier.id;

            return (
              <div
                key={tier.id}
                className={`tier-item ${isActive ? 'active' : ''} ${isNext ? 'next' : ''}`}
              >
                <span className="tier-threshold">{tier.ferocityRequired}+</span>
                <span className="tier-name">{tier.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </BaseClassView>
  );
};

export default FuryView;
