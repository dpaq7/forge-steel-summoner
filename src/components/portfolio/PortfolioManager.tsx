import React, { useState, useMemo } from 'react';
import { useSummonerContext } from '../../context/HeroContext';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useEssence } from '../../hooks/useEssence';
import { useSquads } from '../../hooks/useSquads';
import { isSummonerHero } from '../../types/hero';
import { MinionTemplate } from '../../types';
import { SummonValidationResult } from '../../utils/summonerValidation';
import MinionCard from './MinionCard';
import './PortfolioManager.css';

const PortfolioManager: React.FC = () => {
  const { hero: genericHero } = useSummonerContext();
  const { getSignatureMinions, getUnlockedMinions, getActualEssenceCost } = usePortfolio();
  const { validateMinionSummon, currentEssence, spendForMinion, getMinionCounts, getSquadCount } = useEssence();
  const { createSquad, addSquad } = useSquads();

  const [selectedMinion, setSelectedMinion] = useState<MinionTemplate | null>(null);
  const [filterCost, setFilterCost] = useState<number | 'all'>('all');

  // Only for Summoner heroes
  const hero = genericHero && isSummonerHero(genericHero) ? genericHero : null;

  // Get validation results for all minions
  const signatureMinions = useMemo(() => (hero ? getSignatureMinions() : []), [hero, getSignatureMinions]);
  const unlockedMinions = useMemo(() => (hero ? getUnlockedMinions() : []), [hero, getUnlockedMinions]);

  // Build validation cache for all minions
  const validationCache = useMemo<Record<string, SummonValidationResult>>(() => {
    if (!hero) return {};

    const cache: Record<string, SummonValidationResult> = {};
    [...signatureMinions, ...unlockedMinions].forEach(minion => {
      cache[minion.id] = validateMinionSummon(minion);
    });
    return cache;
  }, [hero, signatureMinions, unlockedMinions, validateMinionSummon]);

  // Get minion/squad counts for header display
  const minionCounts = useMemo(() => getMinionCounts(), [getMinionCounts]);
  const squadCount = useMemo(() => getSquadCount(), [getSquadCount]);

  if (!hero) return null;

  const filteredMinions = filterCost === 'all'
    ? [...signatureMinions, ...unlockedMinions]
    : [...signatureMinions, ...unlockedMinions].filter(m => m.essenceCost === filterCost);

  const handleSummon = (minion: MinionTemplate) => {
    const validation = validationCache[minion.id];
    if (validation?.canSummon) {
      const success = spendForMinion(minion);
      if (success) {
        const newSquad = createSquad(minion);
        addSquad(newSquad);
      }
    }
  };

  // Helper to get validation result for a minion
  const getValidation = (minion: MinionTemplate): SummonValidationResult => {
    return validationCache[minion.id] || {
      canSummon: false,
      message: 'Unknown error',
      details: {
        currentEssence: 0,
        requiredEssence: minion.essenceCost,
        currentMinions: 0,
        maxMinions: 8,
        currentSquads: 0,
        maxSquads: 2,
        minionsToSummon: minion.minionsPerSummon ?? 1,
        isFreeSummon: false,
      },
    };
  };

  return (
    <div className="portfolio-manager">
      <div className="portfolio-header">
        <h2>Portfolio: {hero.portfolio.type.charAt(0).toUpperCase() + hero.portfolio.type.slice(1)}</h2>
        <div className="portfolio-stats">
          <div className="essence-display">
            <span className="essence-label">Essence:</span>
            <span className="essence-value">{currentEssence}★</span>
          </div>
          <div className="minion-count-display">
            <span className="count-label">Minions:</span>
            <span className={`count-value ${minionCounts.current >= minionCounts.max ? 'at-max' : ''}`}>
              {minionCounts.current}/{minionCounts.max}
            </span>
          </div>
          <div className="squad-count-display">
            <span className="count-label">Squads:</span>
            <span className={`count-value ${squadCount >= 2 ? 'at-max' : ''}`}>
              {squadCount}/2
            </span>
          </div>
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
          {signatureMinions.filter(m => filterCost === 'all' || m.essenceCost === filterCost).map((minion) => {
            const validation = getValidation(minion);
            return (
              <MinionCard
                key={minion.id}
                minion={minion}
                isAffordable={validation.canSummon}
                actualCost={getActualEssenceCost(minion)}
                onSummon={() => handleSummon(minion)}
                onSelect={() => setSelectedMinion(minion)}
                isSelected={selectedMinion?.id === minion.id}
                blockReason={validation.canSummon ? undefined : validation.message}
                failedConstraint={validation.failedConstraint}
              />
            );
          })}
        </div>
      </div>

      <div className="unlocked-section">
        <h3>Unlocked Minions</h3>
        <div className="minions-grid">
          {unlockedMinions.filter(m => filterCost === 'all' || m.essenceCost === filterCost).map((minion) => {
            const validation = getValidation(minion);
            return (
              <MinionCard
                key={minion.id}
                minion={minion}
                isAffordable={validation.canSummon}
                actualCost={getActualEssenceCost(minion)}
                onSummon={() => handleSummon(minion)}
                onSelect={() => setSelectedMinion(minion)}
                isSelected={selectedMinion?.id === minion.id}
                blockReason={validation.canSummon ? undefined : validation.message}
                failedConstraint={validation.failedConstraint}
              />
            );
          })}
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
