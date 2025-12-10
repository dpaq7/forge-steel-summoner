import React, { useState } from 'react';
import { Ability, Characteristic } from '../../types';
import { PowerRollResult, getTierColor, performPowerRoll, RollModifier } from '../../utils/dice';
import './AbilityCard.css';

interface AbilityCardProps {
  ability: Ability;
  characteristics: Record<Characteristic, number>;
  onRoll?: (ability: Ability, result: PowerRollResult) => void;
  expanded?: boolean;
}

const AbilityCard: React.FC<AbilityCardProps> = ({
  ability,
  characteristics,
  onRoll,
  expanded: initialExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [rollResult, setRollResult] = useState<PowerRollResult | null>(null);
  const [rollModifier, setRollModifier] = useState<RollModifier>('normal');
  const [isRolling, setIsRolling] = useState(false);

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'action':
        return 'A';
      case 'maneuver':
        return 'M';
      case 'freeManeuver':
        return 'F';
      case 'triggered':
        return 'T';
      case 'freeTriggered':
        return 'FT';
      default:
        return '?';
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case 'action':
        return 'Action';
      case 'maneuver':
        return 'Maneuver';
      case 'freeManeuver':
        return 'Free Maneuver';
      case 'triggered':
        return 'Triggered';
      case 'freeTriggered':
        return 'Free Triggered';
      default:
        return actionType;
    }
  };

  const handleRoll = () => {
    if (!ability.powerRoll) return;

    setIsRolling(true);
    setTimeout(() => {
      const charValue = characteristics[ability.powerRoll!.characteristic];
      const result = performPowerRoll(charValue, rollModifier);
      setRollResult(result);
      setIsRolling(false);
      onRoll?.(ability, result);
    }, 300);
  };

  const cycleModifier = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modifiers: RollModifier[] = ['normal', 'edge', 'bane'];
    const currentIndex = modifiers.indexOf(rollModifier);
    const nextIndex = (currentIndex + 1) % modifiers.length;
    setRollModifier(modifiers[nextIndex]);
  };

  const getModifierClass = () => {
    if (rollModifier === 'edge') return 'edge';
    if (rollModifier === 'bane') return 'bane';
    return '';
  };

  const getModifierLabel = () => {
    if (rollModifier === 'edge') return 'Edge';
    if (rollModifier === 'bane') return 'Bane';
    return 'Normal';
  };

  const getTierResult = () => {
    if (!rollResult || !ability.powerRoll) return null;
    switch (rollResult.tier) {
      case 1:
        return ability.powerRoll.tier1;
      case 2:
        return ability.powerRoll.tier2;
      case 3:
        return ability.powerRoll.tier3;
    }
  };

  return (
    <div className={`ability-card ${expanded ? 'expanded' : ''}`}>
      <div className="ability-header" onClick={() => setExpanded(!expanded)}>
        <div className="ability-action-type" title={getActionTypeLabel(ability.actionType)}>
          {getActionTypeIcon(ability.actionType)}
        </div>
        <div className="ability-title">
          <h4>{ability.name}</h4>
          {ability.essenceCost && (
            <span className="essence-cost">{ability.essenceCost} Essence</span>
          )}
        </div>
        <div className="ability-expand-icon">{expanded ? '−' : '+'}</div>
      </div>

      {expanded && (
        <div className="ability-body">
          {ability.flavorText && (
            <p className="ability-flavor">{ability.flavorText}</p>
          )}

          <div className="ability-meta">
            {ability.keywords.length > 0 && (
              <div className="ability-keywords">
                {ability.keywords.map((keyword) => (
                  <span key={keyword} className="keyword-tag">
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            <div className="ability-targeting">
              <span className="target-distance">{ability.distance}</span>
              <span className="target-info">{ability.target}</span>
            </div>
          </div>

          {ability.trigger && (
            <div className="ability-trigger">
              <strong>Trigger:</strong> {ability.trigger}
            </div>
          )}

          {ability.powerRoll && (
            <div className="ability-power-roll">
              <div className="power-roll-header">
                <span className="roll-characteristic">
                  Power Roll + {ability.powerRoll.characteristic.charAt(0).toUpperCase() + ability.powerRoll.characteristic.slice(1)} ({characteristics[ability.powerRoll.characteristic] >= 0 ? '+' : ''}{characteristics[ability.powerRoll.characteristic]})
                </span>
                <div className="roll-controls">
                  <button
                    className={`modifier-btn ${getModifierClass()}`}
                    onClick={cycleModifier}
                    title="Toggle Edge/Bane"
                  >
                    {getModifierLabel()}
                  </button>
                  <button
                    className={`roll-btn ${isRolling ? 'rolling' : ''}`}
                    onClick={handleRoll}
                    disabled={isRolling}
                  >
                    {isRolling ? '...' : 'Roll'}
                  </button>
                </div>
              </div>

              <div className="power-roll-tiers">
                <div className={`tier tier-1 ${rollResult?.tier === 1 ? 'active' : ''}`}>
                  <span className="tier-label">11 or lower</span>
                  <span className="tier-effect">{ability.powerRoll.tier1}</span>
                </div>
                <div className={`tier tier-2 ${rollResult?.tier === 2 ? 'active' : ''}`}>
                  <span className="tier-label">12-16</span>
                  <span className="tier-effect">{ability.powerRoll.tier2}</span>
                </div>
                <div className={`tier tier-3 ${rollResult?.tier === 3 ? 'active' : ''}`}>
                  <span className="tier-label">17+</span>
                  <span className="tier-effect">{ability.powerRoll.tier3}</span>
                </div>
              </div>

              {rollResult && (
                <div
                  className="roll-result"
                  style={{ borderColor: getTierColor(rollResult.tier) }}
                >
                  <div className="result-main">
                    <span
                      className="result-total"
                      style={{ color: getTierColor(rollResult.tier) }}
                    >
                      {rollResult.total}
                    </span>
                    <span className="result-breakdown">
                      ({rollResult.naturalRoll}
                      {rollResult.secondRoll !== undefined && (
                        <span className="discarded"> / {rollResult.secondRoll}</span>
                      )}
                      {rollResult.modifier !== 0 && (
                        <> {rollResult.modifier >= 0 ? '+' : ''}{rollResult.modifier}</>
                      )}
                      )
                    </span>
                  </div>
                  <div className="result-tier-label" style={{ color: getTierColor(rollResult.tier) }}>
                    Tier {rollResult.tier}
                  </div>
                  <div className="result-effect">{getTierResult()}</div>
                </div>
              )}
            </div>
          )}

          {ability.effect && (
            <div className="ability-effect">
              <strong>Effect:</strong> {ability.effect}
            </div>
          )}

          {ability.spendEssence && (
            <div className="ability-spend-essence">
              <strong>Spend Essence:</strong> {ability.spendEssence}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AbilityCard;
