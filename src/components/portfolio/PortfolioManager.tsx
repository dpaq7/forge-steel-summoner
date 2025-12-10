import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useEssence } from '../../hooks/useEssence';
import { useSquads } from '../../hooks/useSquads';
import { MinionTemplate } from '../../types';
import MinionCard from './MinionCard';
import './PortfolioManager.css';

const PortfolioManager: React.FC = () => {
  const { hero } = useSummonerContext();
  const { getSignatureMinions, getUnlockedMinions, getActualEssenceCost } = usePortfolio();
  const { canAffordMinion, currentEssence, spendForMinion } = useEssence();
  const { createSquad, addSquad } = useSquads();

  const [selectedMinion, setSelectedMinion] = useState<MinionTemplate | null>(null);
  const [filterCost, setFilterCost] = useState<number | 'all'>('all');

  if (!hero) return null;

  const signatureMinions = getSignatureMinions();
  const unlockedMinions = getUnlockedMinions();

  const filteredMinions = filterCost === 'all'
    ? [...signatureMinions, ...unlockedMinions]
    : [...signatureMinions, ...unlockedMinions].filter(m => m.essenceCost === filterCost);

  const handleSummon = (minion: MinionTemplate) => {
    if (canAffordMinion(minion)) {
      const success = spendForMinion(minion);
      if (success) {
        const newSquad = createSquad(minion);
        addSquad(newSquad);
      }
    }
  };

  return (
    <div className="portfolio-manager">
      <div className="portfolio-header">
        <h2>Portfolio: {hero.portfolio.type.charAt(0).toUpperCase() + hero.portfolio.type.slice(1)}</h2>
        <div className="essence-display">
          <span className="essence-label">Available Essence:</span>
          <span className="essence-value">{currentEssence}</span>
        </div>
      </div>

      <div className="portfolio-filters">
        <button
          className={filterCost === 'all' ? 'active' : ''}
          onClick={() => setFilterCost('all')}
        >
          All Minions
        </button>
        <button
          className={filterCost === 1 ? 'active' : ''}
          onClick={() => setFilterCost(1)}
        >
          1 Essence
        </button>
        <button
          className={filterCost === 3 ? 'active' : ''}
          onClick={() => setFilterCost(3)}
        >
          3 Essence
        </button>
        <button
          className={filterCost === 5 ? 'active' : ''}
          onClick={() => setFilterCost(5)}
        >
          5 Essence
        </button>
        <button
          className={filterCost === 7 ? 'active' : ''}
          onClick={() => setFilterCost(7)}
        >
          7 Essence
        </button>
      </div>

      <div className="signature-section">
        <h3>Signature Minions</h3>
        <div className="minions-grid">
          {signatureMinions.filter(m => filterCost === 'all' || m.essenceCost === filterCost).map((minion) => (
            <MinionCard
              key={minion.id}
              minion={minion}
              isAffordable={canAffordMinion(minion)}
              actualCost={getActualEssenceCost(minion)}
              onSummon={() => handleSummon(minion)}
              onSelect={() => setSelectedMinion(minion)}
              isSelected={selectedMinion?.id === minion.id}
            />
          ))}
        </div>
      </div>

      <div className="unlocked-section">
        <h3>Unlocked Minions</h3>
        <div className="minions-grid">
          {unlockedMinions.filter(m => filterCost === 'all' || m.essenceCost === filterCost).map((minion) => (
            <MinionCard
              key={minion.id}
              minion={minion}
              isAffordable={canAffordMinion(minion)}
              actualCost={getActualEssenceCost(minion)}
              onSummon={() => handleSummon(minion)}
              onSelect={() => setSelectedMinion(minion)}
              isSelected={selectedMinion?.id === minion.id}
            />
          ))}
        </div>
      </div>

      {selectedMinion && (
        <div className="minion-detail-panel">
          <div className="detail-content">
            <button className="close-detail" onClick={() => setSelectedMinion(null)}>×</button>
            <h3>{selectedMinion.name}</h3>
            <div className="detail-stats">
              <div className="stat"><strong>Role:</strong> {selectedMinion.role}</div>
              <div className="stat"><strong>Size:</strong> {selectedMinion.size}</div>
              <div className="stat"><strong>Speed:</strong> {selectedMinion.speed}</div>
              <div className="stat"><strong>Stamina:</strong> {Array.isArray(selectedMinion.stamina) ? selectedMinion.stamina.join('/') : selectedMinion.stamina}</div>
              <div className="stat"><strong>Stability:</strong> {selectedMinion.stability}</div>
              <div className="stat"><strong>Free Strike:</strong> {selectedMinion.freeStrike}</div>
              <div className="stat"><strong>Summons:</strong> {selectedMinion.minionsPerSummon} minions</div>
            </div>

            <div className="detail-characteristics">
              <h4>Characteristics</h4>
              <div className="characteristics-grid">
                <div>Might: {selectedMinion.characteristics.might}</div>
                <div>Agility: {selectedMinion.characteristics.agility}</div>
                <div>Reason: {selectedMinion.characteristics.reason}</div>
                <div>Intuition: {selectedMinion.characteristics.intuition}</div>
                <div>Presence: {selectedMinion.characteristics.presence}</div>
              </div>
            </div>

            <div className="detail-traits">
              <h4>Traits</h4>
              {selectedMinion.traits.map((trait, idx) => (
                <div key={idx} className="trait">
                  <strong>{trait.name}:</strong> {trait.description}
                </div>
              ))}
            </div>

            {selectedMinion.signatureAbility && (
              <div className="detail-ability">
                <h4>Signature Ability</h4>
                <div className="ability-name">{selectedMinion.signatureAbility.name}</div>
                <div className="ability-keywords">{selectedMinion.signatureAbility.keywords.join(', ')}</div>
                <div className="ability-target">
                  <strong>Distance:</strong> {selectedMinion.signatureAbility.distance} |
                  <strong> Target:</strong> {selectedMinion.signatureAbility.target}
                </div>
                {selectedMinion.signatureAbility.powerRoll && (
                  <div className="power-roll">
                    <div>Tier 1: {selectedMinion.signatureAbility.powerRoll.tier1}</div>
                    <div>Tier 2: {selectedMinion.signatureAbility.powerRoll.tier2}</div>
                    <div>Tier 3: {selectedMinion.signatureAbility.powerRoll.tier3}</div>
                  </div>
                )}
                {selectedMinion.signatureAbility.effect && (
                  <div className="ability-effect">{selectedMinion.signatureAbility.effect}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
