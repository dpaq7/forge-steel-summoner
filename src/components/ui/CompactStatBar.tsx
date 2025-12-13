import { useState, useCallback } from 'react';
import { useRollHistory } from '../../context/RollHistoryContext';
import { useConditions } from '../../hooks/useConditions';
import { EdgeBaneState, resolveEdgeBane, performPowerRoll } from '../../utils/dice';
import './CompactStatBar.css';

interface CompactStatBarProps {
  name: string;
  level: number;
  portraitUrl: string | null;
  stamina: { current: number; max: number };
  essence: number;
  recoveries: { current: number; max: number };
  recoveryValue: number;
  surges: number;
  victories: number;
  maxVictories: number;
  characteristics: {
    might: number;
    agility: number;
    reason: number;
    intuition: number;
    presence: number;
  };
  speed: number;
  stability: number;
  isInCombat?: boolean;
  onStartCombat?: () => void;
  onEndCombat?: () => void;
  onRespite?: () => void;
  onExpand: () => void;
  onEssenceChange?: (newEssence: number) => void;
  onCatchBreath?: (healAmount: number) => void;
  onVictoriesChange?: (newVictories: number) => void;
}

// Tier calculation
const getTier = (total: number): 1 | 2 | 3 => {
  if (total >= 17) return 3;
  if (total >= 12) return 2;
  return 1;
};

// Tier colors
const getTierColor = (tier: 1 | 2 | 3): string => {
  switch (tier) {
    case 1: return 'var(--color-danger)';
    case 2: return 'var(--color-warning)';
    case 3: return 'var(--color-success)';
  }
};

