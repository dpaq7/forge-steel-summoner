import React, { useState } from 'react';
import { Minimize2 } from 'lucide-react';
import { useSummonerContext } from '../../context/HeroContext';
import { useCombatContext } from '../../context/CombatContext';
import { useConditions, SaveResult, BleedingDamageResult } from '../../hooks/useConditions';
import { useEquipment } from '../../hooks/useEquipment';
import { ALL_CONDITIONS, ConditionDefinition } from '../../data/conditions';
import { EdgeBaneState } from '../../utils/dice';
import { Characteristic, ConditionId, HeroClass } from '../../types';
import { isSummonerHero, SummonerHeroV2, isConduitHero, ConduitHero, Hero } from '../../types/hero';
import { getResourceConfig } from '../../data/class-resources';
import {
  classDefinitions,
  getSubclassTypeName,
  getSubclassTypeNamePlural,
  getSubclassById,
} from '../../data/classes/class-definitions';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import PentagonStatBox from '../ui/PentagonStatBox';
import StatBox from '../shared/StatBox';
import ProgressionTracker from '../ui/ProgressionTracker';
import ResourcePanel from '../ui/ResourcePanel';
import SurgesTracker from '../ui/SurgesTracker';
import SectionHeader from '../shared/SectionHeader';
import DrawSteelDice from '../ui/DrawSteelDice';
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

// Helper to get subclass display info for any hero class
interface SubclassDisplayInfo {
  label: string;      // "Order", "Domain", "Aspect", etc.
  value: string;      // "Exorcist", "Life / Protection", "Berserker"
  colorClass: string; // CSS class for styling
}

function getSubclassDisplay(hero: Hero): SubclassDisplayInfo | null {
  // Handle Conduit's dual domains
  if (hero.heroClass === 'conduit' && isConduitHero(hero)) {
    const conduitHero = hero as ConduitHero;
    if (conduitHero.domains && conduitHero.domains.length > 0) {
      const domainNames = conduitHero.domains
        .map(d => getSubclassById('conduit', d)?.name || d)
        .join(' / ');
      return {
        label: getSubclassTypeNamePlural('conduit'),
        value: domainNames,
        colorClass: 'subclass-conduit',
      };
    }
    // Fallback to single subclass field if domains array is empty
    if (conduitHero.subclass) {
      const option = getSubclassById('conduit', conduitHero.subclass);
      return {
        label: getSubclassTypeName('conduit'),
        value: option?.name || conduitHero.subclass,
        colorClass: 'subclass-conduit',
      };
    }
    return null;
  }

  // Handle single subclass for other classes
  if (!hero.subclass) return null;

  const option = getSubclassById(hero.heroClass, hero.subclass);
  if (!option) return null;

  return {
    label: getSubclassTypeName(hero.heroClass),
    value: option.name,
    colorClass: `subclass-${hero.heroClass}`,
  };
}

interface CharacterStatsPanelProps {
  onLevelUp: () => void;
  onMinimize?: () => void;
}

