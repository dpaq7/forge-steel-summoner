import React, { useState } from 'react';
import {
  performPowerRoll,
  PowerRollResult,
  RollModifier,
  getTierColor,
} from '../../utils/dice';
import { Characteristic } from '../../types';
import './DiceRoller.css';

interface DiceRollerProps {
  characteristic?: Characteristic;
  characteristicValue?: number;
  onRoll?: (result: PowerRollResult) => void;
  label?: string;
  compact?: boolean;
}

const DiceRoller: React.FC<DiceRollerProps> = ({
  characteristic,
  characteristicValue = 0,
  onRoll,
  label,
  compact = false,
}) => {
  const [result, setResult] = useState<PowerRollResult | null>(null);
  const [rollModifier, setRollModifier] = useState<RollModifier>('normal');
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);

    // Add a small delay for animation effect
    setTimeout(() => {
      const rollResult = performPowerRoll(characteristicValue, rollModifier);
      setResult(rollResult);
      setIsRolling(false);
      onRoll?.(rollResult);
    }, 300);
  };

  const cycleModifier = () => {
    const modifiers: RollModifier[] = ['normal', 'edge', 'bane', 'doubleEdge', 'doubleBane'];
    const currentIndex = modifiers.indexOf(rollModifier);
    const nextIndex = (currentIndex + 1) % modifiers.length;
    setRollModifier(modifiers[nextIndex]);
  };

  const getModifierDisplay = () => {
    switch (rollModifier) {
      case 'normal':
        return 'Normal';
      case 'edge':
        return 'Edge';
      case 'bane':
        return 'Bane';
      case 'doubleEdge':
        return '2x Edge';
      case 'doubleBane':
        return '2x Bane';
    }
  };

  const getModifierClass = () => {
    if (rollModifier === 'edge' || rollModifier === 'doubleEdge') return 'edge';
    if (rollModifier === 'bane' || rollModifier === 'doubleBane') return 'bane';
    return '';
  };

  if (compact) {
    return (
      <div className="dice-roller compact">
        <button
          className={`roll-btn compact ${isRolling ? 'rolling' : ''}`}
          onClick={handleRoll}
          disabled={isRolling}
        >
          {isRolling ? '...' : 'PR!'}
        </button>
        {result && (
          <span
            className="result-compact"
            style={{ color: getTierColor(result.tier) }}
          >
            {result.total}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="dice-roller">
      {label && <div className="roller-label">{label}</div>}

      <div className="roller-controls">
        <button
          className={`modifier-toggle ${getModifierClass()}`}
          onClick={cycleModifier}
          title="Click to cycle through roll modifiers"
        >
          {getModifierDisplay()}
        </button>

        <button
          className={`roll-btn ${isRolling ? 'rolling' : ''}`}
          onClick={handleRoll}
          disabled={isRolling}
        >
          <span className="pr-icon">PR!</span>
          {characteristic && (
            <span className="modifier-display">
              {characteristicValue >= 0 ? '+' : ''}{characteristicValue}
            </span>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`roll-result tier-${result.tier}`}
          style={{ borderColor: getTierColor(result.tier) }}
        >
          <div className="result-total" style={{ color: getTierColor(result.tier) }}>
            {result.total}
          </div>
          <div className="result-breakdown">
            <span className="natural-roll" title="2d10 result">
              [{result.dice[0]}+{result.dice[1]}]
            </span>
            {result.secondRoll !== undefined && result.secondDice && (
              <span className="discarded-roll" title="Discarded roll">
                ([{result.secondDice[0]}+{result.secondDice[1]}])
              </span>
            )}
            {result.modifier !== 0 && (
              <span className="modifier">
                {result.modifier >= 0 ? ' + ' : ' - '}
                {Math.abs(result.modifier)}
              </span>
            )}
          </div>
          <div className="result-tier">
            Tier {result.tier}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
