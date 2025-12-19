import React from 'react';
import { MinionTemplate } from '../../types';
import { SummonConstraint } from '../../utils/summonerValidation';
import './MinionCard.css';

interface MinionCardProps {
  minion: MinionTemplate;
  isAffordable: boolean;
  actualCost: number;
  onSummon: () => void;
  onSelect: () => void;
  isSelected: boolean;
  blockReason?: string;
  failedConstraint?: SummonConstraint;
}

const MinionCard: React.FC<MinionCardProps> = ({
  minion,
  isAffordable,
  actualCost,
  onSummon,
  onSelect,
  isSelected,
  blockReason,
  failedConstraint,
}) => {
  // Get appropriate button text based on validation result
  const getButtonText = () => {
    if (isAffordable) return 'Summon';

    // Show specific reason if available
    if (blockReason) return blockReason;

    // Fallback based on constraint type
    switch (failedConstraint) {
      case 'essence':
        return `Need ${actualCost}★`;
      case 'maxMinions':
        return 'Max Minions';
      case 'maxSquads':
        return 'Max Squads';
      case 'squadSize':
        return 'Squad Full';
      default:
        return 'Cannot Summon';
    }
  };

  // Get constraint class for styling
  const getConstraintClass = () => {
    if (isAffordable) return '';
    return `constraint-${failedConstraint || 'unknown'}`;
  };

  return (
    <div
      className={`minion-card ${isSelected ? 'selected' : ''} ${!isAffordable ? 'unaffordable' : ''} ${getConstraintClass()}`}
      onClick={onSelect}
    >
      <div className="minion-header">
        <h4>{minion.name}</h4>
        <span className="essence-cost">{actualCost}★</span>
      </div>

      <div className="minion-role">{minion.role}</div>

      <div className="minion-quick-stats">
        <span>Speed: {minion.speed}</span>
        <span>HP: {Array.isArray(minion.stamina) ? minion.stamina.join('/') : minion.stamina}</span>
        <span>FS: {minion.freeStrike}</span>
      </div>

      <div className="minion-summon-info">
        Summons {minion.minionsPerSummon} {minion.minionsPerSummon === 1 ? 'minion' : 'minions'}
      </div>

      {minion.traits.length > 0 && (
        <div className="minion-trait-preview">
          {minion.traits[0].name}
        </div>
      )}

      <button
        className={`summon-button ${!isAffordable ? 'disabled' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (isAffordable) {
            onSummon();
          }
        }}
        disabled={!isAffordable}
        title={!isAffordable ? blockReason : `Summon ${minion.name} for ${actualCost} essence`}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default MinionCard;