export const CompactStatBar = ({
  name,
  level,
  portraitUrl,
  stamina,
  essence,
  recoveries,
  recoveryValue,
  surges,
  victories,
  maxVictories,
  characteristics,
  speed,
  stability,
  isInCombat = false,
  onStartCombat,
  onEndCombat,
  onRespite,
  onExpand,
  onEssenceChange,
  onCatchBreath,
  onVictoriesChange,
}: CompactStatBarProps) => {
  const { addRoll, history, isHistoryOpen, toggleHistory } = useRollHistory();
  const { getActiveConditions, getConditionDef, hasCondition } = useConditions();
  const [edgeBaneState, setEdgeBaneState] = useState<EdgeBaneState>({ edges: 0, banes: 0 });
  const [lastRoll, setLastRoll] = useState<{ total: number; tier: 1 | 2 | 3 } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [lastD3Roll, setLastD3Roll] = useState<number | null>(null);
  const [isRollingD3, setIsRollingD3] = useState(false);
  const [rollingChar, setRollingChar] = useState<string | null>(null);
  const [lastCharRoll, setLastCharRoll] = useState<{ char: string; total: number; tier: 1 | 2 | 3 } | null>(null);

  // Calculate stamina percentage for color coding
  const staminaPercent = (stamina.current / stamina.max) * 100;
  const staminaStatus = staminaPercent <= 25 ? 'critical' : staminaPercent <= 50 ? 'wounded' : 'healthy';

  // Get active conditions
  const activeConditions = getActiveConditions();

  // Get resolved edge/bane effect
  const resolved = resolveEdgeBane(edgeBaneState);

  // Cycle through: Normal -> Edge -> 2x Edge -> Bane -> 2x Bane -> Normal
  const cycleEdgeBane = () => {
    setEdgeBaneState(prev => {
      // N -> E
      if (prev.edges === 0 && prev.banes === 0) return { edges: 1, banes: 0 };
      // E -> 2E
      if (prev.edges === 1 && prev.banes === 0) return { edges: 2, banes: 0 };
      // 2E -> B
      if (prev.edges === 2 && prev.banes === 0) return { edges: 0, banes: 1 };
      // B -> 2B
      if (prev.edges === 0 && prev.banes === 1) return { edges: 0, banes: 2 };
      // 2B -> N (or any other state)
      return { edges: 0, banes: 0 };
    });
  };

  // Get display text for edge/bane button
  const getEdgeBaneDisplay = (): string => {
    switch (resolved.type) {
      case 'edge': return 'E';
      case 'doubleEdge': return '2E';
      case 'bane': return 'B';
      case 'doubleBane': return '2B';
      default: return 'N';
    }
  };

  // Get CSS class for edge/bane button
  const getEdgeBaneClass = (): string => {
    switch (resolved.type) {
      case 'edge': return 'edge';
      case 'doubleEdge': return 'double-edge';
      case 'bane': return 'bane';
      case 'doubleBane': return 'double-bane';
      default: return 'normal';
    }
  };

  // Handle power roll
  const handlePowerRoll = useCallback(() => {
    setIsRolling(true);

    setTimeout(() => {
      const rollResult = performPowerRoll(0, edgeBaneState);

      setLastRoll({ total: rollResult.total, tier: rollResult.tier });
      setIsRolling(false);

      // Add to roll history
      addRoll({
        naturalRoll: rollResult.naturalRoll,
        dice: rollResult.dice,
        modifier: 0,
        total: rollResult.total,
        tier: rollResult.tier,
        hadEdge: rollResult.hadEdge,
        hadBane: rollResult.hadBane,
        timestamp: Date.now(),
      }, 'Power Roll', 'hero');

      // Clear result after 3 seconds
      setTimeout(() => setLastRoll(null), 3000);
    }, 300);
  }, [edgeBaneState, addRoll]);

  // Handle d3 roll
  const handleD3Roll = useCallback(() => {
    setIsRollingD3(true);

    setTimeout(() => {
      const result = Math.floor(Math.random() * 3) + 1;
      setLastD3Roll(result);
      setIsRollingD3(false);

      // Add to roll history
      addRoll({
        naturalRoll: result,
        dice: [result, 0],
        modifier: 0,
        total: result,
        tier: 1,
        hadEdge: false,
        hadBane: false,
        timestamp: Date.now(),
      }, 'd3 Roll', 'hero');

      // Clear result after 3 seconds
      setTimeout(() => setLastD3Roll(null), 3000);
    }, 300);
  }, [addRoll]);

  // Handle characteristic test roll
  const handleCharacteristicRoll = useCallback((charName: string, charValue: number) => {
    setRollingChar(charName);

    setTimeout(() => {
      const rollResult = performPowerRoll(charValue, edgeBaneState);

      setLastCharRoll({ char: charName, total: rollResult.total, tier: rollResult.tier });
      setRollingChar(null);

      // Add to roll history
      addRoll({
        naturalRoll: rollResult.naturalRoll,
        dice: rollResult.dice,
        modifier: charValue,
        total: rollResult.total,
        tier: rollResult.tier,
        hadEdge: rollResult.hadEdge,
        hadBane: rollResult.hadBane,
        timestamp: Date.now(),
      }, `${charName} Test`, 'hero');

      // Clear result after 3 seconds
      setTimeout(() => setLastCharRoll(null), 3000);
    }, 300);
  }, [edgeBaneState, addRoll]);

  // Check if catch breath is available
  const isDying = stamina.current <= 0;
  const isBleeding = hasCondition('bleeding');
  const hasRecoveries = recoveries.current > 0;
  const canCatchBreath = !isDying && !isBleeding && hasRecoveries;

  // Get catch breath unavailable reason
  const getCatchBreathReason = (): string | null => {
    if (isDying) return 'Catch Breath not available - Dying!';
    if (isBleeding) return 'Catch Breath not available - Bleeding!';
    if (!hasRecoveries) return 'Catch Breath not available - No recoveries!';
    return null;
  };

  // Handle catch breath
  const handleCatchBreath = useCallback(() => {
    const reason = getCatchBreathReason();
    if (reason) {
      // Log the failure to history
      addRoll({
        naturalRoll: 0,
        dice: [0, 0],
        modifier: 0,
        total: 0,
        tier: 1,
        hadEdge: false,
        hadBane: false,
        timestamp: Date.now(),
      }, reason, 'hero');
      return;
    }

    // Use catch breath - heal for recovery value
    if (onCatchBreath) {
      onCatchBreath(recoveryValue);
      addRoll({
        naturalRoll: recoveryValue,
        dice: [recoveryValue, 0],
        modifier: 0,
        total: recoveryValue,
        tier: 3,
        hadEdge: false,
        hadBane: false,
        timestamp: Date.now(),
      }, `Catch Breath (+${recoveryValue} HP)`, 'hero');
    }
  }, [isDying, isBleeding, hasRecoveries, recoveryValue, onCatchBreath, addRoll]);

  // Handle essence change
  const handleEssenceUp = useCallback(() => {
    if (onEssenceChange) {
      onEssenceChange(essence + 1);
    }
  }, [essence, onEssenceChange]);

  const handleEssenceDown = useCallback(() => {
    if (onEssenceChange && essence > 0) {
      onEssenceChange(essence - 1);
    }
  }, [essence, onEssenceChange]);

  // Handle victories change
  const handleVictoriesUp = useCallback(() => {
    if (onVictoriesChange && victories < maxVictories) {
      onVictoriesChange(victories + 1);
    }
  }, [victories, maxVictories, onVictoriesChange]);

  const handleVictoriesDown = useCallback(() => {
    if (onVictoriesChange && victories > 0) {
      onVictoriesChange(victories - 1);
    }
  }, [victories, onVictoriesChange]);

  // Calculate Summoner's Range
  const summonersRange = 5 + characteristics.reason;

  return (
    <div className="compact-stat-bar">
      {/* Mini Portrait */}
      <div className="compact-portrait">
        {portraitUrl ? (
          <img src={portraitUrl} alt={name} className="compact-portrait-img" />
        ) : (
          <span className="compact-portrait-placeholder">&#9671;</span>
        )}
      </div>

      {/* Character Name */}
      <span className="compact-name" title={name}>
        {name.length > 12 ? `${name.slice(0, 10)}...` : name}
      </span>

      <span className="compact-divider">|</span>

      {/* Level */}
      <span className="compact-stat level">
        <span className="stat-label">Lv{level}</span>
      </span>

      <span className="compact-divider">|</span>

      {/* Stamina */}
      <span className={`compact-stat stamina ${staminaStatus}`} title="Stamina">
        <span className="stat-icon">&#10084;</span>
        <span className="stat-value">{stamina.current}</span>
        <span className="stat-separator">/</span>
        <span className="stat-max">{stamina.max}</span>
      </span>

      <span className="compact-divider">|</span>

      {/* Essence with +/- controls */}
      <div className="compact-stat-group">
        <span className="compact-stat essence" title="Essence">
          <span className="stat-icon">&#10022;</span>
          <span className="stat-value">{essence}</span>
        </span>
        <div className="mini-arrows">
          <button
            className="mini-arrow-btn"
            onClick={handleEssenceUp}
            title="Add Essence"
          >
            ▲
          </button>
          <button
            className="mini-arrow-btn"
            onClick={handleEssenceDown}
            disabled={essence <= 0}
            title="Remove Essence"
          >
            ▼
          </button>
        </div>
      </div>

      <span className="compact-divider">|</span>

      {/* Recoveries with Catch Breath */}
      <div className="compact-stat-group">
        <span className="compact-stat recoveries" title="Recoveries">
          <span className="stat-icon">&#10227;</span>
          <span className="stat-value">{recoveries.current}</span>
          <span className="stat-separator">/</span>
          <span className="stat-max">{recoveries.max}</span>
        </span>
        <button
          className={`mini-action-btn cb-btn ${canCatchBreath ? '' : 'disabled'}`}
          onClick={handleCatchBreath}
          title={getCatchBreathReason() || `Catch Breath (heal ${recoveryValue})`}
        >
          CB
        </button>
      </div>

      <span className="compact-divider">|</span>

      {/* Surges */}
      <span className="compact-stat surges" title="Surges">
        <span className="stat-icon">&#9889;</span>
        <span className="stat-value">{surges}</span>
      </span>

      <span className="compact-divider">|</span>

      {/* Mini Victories Tracker with arrows */}
      <div className="compact-stat-group victories-group">
        <button
          className="mini-arrow-btn horizontal"
          onClick={handleVictoriesDown}
          disabled={victories <= 0}
          title="Remove Victory"
        >
          ◀
        </button>
        <div className="compact-victories" title={`Victories: ${victories}/${maxVictories}`}>
          {Array.from({ length: Math.min(maxVictories, 12) }, (_, i) => (
            <span
              key={i}
              className={`mini-victory ${i < victories ? 'filled' : ''}`}
            />
          ))}
        </div>
        <button
          className="mini-arrow-btn horizontal"
          onClick={handleVictoriesUp}
          disabled={victories >= maxVictories}
          title="Add Victory"
        >
          ▶
        </button>
      </div>

      <span className="compact-divider">|</span>

      {/* Characteristics (abbreviated) - clickable for tests */}
      <div className="compact-characteristics">
        <button
          className={`compact-char clickable ${rollingChar === 'Might' ? 'rolling' : ''} ${lastCharRoll?.char === 'Might' ? `has-result tier-${lastCharRoll.tier}` : ''}`}
          title="Click to roll Might test"
          onClick={() => handleCharacteristicRoll('Might', characteristics.might)}
          disabled={rollingChar !== null}
        >
          <span className="char-label">MGT</span>
          <span className="char-value">
            {rollingChar === 'Might' ? (
              <span className="char-rolling">&#8635;</span>
            ) : lastCharRoll?.char === 'Might' ? (
              <span className="char-result" style={{ color: getTierColor(lastCharRoll.tier) }}>{lastCharRoll.total}</span>
            ) : (
              <>{characteristics.might >= 0 ? '+' : ''}{characteristics.might}</>
            )}
          </span>
        </button>
        <button
          className={`compact-char clickable ${rollingChar === 'Agility' ? 'rolling' : ''} ${lastCharRoll?.char === 'Agility' ? `has-result tier-${lastCharRoll.tier}` : ''}`}
          title="Click to roll Agility test"
          onClick={() => handleCharacteristicRoll('Agility', characteristics.agility)}
          disabled={rollingChar !== null}
        >
          <span className="char-label">AGI</span>
          <span className="char-value">
            {rollingChar === 'Agility' ? (
              <span className="char-rolling">&#8635;</span>
            ) : lastCharRoll?.char === 'Agility' ? (
              <span className="char-result" style={{ color: getTierColor(lastCharRoll.tier) }}>{lastCharRoll.total}</span>
            ) : (
              <>{characteristics.agility >= 0 ? '+' : ''}{characteristics.agility}</>
            )}
          </span>
        </button>
        <button
          className={`compact-char clickable ${rollingChar === 'Reason' ? 'rolling' : ''} ${lastCharRoll?.char === 'Reason' ? `has-result tier-${lastCharRoll.tier}` : ''}`}
          title="Click to roll Reason test"
          onClick={() => handleCharacteristicRoll('Reason', characteristics.reason)}
          disabled={rollingChar !== null}
        >
          <span className="char-label">REA</span>
          <span className="char-value">
            {rollingChar === 'Reason' ? (
              <span className="char-rolling">&#8635;</span>
            ) : lastCharRoll?.char === 'Reason' ? (
              <span className="char-result" style={{ color: getTierColor(lastCharRoll.tier) }}>{lastCharRoll.total}</span>
            ) : (
              <>{characteristics.reason >= 0 ? '+' : ''}{characteristics.reason}</>
            )}
          </span>
        </button>
        <button
          className={`compact-char clickable ${rollingChar === 'Intuition' ? 'rolling' : ''} ${lastCharRoll?.char === 'Intuition' ? `has-result tier-${lastCharRoll.tier}` : ''}`}
          title="Click to roll Intuition test"
          onClick={() => handleCharacteristicRoll('Intuition', characteristics.intuition)}
          disabled={rollingChar !== null}
        >
          <span className="char-label">INT</span>
          <span className="char-value">
            {rollingChar === 'Intuition' ? (
              <span className="char-rolling">&#8635;</span>
            ) : lastCharRoll?.char === 'Intuition' ? (
              <span className="char-result" style={{ color: getTierColor(lastCharRoll.tier) }}>{lastCharRoll.total}</span>
            ) : (
              <>{characteristics.intuition >= 0 ? '+' : ''}{characteristics.intuition}</>
            )}
          </span>
        </button>
        <button
          className={`compact-char clickable ${rollingChar === 'Presence' ? 'rolling' : ''} ${lastCharRoll?.char === 'Presence' ? `has-result tier-${lastCharRoll.tier}` : ''}`}
          title="Click to roll Presence test"
          onClick={() => handleCharacteristicRoll('Presence', characteristics.presence)}
          disabled={rollingChar !== null}
        >
          <span className="char-label">PRE</span>
          <span className="char-value">
            {rollingChar === 'Presence' ? (
              <span className="char-rolling">&#8635;</span>
            ) : lastCharRoll?.char === 'Presence' ? (
              <span className="char-result" style={{ color: getTierColor(lastCharRoll.tier) }}>{lastCharRoll.total}</span>
            ) : (
              <>{characteristics.presence >= 0 ? '+' : ''}{characteristics.presence}</>
            )}
          </span>
        </button>
      </div>

      {/* Derived Stats */}
      <div className="compact-derived">
        <span className="compact-derived-stat" title="Speed">
          <span className="derived-label">SPD</span>
          <span className="derived-value">{speed}</span>
        </span>
        <span className="compact-derived-stat" title="Stability">
          <span className="derived-label">STB</span>
          <span className="derived-value">{stability}</span>
        </span>
        <span className="compact-derived-stat" title="Summoner's Range (5 + Reason)">
          <span className="derived-label">RNG</span>
          <span className="derived-value">{summonersRange}</span>
        </span>
      </div>

      {/* Mini Conditions Display */}
      {activeConditions.length > 0 && (
        <>
          <span className="compact-divider">|</span>
          <div className="compact-conditions" title={`Conditions: ${activeConditions.map(ac => getConditionDef(ac.conditionId).name).join(', ')}`}>
            {activeConditions.slice(0, 4).map(ac => {
              const def = getConditionDef(ac.conditionId);
              return (
                <span key={ac.conditionId} className="mini-condition" title={def.name}>
                  {def.icon}
                </span>
              );
            })}
            {activeConditions.length > 4 && (
              <span className="mini-condition-more">+{activeConditions.length - 4}</span>
            )}
          </div>
        </>
      )}

      <span className="compact-divider">|</span>

      {/* Mini Dice Controls */}
      <div className="compact-dice-controls">
        {/* Power Roll Button */}
        <button
          className={`mini-roll-btn ${isRolling ? 'rolling' : ''} ${lastRoll ? `tier-${lastRoll.tier}` : ''}`}
          onClick={handlePowerRoll}
          disabled={isRolling}
          title="Power Roll (2d10)"
        >
          {isRolling ? (
            <span className="mini-rolling">&#8635;</span>
          ) : lastRoll ? (
            <span className="mini-result" style={{ color: getTierColor(lastRoll.tier) }}>
              {lastRoll.total}
            </span>
          ) : (
            <span className="mini-dice-icon">2d10</span>
          )}
        </button>

        {/* d3 Roll Button */}
        <button
          className={`mini-roll-btn d3-btn ${isRollingD3 ? 'rolling' : ''} ${lastD3Roll ? 'has-result' : ''}`}
          onClick={handleD3Roll}
          disabled={isRollingD3}
          title="Roll d3"
        >
          {isRollingD3 ? (
            <span className="mini-rolling">&#8635;</span>
          ) : lastD3Roll ? (
            <span className="mini-result d3-result">{lastD3Roll}</span>
          ) : (
            <span className="mini-dice-icon">d3</span>
          )}
        </button>

        {/* Roll Modifier Toggle */}
        <button
          className={`mini-mod-btn ${getEdgeBaneClass()}`}
          onClick={cycleEdgeBane}
          title="Toggle Edge/Bane (N → E → 2E → B → 2B)"
        >
          {getEdgeBaneDisplay()}
        </button>

        {/* History Toggle */}
        <button
          className={`mini-history-btn ${isHistoryOpen ? 'open' : ''}`}
          onClick={toggleHistory}
          title="Roll History"
        >
          H
          {history.length > 0 && (
            <span className="mini-history-count">{history.length}</span>
          )}
        </button>
      </div>

      <span className="compact-divider">|</span>

      {/* Combat Controls */}
      <div className="compact-combat-controls">
        {!isInCombat ? (
          <button
            className="mini-combat-btn draw-steel"
            onClick={onStartCombat}
            title="Draw Steel - Start Combat"
          >
            ⚔️
          </button>
        ) : (
          <button
            className="mini-combat-btn end-combat"
            onClick={onEndCombat}
            title="End Combat"
          >
            🏁
          </button>
        )}
        <button
          className="mini-combat-btn respite"
          onClick={onRespite}
          disabled={isInCombat}
          title={isInCombat ? "Cannot respite during combat" : "Take a Respite"}
        >
          🏕️
        </button>
      </div>

      {/* Expand Button */}
      <button
        className="compact-expand-btn"
        onClick={onExpand}
        aria-label="Expand header"
        title="Expand header"
      >
        <span className="expand-icon">&#9660;</span>
      </button>
    </div>
  );
};

export default CompactStatBar;
