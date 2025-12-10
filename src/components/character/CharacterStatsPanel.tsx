import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { useCombatContext } from '../../context/CombatContext';
import { useRollHistory } from '../../context/RollHistoryContext';
import { useConditions, SaveResult, BleedingDamageResult } from '../../hooks/useConditions';
import { useEquipment } from '../../hooks/useEquipment';
import { ALL_CONDITIONS, ConditionDefinition } from '../../data/conditions';
import { performPowerRoll, getTierColor, RollModifier, PowerRollResult } from '../../utils/dice';
import { Characteristic, ConditionId } from '../../types';
import './CharacterStatsPanel.css';

// XP thresholds for each level (minimum XP required)
const XP_THRESHOLDS: Record<number, number> = {
  2: 16,
  3: 32,
  4: 48,
  5: 64,
  6: 80,
  7: 96,
  8: 112,
  9: 128,
  10: 144,
};

interface CharacterStatsPanelProps {
  onLevelUp: () => void;
}

const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({ onLevelUp }) => {
  const { hero, updateHero } = useSummonerContext();
  const { essenceState, spendEssence, gainEssence, isInCombat } = useCombatContext();
  const { addRoll } = useRollHistory();
  const {
    addCondition,
    removeCondition,
    hasCondition,
    getActiveConditions,
    getConditionDef,
    attemptSave,
    applyBleedingDamage,
  } = useConditions();
  const { totalBonuses, equippedItems } = useEquipment();
  const [showNotes, setShowNotes] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [rollModifier, setRollModifier] = useState<RollModifier>('normal');
  const [lastRoll, setLastRoll] = useState<{ char: string; result: PowerRollResult } | null>(null);
  const [showRespiteConfirm, setShowRespiteConfirm] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [lastSaveResult, setLastSaveResult] = useState<SaveResult | null>(null);
  const [lastBleedingResult, setLastBleedingResult] = useState<BleedingDamageResult | null>(null);

  if (!hero) return null;

  const adjust = (field: 'stamina' | 'recoveries' | 'victories' | 'surges', delta: number) => {
    if (field === 'stamina') {
      // Allow negative stamina for dying state (death occurs at -winded value)
      const val = Math.min(hero.stamina.max, hero.stamina.current + delta);
      updateHero({ stamina: { ...hero.stamina, current: val } });
    } else if (field === 'recoveries') {
      const val = Math.max(0, Math.min(hero.recoveries.max, hero.recoveries.current + delta));
      updateHero({ recoveries: { ...hero.recoveries, current: val } });
    } else if (field === 'victories') {
      updateHero({ victories: Math.max(0, hero.victories + delta) });
    } else if (field === 'surges') {
      updateHero({ surges: Math.max(0, hero.surges + delta) });
    }
  };

  const useRecovery = () => {
    if (hero.recoveries.current > 0) {
      const newStamina = Math.min(hero.stamina.max, hero.stamina.current + hero.recoveries.value);
      updateHero({
        stamina: { ...hero.stamina, current: newStamina },
        recoveries: { ...hero.recoveries, current: hero.recoveries.current - 1 },
      });
    }
  };

  const handleRespite = () => {
    // Convert victories to XP and reset resources
    const xpGained = hero.victories;
    const newXp = (hero.xp || 0) + xpGained;

    updateHero({
      xp: newXp,
      victories: 0,
      stamina: { ...hero.stamina, current: hero.stamina.max },
      recoveries: { ...hero.recoveries, current: hero.recoveries.max },
      surges: 0,
      activeSquads: [], // Dismiss all minions during respite
    });

    setShowRespiteConfirm(false);
  };

  // Calculate XP progress for current level
  const getXpProgress = () => {
    const currentXp = hero.xp || 0;
    const nextLevel = hero.level + 1;

    if (nextLevel > 10) {
      return { current: currentXp, needed: 0, progress: 100, canLevelUp: false };
    }

    const xpForNextLevel = XP_THRESHOLDS[nextLevel];
    const xpForCurrentLevel = hero.level === 1 ? 0 : XP_THRESHOLDS[hero.level];
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = currentXp - xpForCurrentLevel;
    const progress = Math.min(100, (xpProgress / xpNeeded) * 100);
    const canLevelUp = currentXp >= xpForNextLevel;

    return { current: currentXp, needed: xpForNextLevel, progress, canLevelUp };
  };

  const xpInfo = getXpProgress();

  const handleNotesSave = () => {
    updateHero({ notes: notesValue });
    setEditingNotes(false);
  };

  const openNotes = () => {
    setNotesValue(hero.notes || '');
    setShowNotes(true);
    setEditingNotes(true);
  };

  const circleShort: Record<string, string> = {
    blight: 'Blight', graves: 'Graves', spring: 'Spring', storms: 'Storms',
  };

  const chars = hero.characteristics;

  const charLabels: Record<Characteristic, string> = {
    might: 'Might',
    agility: 'Agility',
    reason: 'Reason',
    intuition: 'Intuition',
    presence: 'Presence',
  };

  const charShort: Record<Characteristic, string> = {
    might: 'MGT',
    agility: 'AGI',
    reason: 'REA',
    intuition: 'INT',
    presence: 'PRE',
  };

  const rollCharacteristic = (char: Characteristic) => {
    const value = chars[char];
    const result = performPowerRoll(value, rollModifier);
    setLastRoll({ char: charLabels[char], result });
    addRoll(result, `${charLabels[char]} Test`, 'hero');

    // Auto-clear the roll result after 5 seconds
    setTimeout(() => setLastRoll(null), 5000);
  };

  const cycleRollModifier = () => {
    const mods: RollModifier[] = ['normal', 'edge', 'bane'];
    const currentIdx = mods.indexOf(rollModifier);
    setRollModifier(mods[(currentIdx + 1) % mods.length]);
  };

  const handleConditionClick = (conditionId: ConditionId, def: ConditionDefinition) => {
    if (def.saveEnds) {
      const result = attemptSave(conditionId);
      setLastSaveResult(result);
      setTimeout(() => setLastSaveResult(null), 3000);
    } else {
      if (confirm(`Remove ${def.name}?`)) {
        removeCondition(conditionId);
      }
    }
  };

  const toggleCondition = (conditionId: ConditionId) => {
    if (hasCondition(conditionId)) {
      removeCondition(conditionId);
    } else {
      addCondition(conditionId);
    }
    setShowConditionDropdown(false);
  };

  const triggerBleeding = (trigger: string) => {
    const result = applyBleedingDamage(trigger);
    setLastBleedingResult(result);
    setTimeout(() => setLastBleedingResult(null), 3000);
  };

  return (
    <div className="stats-panel">
      {/* Row 1: Identity */}
      <div className="panel-row identity-row">
        <div className="identity">
          <span className="name">{hero.name}</span>
          <span className="tag level">Lv {hero.level}</span>
          <span className="tag circle">{circleShort[hero.circle]}</span>
          <span className="tag formation">{hero.formation}</span>
        </div>
        <div className="identity-actions">
          <button
            className="respite-btn"
            onClick={() => setShowRespiteConfirm(true)}
            disabled={isInCombat}
            title={isInCombat ? "Cannot respite during combat" : "Take a respite to convert victories to XP and restore resources"}
          >
            Respite
          </button>
          {hero.level < 10 && xpInfo.canLevelUp && (
            <button className="lvl-btn ready" onClick={onLevelUp}>Level Up!</button>
          )}
          {hero.level < 10 && !xpInfo.canLevelUp && (
            <button className="lvl-btn" onClick={onLevelUp} disabled>Level Up</button>
          )}
          <button className="notes-btn" onClick={openNotes}>Notes</button>
        </div>
      </div>

      {/* Row 2: Characteristics - Stat Box Style */}
      <div className="panel-row chars-row">
        <div className="char clickable" onClick={() => rollCharacteristic('might')} title="Click to roll Might test">
          <span className="val">{chars.might >= 0 ? '+' : ''}{chars.might}</span>
          <span className="lbl">Might</span>
        </div>
        <div className="char clickable" onClick={() => rollCharacteristic('agility')} title="Click to roll Agility test">
          <span className="val">{chars.agility >= 0 ? '+' : ''}{chars.agility}</span>
          <span className="lbl">Agility</span>
        </div>
        <div className="char clickable primary" onClick={() => rollCharacteristic('reason')} title="Click to roll Reason test">
          <span className="val">{chars.reason >= 0 ? '+' : ''}{chars.reason}</span>
          <span className="lbl">Reason</span>
        </div>
        <div className="char clickable" onClick={() => rollCharacteristic('intuition')} title="Click to roll Intuition test">
          <span className="val">{chars.intuition >= 0 ? '+' : ''}{chars.intuition}</span>
          <span className="lbl">Intuition</span>
        </div>
        <div className="char clickable" onClick={() => rollCharacteristic('presence')} title="Click to roll Presence test">
          <span className="val">{chars.presence >= 0 ? '+' : ''}{chars.presence}</span>
          <span className="lbl">Presence</span>
        </div>
        <div className="divider" />
        <button className={`roll-mod-btn ${rollModifier}`} onClick={cycleRollModifier} title="Toggle Edge/Bane">
          {rollModifier === 'edge' ? 'Edge' : rollModifier === 'bane' ? 'Bane' : 'Normal'}
        </button>
        <div className="divider" />
        <div className="char">
          <span className="val">
            {hero.speed}
            {totalBonuses.speed > 0 && <span className="equip-bonus">+{totalBonuses.speed}</span>}
          </span>
          <span className="lbl">Speed</span>
        </div>
        <div className="char">
          <span className="val">
            {hero.stability}
            {totalBonuses.stability > 0 && <span className="equip-bonus">+{totalBonuses.stability}</span>}
          </span>
          <span className="lbl">Stability</span>
        </div>
        {/* Damage Bonus from Equipment */}
        {totalBonuses.damage > 0 && (
          <div className="char equip-damage">
            <span className="val damage-bonus">+{totalBonuses.damage}</span>
            <span className="lbl">Damage</span>
          </div>
        )}

        {/* Roll Result Display */}
        {lastRoll && (
          <div className="roll-result-inline" style={{ borderColor: getTierColor(lastRoll.result.tier) }}>
            <span className="roll-char">{lastRoll.char}</span>
            <span className="roll-total" style={{ color: getTierColor(lastRoll.result.tier) }}>
              {lastRoll.result.total}
            </span>
            <span className="roll-breakdown">
              ({lastRoll.result.naturalRoll}{lastRoll.result.modifier >= 0 ? '+' : ''}{lastRoll.result.modifier})
            </span>
            <span className="roll-tier">T{lastRoll.result.tier}</span>
            <button className="dismiss-roll" onClick={() => setLastRoll(null)}>×</button>
          </div>
        )}
      </div>

      {/* Row 3: Resources */}
      <div className="panel-row resources-row">
        {/* Stamina */}
        <div className="resource stamina">
          <span className="lbl">HP</span>
          <button className="adj" onClick={() => adjust('stamina', -1)}>-</button>
          <span className={`val ${hero.stamina.current <= hero.stamina.winded ? 'winded' : ''}`}>
            {hero.stamina.current}<span className="max">/{hero.stamina.max}</span>
            {totalBonuses.stamina > 0 && <span className="equip-bonus">+{totalBonuses.stamina}</span>}
          </span>
          <button className="adj" onClick={() => adjust('stamina', 1)}>+</button>
          <button className="use-rec" onClick={useRecovery} disabled={hero.recoveries.current <= 0} title={`Use Recovery (+${hero.recoveries.value})`}>
            +{hero.recoveries.value}
          </button>
        </div>

        {/* Recoveries */}
        <div className="resource recoveries">
          <span className="lbl">REC</span>
          <button className="adj" onClick={() => adjust('recoveries', -1)}>-</button>
          <span className="val">{hero.recoveries.current}<span className="max">/{hero.recoveries.max}</span></span>
          <button className="adj" onClick={() => adjust('recoveries', 1)}>+</button>
        </div>

        {/* Essence */}
        <div className="resource essence">
          <span className="lbl">ESS</span>
          <button className="adj" onClick={() => spendEssence(1)} disabled={(essenceState?.currentEssence ?? 0) <= 0}>-</button>
          <span className="val essence-val">{essenceState?.currentEssence ?? 0}</span>
          <button className="adj" onClick={() => gainEssence(1)}>+</button>
        </div>

        {/* Victories */}
        <div className="resource victories">
          <span className="lbl">VIC</span>
          <button className="adj" onClick={() => adjust('victories', -1)}>-</button>
          <span className="val victory-val">{hero.victories}</span>
          <button className="adj" onClick={() => adjust('victories', 1)}>+</button>
        </div>

        {/* Surges */}
        <div className="resource surges">
          <span className="lbl">SRG</span>
          <button className="adj" onClick={() => adjust('surges', -1)}>-</button>
          <span className="val">{hero.surges}</span>
          <button className="adj" onClick={() => adjust('surges', 1)}>+</button>
        </div>

        {/* Hero Tokens */}
        <div className="resource tokens">
          <span className="lbl">TKN</span>
          <span className="val">{hero.heroTokens}</span>
        </div>

        {/* XP */}
        <div className="resource xp">
          <span className="lbl">XP</span>
          <span className={`val ${xpInfo.canLevelUp ? 'level-ready' : ''}`}>
            {hero.xp || 0}
            {hero.level < 10 && <span className="max">/{xpInfo.needed}</span>}
          </span>
        </div>
      </div>

      {/* Row 4: Conditions */}
      <div className="panel-row conditions-row">
        <span className="cond-label">COND</span>

        {/* Active condition badges */}
        <div className="cond-badges">
          {getActiveConditions().map(ac => {
            const def = getConditionDef(ac.conditionId);
            return (
              <button
                key={ac.conditionId}
                className={`cond-badge ${def.saveEnds ? 'saveable' : 'manual'}`}
                title={`${def.primaryEffect}\n\nClick to ${def.saveEnds ? 'attempt save' : 'remove'}`}
                onClick={() => handleConditionClick(ac.conditionId, def)}
              >
                {def.icon} {def.name} {def.saveEnds && '🎲'}
              </button>
            );
          })}
          {getActiveConditions().length === 0 && <span className="no-cond">None</span>}
        </div>

        {/* Add dropdown */}
        <div className="cond-add-wrap">
          <button className="cond-add-btn" onClick={() => setShowConditionDropdown(!showConditionDropdown)}>
            + Add
          </button>
          {showConditionDropdown && (
            <div className="cond-dropdown">
              {ALL_CONDITIONS.map(c => (
                <button key={c.id} onClick={() => toggleCondition(c.id)}>
                  {c.icon} {c.name} {hasCondition(c.id) && '✓'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bleeding triggers */}
        {hasCondition('bleeding') && (
          <div className="bleed-triggers">
            <span className="bleed-label">🩸</span>
            <button onClick={() => triggerBleeding('Main')}>Main</button>
            <button onClick={() => triggerBleeding('Triggered')}>Trig</button>
            <button onClick={() => triggerBleeding('Power Roll')}>Roll</button>
          </div>
        )}

        {/* Toast notifications */}
        {lastSaveResult && (
          <span className={`save-toast ${lastSaveResult.success ? 'success' : 'fail'}`}>
            {lastSaveResult.conditionName}: {lastSaveResult.roll} {lastSaveResult.success ? '✓' : '✗'}
          </span>
        )}
        {lastBleedingResult && (
          <span className="bleed-toast">🩸 {lastBleedingResult.total} dmg</span>
        )}
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="notes-overlay" onClick={() => setShowNotes(false)}>
          <div className="notes-modal" onClick={e => e.stopPropagation()}>
            <h3>Notes</h3>
            {editingNotes ? (
              <>
                <textarea
                  value={notesValue}
                  onChange={e => setNotesValue(e.target.value)}
                  placeholder="Add notes..."
                  autoFocus
                />
                <div className="notes-actions">
                  <button onClick={handleNotesSave}>Save</button>
                  <button onClick={() => setShowNotes(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <p onClick={() => { setNotesValue(hero.notes || ''); setEditingNotes(true); }}>
                {hero.notes || 'Click to add notes...'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Respite Confirmation Modal */}
      {showRespiteConfirm && (
        <div className="notes-overlay" onClick={() => setShowRespiteConfirm(false)}>
          <div className="respite-modal" onClick={e => e.stopPropagation()}>
            <h3>Take a Respite?</h3>
            <p className="respite-description">
              During a respite, you rest and recover. This will:
            </p>
            <ul className="respite-effects">
              <li>Convert <strong>{hero.victories} victories</strong> to <strong>{hero.victories} XP</strong></li>
              <li>Restore stamina to maximum ({hero.stamina.max})</li>
              <li>Restore all recoveries ({hero.recoveries.max})</li>
              <li>Reset surges to 0</li>
              <li>Dismiss all active minions</li>
            </ul>
            {hero.victories > 0 && (
              <p className="xp-preview">
                New XP total: {(hero.xp || 0) + hero.victories}
                {xpInfo.needed > 0 && ` / ${xpInfo.needed}`}
              </p>
            )}
            <div className="respite-actions">
              <button className="confirm-btn" onClick={handleRespite}>
                Take Respite
              </button>
              <button className="cancel-btn" onClick={() => setShowRespiteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterStatsPanel;
