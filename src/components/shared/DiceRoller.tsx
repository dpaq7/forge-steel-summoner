import React, { useState } from 'react';
import {
  performPowerRoll,
  PowerRollResult,
  EdgeBaneState,
  resolveEdgeBane,
  getEdgeBaneDisplay,
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
  const [edgeBaneState, setEdgeBaneState] = useState<EdgeBaneState>({ edges: 0, banes: 0 });
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);

    setTimeout(() => {
      const rollResult = performPowerRoll(characteristicValue, edgeBaneState);
      setResult(rollResult);
      setIsRolling(false);
      onRoll?.(rollResult);
    }, 300);
  };

  const resolved = resolveEdgeBane(edgeBaneState);

  const addEdge = () => setEdgeBaneState(s => ({ ...s, edges: s.edges + 1 }));
  const removeEdge = () => setEdgeBaneState(s => ({ ...s, edges: Math.max(0, s.edges - 1) }));
  const addBane = () => setEdgeBaneState(s => ({ ...s, banes: s.banes + 1 }));
  const removeBane = () => setEdgeBaneState(s => ({ ...s, banes: Math.max(0, s.banes - 1) }));
  const reset = () => setEdgeBaneState({ edges: 0, banes: 0 });

  const getResolvedClass = () => {
    switch (resolved.type) {
      case 'edge': return 'edge';
      case 'doubleEdge': return 'double-edge';
      case 'bane': return 'bane';
      case 'doubleBane': return 'double-bane';
      default: return '';
    }
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
        <div className="edge-bane-compact">
          <div className="eb-row">
            <button className="eb-btn edge" onClick={removeEdge} disabled={edgeBaneState.edges === 0}>-</button>
            <span className="eb-val edge">{edgeBaneState.edges}</span>
            <button className="eb-btn edge" onClick={addEdge}>+</button>
            <span className="eb-lbl">Edge</span>
          </div>
          <div className="eb-row">
            <button className="eb-btn bane" onClick={removeBane} disabled={edgeBaneState.banes === 0}>-</button>
            <span className="eb-val bane">{edgeBaneState.banes}</span>
            <button className="eb-btn bane" onClick={addBane}>+</button>
            <span className="eb-lbl">Bane</span>
          </div>
          {(edgeBaneState.edges > 0 || edgeBaneState.banes > 0) && (
            <button className="eb-reset" onClick={reset}>Reset</button>
          )}
        </div>

        <div className={`resolved-display ${getResolvedClass()}`}>
          {getEdgeBaneDisplay(resolved)}
        </div>

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
            {result.edgeBaneBonus !== 0 && (
              <span className={`eb-bonus ${result.edgeBaneBonus > 0 ? 'edge' : 'bane'}`}>
                {result.edgeBaneBonus > 0 ? '+' : ''}{result.edgeBaneBonus}
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
            {result.tierAdjustment !== 0 ? (
              <>
                <span className="base-tier">T{result.baseTier}</span>
                <span className="tier-arrow">→</span>
                <span className="final-tier">T{result.tier}</span>
                <span className={`tier-adj ${result.tierAdjustment > 0 ? 'up' : 'down'}`}>
                  ({result.tierAdjustment > 0 ? '2×Edge' : '2×Bane'})
                </span>
              </>
            ) : (
              <>Tier {result.tier}</>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
