/**
 * EquipmentBonusDisplay - Shows stat bonuses from equipment
 *
 * Used in:
 * 1. Item selection to preview stat changes before equipping
 * 2. Equipment summary to show current bonuses
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getStatDisplayName } from '../../utils/statCalculator';
import type { DerivedStats } from '../../types/items';
import type { StatBonus } from '../../types/equipment';
import './EquipmentBonusDisplay.css';

// Props for showing stat difference (preview mode)
interface StatDiffDisplayProps {
  statDiff: Partial<Record<keyof DerivedStats, number>>;
  compact?: boolean;
}

/**
 * Shows the difference in stats when previewing an item
 */
export const StatDiffDisplay: React.FC<StatDiffDisplayProps> = ({ statDiff, compact = false }) => {
  // Filter out zero and undefined differences
  const significantDiffs = Object.entries(statDiff).filter(
    ([key, value]) => value !== undefined && value !== 0 && typeof value === 'number'
  ) as [string, number][];

  if (significantDiffs.length === 0) {
    return (
      <div className="stat-diff-display stat-diff-display--empty">
        <Minus className="stat-diff-icon" />
        <span>No stat changes</span>
      </div>
    );
  }

  return (
    <div className={`stat-diff-display ${compact ? 'stat-diff-display--compact' : ''}`}>
      {significantDiffs.map(([statKey, value]) => (
        <div
          key={statKey}
          className={`stat-diff-item ${value > 0 ? 'stat-diff-item--positive' : 'stat-diff-item--negative'}`}
        >
          {value > 0 ? (
            <TrendingUp className="stat-diff-icon stat-diff-icon--positive" />
          ) : (
            <TrendingDown className="stat-diff-icon stat-diff-icon--negative" />
          )}
          <span className="stat-diff-label">{getStatDisplayName(statKey)}</span>
          <span className="stat-diff-value">
            {value > 0 ? '+' : ''}{value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Props for showing item bonuses
interface ItemBonusDisplayProps {
  bonuses: StatBonus[];
  compact?: boolean;
}

/**
 * Shows the bonuses provided by an item
 */
export const ItemBonusDisplay: React.FC<ItemBonusDisplayProps> = ({ bonuses, compact = false }) => {
  if (!bonuses || bonuses.length === 0) {
    return null;
  }

  return (
    <div className={`item-bonus-display ${compact ? 'item-bonus-display--compact' : ''}`}>
      {bonuses.map((bonus, index) => (
        <div key={index} className="item-bonus-item">
          <span className="item-bonus-value">
            {bonus.value > 0 ? '+' : ''}{bonus.value}
          </span>
          <span className="item-bonus-label">{getStatDisplayName(bonus.stat)}</span>
          {bonus.conditional && (
            <span className="item-bonus-condition">({bonus.conditional})</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Props for showing equipment summary
interface EquipmentBonusSummaryProps {
  stamina: number;
  speed: number;
  stability: number;
  damage: number;
  savingThrows: number;
  showZeroValues?: boolean;
}

/**
 * Shows a summary of all active equipment bonuses
 */
export const EquipmentBonusSummary: React.FC<EquipmentBonusSummaryProps> = ({
  stamina,
  speed,
  stability,
  damage,
  savingThrows,
  showZeroValues = false,
}) => {
  const bonuses = [
    { label: 'Stamina', value: stamina },
    { label: 'Speed', value: speed },
    { label: 'Stability', value: stability },
    { label: 'Damage', value: damage },
    { label: 'Saves', value: savingThrows },
  ].filter((b) => showZeroValues || b.value !== 0);

  if (bonuses.length === 0) {
    return (
      <div className="equipment-bonus-summary equipment-bonus-summary--empty">
        No equipment bonuses active
      </div>
    );
  }

  return (
    <div className="equipment-bonus-summary">
      {bonuses.map((bonus) => (
        <div key={bonus.label} className="equipment-bonus-summary-item">
          <span className="equipment-bonus-summary-value">
            {bonus.value > 0 ? '+' : ''}{bonus.value}
          </span>
          <span className="equipment-bonus-summary-label">{bonus.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatDiffDisplay;
