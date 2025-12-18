import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isTroubadourHero, TroubadourHero, TroubadourClass } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './TroubadourView.css';

// Class Act info
const CLASS_ACT_INFO: Record<TroubadourClass, { name: string; description: string }> = {
  auteur: {
    name: 'Auteur',
    description: 'Director of dramatic scenes and battlefield control',
  },
  duelist: {
    name: 'Duelist',
    description: 'Master of one-on-one combat with flair',
  },
  virtuoso: {
    name: 'Virtuoso',
    description: 'Expert performer with multiple routines',
  },
};

export const TroubadourView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  onUpdateHero,
}) => {
  if (!isTroubadourHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for TroubadourView</p>
      </div>
    );
  }

  const troubadourHero = hero as TroubadourHero;
  const drama = troubadourHero.heroicResource?.current ?? 0;
  const classAct = troubadourHero.subclass;
  const activeRoutine = troubadourHero.activeRoutine;
  const secondaryRoutine = troubadourHero.secondaryRoutine;

  const handleDramaChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, drama + delta);
      onUpdateHero({
        heroicResource: {
          ...troubadourHero.heroicResource,
          current: newValue,
        },
      } as Partial<TroubadourHero>);
    },
    [drama, troubadourHero.heroicResource, onUpdateHero]
  );

  const classActInfo = classAct ? CLASS_ACT_INFO[classAct] : null;

  return (
    <BaseClassView
      heroClass="troubadour"
      hero={hero}
      isInCombat={isInCombat}
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
      onUpdateHero={onUpdateHero}
    >
      {/* Drama Tracker */}
      <div className="resource-tracker drama-tracker">
        <span className="resource-tracker-label">Drama</span>
        <div className="resource-display">
          <span className="resource-current">{drama}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handleDramaChange(-1)} disabled={drama <= 0}>
            -
          </button>
          <button onClick={() => handleDramaChange(1)}>+</button>
        </div>
      </div>

      {/* Class Act Display */}
      {classActInfo && (
        <div className="class-feature-section">
          <h4 className="class-feature-title">Class Act</h4>
          <div className="class-act-badge">
            <span className="class-act-name">{classActInfo.name}</span>
            <span className="class-act-desc">{classActInfo.description}</span>
          </div>
        </div>
      )}

      {/* Active Routines */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Active Routines</h4>
        <div className="routines-list">
          {activeRoutine ? (
            <div className="routine-card active">
              <span className="routine-name">{activeRoutine.name}</span>
              <span className="routine-effect">{activeRoutine.effect}</span>
              {activeRoutine.auraDistance && (
                <span className="routine-aura">Aura {activeRoutine.auraDistance}</span>
              )}
            </div>
          ) : (
            <p className="placeholder">No routine active</p>
          )}
          {secondaryRoutine && (
            <div className="routine-card secondary">
              <span className="routine-label">Medley</span>
              <span className="routine-name">{secondaryRoutine.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scene Partners */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Scene Partners</h4>
        {troubadourHero.scenePartners?.length > 0 ? (
          <div className="partners-list">
            {troubadourHero.scenePartners.map((partner) => (
              <span key={partner.id} className="partner-badge">
                {partner.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="placeholder">No scene partners</p>
        )}
      </div>
    </BaseClassView>
  );
};

export default TroubadourView;
