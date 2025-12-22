import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isCensorHero, CensorHero } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './CensorView.css';

export const CensorView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  onUpdateHero,
}) => {
  if (!isCensorHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for CensorView</p>
      </div>
    );
  }

  const censorHero = hero as CensorHero;
  const wrath = censorHero.heroicResource?.current ?? 0;
  const subclass = censorHero.subclass;

  const handleWrathChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, wrath + delta);
      onUpdateHero({
        heroicResource: {
          ...censorHero.heroicResource,
          current: newValue,
        },
      } as Partial<CensorHero>);
    },
    [wrath, censorHero.heroicResource, onUpdateHero]
  );

  return (
    <BaseClassView
      heroClass="censor"
      hero={hero}
      isInCombat={isInCombat}
      onUpdateHero={onUpdateHero}
    >
      {/* Wrath Tracker */}
      <div className="resource-tracker wrath-tracker">
        <span className="resource-tracker-label">Wrath</span>
        <div className="resource-display">
          <span className="resource-current">{wrath}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handleWrathChange(-1)} disabled={wrath <= 0}>
            -
          </button>
          <button onClick={() => handleWrathChange(1)}>+</button>
        </div>
      </div>

      {/* Order Badge */}
      {subclass && (
        <div className="subclass-display">
          <span className="subclass-badge">{subclass}</span>
        </div>
      )}

      {/* Judgment Target */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Judgment</h4>
        <div className="class-feature-content">
          {censorHero.judgment?.targetName ? (
            <p>
              Target: <strong>{censorHero.judgment.targetName}</strong>
            </p>
          ) : (
            <p className="placeholder">No judgment target set</p>
          )}
        </div>
      </div>

      {/* Judgment Triggered Actions */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Judgment Actions (1 Wrath)</h4>
        <div className="triggered-actions-list">
          <div className="triggered-action">
            <span className="action-trigger">Adjacent judged creature shifts:</span>
            <span className="action-effect">Free strike + speed 0</span>
          </div>
          <div className="triggered-action">
            <span className="action-trigger">Judged creature makes power roll:</span>
            <span className="action-effect">Impose bane</span>
          </div>
          <div className="triggered-action">
            <span className="action-trigger">Judged creature uses 1-target ability:</span>
            <span className="action-effect">Reduce potency by 1</span>
          </div>
          <div className="triggered-action">
            <span className="action-trigger">Damage judged creature with melee:</span>
            <span className="action-effect">Taunted (EoNT)</span>
          </div>
        </div>
        <p className="class-feature-note">
          Free triggered action when judged creature uses main action: deal 2 × Presence holy damage
        </p>
      </div>
    </BaseClassView>
  );
};

export default CensorView;
