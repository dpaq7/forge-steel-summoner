import React, { useState, useMemo } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { getProgressionForLevel, getCircleUpgrades } from '../../data/progression';
import { summonerAbilitiesByLevel } from '../../data/abilities/summoner-abilities';
import { LevelFeature, ProgressionChoices, WardType } from '../../types/progression';
import { Characteristic } from '../../types/common';
import { Ability } from '../../types';
import './LevelUp.css';

interface LevelUpProps {
  onClose: () => void;
}

const LevelUp: React.FC<LevelUpProps> = ({ onClose }) => {
  const { hero, updateHero } = useSummonerContext();
  const [choices, setChoices] = useState<Record<string, string>>({});

  if (!hero) return null;

  const nextLevel = hero.level + 1;

  // Calculate stamina changes
  const currentStamina = hero.stamina.max;
  const baseStamina = 15;
  const kitStamina = hero.kit?.stamina || 0;
  const levelBonus = nextLevel >= 2 ? nextLevel * 6 : 0;
  const newMaxStamina = baseStamina + kitStamina + levelBonus;

  // Get new abilities for this level
  const newAbilities = summonerAbilitiesByLevel[nextLevel] || [];

  if (nextLevel > 10) {
    return (
      <div className="level-up-overlay" onClick={onClose}>
        <div className="level-up-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Maximum Level Reached</h2>
          <p>Your character is already at level 10, the maximum level.</p>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  const progression = getProgressionForLevel(nextLevel);

  // Filter circle-specific upgrades for current circle
  const filteredFeatures = useMemo(() => {
    if (!progression) return [];
    return progression.features.map(feature => {
      if (feature.category === 'circle-upgrade') {
        const circleChoices = getCircleUpgrades(hero.circle);
        return {
          ...feature,
          choices: circleChoices.map(u => ({
            id: u.id,
            name: u.name,
            description: u.description,
          })),
        };
      }
      return feature;
    });
  }, [progression, hero.circle]);

  const automaticFeatures = filteredFeatures.filter(f => f.type === 'automatic');
  const choiceFeatures = filteredFeatures.filter(f => f.type === 'choice');

  const handleChoiceChange = (featureId: string, choiceId: string) => {
    setChoices(prev => ({
      ...prev,
      [featureId]: choiceId,
    }));
  };

  const hasAllRequiredChoices = () => {
    return choiceFeatures.every(feature => choices[feature.id] !== undefined);
  };

  const handleLevelUp = () => {
    if (!hasAllRequiredChoices()) {
      alert('Please make all required choices before leveling up.');
      return;
    }

    // Build the new progression choices
    const newProgressionChoices: ProgressionChoices = { ...hero.progressionChoices };

    // Apply choices based on category
    filteredFeatures.forEach(feature => {
      if (feature.type === 'choice' && choices[feature.id]) {
        const choiceId = choices[feature.id];

        switch (feature.category) {
          case 'ward':
            newProgressionChoices.ward = choiceId as WardType;
            break;
          case 'second-ward':
            newProgressionChoices.secondWard = choiceId as WardType;
            break;
          case '7-essence':
            newProgressionChoices.sevenEssenceAbility = choiceId;
            break;
          case '9-essence':
            newProgressionChoices.nineEssenceAbility = choiceId;
            break;
          case '11-essence':
            newProgressionChoices.elevenEssenceAbility = choiceId;
            break;
          case 'circle-upgrade':
            newProgressionChoices.circleUpgrade = choiceId;
            break;
          case 'stat-boost':
            newProgressionChoices.statBoost = choiceId as Characteristic;
            break;
        }
      }
    });

    // Apply stat changes
    const updates: Partial<typeof hero> = {
      level: nextLevel,
      progressionChoices: newProgressionChoices,
    };

    if (progression?.statChanges) {
      const sc = progression.statChanges;

      // Update characteristics
      if (sc.reason !== undefined) {
        updates.characteristics = {
          ...hero.characteristics,
          reason: sc.reason,
        };
      }

      if (sc.allStats !== undefined) {
        updates.characteristics = {
          ...hero.characteristics,
          ...(updates.characteristics || {}),
          might: Math.min(4, hero.characteristics.might + sc.allStats),
          agility: Math.min(4, hero.characteristics.agility + sc.allStats),
          reason: Math.min(4, (updates.characteristics?.reason || hero.characteristics.reason) + sc.allStats),
          intuition: Math.min(4, hero.characteristics.intuition + sc.allStats),
          presence: Math.min(4, hero.characteristics.presence + sc.allStats),
        };
      }

      // Apply stat boost choice
      if (newProgressionChoices.statBoost && nextLevel === 4) {
        const stat = newProgressionChoices.statBoost;
        updates.characteristics = {
          ...(updates.characteristics || hero.characteristics),
          [stat]: Math.min(4, (updates.characteristics?.[stat] || hero.characteristics[stat]) + 1),
        };
      }
    }

    // Update stamina
    updates.stamina = {
      current: newMaxStamina, // Full heal on level up
      max: newMaxStamina,
      winded: Math.floor(newMaxStamina / 2),
    };

    updateHero(updates);
    onClose();
  };

  // Calculate characteristic preview
  const getCharPreview = () => {
    if (!progression?.statChanges) return null;
    const sc = progression.statChanges;
    const changes: string[] = [];

    if (sc.reason !== undefined && sc.reason !== hero.characteristics.reason) {
      changes.push(`Reason: ${hero.characteristics.reason} → ${sc.reason}`);
    }
    if (sc.allStats !== undefined) {
      changes.push(`All Stats: +${sc.allStats}`);
    }

    return changes.length > 0 ? changes : null;
  };

  const charPreview = getCharPreview();

  return (
    <div className="level-up-overlay" onClick={onClose}>
      <div className="level-up-modal enhanced" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="level-up-header">
          <div className="level-badge-container">
            <span className="level-badge old">Lv {hero.level}</span>
            <span className="level-arrow">→</span>
            <span className="level-badge new">Lv {nextLevel}</span>
          </div>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>

        <div className="level-up-content">
          {/* Stats Summary */}
          <div className="stats-summary">
            <h3>Stats Changes</h3>
            <div className="stats-grid">
              <div className="stat-change">
                <span className="stat-label">Stamina</span>
                <span className="stat-values">
                  <span className="old-value">{currentStamina}</span>
                  <span className="arrow">→</span>
                  <span className="new-value highlight">{newMaxStamina}</span>
                  <span className="delta">(+{newMaxStamina - currentStamina})</span>
                </span>
              </div>
              {charPreview && charPreview.map((change, i) => (
                <div key={i} className="stat-change">
                  <span className="stat-values characteristic">{change}</span>
                </div>
              ))}
              {progression?.statChanges?.minionCap && (
                <div className="stat-change">
                  <span className="stat-label">Minion Cap</span>
                  <span className="stat-values">
                    <span className="new-value">+{progression.statChanges.minionCap}</span>
                  </span>
                </div>
              )}
              {progression?.statChanges?.essencePerTurn && (
                <div className="stat-change">
                  <span className="stat-label">Essence/Turn</span>
                  <span className="stat-values">
                    <span className="new-value">{progression.statChanges.essencePerTurn}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* New Abilities */}
          {newAbilities.length > 0 && (
            <div className="new-abilities-section">
              <h3>New Abilities</h3>
              <div className="abilities-list">
                {newAbilities.map((ability: Ability) => (
                  <div key={ability.id} className="ability-preview-card">
                    <div className="ability-header">
                      <span className="ability-name">{ability.name}</span>
                      <span className="ability-type">{ability.actionType}</span>
                    </div>
                    {ability.keywords && ability.keywords.length > 0 && (
                      <div className="ability-keywords">
                        {ability.keywords.join(' • ')}
                      </div>
                    )}
                    <div className="ability-meta">
                      {ability.essenceCost && (
                        <span className="ability-cost">{ability.essenceCost} Essence</span>
                      )}
                      <span className="ability-distance">{ability.distance}</span>
                      <span className="ability-target">{ability.target}</span>
                    </div>
                    {ability.effect && (
                      <p className="ability-effect">{ability.effect.substring(0, 150)}{ability.effect.length > 150 ? '...' : ''}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automatic Features */}
          {automaticFeatures.length > 0 && (
            <div className="automatic-features-section">
              <h3>Automatic Upgrades</h3>
              <div className="automatic-list">
                {automaticFeatures.map((feature) => (
                  <div key={feature.id} className="automatic-feature">
                    <span className="feature-icon">✦</span>
                    <div className="feature-info">
                      <strong>{feature.name}</strong>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Choice Features */}
          {choiceFeatures.length > 0 && (
            <div className="choice-features-section">
              <h3>Make Your Choices</h3>
              {choiceFeatures.map((feature) => (
                <div key={feature.id} className="choice-feature">
                  <h4>{feature.name}</h4>
                  <p className="feature-description">{feature.description}</p>

                  <div className="feature-choices">
                    {feature.choices?.map((choice) => (
                      <label
                        key={choice.id}
                        className={`choice-option ${choices[feature.id] === choice.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={feature.id}
                          value={choice.id}
                          checked={choices[feature.id] === choice.id}
                          onChange={() => handleChoiceChange(feature.id, choice.id)}
                        />
                        <div className="choice-content">
                          <strong>{choice.name}</strong>
                          <span>{choice.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No progression data */}
          {!progression && (
            <div className="no-features">
              <p>No special features at this level. Your stats will still increase!</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="level-up-actions">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button
            onClick={handleLevelUp}
            className="confirm-btn"
            disabled={choiceFeatures.length > 0 && !hasAllRequiredChoices()}
          >
            Confirm Level Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUp;
