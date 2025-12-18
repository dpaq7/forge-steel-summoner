import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isNullHero, NullHero, NullTradition, PsionicAugmentation } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './NullView.css';

// Tradition info
const TRADITION_INFO: Record<NullTradition, { name: string; description: string }> = {
  chronokinetic: {
    name: 'Chronokinetic',
    description: 'Manipulate time and temporal fields',
  },
  cryokinetic: {
    name: 'Cryokinetic',
    description: 'Control cold and entropy',
  },
  metakinetic: {
    name: 'Metakinetic',
    description: 'Shape raw psionic force',
  },
};

// Augmentation info
const AUGMENTATION_INFO: Record<PsionicAugmentation, { name: string; effect: string }> = {
  density: { name: 'Density', effect: '+1 Stability' },
  force: { name: 'Force', effect: '+1 damage with psionic attacks' },
  speed: { name: 'Speed', effect: '+1 Speed' },
};

export const NullView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  onUpdateHero,
}) => {
  if (!isNullHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for NullView</p>
      </div>
    );
  }

  const nullHero = hero as NullHero;
  const discipline = nullHero.heroicResource?.current ?? 0;
  const tradition = nullHero.subclass;
  const augmentation = nullHero.augmentation;
  const nullField = nullHero.nullField;
  const order = nullHero.order;

  const handleDisciplineChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, discipline + delta);
      onUpdateHero({
        heroicResource: {
          ...nullHero.heroicResource,
          current: newValue,
        },
      } as Partial<NullHero>);
    },
    [discipline, nullHero.heroicResource, onUpdateHero]
  );

  const handleNullFieldToggle = useCallback(() => {
    onUpdateHero({
      nullField: {
        ...nullField,
        isActive: !nullField?.isActive,
      },
    } as Partial<NullHero>);
  }, [nullField, onUpdateHero]);

  const traditionInfo = tradition ? TRADITION_INFO[tradition] : null;
  const augmentationInfo = augmentation ? AUGMENTATION_INFO[augmentation] : null;
  const fieldSize = (nullField?.baseSize ?? 1) + (nullField?.bonusSize ?? 0);

  return (
    <BaseClassView
      heroClass="null"
      hero={hero}
      isInCombat={isInCombat}
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
      onUpdateHero={onUpdateHero}
    >
      {/* Discipline Tracker */}
      <div className="resource-tracker discipline-tracker">
        <span className="resource-tracker-label">Discipline</span>
        <div className="resource-display">
          <span className="resource-current">{discipline}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handleDisciplineChange(-1)} disabled={discipline <= 0}>
            -
          </button>
          <button onClick={() => handleDisciplineChange(1)}>+</button>
        </div>
      </div>

      {/* Tradition & Augmentation */}
      <div className="null-traits">
        {traditionInfo && (
          <div className="trait-badge tradition">
            <span className="trait-name">{traditionInfo.name}</span>
            <span className="trait-desc">{traditionInfo.description}</span>
          </div>
        )}
        {augmentationInfo && (
          <div className="trait-badge augmentation">
            <span className="trait-name">{augmentationInfo.name}</span>
            <span className="trait-desc">{augmentationInfo.effect}</span>
          </div>
        )}
      </div>

      {/* Null Field */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Null Field</h4>
        <div className="null-field-controls">
          <button
            className={`field-toggle ${nullField?.isActive ? 'active' : ''}`}
            onClick={handleNullFieldToggle}
          >
            {nullField?.isActive ? `Active (Size ${fieldSize})` : 'Inactive'}
          </button>
          {nullField?.currentEnhancement && (
            <span className="field-enhancement">
              Enhancement: {nullField.currentEnhancement}
            </span>
          )}
        </div>
      </div>

      {/* Order (L10) */}
      {nullHero.level >= 10 && order && (
        <div className="class-feature-section">
          <h4 className="class-feature-title">Order (Epic)</h4>
          <div className="resource-display">
            <span className="resource-current">{order.current}</span>
          </div>
        </div>
      )}
    </BaseClassView>
  );
};

export default NullView;