const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({ onLevelUp, onMinimize }) => {
  const { hero, updateHero } = useSummonerContext();
  const { isInCombat, startCombat, endCombat } = useCombatContext();
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
  const [edgeBaneState, setEdgeBaneState] = useState<EdgeBaneState>({ edges: 0, banes: 0 });
  const [pendingCharacteristic, setPendingCharacteristic] = useState<{ name: string; value: number } | null>(null);
  const [showRespiteConfirm, setShowRespiteConfirm] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [lastSaveResult, setLastSaveResult] = useState<SaveResult | null>(null);
  const [lastBleedingResult, setLastBleedingResult] = useState<BleedingDamageResult | null>(null);
  const [windedOverride, setWindedOverride] = useState(false);
  const [dyingOverride, setDyingOverride] = useState(false);

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

  // Get hero class and check if Summoner
  const heroClass: HeroClass = hero.heroClass || 'summoner';
  const isSummoner = isSummonerHero(hero);
  const summonerHero = isSummoner ? (hero as SummonerHeroV2) : null;
  const classDef = classDefinitions[heroClass];

  // Get subclass display info for the current hero
  const subclassInfo = getSubclassDisplay(hero);

  const chars = hero.characteristics;

  // Get class-specific resource config (single source of truth)
  const resourceConfig = getResourceConfig(heroClass);
  const resourceName = resourceConfig.name;
  const resourceMinValue = resourceConfig.minValue;
  const currentResource = hero.heroicResource?.current ?? 0;

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
    setPendingCharacteristic({ name: charLabels[char], value });
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
          <span className="tag class">{classDef?.name || 'Unknown'}</span>
          {/* Universal Subclass Tag - shows for all classes when subclass is selected */}
          {subclassInfo && (
            <span
              className={`tag subclass ${subclassInfo.colorClass}`}
              title={`${subclassInfo.label}: ${subclassInfo.value}`}
            >
              {subclassInfo.value}
            </span>
          )}
          {/* Summoner-specific: Formation tag (kept separate from subclass) */}
          {isSummoner && summonerHero?.formation && (
            <span className="tag formation">
              {summonerHero.formation.charAt(0).toUpperCase() + summonerHero.formation.slice(1)}
            </span>
          )}
        </div>
        <div className="identity-actions">
          {!isInCombat ? (
            <button className="draw-steel-btn" onClick={startCombat}>
              Draw Steel!
            </button>
          ) : (
            <button className="end-combat-btn" onClick={endCombat}>
              End Combat
            </button>
          )}
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
          {onMinimize && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onMinimize}
                  className="expand-toggle"
                  aria-label="Minimize to smart header"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Minimize to Smart Header</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Row 2: Characteristics + Resources + Progression */}
      <div className="panel-row chars-progression-row">
        <div className="characteristics-section">
          <SectionHeader title="Characteristics" variant="compact" />
          <div className="pentagon-stats">
            <PentagonStatBox
              value={chars.might}
              label="Might"
              onClick={() => rollCharacteristic('might')}
            />
            <PentagonStatBox
              value={chars.agility}
              label="Agility"
              onClick={() => rollCharacteristic('agility')}
            />
            <PentagonStatBox
              value={chars.reason}
              label="Reason"
              onClick={() => rollCharacteristic('reason')}
            />
            <PentagonStatBox
              value={chars.intuition}
              label="Intuition"
              onClick={() => rollCharacteristic('intuition')}
            />
            <PentagonStatBox
              value={chars.presence}
              label="Presence"
              onClick={() => rollCharacteristic('presence')}
            />
          </div>
        </div>

        <ResourcePanel
          stamina={{
            current: hero.stamina.current,
            max: hero.stamina.max + (totalBonuses.stamina || 0),
            temporary: 0,
            winded: windedOverride,
            dying: dyingOverride,
            dyingThreshold: 0, // Dying occurs at 0 HP per Draw Steel rules
          }}
          recoveries={{
            stamina: hero.recoveries.value,
            current: hero.recoveries.current,
            max: hero.recoveries.max,
          }}
          essence={{
            current: currentResource,
            max: isSummoner && summonerHero ? summonerHero.heroicResource.maxPerTurn : 10,
          }}
          resourceName={resourceName}
          onStaminaChange={(updates) => {
            if (updates.current !== undefined) {
              updateHero({ stamina: { ...hero.stamina, current: updates.current } });
            }
            if (updates.winded !== undefined) {
              setWindedOverride(updates.winded);
            }
            if (updates.dying !== undefined) {
              setDyingOverride(updates.dying);
            }
          }}
          onRecoveriesChange={(current) => {
            updateHero({ recoveries: { ...hero.recoveries, current } });
          }}
          onCatchBreath={useRecovery}
          onEssenceChange={(newValue) => {
            // Single source of truth: update hero.heroicResource directly
            const clampedValue = Math.max(resourceMinValue, newValue);
            const updatedResource = {
              ...hero.heroicResource,
              current: clampedValue,
            };
            updateHero({ heroicResource: updatedResource } as Partial<typeof hero>);
          }}
          onDyingTriggered={() => {
            // Per Draw Steel rules: when you become dying, you gain the Bleeding condition
            if (!hasCondition('bleeding')) {
              addCondition('bleeding');
            }
          }}
          hideSurges
          className="inline-resources"
        />

        <ProgressionTracker
          victories={hero.victories}
          maxVictories={12}
          onVictoriesChange={(count) => updateHero({ victories: count })}
          level={hero.level}
          gold={hero.gold}
          onGoldChange={(gold) => updateHero({ gold })}
          renown={hero.renown}
          onRenownChange={(renown) => updateHero({ renown })}
          xp={{ current: hero.xp || 0, needed: xpInfo.needed }}
          portraitUrl={hero.portraitUrl}
          onPortraitChange={(portraitUrl) => updateHero({ portraitUrl })}
          className="inline-progression"
        />
      </div>

      {/* Row 2.5: Derived Stats, Roll Controls & Conditions */}
      <div className="panel-row derived-row">
        <DrawSteelDice
          edgeBaneState={edgeBaneState}
          onEdgeBaneChange={setEdgeBaneState}
          pendingCharacteristic={pendingCharacteristic}
          onCharacteristicRollComplete={() => setPendingCharacteristic(null)}
        />

        <div className="derived-stats">
          <StatBox
            value={hero.speed + (totalBonuses.speed || 0)}
            label="Speed"
            size="sm"
          />
          <StatBox
            value={hero.stability + (totalBonuses.stability || 0)}
            label="Stability"
            size="sm"
          />
          {/* Only show Summoner's Range for Summoners */}
          {isSummoner && (
            <StatBox
              value={5 + chars.reason}
              label="Sum. Range"
              size="sm"
              title="Summoner's Range: Maximum distance to summon minions and use conjuring abilities (5 + Reason)"
            />
          )}
          {totalBonuses.damage > 0 && (
            <StatBox
              value={`+${totalBonuses.damage}`}
              label="Damage"
              size="sm"
              variant="accent"
            />
          )}
        </div>

        <SurgesTracker
          current={hero.surges}
          max={3}
          onCurrentChange={(current) => updateHero({ surges: current })}
        />

        {/* Conditions */}
        <div className="conditions-inline">
          <span className="cond-label">COND</span>
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
          {hasCondition('bleeding') && (
            <div className="bleed-triggers">
              <span className="bleed-label">🩸</span>
              <button onClick={() => triggerBleeding('Main')}>Main</button>
              <button onClick={() => triggerBleeding('Triggered')}>Trig</button>
              <button onClick={() => triggerBleeding('Power Roll')}>Roll</button>
            </div>
          )}
          {lastSaveResult && (
            <span className={`save-toast ${lastSaveResult.success ? 'success' : 'fail'}`}>
              {lastSaveResult.conditionName}: {lastSaveResult.roll} {lastSaveResult.success ? '✓' : '✗'}
            </span>
          )}
          {lastBleedingResult && (
            <span className="bleed-toast">🩸 {lastBleedingResult.total} dmg</span>
          )}
        </div>

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
