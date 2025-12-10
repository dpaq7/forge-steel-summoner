import React from 'react';
import { MinionTemplate } from '../../types';

interface MinionCardProps {
  minion: MinionTemplate;
  isAffordable: boolean;
  actualCost: number;
  onSummon: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

const MinionCard: React.FC<MinionCardProps> = ({
  minion,
  isAffordable,
  actualCost,
  onSummon,
  onSelect,
  isSelected,
}) => {
  return (
    <div
      className={`minion-card ${isSelected ? 'selected' : ''} ${!isAffordable ? 'unaffordable' : ''}`}
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
        className="summon-button"
        onClick={(e) => {
          e.stopPropagation();
          onSummon();
        }}
        disabled={!isAffordable}
      >
        {isAffordable ? 'Summon' : 'Not Enough Essence'}
      </button>
    </div>
  );
};

export default MinionCard;
