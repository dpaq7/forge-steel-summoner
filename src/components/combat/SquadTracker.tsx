import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { useSquads } from '../../hooks/useSquads';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useRollHistory } from '../../context/RollHistoryContext';
import { Squad, MinionTemplate } from '../../types';
import { performPowerRoll, PowerRollResult, getTierColor, RollModifier } from '../../utils/dice';
import './SquadTracker.css';

interface RollState {
  squadId: string;
  result: PowerRollResult;
  type: 'freeStrike' | 'signature';
}

const SquadTracker: React.FC = () => {
  const { hero } = useSummonerContext();
  const { removeSquad, updateSquad, damageSquad, healSquad, getAliveCount } = useSquads();
  const { getMinionById } = usePortfolio();
  const { addRoll } = useRollHistory();
  const [rollStates, setRollStates] = useState<Record<string, RollState>>({});
  const [rollModifiers, setRollModifiers] = useState<Record<string, RollModifier>>({});
  const [damageInput, setDamageInput] = useState<Record<string, string>>({});

  if (!hero || hero.activeSquads.length === 0) {
    return (
      <div className="squad-tracker empty">
        <h3>No Active Squads</h3>
        <p>Use the Portfolio to summon minions</p>
      </div>
    );
  }

  const handleDismissSquad = (squadId: string) => {
    if (confirm('Dismiss this entire squad?')) {
      removeSquad(squadId);
    }
  };

  // SRD: Damage the shared stamina pool
  const handleDamageSquad = (squadId: string, amount: number) => {
    const result = damageSquad(squadId, amount);
    if (result.overflowDamage > 0) {
      alert(`Squad wiped! Overflow damage: ${result.overflowDamage} to summoner.`);
    }
  };

  // SRD: Heal the shared stamina pool
  const handleHealSquad = (squadId: string, amount: number) => {
    healSquad(squadId, amount);
  };

  const toggleSquadMoved = (squad: Squad) => {
    updateSquad(squad.id, { hasMoved: !squad.hasMoved });
  };

  const toggleSquadActed = (squad: Squad) => {
    updateSquad(squad.id, { hasActed: !squad.hasActed });
  };

  const getRollModifier = (squadId: string): RollModifier => {
    return rollModifiers[squadId] || 'normal';
  };

  const cycleRollModifier = (squadId: string) => {
    const modifiers: RollModifier[] = ['normal', 'edge', 'bane'];
    const current = getRollModifier(squadId);
    const currentIndex = modifiers.indexOf(current);
    const nextIndex = (currentIndex + 1) % modifiers.length;
    setRollModifiers((prev) => ({ ...prev, [squadId]: modifiers[nextIndex] }));
  };

  const handleFreeStrikeRoll = (squad: Squad, template: MinionTemplate) => {
    // Free strikes use the minion's primary characteristic
    // Most minions use might or agility for free strikes
    const charValue = template.characteristics.might > template.characteristics.agility
      ? template.characteristics.might
      : template.characteristics.agility;

    const modifier = getRollModifier(squad.id);
    const result = performPowerRoll(charValue, modifier);

    setRollStates((prev) => ({
      ...prev,
      [squad.id]: { squadId: squad.id, result, type: 'freeStrike' },
    }));

    addRoll(result, `${template.name} Free Strike`, 'minion');
  };

  const handleSignatureRoll = (squad: Squad, template: MinionTemplate) => {
    if (!template.signatureAbility?.powerRoll) return;

    const charValue = template.characteristics[template.signatureAbility.powerRoll.characteristic];
    const modifier = getRollModifier(squad.id);
    const result = performPowerRoll(charValue, modifier);

    setRollStates((prev) => ({
      ...prev,
      [`${squad.id}_sig`]: { squadId: squad.id, result, type: 'signature' },
    }));

    addRoll(result, `${template.name} ${template.signatureAbility.name}`, 'minion');
  };

  const getModifierLabel = (modifier: RollModifier) => {
    switch (modifier) {
      case 'edge': return 'Edge';
      case 'bane': return 'Bane';
      default: return 'Normal';
    }
  };

  const getModifierClass = (modifier: RollModifier) => {
    if (modifier === 'edge') return 'edge';
    if (modifier === 'bane') return 'bane';
    return '';
  };

  const aliveCount = (squad: Squad) => squad.members.filter(m => m.isAlive).length;

  return (
    <div className="squad-tracker">
      <div className="squad-header">
        <h3>Active Squads ({hero.activeSquads.length})</h3>
      </div>

      <div className="squads-list">
        {hero.activeSquads.map((squad) => {
          const template = getMinionById(squad.templateId);
          if (!template) return null;

          const freeStrikeResult = rollStates[squad.id];
          const signatureResult = rollStates[`${squad.id}_sig`];
          const rollMod = getRollModifier(squad.id);
          const healthPercent = (squad.currentStamina / squad.maxStamina) * 100;
          const alive = aliveCount(squad);

          return (
            <div key={squad.id} className="squad-card">
              <div className="squad-card-header">
                <div className="squad-name">
                  <h4>{template.name}</h4>
                  <span className="squad-count">({alive}/{squad.members.length})</span>
                  <span className="squad-role">{template.role}</span>
                </div>
                <button
                  className="dismiss-squad"
                  onClick={() => handleDismissSquad(squad.id)}
                  title="Dismiss Squad"
                >
                  ×
                </button>
              </div>

              {/* Shared Stamina Pool (SRD) */}
              <div className="squad-stamina-pool">
                <div className="stamina-label">
                  Squad HP: {squad.currentStamina}/{squad.maxStamina}
                </div>
                <div className="health-bar squad-health-bar">
                  <div
                    className="health-fill"
                    style={{
                      width: `${healthPercent}%`,
                      background: healthPercent > 50
                        ? '#4caf50'
                        : healthPercent > 25
                        ? '#ff9800'
                        : '#f44336',
                    }}
                  />
                </div>
                <div className="squad-damage-controls">
                  <button
                    onClick={() => handleDamageSquad(squad.id, 1)}
                    className="damage-btn"
                    title="Deal 1 damage to squad pool"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleDamageSquad(squad.id, 5)}
                    className="damage-btn"
                    title="Deal 5 damage to squad pool"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    className="damage-input"
                    placeholder="Dmg"
                    value={damageInput[squad.id] || ''}
                    onChange={(e) => setDamageInput({ ...damageInput, [squad.id]: e.target.value })}
                    min="1"
                  />
                  <button
                    onClick={() => {
                      const dmg = parseInt(damageInput[squad.id] || '0');
                      if (dmg > 0) {
                        handleDamageSquad(squad.id, dmg);
                        setDamageInput({ ...damageInput, [squad.id]: '' });
                      }
                    }}
                    className="damage-btn apply"
                    title="Apply custom damage"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => handleHealSquad(squad.id, 1)}
                    className="heal-btn"
                    title="Heal 1 HP"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Minion Icons - Visual death tracking */}
              <div className="minion-icons">
                {squad.members.map((minion, idx) => (
                  <div
                    key={minion.id}
                    className={`minion-icon ${minion.isAlive ? 'alive' : 'dead'}`}
                    title={`${template.name} #${idx + 1} - ${minion.isAlive ? 'Alive' : 'Dead'} (${minion.maxStamina} HP threshold)`}
                  >
                    <span className="minion-icon-number">{idx + 1}</span>
                  </div>
                ))}
              </div>

              <div className="squad-actions">
                <button
                  className={`action-toggle ${squad.hasMoved ? 'used' : 'available'}`}
                  onClick={() => toggleSquadMoved(squad)}
                >
                  {squad.hasMoved ? 'Moved' : 'Move'}
                </button>
                <button
                  className={`action-toggle ${squad.hasActed ? 'used' : 'available'}`}
                  onClick={() => toggleSquadActed(squad)}
                >
                  {squad.hasActed ? 'Acted' : 'Act'}
                </button>
              </div>

              {/* Combat Roll Section */}
              <div className="squad-combat">
                <div className="roll-modifier-toggle">
                  <button
                    className={`modifier-btn ${getModifierClass(rollMod)}`}
                    onClick={() => cycleRollModifier(squad.id)}
                    title="Toggle Edge/Bane"
                  >
                    {getModifierLabel(rollMod)}
                  </button>
                </div>

                <div className="combat-buttons">
                  <button
                    className="roll-btn free-strike"
                    onClick={() => handleFreeStrikeRoll(squad, template)}
                    title={`Free Strike: ${template.freeStrike} damage (${template.freeStrikeDamageType})`}
                    disabled={alive === 0}
                  >
                    Free Strike ({template.freeStrike} × {alive})
                  </button>

                  {template.signatureAbility && (
                    <button
                      className="roll-btn signature"
                      onClick={() => handleSignatureRoll(squad, template)}
                      title={template.signatureAbility.name}
                      disabled={alive === 0}
                    >
                      {template.signatureAbility.name}
                    </button>
                  )}
                </div>

                {freeStrikeResult && (
                  <div
                    className="roll-result"
                    style={{ borderColor: getTierColor(freeStrikeResult.result.tier) }}
                  >
                    <span className="result-label">Free Strike:</span>
                    <span
                      className="result-total"
                      style={{ color: getTierColor(freeStrikeResult.result.tier) }}
                    >
                      {freeStrikeResult.result.total}
                    </span>
                    <span className="result-tier">
                      T{freeStrikeResult.result.tier}
                    </span>
                    <span className="result-damage">
                      = {template.freeStrike * alive} {template.freeStrikeDamageType} dmg
                    </span>
                  </div>
                )}

                {signatureResult && template.signatureAbility?.powerRoll && (
                  <div
                    className="roll-result signature-result"
                    style={{ borderColor: getTierColor(signatureResult.result.tier) }}
                  >
                    <span className="result-label">{template.signatureAbility.name}:</span>
                    <span
                      className="result-total"
                      style={{ color: getTierColor(signatureResult.result.tier) }}
                    >
                      {signatureResult.result.total}
                    </span>
                    <span className="result-tier">
                      T{signatureResult.result.tier}
                    </span>
                    <div className="result-effect">
                      {signatureResult.result.tier === 1 && template.signatureAbility.powerRoll.tier1}
                      {signatureResult.result.tier === 2 && template.signatureAbility.powerRoll.tier2}
                      {signatureResult.result.tier === 3 && template.signatureAbility.powerRoll.tier3}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SquadTracker;
