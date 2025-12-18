import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isTalentHero, TalentHero, TalentTradition } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './TalentView.css';

// Tradition info
const TRADITION_INFO: Record<TalentTradition, { name: string; description: string }> = {
  chronopathy: {
    name: 'Chronopathy',
    description: 'Seer of time who perceives past and future',
  },
  telekinesis: {
    name: 'Telekinesis',
    description: 'Move objects and creatures with thought',
  },
  telepathy: {
    name: 'Telepathy',
    description: 'Read minds and project psychic attacks',
  },
};

export const TalentView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  onUpdateHero,
}) => {
  if (!isTalentHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for TalentView</p>
      </div>
    );
  }

  const talentHero = hero as TalentHero;
  const clarity = talentHero.heroicResource?.current ?? 0;
  const minimum = talentHero.heroicResource?.minimum ?? -3;
  const tradition = talentHero.subclass;
  const isStrained = talentHero.isStrained ?? clarity < 0;

  const handleClarityChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(minimum, clarity + delta);
      const newIsStrained = newValue < 0;
      onUpdateHero({
        heroicResource: {
          ...talentHero.heroicResource,
          current: newValue,
        },
        isStrained: newIsStrained,
      } as Partial<TalentHero>);
    },
    [clarity, minimum, talentHero.heroicResource, onUpdateHero]
  );

  const traditionInfo = tradition ? TRADITION_INFO[tradition] : null;

  return (
    <BaseClassView
      heroClass="talent"
      hero={hero}
      isInCombat={isInCombat}
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
      onUpdateHero={onUpdateHero}
    >
      {/* Clarity Tracker */}
      <div className={`resource-tracker clarity-tracker ${isStrained ? 'strained' : ''}`}>
        <span className="resource-tracker-label">
          Clarity {isStrained && <span className="strained-badge">STRAINED</span>}
        </span>
        <div className="resource-display">
          <span className="resource-current">{clarity}</span>
          <span className="resource-separator">/</span>
          <span className="resource-max">min {minimum}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handleClarityChange(-1)} disabled={clarity <= minimum}>
            -
          </button>
          <button onClick={() => handleClarityChange(1)}>+</button>
        </div>
      </div>

      {/* Strain Warning */}
      {isStrained && (
        <div className="strain-warning">
          <span className="strain-icon">\u26A0\uFE0F</span>
          <span className="strain-text">
            Take {Math.abs(clarity)} psychic damage at end of turn!
          </span>
        </div>
      )}

      {/* Tradition Display */}
      {traditionInfo && (
        <div className="class-feature-section">
          <h4 className="class-feature-title">Tradition</h4>
          <div className="tradition-badge">
            <span className="tradition-name">{traditionInfo.name}</span>
            <span className="tradition-desc">{traditionInfo.description}</span>
          </div>
        </div>
      )}

      {/* Psionic Abilities - TODO */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Manifestations</h4>
        <p className="placeholder">Manifestations panel coming soon</p>
      </div>
    </BaseClassView>
  );
};

export default TalentView;
