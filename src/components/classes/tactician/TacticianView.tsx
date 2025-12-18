import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isTacticianHero, TacticianHero, TacticianDoctrine } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './TacticianView.css';

// Doctrine info
const DOCTRINE_INFO: Record<TacticianDoctrine, { name: string; description: string }> = {
  insurgent: {
    name: 'Insurgent',
    description: 'Guerrilla tactics and hit-and-run warfare',
  },
  mastermind: {
    name: 'Mastermind',
    description: 'Strategic planning and tactical superiority',
  },
  vanguard: {
    name: 'Vanguard',
    description: 'Leading from the front, inspiring allies',
  },
};

export const TacticianView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  onUpdateHero,
}) => {
  if (!isTacticianHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for TacticianView</p>
      </div>
    );
  }

  const tacticianHero = hero as TacticianHero;
  const focus = tacticianHero.heroicResource?.current ?? 0;
  const doctrine = tacticianHero.subclass;
  const markedTargets = tacticianHero.markedTargets || [];

  const handleFocusChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, focus + delta);
      onUpdateHero({
        heroicResource: {
          ...tacticianHero.heroicResource,
          current: newValue,
        },
      } as Partial<TacticianHero>);
    },
    [focus, tacticianHero.heroicResource, onUpdateHero]
  );

  const doctrineInfo = doctrine ? DOCTRINE_INFO[doctrine] : null;

  return (
    <BaseClassView
      heroClass="tactician"
      hero={hero}
      isInCombat={isInCombat}
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
      onUpdateHero={onUpdateHero}
    >
      {/* Focus Tracker */}
      <div className="resource-tracker focus-tracker">
        <span className="resource-tracker-label">Focus</span>
        <div className="resource-display">
          <span className="resource-current">{focus}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handleFocusChange(-1)} disabled={focus <= 0}>
            -
          </button>
          <button onClick={() => handleFocusChange(1)}>+</button>
        </div>
      </div>

      {/* Doctrine Display */}
      {doctrineInfo && (
        <div className="class-feature-section">
          <h4 className="class-feature-title">Doctrine</h4>
          <div className="doctrine-badge">
            <span className="doctrine-name">{doctrineInfo.name}</span>
            <span className="doctrine-desc">{doctrineInfo.description}</span>
          </div>
        </div>
      )}

      {/* Marked Targets */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Marked Targets</h4>
        {markedTargets.length > 0 ? (
          <div className="marked-targets-list">
            {markedTargets.map((target, idx) => (
              <span key={idx} className="marked-target">
                \uD83C\uDFAF {target}
              </span>
            ))}
          </div>
        ) : (
          <p className="placeholder">No targets marked</p>
        )}
      </div>

      {/* Commands Panel - TODO */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Commands</h4>
        <p className="placeholder">Commands panel coming soon</p>
      </div>
    </BaseClassView>
  );
};

export default TacticianView;
