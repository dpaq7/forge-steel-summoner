import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { useCombatContext } from '../../context/CombatContext';
import { useSquads } from '../../hooks/useSquads';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useEssence } from '../../hooks/useEssence';
import { useStaminaStates } from '../../hooks/useStaminaStates';
import { useConditions, SaveResult, BleedingDamageResult } from '../../hooks/useConditions';
import { useRollHistory } from '../../context/RollHistoryContext';
import { Squad, MinionTemplate, ConditionId } from '../../types';
import { calculateMaxMinions } from '../../utils/calculations';
import { performPowerRoll, PowerRollResult, getTierColor, RollModifier } from '../../utils/dice';
import { ALL_CONDITIONS, CONDITIONS } from '../../data/conditions';
import TurnFlowGuide from './TurnFlowGuide';
import ActionEconomyPanel from './ActionEconomyPanel';
import './CombatView.css';

const CombatView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();
  const { isInCombat, essenceState, hasSacrificedThisTurn, sacrificeMinion } = useCombatContext();
  const { createSquad, addSquad, removeSquad, updateSquad, damageSquad, healSquad } = useSquads();
  const { getSignatureMinions, getUnlockedMinions, getMinionById, getActualEssenceCost, isMinionUnlockedByLevel, getRequiredLevel, isSignatureMinion } = usePortfolio();
  const { canAffordMinion, spendForMinion, currentEssence } = useEssence();
  const { getSquadStaminaState, getStateColor, getStateLabel, getStaminaState } = useStaminaStates();
  const {
    addCondition,
    removeCondition,
    hasCondition,
    getActiveConditions,
    getConditionDef,
    attemptSave,
    applyBleedingDamage,
  } = useConditions();
  const { addRoll } = useRollHistory();

  const [rollStates, setRollStates] = useState<Record<string, { result: PowerRollResult; type: string }>>({});
  const [rollModifiers, setRollModifiers] = useState<Record<string, RollModifier>>({});
  const [damageInput, setDamageInput] = useState<Record<string, string>>({});
  const [selectedMinion, setSelectedMinion] = useState<MinionTemplate | null>(null);
  // Track summon quantities per minion type (in multiples of minionsPerSummon)
  const [summonMultipliers, setSummonMultipliers] = useState<Record<string, number>>({});
  const [heroStaminaInput, setHeroStaminaInput] = useState<string>('');
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [lastSaveResult, setLastSaveResult] = useState<SaveResult | null>(null);
  const [lastBleedingResult, setLastBleedingResult] = useState<BleedingDamageResult | null>(null);

  if (!hero) return null;

  const signatureMinions = getSignatureMinions();
  const unlockedMinions = getUnlockedMinions();
  const allMinions = [...signatureMinions, ...unlockedMinions];

  // Calculate constraints
  const totalActiveMinions = hero.activeSquads.reduce(
    (sum, squad) => sum + squad.members.filter(m => m.isAlive).length,
    0
  );
  const maxMinions = calculateMaxMinions(hero.formation, hero.level);
  const squadCount = hero.activeSquads.length;
  const maxSquads = 2;

  // Get the current summon multiplier (number of summon batches)
  const getSummonMultiplier = (minionId: string) => summonMultipliers[minionId] || 1;

  // Adjust the summon multiplier
  const adjustSummonMultiplier = (minionId: string, delta: number) => {
    setSummonMultipliers(prev => {
      const current = prev[minionId] || 1;
      const newValue = Math.max(1, current + delta);
      return { ...prev, [minionId]: newValue };
    });
  };

  // Calculate total minions and cost for a given multiplier
  const getSummonInfo = (minion: MinionTemplate) => {
    const multiplier = getSummonMultiplier(minion.id);
    const totalMinions = minion.minionsPerSummon * multiplier;
    const baseCost = getActualEssenceCost(minion);
    const totalCost = baseCost * multiplier;
    return { multiplier, totalMinions, totalCost };
  };

  // Check if we can summon a minion (with multiplier)
  const canSummon = (minion: MinionTemplate): { canSummon: boolean; reason: string } => {
    if (!isInCombat) {
      return { canSummon: false, reason: 'Not in combat' };
    }

    // Check level requirement
    if (!isMinionUnlockedByLevel(minion)) {
      const requiredLevel = getRequiredLevel(minion);
      return { canSummon: false, reason: `Requires Level ${requiredLevel}` };
    }

    const { totalMinions, totalCost } = getSummonInfo(minion);

    if (currentEssence < totalCost) {
      return { canSummon: false, reason: `Need ${totalCost} essence` };
    }

    const newMinions = totalActiveMinions + totalMinions;
    if (newMinions > maxMinions) {
      return { canSummon: false, reason: `Exceeds cap (${totalActiveMinions}/${maxMinions})` };
    }

    // Check squad limit - can we add to existing or create new?
    const existingSquad = hero.activeSquads.find(s => s.templateId === minion.id);
    if (!existingSquad && squadCount >= maxSquads) {
      return { canSummon: false, reason: `Max ${maxSquads} squads` };
    }

    return { canSummon: true, reason: '' };
  };

  const handleSummon = (minion: MinionTemplate) => {
    const check = canSummon(minion);
    if (!check.canSummon) return;

    const { multiplier } = getSummonInfo(minion);

    // Spend essence for all batches
    let allSucceeded = true;
    for (let i = 0; i < multiplier; i++) {
      const success = spendForMinion(minion);
      if (!success) {
        allSucceeded = false;
        break;
      }
    }

    if (allSucceeded) {
      // Create all minions at once
      let existingSquad = hero.activeSquads.find(s => s.templateId === minion.id);

      for (let i = 0; i < multiplier; i++) {
        const newSquad = createSquad(minion);

        if (existingSquad) {
          // Add minions to existing squad
          const updatedMembers = [...existingSquad.members, ...newSquad.members];
          const updatedMaxStamina = existingSquad.maxStamina + newSquad.maxStamina;
          const updatedCurrentStamina = existingSquad.currentStamina + newSquad.currentStamina;

          updateSquad(existingSquad.id, {
            members: updatedMembers,
            maxStamina: updatedMaxStamina,
            currentStamina: updatedCurrentStamina,
          });

          // Update our reference for next iteration
          existingSquad = {
            ...existingSquad,
            members: updatedMembers,
            maxStamina: updatedMaxStamina,
            currentStamina: updatedCurrentStamina,
          };
        } else {
          // Create new squad on first iteration
          addSquad(newSquad);
          existingSquad = newSquad;
        }
      }

      // Reset multiplier after successful summon
      setSummonMultipliers(prev => ({ ...prev, [minion.id]: 1 }));
    }
  };

  // Squad management functions
  const handleDismissSquad = (squadId: string) => {
    if (confirm('Dismiss this entire squad?')) {
      removeSquad(squadId);
    }
  };

  // Sacrifice a signature minion for 1 essence (1/turn)
  const handleSacrifice = (squad: Squad) => {
    const template = getMinionById(squad.templateId);
    if (!template || !isSignatureMinion(template)) return;
    if (hasSacrificedThisTurn) return;

    const aliveMembers = squad.members.filter(m => m.isAlive);
    if (aliveMembers.length === 0) return;

    // Kill one minion from the squad
    const minionToKill = aliveMembers[aliveMembers.length - 1]; // Kill the last one
    const updatedMembers = squad.members.map(m =>
      m.id === minionToKill.id ? { ...m, isAlive: false } : m
    );

    // Update stamina pool
    const newCurrentStamina = Math.max(0, squad.currentStamina - minionToKill.maxStamina);

    updateSquad(squad.id, {
      members: updatedMembers,
      currentStamina: newCurrentStamina,
    });

    // Gain essence via sacrificeMinion (handles the once-per-turn tracking)
    sacrificeMinion();
  };

  const handleDamageSquad = (squadId: string, amount: number) => {
    const result = damageSquad(squadId, amount);
    if (result.overflowDamage > 0) {
      alert(`Squad wiped! Overflow damage: ${result.overflowDamage} to summoner.`);
    }
  };

  const toggleSquadMoved = (squad: Squad) => {
    updateSquad(squad.id, { hasMoved: !squad.hasMoved });
  };

  const toggleSquadActed = (squad: Squad) => {
    updateSquad(squad.id, { hasActed: !squad.hasActed });
  };

  const getRollModifier = (squadId: string): RollModifier => rollModifiers[squadId] || 'normal';

  const cycleRollModifier = (squadId: string) => {
    const mods: RollModifier[] = ['normal', 'edge', 'bane'];
    const current = getRollModifier(squadId);
    const next = mods[(mods.indexOf(current) + 1) % mods.length];
    setRollModifiers(prev => ({ ...prev, [squadId]: next }));
  };

  const handleFreeStrikeRoll = (squad: Squad, template: MinionTemplate) => {
    const charValue = Math.max(template.characteristics.might, template.characteristics.agility);
    const result = performPowerRoll(charValue, getRollModifier(squad.id));
    setRollStates(prev => ({ ...prev, [squad.id]: { result, type: 'freeStrike' } }));
    addRoll(result, `${template.name} Free Strike`, 'minion');
  };

  const handleSignatureRoll = (squad: Squad, template: MinionTemplate) => {
    if (!template.signatureAbility?.powerRoll) return;
    const charValue = template.characteristics[template.signatureAbility.powerRoll.characteristic];
    const result = performPowerRoll(charValue, getRollModifier(squad.id));
    setRollStates(prev => ({ ...prev, [`${squad.id}_sig`]: { result, type: 'signature' } }));
    addRoll(result, `${template.name} ${template.signatureAbility.name}`, 'minion');
  };

  const aliveCount = (squad: Squad) => squad.members.filter(m => m.isAlive).length;

  return (
    <div className="combat-view-merged">
      {/* Left Panel: Turn Flow + Summon */}
      <div className="combat-left-panel">
        <TurnFlowGuide />

        {/* Essence & Constraints */}
        <div className="combat-constraints">
          <div className="constraint essence-constraint">
            <span className="constraint-label">Essence</span>
            <span className="constraint-value essence-val">{currentEssence}</span>
          </div>
          <div className="constraint minion-constraint">
            <span className="constraint-label">Minions</span>
            <span className={`constraint-value ${totalActiveMinions >= maxMinions ? 'at-cap' : ''}`}>
              {totalActiveMinions}/{maxMinions}
            </span>
          </div>
          <div className="constraint squad-constraint">
            <span className="constraint-label">Squads</span>
            <span className={`constraint-value ${squadCount >= maxSquads ? 'at-cap' : ''}`}>
              {squadCount}/{maxSquads}
            </span>
          </div>
        </div>

        {/* Hero Stamina Panel with Winded/Dying States */}
        {(() => {
          const heroState = getStaminaState(hero.stamina.current, hero.stamina.max);
          const heroStateLabel = getStateLabel(heroState.currentState);
          const heroHealthPct = Math.max(0, (hero.stamina.current / hero.stamina.max) * 100);

          const handleHeroDamage = (amount: number) => {
            const newStamina = hero.stamina.current - amount;
            updateHero({
              stamina: { ...hero.stamina, current: newStamina }
            });
            // Check for death
            if (newStamina <= heroState.deathThreshold) {
              alert(`${hero.name} has DIED! (Stamina: ${newStamina} <= Death threshold: ${heroState.deathThreshold})`);
            }
          };

          const handleHeroHeal = (amount: number) => {
            const newStamina = Math.min(hero.stamina.max, hero.stamina.current + amount);
            updateHero({
              stamina: { ...hero.stamina, current: newStamina }
            });
          };

          return (
            <div className={`hero-stamina-panel state-${heroState.currentState}`}>
              <div className="hero-stamina-header">
                <span className="hero-stamina-title">{hero.name}</span>
                {heroStateLabel && (
                  <span className={`stamina-state state-${heroState.currentState}`}>
                    {heroStateLabel}
                  </span>
                )}
              </div>

              <div className="hero-hp-bar-container">
                <div className="hero-hp-bar">
                  <div
                    className="hp-fill"
                    style={{
                      width: `${heroHealthPct}%`,
                      background: getStateColor(heroState.currentState)
                    }}
                  />
                  {/* Winded threshold marker at 50% */}
                  <div className="winded-marker" style={{ left: '50%' }} title={`Winded: ${heroState.windedValue}`} />
                </div>
                <span className="hero-hp-text">
                  {hero.stamina.current}/{hero.stamina.max}
                </span>
              </div>

              <div className="hero-stamina-thresholds">
                <span className="threshold winded" title="Winded threshold">
                  Winded: ≤{heroState.windedValue}
                </span>
                <span className="threshold death" title="Death threshold">
                  Death: ≤{heroState.deathThreshold}
                </span>
              </div>

              <div className="hero-damage-controls">
                <button onClick={() => handleHeroDamage(1)}>-1</button>
                <button onClick={() => handleHeroDamage(5)}>-5</button>
                <input
                  type="number"
                  placeholder="Dmg"
                  value={heroStaminaInput}
                  onChange={e => setHeroStaminaInput(e.target.value)}
                />
                <button
                  onClick={() => {
                    const dmg = parseInt(heroStaminaInput || '0');
                    if (dmg !== 0) {
                      if (dmg > 0) handleHeroDamage(dmg);
                      else handleHeroHeal(-dmg);
                      setHeroStaminaInput('');
                    }
                  }}
                >
                  Apply
                </button>
                <button onClick={() => handleHeroHeal(1)} className="heal-btn">+1</button>
                <button onClick={() => handleHeroHeal(hero.recoveries.value)} className="heal-btn recovery" title={`Use Recovery (${hero.recoveries.value} HP)`}>
                  Rec
                </button>
              </div>

              {/* Conditions Section */}
              <div className="conditions-section">
                <div className="conditions-header">
                  <span className="conditions-label">Conditions</span>
                  <div className="condition-dropdown-wrapper">
                    <button
                      className="add-condition-btn"
                      onClick={() => setShowConditionDropdown(!showConditionDropdown)}
                    >
                      + Add
                    </button>
                    {showConditionDropdown && (
                      <div className="condition-dropdown">
                        {ALL_CONDITIONS.map(condition => {
                          const isActive = hasCondition(condition.id);
                          return (
                            <button
                              key={condition.id}
                              className={`condition-option ${isActive ? 'active' : ''}`}
                              onClick={() => {
                                if (isActive) {
                                  removeCondition(condition.id);
                                } else {
                                  addCondition(condition.id);
                                }
                                setShowConditionDropdown(false);
                              }}
                              title={condition.primaryEffect}
                            >
                              <span className="condition-icon">{condition.icon}</span>
                              <span className="condition-name">{condition.name}</span>
                              {isActive && <span className="condition-check">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Conditions Display */}
                {getActiveConditions().length > 0 && (
                  <div className="active-conditions">
                    {getActiveConditions().map(activeCondition => {
                      const def = getConditionDef(activeCondition.conditionId);
                      return (
                        <div
                          key={activeCondition.conditionId}
                          className={`condition-badge ${def.saveEnds ? 'saveable' : 'manual'}`}
                          title={`${def.name}: ${def.primaryEffect}\n\nEnds via: ${def.saveRequired}`}
                          onClick={() => {
                            if (def.saveEnds) {
                              const result = attemptSave(activeCondition.conditionId);
                              setLastSaveResult(result);
                              setTimeout(() => setLastSaveResult(null), 3000);
                            } else {
                              if (confirm(`Remove ${def.name}? (${def.saveRequired})`)) {
                                removeCondition(activeCondition.conditionId);
                              }
                            }
                          }}
                        >
                          <span className="badge-icon">{def.icon}</span>
                          <span className="badge-name">{def.name}</span>
                          {def.saveEnds && <span className="save-hint">🎲</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Save Result Toast */}
                {lastSaveResult && (
                  <div className={`save-result-toast ${lastSaveResult.success ? 'success' : 'failure'}`}>
                    <strong>{lastSaveResult.conditionName}</strong> Save: {lastSaveResult.roll}
                    {lastSaveResult.success
                      ? ` ≥ 6 - SUCCESS! ${lastSaveResult.removed ? 'Condition removed.' : ''}`
                      : ' < 6 - FAILED'}
                  </div>
                )}

                {/* Bleeding Damage Result Toast */}
                {lastBleedingResult && (
                  <div className="bleeding-result-toast">
                    🩸 Bleeding: 1d6 ({lastBleedingResult.roll}) + {hero.level} = <strong>{lastBleedingResult.total} damage</strong>
                    <span className="trigger-source">({lastBleedingResult.trigger})</span>
                  </div>
                )}

                {/* Bleeding Action Trigger Button */}
                {hasCondition('bleeding') && (
                  <div className="bleeding-trigger-section">
                    <span className="bleeding-trigger-label">
                      🩸 Bleeding triggers on: Main Action, Triggered Action, Might/Agility Power Rolls
                    </span>
                    <div className="bleeding-trigger-buttons">
                      <button
                        className="bleeding-trigger-btn"
                        onClick={() => {
                          const result = applyBleedingDamage('Main Action');
                          if (result) {
                            setLastBleedingResult(result);
                            setTimeout(() => setLastBleedingResult(null), 3000);
                          }
                        }}
                      >
                        Main Action
                      </button>
                      <button
                        className="bleeding-trigger-btn"
                        onClick={() => {
                          const result = applyBleedingDamage('Triggered Action');
                          if (result) {
                            setLastBleedingResult(result);
                            setTimeout(() => setLastBleedingResult(null), 3000);
                          }
                        }}
                      >
                        Triggered
                      </button>
                      <button
                        className="bleeding-trigger-btn"
                        onClick={() => {
                          const result = applyBleedingDamage('Might/Agility Roll');
                          if (result) {
                            setLastBleedingResult(result);
                            setTimeout(() => setLastBleedingResult(null), 3000);
                          }
                        }}
                      >
                        Power Roll
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {heroState.isDying && (
                <div className="dying-warning">
                  ⚠️ DYING: Bleeding (cannot be removed), cannot Catch Breath
                </div>
              )}
            </div>
          );
        })()}

        {/* Summon Panel */}
        <div className="summon-panel">
          <h3>Summon Minions</h3>
          {!isInCombat && <div className="not-in-combat">Start combat to summon</div>}

          <div className="summon-grid">
            {/* Signature Minions */}
            <div className="summon-section">
              <h4>Signature (1 Ess)</h4>
              {signatureMinions.map(minion => {
                const check = canSummon(minion);
                const { totalMinions, totalCost } = getSummonInfo(minion);
                return (
                  <div key={minion.id} className="summon-row">
                    <button
                      className="qty-btn"
                      onClick={() => adjustSummonMultiplier(minion.id, -1)}
                      disabled={getSummonMultiplier(minion.id) <= 1}
                    >
                      -
                    </button>
                    <button
                      className={`summon-btn ${check.canSummon ? 'available' : 'unavailable'}`}
                      onClick={() => handleSummon(minion)}
                      disabled={!check.canSummon}
                      title={check.canSummon ? `Summon ${totalMinions}x ${minion.name}` : check.reason}
                    >
                      <span className="minion-name">{minion.name}</span>
                      <span className="minion-info">×{totalMinions} {minion.role}</span>
                      <span className="minion-cost">{totalCost}</span>
                    </button>
                    <button
                      className="qty-btn"
                      onClick={() => adjustSummonMultiplier(minion.id, 1)}
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 3-Essence Minions */}
            {unlockedMinions.filter(m => m.essenceCost === 3).length > 0 && (
              <div className="summon-section">
                <h4>3 Essence</h4>
                {unlockedMinions.filter(m => m.essenceCost === 3).map(minion => {
                  const check = canSummon(minion);
                  const { totalMinions, totalCost } = getSummonInfo(minion);
                  return (
                    <div key={minion.id} className="summon-row">
                      <button
                        className="qty-btn"
                        onClick={() => adjustSummonMultiplier(minion.id, -1)}
                        disabled={getSummonMultiplier(minion.id) <= 1}
                      >
                        -
                      </button>
                      <button
                        className={`summon-btn ${check.canSummon ? 'available' : 'unavailable'}`}
                        onClick={() => handleSummon(minion)}
                        disabled={!check.canSummon}
                        title={check.canSummon ? `Summon ${totalMinions}x ${minion.name}` : check.reason}
                      >
                        <span className="minion-name">{minion.name}</span>
                        <span className="minion-info">×{totalMinions} {minion.role}</span>
                        <span className="minion-cost">{totalCost}</span>
                      </button>
                      <button
                        className="qty-btn"
                        onClick={() => adjustSummonMultiplier(minion.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5-Essence Minions */}
            {unlockedMinions.filter(m => m.essenceCost === 5).length > 0 && (
              <div className="summon-section">
                <h4>5 Essence</h4>
                {unlockedMinions.filter(m => m.essenceCost === 5).map(minion => {
                  const check = canSummon(minion);
                  const { totalMinions, totalCost } = getSummonInfo(minion);
                  return (
                    <div key={minion.id} className="summon-row">
                      <button
                        className="qty-btn"
                        onClick={() => adjustSummonMultiplier(minion.id, -1)}
                        disabled={getSummonMultiplier(minion.id) <= 1}
                      >
                        -
                      </button>
                      <button
                        className={`summon-btn ${check.canSummon ? 'available' : 'unavailable'}`}
                        onClick={() => handleSummon(minion)}
                        disabled={!check.canSummon}
                        title={check.canSummon ? `Summon ${totalMinions}x ${minion.name}` : check.reason}
                      >
                        <span className="minion-name">{minion.name}</span>
                        <span className="minion-info">×{totalMinions} {minion.role}</span>
                        <span className="minion-cost">{totalCost}</span>
                      </button>
                      <button
                        className="qty-btn"
                        onClick={() => adjustSummonMultiplier(minion.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 7-Essence Minions */}
            {unlockedMinions.filter(m => m.essenceCost === 7).length > 0 && (
              <div className="summon-section">
                <h4>7 Essence</h4>
                {unlockedMinions.filter(m => m.essenceCost === 7).map(minion => {
                  const check = canSummon(minion);
                  const { totalMinions, totalCost } = getSummonInfo(minion);
                  return (
                    <div key={minion.id} className="summon-row">
                      <button
                        className="qty-btn"
                        onClick={() => adjustSummonMultiplier(minion.id, -1)}
                        disabled={getSummonMultiplier(minion.id) <= 1}
                      >
                        -
                      </button>
                      <button
                        className={`summon-btn ${check.canSummon ? 'available' : 'unavailable'}`}
                        onClick={() => handleSummon(minion)}
                        disabled={!check.canSummon}
                        title={check.canSummon ? `Summon ${totalMinions}x ${minion.name}` : check.reason}
                      >
                        <span className="minion-name">{minion.name}</span>
                        <span className="minion-info">×{totalMinions} {minion.role}</span>
                        <span className="minion-cost">{totalCost}</span>
                      </button>
                      <button
                        className="qty-btn"
                        onClick={() => adjustSummonMultiplier(minion.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Action Economy + Active Squads */}
      <div className="combat-right-panel">
        {/* Action Economy Reference */}
        <ActionEconomyPanel />

        <div className="squads-header">
          <h3>Active Squads</h3>
        </div>

        {hero.activeSquads.length === 0 ? (
          <div className="no-squads">
            <p>No active squads</p>
            <p className="hint">{isInCombat ? 'Use the summon panel to call forth minions' : 'Start combat to begin'}</p>
          </div>
        ) : (
          <div className="squads-list">
            {hero.activeSquads.map(squad => {
              const template = getMinionById(squad.templateId);
              if (!template) return null;

              const alive = aliveCount(squad);
              const healthPct = (squad.currentStamina / squad.maxStamina) * 100;
              const staminaState = getSquadStaminaState(squad);
              const stateLabel = getStateLabel(staminaState.currentState);
              const rollMod = getRollModifier(squad.id);
              const freeStrikeResult = rollStates[squad.id];
              const sigResult = rollStates[`${squad.id}_sig`];

              return (
                <div key={squad.id} className="squad-card">
                  <div className="squad-header">
                    <div className="squad-title">
                      <h4>{template.name}</h4>
                      <span className="squad-meta">{alive}/{squad.members.length} alive · {template.role}</span>
                    </div>
                    <button className="dismiss-btn" onClick={() => handleDismissSquad(squad.id)} title="Dismiss">×</button>
                  </div>

                  {/* HP Bar with Winded/Dying State */}
                  <div className="squad-hp">
                    <div className="hp-bar">
                      <div
                        className="hp-fill"
                        style={{
                          width: `${healthPct}%`,
                          background: getStateColor(staminaState.currentState)
                        }}
                      />
                      {/* Winded threshold marker */}
                      <div
                        className="winded-marker"
                        style={{ left: '50%' }}
                        title={`Winded threshold: ${staminaState.windedValue}`}
                      />
                    </div>
                    <span className="hp-text">{squad.currentStamina}/{squad.maxStamina}</span>
                    {stateLabel && (
                      <span className={`stamina-state state-${staminaState.currentState}`}>
                        {stateLabel}
                      </span>
                    )}
                  </div>

                  {/* Minion Icons */}
                  <div className="minion-icons">
                    {squad.members.map((m, i) => (
                      <div key={m.id} className={`minion-icon ${m.isAlive ? 'alive' : 'dead'}`} title={`#${i + 1}: ${m.isAlive ? 'Alive' : 'Dead'}`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Damage Controls */}
                  <div className="damage-controls">
                    <button onClick={() => handleDamageSquad(squad.id, 1)}>-1</button>
                    <button onClick={() => handleDamageSquad(squad.id, 5)}>-5</button>
                    <input
                      type="number"
                      placeholder="Dmg"
                      value={damageInput[squad.id] || ''}
                      onChange={e => setDamageInput(prev => ({ ...prev, [squad.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => {
                        const dmg = parseInt(damageInput[squad.id] || '0');
                        if (dmg > 0) {
                          handleDamageSquad(squad.id, dmg);
                          setDamageInput(prev => ({ ...prev, [squad.id]: '' }));
                        }
                      }}
                    >
                      Apply
                    </button>
                    <button onClick={() => healSquad(squad.id, 1)} className="heal-btn">+1</button>
                  </div>

                  {/* Action Toggles */}
                  <div className="action-toggles">
                    <button className={squad.hasMoved ? 'used' : ''} onClick={() => toggleSquadMoved(squad)}>
                      {squad.hasMoved ? 'Moved' : 'Move'}
                    </button>
                    <button className={squad.hasActed ? 'used' : ''} onClick={() => toggleSquadActed(squad)}>
                      {squad.hasActed ? 'Acted' : 'Act'}
                    </button>
                    <button className={`mod-btn ${rollMod}`} onClick={() => cycleRollModifier(squad.id)}>
                      {rollMod === 'edge' ? 'Edge' : rollMod === 'bane' ? 'Bane' : 'Normal'}
                    </button>
                  </div>

                  {/* Combat Rolls */}
                  <div className="combat-rolls">
                    <button
                      className="roll-btn"
                      onClick={() => handleFreeStrikeRoll(squad, template)}
                      disabled={alive === 0}
                    >
                      Free Strike ({template.freeStrike}×{alive})
                    </button>
                    {template.signatureAbility && (
                      <button
                        className="roll-btn sig"
                        onClick={() => handleSignatureRoll(squad, template)}
                        disabled={alive === 0}
                      >
                        {template.signatureAbility.name}
                      </button>
                    )}
                    {/* Sacrifice button - only for signature minions */}
                    {isSignatureMinion(template) && (
                      <button
                        className={`roll-btn sacrifice ${hasSacrificedThisTurn ? 'used' : ''}`}
                        onClick={() => handleSacrifice(squad)}
                        disabled={hasSacrificedThisTurn || alive === 0}
                        title={hasSacrificedThisTurn ? 'Already sacrificed this turn' : 'Kill one minion to gain 1 essence (1/turn)'}
                      >
                        Sacrifice (+1 Ess)
                      </button>
                    )}
                  </div>

                  {/* Traits */}
                  {template.traits.length > 0 && (
                    <div className="minion-traits">
                      {template.traits.map((trait, idx) => (
                        <div key={idx} className="trait">
                          <span className="trait-name">{trait.name}:</span>
                          <span className="trait-desc">{trait.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Signature Ability Description */}
                  {template.signatureAbility && (
                    <div className="sig-ability-info">
                      <span className="sig-name">{template.signatureAbility.name}:</span>
                      <span className="sig-desc">
                        {template.signatureAbility.distance} · {template.signatureAbility.target}
                      </span>
                    </div>
                  )}

                  {/* Roll Results */}
                  {freeStrikeResult && (
                    <div className="roll-result" style={{ borderColor: getTierColor(freeStrikeResult.result.tier) }}>
                      <span style={{ color: getTierColor(freeStrikeResult.result.tier) }}>
                        {freeStrikeResult.result.total}
                      </span>
                      <span className="tier">T{freeStrikeResult.result.tier}</span>
                      <span className="dmg">= {template.freeStrike * alive} dmg</span>
                    </div>
                  )}
                  {sigResult && template.signatureAbility?.powerRoll && (
                    <div className="roll-result sig" style={{ borderColor: getTierColor(sigResult.result.tier) }}>
                      <span style={{ color: getTierColor(sigResult.result.tier) }}>
                        {sigResult.result.total}
                      </span>
                      <span className="tier">T{sigResult.result.tier}</span>
                      <div className="effect">
                        {sigResult.result.tier === 1 && template.signatureAbility.powerRoll.tier1}
                        {sigResult.result.tier === 2 && template.signatureAbility.powerRoll.tier2}
                        {sigResult.result.tier === 3 && template.signatureAbility.powerRoll.tier3}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatView;
