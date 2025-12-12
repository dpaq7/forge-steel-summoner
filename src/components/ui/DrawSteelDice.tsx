import { useState, useCallback, useEffect } from 'react';
import { useRollHistory } from '../../context/RollHistoryContext';
import { RollModifier } from '../../utils/dice';
import './DrawSteelDice.css';
import '../shared/RollHistoryPanel.css';

// Types
interface PowerRollResult {
  type: 'power';
  dice: [number, number];
  total: number;
  modifiedTotal: number;
  tier: 1 | 2 | 3;
  isCritical: boolean;
  hasEdge: boolean;
  hasBane: boolean;
  timestamp: number;
  characteristicName?: string;
  characteristicValue?: number;
}

interface D3Result {
  type: 'd3';
  value: number;
  timestamp: number;
}

interface CharacteristicRoll {
  name: string;
  value: number;
}

interface DrawSteelDiceProps {
  rollModifier: RollModifier;
  onCycleModifier: () => void;
  className?: string;
  pendingCharacteristic?: CharacteristicRoll | null;
  onCharacteristicRollComplete?: () => void;
}

export const DrawSteelDice = ({
  rollModifier,
  onCycleModifier,
  className = '',
  pendingCharacteristic,
  onCharacteristicRollComplete,
}: DrawSteelDiceProps) => {
  const { addRoll, history, isHistoryOpen, toggleHistory } = useRollHistory();

  const [powerResult, setPowerResult] = useState<PowerRollResult | null>(null);
  const [d3Result, setD3Result] = useState<D3Result | null>(null);
  const [isRollingPower, setIsRollingPower] = useState(false);
  const [isRollingD3, setIsRollingD3] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeCharacteristic, setActiveCharacteristic] = useState<CharacteristicRoll | null>(null);

  // Roll functions
  const rollD10 = (): number => Math.floor(Math.random() * 10) + 1;
  const rollD3 = (): number => Math.ceil(Math.random() * 3);

  const getTier = (total: number): 1 | 2 | 3 => {
    if (total >= 17) return 3;
    if (total >= 12) return 2;
    return 1;
  };

  // Power Roll (2d10) - optionally with characteristic modifier
  const handlePowerRoll = useCallback((characteristic?: CharacteristicRoll | null) => {
    setIsRollingPower(true);
    setShowResults(true);

    // Store the characteristic for display
    if (characteristic) {
      setActiveCharacteristic(characteristic);
    }

    setTimeout(() => {
      let die1 = rollD10();
      let die2 = rollD10();

      // Edge: roll extra die, take highest two
      if (rollModifier === 'edge') {
        const die3 = rollD10();
        const sorted = [die1, die2, die3].sort((a, b) => b - a);
        die1 = sorted[0];
        die2 = sorted[1];
      }

      // Bane: roll extra die, take lowest two
      if (rollModifier === 'bane') {
        const die3 = rollD10();
        const sorted = [die1, die2, die3].sort((a, b) => a - b);
        die1 = sorted[0];
        die2 = sorted[1];
      }

      const total = die1 + die2;
      const charMod = characteristic?.value ?? 0;
      const modifiedTotal = total + charMod;
      // Crit only on natural 19 or 20 on 2d10
      const isCritical = total >= 19;
      // Tier is based on modified total
      const tier = getTier(modifiedTotal);

      const result: PowerRollResult = {
        type: 'power',
        dice: [die1, die2],
        total,
        modifiedTotal,
        tier,
        isCritical,
        hasEdge: rollModifier === 'edge',
        hasBane: rollModifier === 'bane',
        timestamp: Date.now(),
        characteristicName: characteristic?.name,
        characteristicValue: characteristic?.value,
      };

      setPowerResult(result);
      setIsRollingPower(false);

      // Add to roll history
      const rollLabel = characteristic ? `${characteristic.name} Test` : 'Power Roll';
      addRoll({
        naturalRoll: total,
        dice: [die1, die2],
        modifier: charMod,
        total: modifiedTotal,
        tier,
        hadEdge: rollModifier === 'edge',
        hadBane: rollModifier === 'bane',
        timestamp: Date.now(),
      }, rollLabel, 'hero');

      // Notify parent that characteristic roll is complete
      if (characteristic) {
        onCharacteristicRollComplete?.();
      }
    }, 500);
  }, [rollModifier, addRoll, onCharacteristicRollComplete]);

  // Trigger roll when pendingCharacteristic is set
  useEffect(() => {
    if (pendingCharacteristic && !isRollingPower) {
      handlePowerRoll(pendingCharacteristic);
    }
  }, [pendingCharacteristic]);

  // Independent d3 Roll
  const handleD3Roll = useCallback(() => {
    setIsRollingD3(true);
    setShowResults(true);

    setTimeout(() => {
      const value = rollD3();

      const result: D3Result = {
        type: 'd3',
        value,
        timestamp: Date.now(),
      };

      setD3Result(result);
      setIsRollingD3(false);
    }, 400);
  }, []);

  const clearResults = () => {
    setPowerResult(null);
    setD3Result(null);
    setShowResults(false);
    setActiveCharacteristic(null);
  };

  return (
    <div className={`draw-steel-dice ${className}`}>
      {/* Power Roll Die (D20 shape) */}
      <button
        className={`die d20-die ${isRollingPower ? 'rolling' : ''} ${powerResult ? `tier-${powerResult.tier}` : ''}`}
        onClick={() => handlePowerRoll(null)}
        disabled={isRollingPower}
        aria-label="Roll Power Roll (2d10)"
        title="Power Roll (2d10)"
      >
        <div className="die-border" />
        <div className="die-face">
          {isRollingPower ? (
            <span className="rolling-indicator">&#8635;</span>
          ) : powerResult ? (
            <span className="die-result">{powerResult.total}</span>
          ) : (
            <span className="die-icon">2d10</span>
          )}
        </div>
      </button>

      {/* d3 Die */}
      <button
        className={`die d3-die ${isRollingD3 ? 'rolling' : ''} ${d3Result ? 'd3-result' : ''}`}
        onClick={handleD3Roll}
        disabled={isRollingD3}
        aria-label="Roll d3"
        title="Roll d3"
      >
        <div className="die-border" />
        <div className="die-face">
          {isRollingD3 ? (
            <span className="rolling-indicator">&#8635;</span>
          ) : d3Result ? (
            <span className="die-result">{d3Result.value}</span>
          ) : (
            <span className="die-icon">d3</span>
          )}
        </div>
      </button>

      {/* Roll Modifier Button */}
      <button
        className={`roll-mod-btn ${rollModifier}`}
        onClick={onCycleModifier}
        title="Toggle Edge/Bane for Power Rolls"
      >
        {rollModifier === 'edge' ? 'Edge' : rollModifier === 'bane' ? 'Bane' : 'Normal'}
      </button>

      {/* Roll History Toggle */}
      <button
        className={`roll-history-toggle-inline ${isHistoryOpen ? 'open' : ''}`}
        onClick={toggleHistory}
        title="Roll History"
      >
        <span className="history-icon">H</span>
        {history.length > 0 && (
          <span className="history-count">{history.length}</span>
        )}
      </button>

      {/* Results Popup */}
      {showResults && (powerResult || d3Result) && (
        <div className="dice-results-popup">
          <button className="close-results" onClick={clearResults}>&times;</button>

          {powerResult && (
            <div className={`result-section power tier-${powerResult.tier}`}>
              <div className="result-label">
                {powerResult.characteristicName ? `${powerResult.characteristicName} Test` : 'Power Roll'}
              </div>
              <div className="result-breakdown">
                <span className="die-val">[{powerResult.dice[0]}]</span>
                <span className="op">+</span>
                <span className="die-val">[{powerResult.dice[1]}]</span>
                {powerResult.characteristicValue !== undefined && (
                  <>
                    <span className="op">{powerResult.characteristicValue >= 0 ? '+' : ''}</span>
                    <span className="char-mod">{powerResult.characteristicValue}</span>
                  </>
                )}
                <span className="op">=</span>
                <span className="result-total">{powerResult.modifiedTotal}</span>
              </div>
              <div className="result-tier">
                Tier {powerResult.tier}
                {powerResult.isCritical && <span className="crit-badge">CRIT!</span>}
              </div>
              {(powerResult.hasEdge || powerResult.hasBane) && (
                <div className="result-mod">
                  {powerResult.hasEdge && '(with Edge)'}
                  {powerResult.hasBane && '(with Bane)'}
                </div>
              )}
            </div>
          )}

          {d3Result && (
            <div className="result-section d3">
              <div className="result-label">d3 Roll</div>
              <div className="result-breakdown">
                <span className="result-total">{d3Result.value}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DrawSteelDice;
