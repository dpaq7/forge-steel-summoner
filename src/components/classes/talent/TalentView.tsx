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

      {/* Strain Mechanics */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Strain Mechanics</h4>
        <div className="triggered-actions-list">
          <div className="triggered-action">
            <span className="action-trigger">Negative Clarity:</span>
            <span className="action-effect">Can spend below 0 (to -{Math.abs(minimum)})</span>
          </div>
          <div className="triggered-action">
            <span className="action-trigger">End of turn while strained:</span>
            <span className="action-effect">Take damage = negative Clarity</span>
          </div>
          <div className="triggered-action">
            <span className="action-trigger">Strained abilities:</span>
            <span className="action-effect">Enhanced effects when Clarity &lt; 0</span>
          </div>
        </div>
        <p className="class-feature-note">
          Start of turn: gain 1d3 Clarity. First force move per round: +1 Clarity. Min Clarity = -(1 + Reason).
        </p>
      </div>
    </BaseClassView>
  );
};

export default TalentView;
