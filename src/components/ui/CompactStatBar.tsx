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
  onExpand,
}: CompactStatBarProps) => {
  const { addRoll, history, isHistoryOpen, toggleHistory } = useRollHistory();
  const { getActiveConditions, getConditionDef } = useConditions();
  const [rollModifier, setRollModifier] = useState<RollModifier>('normal');
  const [lastRoll, setLastRoll] = useState<{ total: number; tier: 1 | 2 | 3 } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

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

      {/* Characteristics (abbreviated) */}
      <div className="compact-characteristics">
        <span className="compact-char" title="Might">
          M{characteristics.might >= 0 ? '+' : ''}{characteristics.might}
        </span>
        <span className="compact-char" title="Agility">
          A{characteristics.agility >= 0 ? '+' : ''}{characteristics.agility}
        </span>
        <span className="compact-char" title="Reason">
          R{characteristics.reason >= 0 ? '+' : ''}{characteristics.reason}
        </span>
        <span className="compact-char" title="Intuition">
          I{characteristics.intuition >= 0 ? '+' : ''}{characteristics.intuition}
        </span>
        <span className="compact-char" title="Presence">
          P{characteristics.presence >= 0 ? '+' : ''}{characteristics.presence}
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
