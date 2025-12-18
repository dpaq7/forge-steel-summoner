import React, { useCallback, useState } from 'react';
import { useSummonerContext } from '../../../context/HeroContext';
import { useCombatContext } from '../../../context/CombatContext';
import {
  isTroubadourHero,
  TroubadourHero,
  TroubadourClass,
  Routine,
  ScenePartner,
} from '../../../types/hero';
import {
  getRoutinesForClassAct,
  getRoutinesGroupedBySource,
  canUseMedley,
  RoutineDefinition,
} from '../../../data/troubadour/routines';
import { classActDefinitions, TroubadourClassAct } from '../../../data/troubadour/subclasses';
import { getFeaturesForLevel, SubclassFeature } from '../../../data/troubadour/features';
import { TurnTracker } from '../../combat/TurnTracker';
import type { ConditionId } from '@/types/common';
import './RoutinesView.css';

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * RoutinesView - Main view for Troubadour class's Routines tab
 * Displays active routines, routine selection, scene partners, and drama mechanics
 */
export const RoutinesView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();
  const { isInCombat, combatTurnNumber, onEndTurn } = useCombatContext();

  // Local state for scene partner input
  const [newPartnerName, setNewPartnerName] = useState('');
  const [showAddPartner, setShowAddPartner] = useState(false);

  // Handle condition removal for TurnTracker
  const handleRemoveCondition = useCallback((conditionId: ConditionId) => {
    if (!hero) return;
    updateHero({
      activeConditions: hero.activeConditions.filter((c) => c.conditionId !== conditionId),
    });
  }, [hero, updateHero]);

  // Type guard - only render for Troubadour heroes
  if (!hero || !isTroubadourHero(hero)) {
    return (
      <div className="routines-view routines-view--empty">
        <p>This view is only available for Troubadour heroes.</p>
      </div>
    );
  }

  const troubadourHero = hero as TroubadourHero;
  const {
    heroicResource,
    subclass,
    activeRoutine,
    secondaryRoutine,
    scenePartners,
    heroPartners,
    level,
    characteristics,
  } = troubadourHero;

  const currentDrama = heroicResource?.current ?? 0;
  const presenceScore = characteristics?.presence ?? 0;
  const classAct = subclass as TroubadourClassAct | undefined;

  // Get available routines
  const availableRoutines = getRoutinesForClassAct(classAct, level);
  const groupedRoutines = getRoutinesGroupedBySource(classAct, level);
  const hasMedley = canUseMedley(classAct, level);
  const hasEqualBilling = level >= 7;

  // Get class act data
  const classActData = classAct ? classActDefinitions[classAct] : null;

  // Get unlocked features for display
  const unlockedFeatures = classAct ? getFeaturesForLevel(classAct, level) : [];

  // Drama adjustment
  const handleDramaChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, currentDrama + delta);
      updateHero({
        heroicResource: {
          ...heroicResource,
          current: newValue,
        },
      } as Partial<TroubadourHero>);
    },
    [heroicResource, currentDrama, updateHero]
  );

  // Convert routine definition to Routine type
  const routineToState = (def: RoutineDefinition): Routine => ({
    id: def.id,
    name: def.name,
    effect: def.effect,
    auraDistance: def.auraDistance,
    rangedDistance: def.rangedDistance,
  });

  // Select primary routine
  const handleSelectRoutine = useCallback(
    (routine: RoutineDefinition) => {
      // If selecting the same routine, deselect it
      if (activeRoutine?.id === routine.id) {
        updateHero({
          activeRoutine: null,
          secondaryRoutine: null, // Clear secondary when primary is cleared
        } as Partial<TroubadourHero>);
        return;
      }

      // If this routine is the secondary, swap them
      if (secondaryRoutine?.id === routine.id) {
        updateHero({
          activeRoutine: routineToState(routine),
          secondaryRoutine: activeRoutine,
        } as Partial<TroubadourHero>);
        return;
      }

      updateHero({
        activeRoutine: routineToState(routine),
      } as Partial<TroubadourHero>);
    },
    [activeRoutine, secondaryRoutine, updateHero]
  );

  // Select secondary routine (Medley)
  const handleSelectSecondaryRoutine = useCallback(
    (routine: RoutineDefinition) => {
      if (!hasMedley) return;

      // Can't select same as primary
      if (activeRoutine?.id === routine.id) return;

      // If selecting the same secondary, deselect it
      if (secondaryRoutine?.id === routine.id) {
        updateHero({
          secondaryRoutine: null,
        } as Partial<TroubadourHero>);
        return;
      }

      updateHero({
        secondaryRoutine: routineToState(routine),
      } as Partial<TroubadourHero>);
    },
    [activeRoutine, secondaryRoutine, hasMedley, updateHero]
  );

  // Clear all routines
  const handleClearRoutines = useCallback(() => {
    updateHero({
      activeRoutine: null,
      secondaryRoutine: null,
    } as Partial<TroubadourHero>);
  }, [updateHero]);

  // Add scene partner
  const handleAddScenePartner = useCallback(() => {
    if (!newPartnerName.trim()) return;
    if (scenePartners.length >= 10) return; // Reasonable limit

    const newPartner: ScenePartner = {
      id: generateId(),
      name: newPartnerName.trim(),
      bondedAt: level,
    };

    updateHero({
      scenePartners: [...scenePartners, newPartner],
    } as Partial<TroubadourHero>);

    setNewPartnerName('');
    setShowAddPartner(false);
  }, [newPartnerName, scenePartners, level, updateHero]);

  // Remove scene partner
  const handleRemoveScenePartner = useCallback(
    (partnerId: string) => {
      updateHero({
        scenePartners: scenePartners.filter((p) => p.id !== partnerId),
      } as Partial<TroubadourHero>);
    },
    [scenePartners, updateHero]
  );

  // Render routine card
  const renderRoutineCard = (routine: RoutineDefinition) => {
    const isPrimary = activeRoutine?.id === routine.id;
    const isSecondary = secondaryRoutine?.id === routine.id;
    const isActive = isPrimary || isSecondary;

    return (
      <div
        key={routine.id}
        className={`routines-view__routine-card ${isPrimary ? 'primary' : ''} ${isSecondary ? 'secondary' : ''}`}
        onClick={() => handleSelectRoutine(routine)}
      >
        <div className="routines-view__routine-header">
          <span className="routines-view__routine-name">{routine.name}</span>
          {isActive && (
            <span className={`routines-view__routine-badge ${isPrimary ? 'primary' : 'secondary'}`}>
              {isPrimary ? 'Primary' : 'Secondary'}
            </span>
          )}
        </div>
        <div className="routines-view__routine-meta">
          {routine.auraDistance !== null ? (
            <span className="routines-view__aura-badge">Aura {routine.auraDistance}</span>
          ) : routine.rangedDistance ? (
            <span className="routines-view__range-badge">Range {routine.rangedDistance}</span>
          ) : null}
          <span className="routines-view__routine-source">
            {routine.source === 'base' ? 'Base' : classActData?.name || routine.source}
          </span>
        </div>
        <p className="routines-view__routine-effect">{routine.effect}</p>
        {routine.endOfTurnEffect && (
          <p className="routines-view__routine-trigger">
            <strong>End of Turn:</strong> {routine.endOfTurnEffect}
          </p>
        )}
        {hasMedley && !isPrimary && activeRoutine && (
          <button
            className="routines-view__secondary-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectSecondaryRoutine(routine);
            }}
            disabled={activeRoutine?.id === routine.id}
          >
            {isSecondary ? 'Remove Secondary' : 'Set as Secondary'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="routines-view">
      {/* Turn Tracker - Only visible in combat */}
      <TurnTracker
        isInCombat={isInCombat}
        turnNumber={combatTurnNumber}
        conditions={hero.activeConditions}
        onEndTurn={onEndTurn}
        onRemoveCondition={handleRemoveCondition}
      />

      <header className="routines-view__header">
        <h1 className="routines-view__title">Routines</h1>
        <p className="routines-view__subtitle">
          Manage your active performances and scene partners
        </p>
      </header>

      <div className="routines-view__content">
        {/* Class Act Display */}
        <section className="routines-view__section routines-view__section--classact">
          <div className="routines-view__classact-card">
            <h3 className="routines-view__classact-label">Class Act</h3>
            {classActData ? (
              <>
                <span className="routines-view__classact-name">{classActData.name}</span>
                <p className="routines-view__classact-theme">{classActData.theme}</p>
                <p className="routines-view__classact-desc">{classActData.description}</p>
              </>
            ) : (
              <span className="routines-view__classact-name routines-view__classact-name--none">
                Not Selected
              </span>
            )}
          </div>
        </section>

        {/* Drama Tracker */}
        <section className="routines-view__section routines-view__section--drama">
          <h2 className="routines-view__section-title">Drama</h2>
          <div className="routines-view__drama-controls">
            <button
              className="routines-view__drama-btn"
              onClick={() => handleDramaChange(-1)}
              disabled={currentDrama <= 0}
            >
              -
            </button>
            <span className={`routines-view__drama-value ${currentDrama >= 30 ? 'resurrection' : ''}`}>
              {currentDrama}
            </span>
            <button
              className="routines-view__drama-btn"
              onClick={() => handleDramaChange(1)}
            >
              +
            </button>
          </div>
          {currentDrama >= 30 && (
            <div className="routines-view__resurrection-alert">
              You can resurrect a dead ally!
            </div>
          )}
          <div className="routines-view__drama-triggers">
            <h4>Drama Gain Triggers:</h4>
            <ul className="routines-view__trigger-list">
              <li><span className="trigger-event">Start of Turn</span> <span className="trigger-amount">+1d3</span></li>
              <li><span className="trigger-event">3+ heroes act same turn</span> <span className="trigger-amount">+2</span></li>
              <li><span className="trigger-event">Ally becomes winded</span> <span className="trigger-amount">+2</span></li>
              <li><span className="trigger-event">Natural 19-20 on power roll</span> <span className="trigger-amount">+3</span></li>
              <li><span className="trigger-event">Ally dies</span> <span className="trigger-amount">+10</span></li>
            </ul>
          </div>
        </section>

        {/* Active Performance */}
        <section className="routines-view__section routines-view__section--active">
          <div className="routines-view__section-header">
            <h2 className="routines-view__section-title">Active Performance</h2>
            {(activeRoutine || secondaryRoutine) && (
              <button className="routines-view__clear-btn" onClick={handleClearRoutines}>
                End Performance
              </button>
            )}
          </div>

          {activeRoutine ? (
            <div className="routines-view__active-display">
              <div className="routines-view__active-routine primary">
                <div className="routines-view__active-header">
                  <span className="routines-view__active-label">Primary Routine</span>
                  <span className="routines-view__active-name">{activeRoutine.name}</span>
                </div>
                {activeRoutine.auraDistance !== null && (
                  <span className="routines-view__active-aura">Aura {activeRoutine.auraDistance}</span>
                )}
                <p className="routines-view__active-effect">{activeRoutine.effect}</p>
              </div>

              {secondaryRoutine && hasMedley && (
                <div className="routines-view__active-routine secondary">
                  <div className="routines-view__active-header">
                    <span className="routines-view__active-label">Secondary (Medley)</span>
                    <span className="routines-view__active-name">{secondaryRoutine.name}</span>
                  </div>
                  {secondaryRoutine.auraDistance !== null && (
                    <span className="routines-view__active-aura">Aura {secondaryRoutine.auraDistance}</span>
                  )}
                  <p className="routines-view__active-effect">{secondaryRoutine.effect}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="routines-view__no-routine">
              <p>No active routine. Select a routine below to begin your performance.</p>
            </div>
          )}

          {hasMedley && (
            <div className="routines-view__medley-note">
              <strong>Medley (Level 5):</strong> You can maintain two routines simultaneously.
            </div>
          )}
        </section>

        {/* Available Routines */}
        <section className="routines-view__section routines-view__section--routines">
          <h2 className="routines-view__section-title">Available Routines</h2>

          {/* Base Routines */}
          <div className="routines-view__routine-group">
            <h3 className="routines-view__group-title">Base Routines</h3>
            <div className="routines-view__routines-grid">
              {groupedRoutines.base.map(renderRoutineCard)}
            </div>
          </div>

          {/* Class Act Routines */}
          {classAct && groupedRoutines.classAct.length > 0 && (
            <div className="routines-view__routine-group">
              <h3 className="routines-view__group-title">{classActData?.name} Routines</h3>
              <div className="routines-view__routines-grid">
                {groupedRoutines.classAct.map(renderRoutineCard)}
              </div>
            </div>
          )}

          {!classAct && (
            <p className="routines-view__no-classact-note">
              Select a Class Act to unlock additional routines.
            </p>
          )}
        </section>

        {/* Scene Partners */}
        <section className="routines-view__section routines-view__section--partners">
          <div className="routines-view__section-header">
            <h2 className="routines-view__section-title">Scene Partners</h2>
            <button
              className="routines-view__add-partner-btn"
              onClick={() => setShowAddPartner(!showAddPartner)}
            >
              {showAddPartner ? 'Cancel' : '+ Add Partner'}
            </button>
          </div>

          <p className="routines-view__partners-desc">
            Scene partners are NPCs you've bonded with during negotiation. You gain benefits when interacting with them.
          </p>

          {showAddPartner && (
            <div className="routines-view__add-partner-form">
              <input
                type="text"
                className="routines-view__partner-input"
                placeholder="Partner name"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddScenePartner()}
              />
              <button
                className="routines-view__confirm-add-btn"
                onClick={handleAddScenePartner}
                disabled={!newPartnerName.trim()}
              >
                Add
              </button>
            </div>
          )}

          {scenePartners.length > 0 ? (
            <div className="routines-view__partners-list">
              {scenePartners.map((partner) => (
                <div key={partner.id} className="routines-view__partner-item">
                  <span className="routines-view__partner-name">{partner.name}</span>
                  <span className="routines-view__partner-bonded">Bonded at L{partner.bondedAt}</span>
                  <button
                    className="routines-view__remove-partner-btn"
                    onClick={() => handleRemoveScenePartner(partner.id)}
                    title="Remove partner"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="routines-view__no-partners">No scene partners yet.</p>
          )}
        </section>

        {/* Equal Billing (Level 7+) */}
        {hasEqualBilling && (
          <section className="routines-view__section routines-view__section--equalbilling">
            <h2 className="routines-view__section-title">Equal Billing</h2>
            <p className="routines-view__equalbilling-desc">
              <strong>Level 7 Feature:</strong> You can bond with other heroes in your party.
              When you start your turn adjacent to a hero partner, you both gain +1 Drama.
            </p>
            <p className="routines-view__hero-partners-count">
              Hero Partners: {heroPartners.length}
            </p>
          </section>
        )}

        {/* Class Act Features */}
        {classAct && unlockedFeatures.length > 0 && (
          <section className="routines-view__section routines-view__section--features">
            <h2 className="routines-view__section-title">{classActData?.name} Features</h2>
            <div className="routines-view__features-list">
              {unlockedFeatures.map((feature) => (
                <div key={feature.id} className="routines-view__feature">
                  <div className="routines-view__feature-header">
                    <span className="routines-view__feature-level">L{feature.level}</span>
                    <span className="routines-view__feature-name">{feature.name}</span>
                    <span className={`routines-view__feature-type ${feature.type}`}>
                      {feature.type.replace('-', ' ')}
                    </span>
                    {feature.dramaCost && (
                      <span className="routines-view__feature-cost">{feature.dramaCost} Drama</span>
                    )}
                  </div>
                  <p className="routines-view__feature-desc">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Potency Reference */}
        <section className="routines-view__section routines-view__section--potency">
          <h2 className="routines-view__section-title">Potency</h2>
          <div className="routines-view__potency-display">
            <span className="routines-view__potency-label">Presence Score</span>
            <span className="routines-view__potency-value">
              {presenceScore >= 0 ? `+${presenceScore}` : presenceScore}
            </span>
          </div>
          <p className="routines-view__potency-desc">
            Your Presence characteristic determines the potency of your abilities
            and the number of targets for effects like Revitalizing Limerick.
          </p>
        </section>
      </div>
    </div>
  );
};

export default RoutinesView;
