import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isShadowHero, ShadowHero, ShadowCollege } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './ShadowView.css';

// College info
const COLLEGE_INFO: Record<ShadowCollege, { name: string; description: string }> = {
  'black-ash': {
    name: 'Black Ash',
    description: 'Master of fire and destruction',
  },
  'caustic-alchemy': {
    name: 'Caustic Alchemy',
    description: 'Expert in poisons and acids',
  },
  'harlequin-mask': {
    name: 'Harlequin Mask',
    description: 'Specialist in deception and misdirection',
  },
};

export const ShadowView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  onUpdateHero,
}) => {
  if (!isShadowHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for ShadowView</p>
      </div>
    );
  }

  const shadowHero = hero as ShadowHero;
  const insight = shadowHero.heroicResource?.current ?? 0;
  const college = shadowHero.subclass;
  const isHidden = shadowHero.isHidden ?? false;

  const handleInsightChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, insight + delta);
      onUpdateHero({
        heroicResource: {
          ...shadowHero.heroicResource,
          current: newValue,
        },
      } as Partial<ShadowHero>);
    },
    [insight, shadowHero.heroicResource, onUpdateHero]
  );

  const handleHiddenToggle = useCallback(() => {
    onUpdateHero({
      isHidden: !isHidden,
    } as Partial<ShadowHero>);
  }, [isHidden, onUpdateHero]);

  const collegeInfo = college ? COLLEGE_INFO[college] : null;

  return (
    <BaseClassView
      heroClass="shadow"
      hero={hero}
      isInCombat={isInCombat}
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
      onUpdateHero={onUpdateHero}
    >
      {/* Insight Tracker */}
      <div className="resource-tracker insight-tracker">
        <span className="resource-tracker-label">Insight</span>
        <div className="resource-display">
          <span className="resource-current">{insight}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handleInsightChange(-1)} disabled={insight <= 0}>
            -
          </button>
          <button onClick={() => handleInsightChange(1)}>+</button>
        </div>
      </div>

      {/* Hidden Status */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Stealth Status</h4>
        <button
          className={`hidden-toggle ${isHidden ? 'hidden' : 'visible'}`}
          onClick={handleHiddenToggle}
        >
          {isHidden ? '\uD83C\uDF11 Hidden' : '\uD83D\uDC41\uFE0F Visible'}
        </button>
      </div>

      {/* College Display */}
      {collegeInfo && (
        <div className="class-feature-section">
          <h4 className="class-feature-title">College</h4>
          <div className="college-badge">
            <span className="college-name">{collegeInfo.name}</span>
            <span className="college-desc">{collegeInfo.description}</span>
          </div>
        </div>
      )}

      {/* Shadow Techniques - TODO */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Shadow Techniques</h4>
        <p className="placeholder">Shadow techniques panel coming soon</p>
      </div>
    </BaseClassView>
  );
};

export default ShadowView;
