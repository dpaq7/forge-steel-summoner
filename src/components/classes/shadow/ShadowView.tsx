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

      {/* Hesitation Is Weakness */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Hesitation Is Weakness (1 Insight)</h4>
        <div className="triggered-actions-list">
          <div className="triggered-action">
            <span className="action-trigger">After ally ends turn:</span>
            <span className="action-effect">Take your turn immediately</span>
          </div>
        </div>
        <p className="class-feature-note">
          Start of turn: gain 1d3 Insight. First surge damage per round: +1 Insight. Edge/double edge: -1/-2 Insight cost.
        </p>
      </div>
    </BaseClassView>
  );
};

export default ShadowView;
