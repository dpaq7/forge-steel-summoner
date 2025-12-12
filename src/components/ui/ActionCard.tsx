import { useState, useCallback } from 'react';
import { useRollHistory } from '../../context/RollHistoryContext';
import { ActionType, ActionTag, Characteristic, TierResult, ActionRollResult } from '../../types/action';
import { Characteristics } from '../../types';
import './ActionCard.css';

interface PowerRoll {
  characteristic: Characteristic;
  bonus?: number;
  tiers: TierResult[];
}

interface ActionCardProps {
  id: string;
  name: string;
  type: ActionType;
  tags: ActionTag[];
  cost: number | string;
  costType?: 'essence' | 'recovery' | 'surge' | 'other';
  target?: string;
  distance?: string;
  area?: string;
  powerRoll?: PowerRoll;
  effect?: string;
  trigger?: string;
  keywords: string[];
  notes?: string;

  // Interaction
  characteristicValues?: Characteristics;
  onRoll?: (result: ActionRollResult) => void;
  isCompact?: boolean;
  className?: string;
}

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  main: 'Main Action',
  maneuver: 'Maneuver',
  triggered: 'Triggered Action',
  free: 'Free Triggered Action',
  heroic: 'Heroic Ability',
  signature: 'Signature Ability',
  villain: 'Villain Action',
  utility: 'Action',
};

const COST_ICONS: Record<string, string> = {
  essence: '✦',
  recovery: '⟲',
  surge: '⚡',
  other: '',
};

