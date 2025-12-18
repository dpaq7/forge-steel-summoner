import React, { useCallback } from 'react';
import { useSummonerContext } from '../../../context/HeroContext';
import { useCombatContext } from '../../../context/CombatContext';
import {
  isNullHero,
  NullHero,
  NullTradition,
  PsionicAugmentation,
  NullFieldEnhancement,
} from '../../../types/hero';
import {
  NULL_TRADITIONS,
  getActiveThreshold,
  getActiveBenefits,
} from '../../../data/null/traditions';
import { PSIONIC_AUGMENTATIONS } from '../../../data/null/augmentations';
import { NULL_FIELD_ENHANCEMENTS } from '../../../data/null/enhancements';
import {
  NULL_LEVEL_FEATURES,
  calculateDisciplineGain,
  calculateTriggerGain,
} from '../../../data/null/features';
import { PSI_BOOST_OPTIONS, PsiBoostOption } from '../../../data/null/psi-boost';
import { TurnTracker } from '../../combat/TurnTracker';
import type { ConditionId } from '@/types/common';
import './NullFieldView.css';

/**
 * NullFieldView - Main view for Null class's Null Field tab
 * Displays Null Field management, Discipline Mastery, Tradition, and level features
 */
export const NullFieldView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();
  const { isInCombat, combatTurnNumber, onEndTurn } = useCombatContext();

  // Handle condition removal for TurnTracker
  const handleRemoveCondition = useCallback((conditionId: ConditionId) => {
    if (!hero) return;
    updateHero({
      activeConditions: hero.activeConditions.filter((c) => c.conditionId !== conditionId),
    });
  }, [hero, updateHero]);

  // Type guard - only render for Null heroes
  if (!hero || !isNullHero(hero)) {
    return (
      <div className="null-field-view null-field-view--empty">
        <p>This view is only available for Null heroes.</p>
      </div>
    );
  }

  const nullHero = hero as NullHero;
  const {
    heroicResource,
    subclass: tradition, // Renamed from tradition to subclass in types
    augmentation,
    order,
    level,
    characteristics,
  } = nullHero;

  // Provide defaults for nullField and inertialShield if not present (migration support)
  const nullField = nullHero.nullField ?? {
    isActive: false,
    baseSize: 1,
    bonusSize: 0,
    currentEnhancement: null,
    enhancementUsedThisTurn: false,
  };

  const inertialShield = nullHero.inertialShield ?? {
    usedThisRound: false,
    disciplineSpentOnPotencyReduction: 0,
    traditionBonusUsed: false,
  };

  const currentDiscipline = heroicResource?.current ?? 0;
  const activeThreshold = getActiveThreshold(currentDiscipline);
  const disciplineGain = calculateDisciplineGain(level);
  const triggerGain = calculateTriggerGain(level);

  // Get tradition-specific benefits if tradition is selected
  const activeBenefits = tradition ? getActiveBenefits(tradition, currentDiscipline) : [];
  const traditionData = tradition ? NULL_TRADITIONS[tradition] : null;
  const augmentationData = augmentation ? PSIONIC_AUGMENTATIONS[augmentation] : null;

  // Null Field toggle
  const handleToggleNullField = useCallback(() => {
    const currentNullField = nullHero.nullField ?? nullField;
    updateHero({
      nullField: {
        ...currentNullField,
        isActive: !currentNullField.isActive,
      },
    } as Partial<NullHero>);
  }, [nullHero.nullField, nullField, updateHero]);

  // Enhancement selection
  const handleSelectEnhancement = useCallback(
    (enhancement: NullFieldEnhancement) => {
      if (nullField.enhancementUsedThisTurn) return;
      if (currentDiscipline < 1) return;

      const currentNullField = nullHero.nullField ?? nullField;
      updateHero({
        nullField: {
          ...currentNullField,
          currentEnhancement: enhancement,
          enhancementUsedThisTurn: true,
        },
        heroicResource: {
          ...heroicResource,
          current: currentDiscipline - 1,
        },
      } as Partial<NullHero>);
    },
    [nullHero.nullField, nullField, heroicResource, currentDiscipline, updateHero]
  );

  // Clear enhancement (for turn reset)
  const handleClearEnhancement = useCallback(() => {
    const currentNullField = nullHero.nullField ?? nullField;
    updateHero({
      nullField: {
        ...currentNullField,
        currentEnhancement: null,
        enhancementUsedThisTurn: false,
      },
    } as Partial<NullHero>);
  }, [nullHero.nullField, nullField, updateHero]);

  // Inertial Shield usage toggle
  const handleToggleInertialShield = useCallback(() => {
    const currentShield = nullHero.inertialShield ?? inertialShield;
    updateHero({
      inertialShield: {
        ...currentShield,
        usedThisRound: !currentShield.usedThisRound,
      },
    } as Partial<NullHero>);
  }, [nullHero.inertialShield, inertialShield, updateHero]);

  // Reset round tracking (for new round)
  const handleNewRound = useCallback(() => {
    const currentNullField = nullHero.nullField ?? nullField;
    updateHero({
      nullField: {
        ...currentNullField,
        enhancementUsedThisTurn: false,
      },
      inertialShield: {
        usedThisRound: false,
        disciplineSpentOnPotencyReduction: 0,
        traditionBonusUsed: false,
      },
    } as Partial<NullHero>);
  }, [nullHero.nullField, nullField, updateHero]);

  // Discipline adjustment
  const handleDisciplineChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, currentDiscipline + delta);
      updateHero({
        heroicResource: {
          ...heroicResource,
          current: newValue,
        },
      } as Partial<NullHero>);
    },
    [heroicResource, currentDiscipline, updateHero]
  );

  // Calculate total field size
  const totalFieldSize = nullField.baseSize + nullField.bonusSize + (order?.fieldSizeBonus || 0);

  // Filter features by level
  const unlockedFeatures = NULL_LEVEL_FEATURES.filter((f) => f.level <= level);
  const lockedFeatures = NULL_LEVEL_FEATURES.filter((f) => f.level > level);

  return (
    <div className="null-field-view">
      {/* Turn Tracker - Only visible in combat */}
      <TurnTracker
        isInCombat={isInCombat}
        turnNumber={combatTurnNumber}
        conditions={hero.activeConditions}
        onEndTurn={onEndTurn}
        onRemoveCondition={handleRemoveCondition}
      />

      <header className="null-field-view__header">
        <h1 className="null-field-view__title">Null Field</h1>
        <p className="null-field-view__subtitle">
          Manage your psionic aura and Discipline Mastery
        </p>
      </header>

      <div className="null-field-view__content">
        {/* Tradition & Augmentation Display */}
        <section className="null-field-view__section null-field-view__section--identity">
          <div className="null-field-view__identity-row">
            {/* Tradition */}
            <div className="null-field-view__identity-card">
              <h3 className="null-field-view__identity-label">Tradition</h3>
              {traditionData ? (
                <>
                  <span className="null-field-view__identity-name">{traditionData.name}</span>
                  <p className="null-field-view__identity-focus">{traditionData.focus}</p>
                </>
              ) : (
                <span className="null-field-view__identity-name null-field-view__identity-name--none">
                  Not Selected
                </span>
              )}
            </div>

            {/* Augmentation */}
            <div className="null-field-view__identity-card">
              <h3 className="null-field-view__identity-label">Psionic Augmentation</h3>
              {augmentationData ? (
                <>
                  <span className="null-field-view__identity-name">{augmentationData.name}</span>
                  <ul className="null-field-view__augmentation-effects">
                    {augmentationData.effects.map((effect, i) => (
                      <li key={i}>{effect}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <span className="null-field-view__identity-name null-field-view__identity-name--none">
                  Not Selected
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Null Field Control */}
        <section className="null-field-view__section null-field-view__section--field">
          <div className="null-field-view__field-header">
            <h2 className="null-field-view__section-title">Null Field</h2>
            <button
              className={`null-field-view__field-toggle ${nullField.isActive ? 'active' : ''}`}
              onClick={handleToggleNullField}
            >
              {nullField.isActive ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>

          <div className="null-field-view__field-info">
            <div className="null-field-view__field-stat">
              <span className="null-field-view__field-stat-label">Size:</span>
              <span className="null-field-view__field-stat-value">
                {totalFieldSize}
                {nullField.bonusSize > 0 && (
                  <span className="null-field-view__field-bonus"> (+{nullField.bonusSize})</span>
                )}
              </span>
            </div>
            <div className="null-field-view__field-stat">
              <span className="null-field-view__field-stat-label">Effect:</span>
              <span className="null-field-view__field-stat-value">
                Enemies reduce potencies by 1
              </span>
            </div>
            {level >= 4 && (
              <div className="null-field-view__field-stat null-field-view__field-stat--enhanced">
                <span className="null-field-view__field-stat-label">Enhanced:</span>
                <span className="null-field-view__field-stat-value">
                  Suppresses supernatural terrain (level {level} or lower)
                </span>
              </div>
            )}
          </div>

          {/* Field Enhancements */}
          <div className="null-field-view__enhancements">
            <h3 className="null-field-view__enhancements-title">
              Field Enhancements
              <span className="null-field-view__enhancements-cost">(1 Discipline each)</span>
            </h3>
            <div className="null-field-view__enhancements-grid">
              {Object.values(NULL_FIELD_ENHANCEMENTS).map((enhancement) => {
                const isActive = nullField.currentEnhancement === enhancement.id;
                const canSelect =
                  !nullField.enhancementUsedThisTurn && currentDiscipline >= 1 && nullField.isActive;
                return (
                  <button
                    key={enhancement.id}
                    className={`null-field-view__enhancement ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectEnhancement(enhancement.id)}
                    disabled={!canSelect && !isActive}
                    title={enhancement.effect}
                  >
                    <span className="null-field-view__enhancement-icon">{enhancement.icon}</span>
                    <span className="null-field-view__enhancement-name">{enhancement.name}</span>
                  </button>
                );
              })}
            </div>
            {nullField.currentEnhancement && (
              <div className="null-field-view__active-enhancement">
                <span className="null-field-view__active-enhancement-text">
                  {NULL_FIELD_ENHANCEMENTS[nullField.currentEnhancement].icon}{' '}
                  {NULL_FIELD_ENHANCEMENTS[nullField.currentEnhancement].name} active
                </span>
                <span className="null-field-view__active-enhancement-duration">
                  (until start of next turn)
                </span>
                <button
                  className="null-field-view__clear-enhancement"
                  onClick={handleClearEnhancement}
                  title="Clear enhancement (new turn)"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Discipline Mastery */}
        <section className="null-field-view__section null-field-view__section--mastery">
          <h2 className="null-field-view__section-title">Discipline Mastery</h2>

          {/* Discipline Controls */}
          <div className="null-field-view__discipline-controls">
            <button
              className="null-field-view__discipline-btn"
              onClick={() => handleDisciplineChange(-1)}
              disabled={currentDiscipline <= 0}
            >
              -
            </button>
            <span className="null-field-view__discipline-value">{currentDiscipline}</span>
            <button
              className="null-field-view__discipline-btn"
              onClick={() => handleDisciplineChange(1)}
            >
              +
            </button>
          </div>

          {/* Threshold Progress Bar */}
          <div className="null-field-view__threshold-bar">
            <div
              className="null-field-view__threshold-fill"
              style={{ width: `${Math.min(100, (currentDiscipline / 12) * 100)}%` }}
            />
            {[4, 6, 8, 10, 12].map((threshold) => (
              <div
                key={threshold}
                className={`null-field-view__threshold-marker ${
                  currentDiscipline >= threshold ? 'reached' : ''
                }`}
                style={{ left: `${(threshold / 12) * 100}%` }}
              >
                <span className="null-field-view__threshold-label">{threshold}</span>
              </div>
            ))}
            <div
              className="null-field-view__threshold-current"
              style={{ left: `${Math.min(100, (currentDiscipline / 12) * 100)}%` }}
            />
          </div>

          {/* Discipline Mechanics */}
          <div className="null-field-view__discipline-info">
            <div className="null-field-view__discipline-mechanic">
              <span className="null-field-view__discipline-label">Start of Turn:</span>
              <span className="null-field-view__discipline-gain">+{disciplineGain} Discipline</span>
            </div>
            <div className="null-field-view__discipline-mechanic">
              <span className="null-field-view__discipline-label">Enemy Action Trigger:</span>
              <span className="null-field-view__discipline-gain">+{triggerGain} Discipline</span>
            </div>
          </div>

          {/* Active Benefits */}
          {tradition && (
            <div className="null-field-view__benefits">
              <h3 className="null-field-view__benefits-title">
                {traditionData?.name} Mastery Benefits
              </h3>
              <ul className="null-field-view__benefits-list">
                {traditionData?.masteryBenefits.map((benefit) => {
                  const isUnlocked = currentDiscipline >= benefit.threshold;
                  return (
                    <li
                      key={benefit.threshold}
                      className={`null-field-view__benefit ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <span className="null-field-view__benefit-threshold">
                        {benefit.threshold}+
                      </span>
                      <span className="null-field-view__benefit-text">{benefit.benefit}</span>
                      {isUnlocked && <span className="null-field-view__benefit-check">✓</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Inertial Shield */}
        <section className="null-field-view__section null-field-view__section--shield">
          <div className="null-field-view__shield-header">
            <h2 className="null-field-view__section-title">Inertial Shield</h2>
            <div className="null-field-view__shield-status">
              <span className="null-field-view__shield-label">Used this round:</span>
              <button
                className={`null-field-view__shield-toggle ${
                  inertialShield.usedThisRound ? 'used' : ''
                }`}
                onClick={handleToggleInertialShield}
              >
                {inertialShield.usedThisRound ? 'Yes' : 'No'}
              </button>
            </div>
          </div>
          <div className="null-field-view__shield-info">
            <p className="null-field-view__shield-effect">
              <strong>Trigger:</strong> When you take damage
            </p>
            <p className="null-field-view__shield-effect">
              <strong>Effect:</strong> Halve the damage taken
            </p>
            <p className="null-field-view__shield-effect">
              <strong>Spend 1 Discipline:</strong> Also reduce potency of associated effects by 1
            </p>
            {traditionData && (
              <p className="null-field-view__shield-tradition-bonus">
                <strong>Tradition Bonus:</strong> {traditionData.inertialShieldBonus}
              </p>
            )}
          </div>
          <button className="null-field-view__new-round-btn" onClick={handleNewRound}>
            New Round (Reset Tracking)
          </button>
        </section>

        {/* Psi Boost (L7+) */}
        {level >= 7 && (
          <section className="null-field-view__section null-field-view__section--psiboost">
            <h2 className="null-field-view__section-title">Psi Boost</h2>
            <p className="null-field-view__psiboost-desc">
              Spend Discipline to enhance psionic abilities
            </p>
            <div className="null-field-view__psiboost-options">
              {Object.values(PSI_BOOST_OPTIONS).map((boost) => {
                const canAfford = currentDiscipline >= boost.cost;
                return (
                  <div
                    key={boost.id}
                    className={`null-field-view__psiboost-option ${canAfford ? '' : 'unaffordable'}`}
                  >
                    <span className="null-field-view__psiboost-icon">{boost.icon}</span>
                    <span className="null-field-view__psiboost-name">{boost.name}</span>
                    <span className="null-field-view__psiboost-cost">{boost.cost} Disc</span>
                    <span className="null-field-view__psiboost-effect">{boost.effect}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Order (L10) */}
        {level >= 10 && order && (
          <section className="null-field-view__section null-field-view__section--order">
            <h2 className="null-field-view__section-title">Order (Epic Resource)</h2>
            <div className="null-field-view__order-display">
              <span className="null-field-view__order-value">{order.current}</span>
              <span className="null-field-view__order-label">Current Order</span>
            </div>
            <div className="null-field-view__order-info">
              <p>
                <strong>Gain:</strong> Upon respite, gain Order equal to XP gained
              </p>
              <p>
                <strong>Spend:</strong> Can spend Order as Discipline
              </p>
              <p>
                <strong>Combat Start:</strong> Spend 1 Order to increase Null Field size by 1
              </p>
            </div>
            <div className="null-field-view__order-abilities">
              <h3>Manifold Resonance</h3>
              <p>Teleport yourself and willing allies to known locations.</p>
              <p>Abilities used in the Null Field ignore banes and treat double banes as single banes.</p>
            </div>
          </section>
        )}

        {/* Level Features */}
        <section className="null-field-view__section null-field-view__section--features">
          <h2 className="null-field-view__section-title">Level Features</h2>
          <div className="null-field-view__features-list">
            {NULL_LEVEL_FEATURES.map((feature) => {
              const isUnlocked = level >= feature.level;
              return (
                <div
                  key={feature.name}
                  className={`null-field-view__feature ${isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="null-field-view__feature-header">
                    <span
                      className={`null-field-view__feature-level ${
                        feature.category === 'epic' ? 'epic' : ''
                      }`}
                    >
                      L{feature.level}
                    </span>
                    <span className="null-field-view__feature-name">{feature.name}</span>
                    {!isUnlocked && (
                      <span className="null-field-view__feature-locked-badge">Locked</span>
                    )}
                  </div>
                  <p className="null-field-view__feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tradition L5 Feature */}
        {tradition && level >= 5 && traditionData?.level5Feature && (
          <section className="null-field-view__section null-field-view__section--tradition-feature">
            <h2 className="null-field-view__section-title">
              {traditionData.name}: {traditionData.level5Feature.name}
            </h2>
            <p className="null-field-view__tradition-feature-desc">
              {traditionData.level5Feature.description}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default NullFieldView;
