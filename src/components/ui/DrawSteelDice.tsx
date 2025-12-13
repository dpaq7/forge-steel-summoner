import { useState, useCallback, useEffect } from 'react';
import { useRollHistory } from '../../context/RollHistoryContext';
import {
  EdgeBaneState,
  resolveEdgeBane,
  getEdgeBaneDisplay,
  performPowerRoll,
} from '../../utils/dice';
import './DrawSteelDice.css';
import '../shared/RollHistoryPanel.css';

// Types
interface PowerRollResult {
  type: 'power';
  dice: [number, number];
  naturalTotal: number;       // 2d10 sum
  edgeBaneBonus: number;      // +2/-2 for edge/bane
  total: number;              // naturalTotal + edgeBaneBonus + characteristic
  baseTier: 1 | 2 | 3;        // Tier before double edge/bane
  tier: 1 | 2 | 3;            // Final tier
  tierAdjustment: number;     // +1/-1 for double edge/bane
  isCritical: boolean;
  edgeBaneState: EdgeBaneState;
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
  edgeBaneState: EdgeBaneState;
  onEdgeBaneChange: (state: EdgeBaneState) => void;
  className?: string;
  pendingCharacteristic?: CharacteristicRoll | null;
  onCharacteristicRollComplete?: () => void;
}

export const DrawSteelDice = ({
  edgeBaneState,
  onEdgeBaneChange,
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

  // Roll functions
  const rollD3 = (): number => Math.ceil(Math.random() * 3);

  // Edge/Bane adjustment functions
  const addEdge = () => onEdgeBaneChange({ ...edgeBaneState, edges: edgeBaneState.edges + 1 });
  const removeEdge = () => onEdgeBaneChange({ ...edgeBaneState, edges: Math.max(0, edgeBaneState.edges - 1) });
  const addBane = () => onEdgeBaneChange({ ...edgeBaneState, banes: edgeBaneState.banes + 1 });
  const removeBane = () => onEdgeBaneChange({ ...edgeBaneState, banes: Math.max(0, edgeBaneState.banes - 1) });
  const resetEdgeBane = () => onEdgeBaneChange({ edges: 0, banes: 0 });

  // Get resolved effect
  const resolved = resolveEdgeBane(edgeBaneState);

  // Power Roll (2d10) - optionally with characteristic modifier
  const handlePowerRoll = useCallback((characteristic?: CharacteristicRoll | null) => {
    setIsRollingPower(true);
    setShowResults(true);

    setTimeout(() => {
      const charMod = characteristic?.value ?? 0;
      const rollResult = performPowerRoll(charMod, edgeBaneState);

      // Crit only on natural 19 or 20 on 2d10
      const isCritical = rollResult.naturalRoll >= 19;

      const result: PowerRollResult = {
        type: 'power',
        dice: rollResult.dice,
        naturalTotal: rollResult.naturalRoll,
        edgeBaneBonus: rollResult.edgeBaneBonus,
        total: rollResult.total,
        baseTier: rollResult.baseTier,
        tier: rollResult.tier,
        tierAdjustment: rollResult.tierAdjustment,
        isCritical,
        edgeBaneState: rollResult.edgeBaneState,
        timestamp: Date.now(),
        characteristicName: characteristic?.name,
        characteristicValue: characteristic?.value,
      };

      setPowerResult(result);
      setIsRollingPower(false);

      // Add to roll history
      const rollLabel = characteristic ? `${characteristic.name} Test` : 'Power Roll';
      addRoll({
        naturalRoll: rollResult.naturalRoll,
        dice: rollResult.dice,
        modifier: charMod,
        total: rollResult.total,
        tier: rollResult.tier,
        hadEdge: rollResult.hadEdge,
        hadBane: rollResult.hadBane,
        timestamp: Date.now(),
      }, rollLabel, 'hero');

      // Notify parent that characteristic roll is complete
      if (characteristic) {
        onCharacteristicRollComplete?.();
      }
    }, 500);
  }, [edgeBaneState, addRoll, onCharacteristicRollComplete]);

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
  };

  // Get CSS class for resolved effect
  const getResolvedClass = () => {
    switch (resolved.type) {
      case 'edge': return 'edge';
      case 'doubleEdge': return 'double-edge';
      case 'bane': return 'bane';
      case 'doubleBane': return 'double-bane';
      default: return '';
    }
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
            <span className="die-result">{powerResult.naturalTotal}</span>
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

      {/* Edge/Bane Controls */}
      <div className="edge-bane-controls">
        <div className="edge-controls">
          <button
            className="eb-btn edge-btn"
            onClick={removeEdge}
            disabled={edgeBaneState.edges === 0}
            title="Remove Edge"
          >-</button>
          <span className="eb-count edge-count">{edgeBaneState.edges}</span>
          <button
            className="eb-btn edge-btn"
            onClick={addEdge}
            title="Add Edge"
          >+</button>
          <span className="eb-label">Edge</span>
        </div>
        <div className="bane-controls">
          <button
            className="eb-btn bane-btn"
            onClick={removeBane}
            disabled={edgeBaneState.banes === 0}
            title="Remove Bane"
          >-</button>
          <span className="eb-count bane-count">{edgeBaneState.banes}</span>
          <button
            className="eb-btn bane-btn"
            onClick={addBane}
            title="Add Bane"
          >+</button>
          <span className="eb-label">Bane</span>
        </div>
        {(edgeBaneState.edges > 0 || edgeBaneState.banes > 0) && (
          <button
            className="eb-reset"
            onClick={resetEdgeBane}
            title="Reset Edge/Bane"
          >Reset</button>
        )}
      </div>

      {/* Resolved Effect Display */}
      <div className={`resolved-effect ${getResolvedClass()}`}>
        {getEdgeBaneDisplay(resolved)}
      </div>

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
                {powerResult.edgeBaneBonus !== 0 && (
                  <>
                    <span className="op">{powerResult.edgeBaneBonus > 0 ? '+' : ''}</span>
                    <span className={`eb-mod ${powerResult.edgeBaneBonus > 0 ? 'edge' : 'bane'}`}>
                      {powerResult.edgeBaneBonus}
                    </span>
                  </>
                )}
                {powerResult.characteristicValue !== undefined && powerResult.characteristicValue !== 0 && (
                  <>
                    <span className="op">{powerResult.characteristicValue >= 0 ? '+' : ''}</span>
                    <span className="char-mod">{powerResult.characteristicValue}</span>
                  </>
                )}
                <span className="op">=</span>
                <span className="result-total">{powerResult.total}</span>
              </div>
              <div className="result-tier">
                {powerResult.tierAdjustment !== 0 ? (
                  <>
                    <span className="base-tier">Tier {powerResult.baseTier}</span>
                    <span className="tier-arrow">{powerResult.tierAdjustment > 0 ? '→' : '→'}</span>
                    <span className="final-tier">Tier {powerResult.tier}</span>
                    <span className={`tier-adjust ${powerResult.tierAdjustment > 0 ? 'up' : 'down'}`}>
                      ({powerResult.tierAdjustment > 0 ? '2× Edge' : '2× Bane'})
                    </span>
                  </>
                ) : (
                  <>Tier {powerResult.tier}</>
                )}
                {powerResult.isCritical && <span className="crit-badge">CRIT!</span>}
              </div>
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
