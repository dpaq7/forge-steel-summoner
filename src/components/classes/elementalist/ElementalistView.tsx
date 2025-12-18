import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isElementalistHero, ElementalistHero, ElementalistElement } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './ElementalistView.css';

// Element info
const ELEMENT_INFO: Record<ElementalistElement, { name: string; icon: string; color: string }> = {
  earth: { name: 'Earth', icon: '\uD83C\uDF0D', color: '#8B4513' },
  fire: { name: 'Fire', icon: '\uD83D\uDD25', color: '#FF4500' },
  green: { name: 'Green', icon: '\uD83C\uDF3F', color: '#228B22' },
  void: { name: 'Void', icon: '\uD83C\uDF0C', color: '#4B0082' },
};

export const ElementalistView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  onUpdateHero,
}) => {
  if (!isElementalistHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for ElementalistView</p>
      </div>
    );
  }

  const elementalistHero = hero as ElementalistHero;
  const essence = elementalistHero.heroicResource?.current ?? 0;
  const persistent = elementalistHero.heroicResource?.persistent ?? 0;
  const availableEssence = essence - persistent;
  const element = elementalistHero.subclass;
  const mantleActive = elementalistHero.mantleActive ?? false;

  const handleEssenceChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, essence + delta);
      onUpdateHero({
        heroicResource: {
          ...elementalistHero.heroicResource,
          current: newValue,
        },
      } as Partial<ElementalistHero>);
    },
    [essence, elementalistHero.heroicResource, onUpdateHero]
  );

  const handleMantleToggle = useCallback(() => {
    onUpdateHero({
      mantleActive: !mantleActive,
    } as Partial<ElementalistHero>);
  }, [mantleActive, onUpdateHero]);

  const elementInfo = element ? ELEMENT_INFO[element] : null;

  return (
    <BaseClassView
      heroClass="elementalist"
      hero={hero}
      isInCombat={isInCombat}
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
      onUpdateHero={onUpdateHero}
    >
      {/* Essence Tracker */}
      <div className="resource-tracker essence-tracker">
        <span className="resource-tracker-label">Essence</span>
        <div className="resource-display">
          <span className="resource-current">{essence}</span>
          {persistent > 0 && (
            <span className="resource-persistent">({persistent} locked)</span>
          )}
        </div>
        <div className="resource-controls">
          <button onClick={() => handleEssenceChange(-1)} disabled={availableEssence <= 0}>
            -
          </button>
          <button onClick={() => handleEssenceChange(1)}>+</button>
        </div>
      </div>

      {/* Element Display */}
      {elementInfo && (
        <div
          className="element-display"
          style={{ '--element-color': elementInfo.color } as React.CSSProperties}
        >
          <span className="element-icon">{elementInfo.icon}</span>
          <span className="element-name">{elementInfo.name}</span>
        </div>
      )}

      {/* Mantle Toggle */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Elemental Mantle</h4>
        <button
          className={`mantle-toggle ${mantleActive ? 'active' : ''}`}
          onClick={handleMantleToggle}
        >
          {mantleActive ? 'Mantle Active' : 'Mantle Inactive'}
        </button>
      </div>

      {/* Persistent Effects Panel - TODO */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Persistent Effects</h4>
        {elementalistHero.persistentAbilities?.length > 0 ? (
          <div className="persistent-list">
            {elementalistHero.persistentAbilities.map((ability) => (
              <div key={ability.abilityId} className="persistent-item">
                <span className="persistent-name">{ability.abilityName}</span>
                <span className="persistent-cost">-{ability.essenceLocked} Essence</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="placeholder">No persistent effects active</p>
        )}
      </div>
    </BaseClassView>
  );
};

export default ElementalistView;
