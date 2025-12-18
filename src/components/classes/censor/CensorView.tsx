import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isCensorHero, CensorHero } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './CensorView.css';

export const CensorView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
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
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
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

      {/* Pronouncements Panel - TODO */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Pronouncements</h4>
        <p className="placeholder">Pronouncements panel coming soon</p>
      </div>
    </BaseClassView>
  );
};

export default CensorView;
