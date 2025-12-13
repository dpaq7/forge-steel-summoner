import { useState, useCallback } from 'react';
import { useRollHistory } from '../../context/RollHistoryContext';
import { useConditions } from '../../hooks/useConditions';
import { RollModifier } from '../../utils/dice';
import './CompactStatBar.css';

interface CompactStatBarProps {
  name: string;
  level: number;
  portraitUrl: string | null;
  stamina: { current: number; max: number };
  essence: number;
  recoveries: { current: number; max: number };
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
}: CompactStatBarProps) => {
  const { addRoll, history, isHistoryOpen, toggleHistory } = useRollHistory();
  const { getActiveConditions, getConditionDef } = useConditions();
  const [rollModifier, setRollModifier] = useState<RollModifier>('normal');
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

  // Roll D10
  const rollD10 = (): number => Math.floor(Math.random() * 10) + 1;

  // Cycle roll modifier
  const cycleRollModifier = () => {
    setRollModifier(prev => {
      if (prev === 'normal') return 'edge';
      if (prev === 'edge') return 'bane';
      return 'normal';
    });
  };

  // Handle power roll
  const handlePowerRoll = useCallback(() => {
    setIsRolling(true);

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
      const tier = getTier(total);

      setLastRoll({ total, tier });
      setIsRolling(false);

      // Add to roll history
      addRoll({
        naturalRoll: total,
        dice: [die1, die2],
        modifier: 0,
        total,
        tier,
        hadEdge: rollModifier === 'edge',
        hadBane: rollModifier === 'bane',
        timestamp: Date.now(),
      }, 'Power Roll', 'hero');

      // Clear result after 3 seconds
      setTimeout(() => setLastRoll(null), 3000);
    }, 300);
  }, [rollModifier, addRoll]);

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

      const naturalRoll = die1 + die2;
      const total = naturalRoll + charValue;
      const tier = getTier(total);

      setLastCharRoll({ char: charName, total, tier });
      setRollingChar(null);

      // Add to roll history
      addRoll({
        naturalRoll,
        dice: [die1, die2],
        modifier: charValue,
        total,
        tier,
        hadEdge: rollModifier === 'edge',
        hadBane: rollModifier === 'bane',
        timestamp: Date.now(),
      }, `${charName} Test`, 'hero');

      // Clear result after 3 seconds
      setTimeout(() => setLastCharRoll(null), 3000);
    }, 300);
  }, [rollModifier, addRoll]);

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
        <span className="stat-label">Lv</span>
        <span className="stat-value">{level}</span>
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

      {/* Essence */}
      <span className="compact-stat essence" title="Essence">
        <span className="stat-icon">&#10022;</span>
        <span className="stat-value">{essence}</span>
      </span>

      <span className="compact-divider">|</span>

      {/* Recoveries */}
      <span className="compact-stat recoveries" title="Recoveries">
        <span className="stat-icon">&#10227;</span>
        <span className="stat-value">{recoveries.current}</span>
        <span className="stat-separator">/</span>
        <span className="stat-max">{recoveries.max}</span>
      </span>

      <span className="compact-divider">|</span>

      {/* Surges */}
      <span className="compact-stat surges" title="Surges">
        <span className="stat-icon">&#9889;</span>
        <span className="stat-value">{surges}</span>
      </span>

      <span className="compact-divider">|</span>

      {/* Mini Victories Tracker */}
      <div className="compact-victories" title={`Victories: ${victories}/${maxVictories}`}>
        {Array.from({ length: Math.min(maxVictories, 12) }, (_, i) => (
          <span
            key={i}
            className={`mini-victory ${i < victories ? 'filled' : ''}`}
          />
        ))}
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
          className={`mini-mod-btn ${rollModifier}`}
          onClick={cycleRollModifier}
          title="Toggle Edge/Bane"
        >
          {rollModifier === 'edge' ? 'E' : rollModifier === 'bane' ? 'B' : 'N'}
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