export const ActionCard = ({
  id,
  name,
  type,
  tags,
  cost,
  costType,
  target,
  distance,
  area,
  powerRoll,
  effect,
  trigger,
  keywords,
  notes,
  characteristicValues,
  onRoll,
  isCompact = false,
  className = '',
}: ActionCardProps) => {
  const { addRoll } = useRollHistory();
  const [isExpanded, setIsExpanded] = useState(!isCompact);
  const [lastRollResult, setLastRollResult] = useState<number | null>(null);

  // Handle power roll
  const handleRoll = useCallback(() => {
    if (!powerRoll) return;

    // Roll 2d10
    const die1 = Math.floor(Math.random() * 10) + 1;
    const die2 = Math.floor(Math.random() * 10) + 1;
    const characteristicBonus = characteristicValues?.[powerRoll.characteristic] || 0;
    const total = die1 + die2 + characteristicBonus + (powerRoll.bonus || 0);

    // Determine tier based on total
    let tier: 1 | 2 | 3;
    if (total >= 17) tier = 3;
    else if (total >= 12) tier = 2;
    else tier = 1;

    const result: ActionRollResult = {
      type: 'power',
      dice: [die1, die2],
      characteristic: powerRoll.characteristic,
      characteristicBonus,
      additionalBonus: powerRoll.bonus || 0,
      total,
      tier,
      tierEffect: powerRoll.tiers.find(t => t.tier === tier)?.effect,
      actionName: name,
      timestamp: Date.now(),
    };

    setLastRollResult(total);
    onRoll?.(result);

    // Add to roll history
    addRoll({
      naturalRoll: die1 + die2,
      dice: [die1, die2],
      modifier: characteristicBonus + (powerRoll.bonus || 0),
      total,
      tier,
      hadEdge: false,
      hadBane: false,
      timestamp: Date.now(),
    }, name, 'ability');

    // Clear result highlight after 3 seconds
    setTimeout(() => setLastRollResult(null), 3000);
  }, [powerRoll, characteristicValues, name, onRoll, addRoll]);

  // Get current tier for highlighting
  const getCurrentTier = (): 1 | 2 | 3 | null => {
    if (lastRollResult === null) return null;
    if (lastRollResult >= 17) return 3;
    if (lastRollResult >= 12) return 2;
    return 1;
  };

  const currentTier = getCurrentTier();

  return (
    <div
      className={`action-card action-${type} ${isExpanded ? 'expanded' : 'compact'} ${className}`}
      data-type={type}
    >
      {/* Card Border */}
      <div className="action-card-border" />

      {/* Card Content */}
      <div className="action-card-content">

        {/* Header Row */}
        <div className="action-card-header">
          <div className="header-left">
            <span className="action-type-label">{ACTION_TYPE_LABELS[type]}</span>
            <h3 className="action-name">{name}</h3>
          </div>

          {/* Cost Box */}
          <div className="action-cost-box">
            {costType && <span className="cost-icon">{COST_ICONS[costType]}</span>}
            <span className="cost-value">{cost}</span>
            {costType && <span className="cost-label">{costType}</span>}
          </div>
        </div>

        {/* Tags Row */}
        <div className="action-tags-row">
          {(['freeStrike', 'signature', 'heroic', 'other'] as const).map((tag) => (
            <span
              key={tag}
              className={`action-tag ${tags.includes(tag) ? 'active' : ''}`}
            >
              <span className="tag-diamond">{tags.includes(tag) ? '◆' : '◇'}</span>
              <span className="tag-label">
                {tag === 'freeStrike' ? 'Free Strike' : tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            </span>
          ))}
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="action-card-body">

            {/* Trigger (for triggered actions) */}
            {trigger && (
              <div className="action-field trigger-field">
                <span className="field-label">Trigger</span>
                <span className="field-separator">───</span>
                <span className="field-value">{trigger}</span>
              </div>
            )}

            {/* Target */}
            {target && (
              <div className="action-field">
                <span className="field-label">Target</span>
                <span className="field-separator">───</span>
                <span className="field-value">{target}</span>
              </div>
            )}

            {/* Distance */}
            {distance && (
              <div className="action-field">
                <span className="field-label">Distance</span>
                <span className="field-separator">───</span>
                <span className="field-value">{distance}</span>
              </div>
            )}

            {/* Area */}
            {area && (
              <div className="action-field">
                <span className="field-label">Area</span>
                <span className="field-separator">───</span>
                <span className="field-value">{area}</span>
              </div>
            )}

            {/* Power Roll */}
            {powerRoll && (
              <div className="action-power-roll">
                <div className="power-roll-header">
                  <span className="field-label">Power Roll</span>
                  <span className="power-roll-formula">
                    2d10 + {powerRoll.characteristic.charAt(0).toUpperCase() + powerRoll.characteristic.slice(1)}
                    {powerRoll.bonus ? ` + ${powerRoll.bonus}` : ''}
                  </span>
                  <button
                    className="roll-button"
                    onClick={handleRoll}
                    title="Roll Power Roll"
                  >
                    🎲 Roll
                  </button>
                </div>

                <div className="power-roll-tiers">
                  {powerRoll.tiers.map((tierResult) => (
                    <div
                      key={tierResult.tier}
                      className={`tier-result tier-${tierResult.tier} ${currentTier === tierResult.tier ? 'active' : ''}`}
                    >
                      <span className="tier-badge">
                        Tier {tierResult.tier}
                        <span className="tier-threshold">({tierResult.threshold})</span>
                      </span>
                      <span className="tier-effect">{tierResult.effect}</span>
                    </div>
                  ))}
                </div>

                {lastRollResult !== null && (
                  <div className={`roll-result tier-${currentTier}`}>
                    Result: <strong>{lastRollResult}</strong> — Tier {currentTier}
                  </div>
                )}
              </div>
            )}

            {/* Effect */}
            {effect && (
              <div className="action-effect">
                <span className="effect-label">Effect:</span>
                <span className="effect-text">{effect}</span>
              </div>
            )}

            {/* Notes */}
            {notes && (
              <div className="action-notes">
                <span className="notes-text">{notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Keywords Footer */}
        <div className="action-keywords">
          <span className="keywords-label">Keywords:</span>
          <span className="keywords-list">
            {keywords.length > 0 ? keywords.join(', ') : '—'}
          </span>
        </div>

        {/* Expand/Collapse Toggle (for compact mode) */}
        {isCompact && (
          <button
            className="expand-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionCard;
