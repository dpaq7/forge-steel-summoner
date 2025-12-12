import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { useCombatContext } from '../../context/CombatContext';
import { useSquads } from '../../hooks/useSquads';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useEssence } from '../../hooks/useEssence';
import { useStaminaStates } from '../../hooks/useStaminaStates';
import { useRollHistory } from '../../context/RollHistoryContext';
import { Squad, MinionTemplate } from '../../types';
import { calculateMaxMinions } from '../../utils/calculations';
import { performPowerRoll, PowerRollResult, getTierColor, RollModifier } from '../../utils/dice';
import SummonMinionCard from '../ui/SummonMinionCard';
import './CombatView.css';

const CombatView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();
  const { isInCombat, essenceState, hasSacrificedThisTurn, sacrificeMinion } = useCombatContext();
  const { createSquad, addSquad, removeSquad, updateSquad, damageSquad, healSquad } = useSquads();
  const { getSignatureMinions, getUnlockedMinions, getMinionById, getActualEssenceCost, isMinionUnlockedByLevel, getRequiredLevel, isSignatureMinion } = usePortfolio();
  const { canAffordMinion, spendForMinion, currentEssence } = useEssence();
  const { getSquadStaminaState, getStateColor, getStateLabel } = useStaminaStates();
  const { addRoll } = useRollHistory();

  const [rollStates, setRollStates] = useState<Record<string, { result: PowerRollResult; type: string }>>({});
  const [rollModifiers, setRollModifiers] = useState<Record<string, RollModifier>>({});
  const [damageInput, setDamageInput] = useState<Record<string, string>>({});
  // Track summon quantities per minion type (in multiples of minionsPerSummon)
  const [summonMultipliers, setSummonMultipliers] = useState<Record<string, number>>({});

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

  // Get minion portrait URL
  const getMinionPortrait = (minionId: string): string | null => {
    return hero.minionPortraits?.[minionId] ?? null;
  };

  // Handle minion portrait change
  const handleMinionPortraitChange = (minionId: string, imageUrl: string | null) => {
    updateHero({
      minionPortraits: {
        ...(hero.minionPortraits || {}),
        [minionId]: imageUrl,
      },
    });
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
    removeSquad(squadId);
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
      {/* Top Panel: Active Squads (Horizontal) */}
      <div className="combat-top-panel">
        <div className="squads-header">
          <h3>Active Squads</h3>
          <div className="combat-constraints-inline">
            <div className="constraint-inline essence-constraint">
              <span className="constraint-label">Essence</span>
              <span className="constraint-value essence-val">{currentEssence}</span>
            </div>
            <div className="constraint-inline minion-constraint">
              <span className="constraint-label">Minions</span>
              <span className={`constraint-value ${totalActiveMinions >= maxMinions ? 'at-cap' : ''}`}>
                {totalActiveMinions}/{maxMinions}
              </span>
            </div>
            <div className="constraint-inline squad-constraint">
              <span className="constraint-label">Squads</span>
              <span className={`constraint-value ${squadCount >= maxSquads ? 'at-cap' : ''}`}>
                {squadCount}/{maxSquads}
              </span>
            </div>
          </div>
        </div>

        {hero.activeSquads.length === 0 ? (
          <div className="no-squads">
            <p>No active squads</p>
            <p className="hint">{isInCombat ? 'Use the summon panel below to call forth minions' : 'Start combat to begin'}</p>
          </div>
        ) : (
          <div className="squads-list-horizontal">
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
                    {staminaState.currentState !== 'healthy' && (
                      <span className={`stamina-state state-${staminaState.currentState}`}>
                        {stateLabel}
                      </span>
                    )}
                  </div>

                  {/* Minion Icons */}
                  <div className="minion-icons">
                    {squad.members.map((m, i) => (
                      <span key={i} className={`minion-icon ${m.isAlive ? 'alive' : 'dead'}`}>
                        {i + 1}
                      </span>
                    ))}
                  </div>

                  {/* Damage Controls */}
                  <div className="damage-controls">
                    <button onClick={() => damageSquad(squad.id, 1)}>-1</button>
                    <button onClick={() => damageSquad(squad.id, 5)}>-5</button>
                    <input
                      type="number"
                      placeholder="Dmg"
                      value={damageInput[squad.id] || ''}
                      onChange={(e) => setDamageInput(prev => ({ ...prev, [squad.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt(damageInput[squad.id] || '0');
                          if (val > 0) damageSquad(squad.id, val);
                          setDamageInput(prev => ({ ...prev, [squad.id]: '' }));
                        }
                      }}
                    />
                    <button className="heal-btn" onClick={() => healSquad(squad.id, 1)}>+1</button>
                    <button className="heal-btn" onClick={() => healSquad(squad.id, 5)}>+5</button>
                  </div>

                  {/* Roll Modifier */}
                  <div className="action-toggles">
                    <button
                      className={`mod-btn ${rollMod}`}
                      onClick={() => cycleRollModifier(squad.id)}
                    >
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
                    <button
                      className={`roll-btn sacrifice ${hasSacrificedThisTurn ? 'used' : ''}`}
                      onClick={() => handleSacrifice(squad)}
                      disabled={hasSacrificedThisTurn || alive === 0}
                      title={hasSacrificedThisTurn ? 'Already sacrificed this turn' : 'Sacrifice a minion'}
                    >
                      Sacrifice
                    </button>
                  </div>

                  {/* Roll Results */}
                  {freeStrikeResult && (
                    <div
                      className="roll-result"
                      style={{ borderLeftColor: getTierColor(freeStrikeResult.result.tier) }}
                    >
                      <strong style={{ color: getTierColor(freeStrikeResult.result.tier) }}>
                        {freeStrikeResult.result.total}
                      </strong>
                      <span className="tier">T{freeStrikeResult.result.tier}</span>
                      <span className="dmg">= {template.freeStrike * alive} dmg</span>
                    </div>
                  )}
                  {sigResult && (
                    <div
                      className="roll-result"
                      style={{ borderLeftColor: getTierColor(sigResult.result.tier) }}
                    >
                      <strong style={{ color: getTierColor(sigResult.result.tier) }}>
                        {sigResult.result.total}
                      </strong>
                      <span className="tier">T{sigResult.result.tier}</span>
                      <span className="effect">{template.signatureAbility?.name}</span>
                    </div>
                  )}

                  {/* Minion Traits */}
                  {(template.traits?.length > 0 || template.signatureAbility) && (
                    <div className="minion-traits">
                      {template.traits?.map((trait, i) => (
                        <div key={i} className="trait">
                          <span className="trait-name">{trait.name}:</span>
                          <span className="trait-desc">{trait.description}</span>
                        </div>
                      ))}
                      {template.signatureAbility && (
                        <div className="sig-ability-info">
                          <span className="sig-name">{template.signatureAbility.name}:</span>
                          <span className="sig-desc">{template.signatureAbility.effect}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Panel: Summon */}
      <div className="combat-bottom-panel">
        {/* Summon Panel */}
        <div className="summon-panel">
          <h3>Summon Minions</h3>
          {!isInCombat && <div className="not-in-combat">Start combat to summon</div>}

          <div className="summon-cards-grid">
            {/* Signature Minions */}
            <div className="summon-section">
              <h4 className="section-header">Signature Minions</h4>
              <div className="summon-cards-row">
                {signatureMinions.map(minion => {
                  const check = canSummon(minion);
                  const { totalMinions, totalCost, multiplier } = getSummonInfo(minion);
                  return (
                    <SummonMinionCard
                      key={minion.id}
                      minion={minion}
                      isSignature={true}
                      canSummon={check.canSummon}
                      reason={check.reason}
                      totalMinions={totalMinions}
                      totalCost={totalCost}
                      multiplier={multiplier}
                      imageUrl={getMinionPortrait(minion.id)}
                      onSummon={() => handleSummon(minion)}
                      onAdjustMultiplier={(delta) => adjustSummonMultiplier(minion.id, delta)}
                      onImageChange={(url) => handleMinionPortraitChange(minion.id, url)}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3-Essence Minions */}
            {unlockedMinions.filter(m => m.essenceCost === 3).length > 0 && (
              <div className="summon-section">
                <h4 className="section-header">3 Essence Minions</h4>
                <div className="summon-cards-row">
                  {unlockedMinions.filter(m => m.essenceCost === 3).map(minion => {
                    const check = canSummon(minion);
                    const { totalMinions, totalCost, multiplier } = getSummonInfo(minion);
                    return (
                      <SummonMinionCard
                        key={minion.id}
                        minion={minion}
                        isSignature={false}
                        canSummon={check.canSummon}
                        reason={check.reason}
                        totalMinions={totalMinions}
                        totalCost={totalCost}
                        multiplier={multiplier}
                        imageUrl={getMinionPortrait(minion.id)}
                        onSummon={() => handleSummon(minion)}
                        onAdjustMultiplier={(delta) => adjustSummonMultiplier(minion.id, delta)}
                        onImageChange={(url) => handleMinionPortraitChange(minion.id, url)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5-Essence Minions */}
            {unlockedMinions.filter(m => m.essenceCost === 5).length > 0 && (
              <div className="summon-section">
                <h4 className="section-header">5 Essence Minions</h4>
                <div className="summon-cards-row">
                  {unlockedMinions.filter(m => m.essenceCost === 5).map(minion => {
                    const check = canSummon(minion);
                    const { totalMinions, totalCost, multiplier } = getSummonInfo(minion);
                    return (
                      <SummonMinionCard
                        key={minion.id}
                        minion={minion}
                        isSignature={false}
                        canSummon={check.canSummon}
                        reason={check.reason}
                        totalMinions={totalMinions}
                        totalCost={totalCost}
                        multiplier={multiplier}
                        imageUrl={getMinionPortrait(minion.id)}
                        onSummon={() => handleSummon(minion)}
                        onAdjustMultiplier={(delta) => adjustSummonMultiplier(minion.id, delta)}
                        onImageChange={(url) => handleMinionPortraitChange(minion.id, url)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7-Essence Minions */}
            {unlockedMinions.filter(m => m.essenceCost === 7).length > 0 && (
              <div className="summon-section">
                <h4 className="section-header">7 Essence Minions</h4>
                <div className="summon-cards-row">
                  {unlockedMinions.filter(m => m.essenceCost === 7).map(minion => {
                    const check = canSummon(minion);
                    const { totalMinions, totalCost, multiplier } = getSummonInfo(minion);
                    return (
                      <SummonMinionCard
                        key={minion.id}
                        minion={minion}
                        isSignature={false}
                        canSummon={check.canSummon}
                        reason={check.reason}
                        totalMinions={totalMinions}
                        totalCost={totalCost}
                        multiplier={multiplier}
                        imageUrl={getMinionPortrait(minion.id)}
                        onSummon={() => handleSummon(minion)}
                        onAdjustMultiplier={(delta) => adjustSummonMultiplier(minion.id, delta)}
                        onImageChange={(url) => handleMinionPortraitChange(minion.id, url)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatView;
