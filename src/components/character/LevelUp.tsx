import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { getProgressionForLevel, getCircleUpgrades } from '../../data/progression';
import { LevelFeature, ProgressionChoices, WardType } from '../../types/progression';
import { Characteristic } from '../../types/common';
import './LevelUp.css';

interface LevelUpProps {
  onClose: () => void;
}

const LevelUp: React.FC<LevelUpProps> = ({ onClose }) => {
  const { hero, updateHero } = useSummonerContext();
  const [choices, setChoices] = useState<Record<string, string>>({});

  if (!hero) return null;

  const nextLevel = hero.level + 1;

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

  if (!progression) {
    return (
      <div className="level-up-overlay" onClick={onClose}>
        <div className="level-up-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Level Up to {nextLevel}</h2>
          <p>No special features at this level. Click confirm to level up.</p>
          <div className="level-up-actions">
            <button onClick={onClose} className="cancel-btn">Cancel</button>
            <button onClick={() => handleLevelUp()} className="confirm-btn">Confirm Level Up</button>
          </div>
        </div>
      </div>
    );
  }

  // Filter circle-specific upgrades for current circle
  const filteredFeatures = progression.features.map(feature => {
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

  const handleChoiceChange = (featureId: string, choiceId: string) => {
    setChoices(prev => ({
      ...prev,
      [featureId]: choiceId,
    }));
  };

  const hasAllRequiredChoices = () => {
    return filteredFeatures.every(feature => {
      if (feature.type === 'choice') {
        return choices[feature.id] !== undefined;
      }
      return true;
    });
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

    if (progression.statChanges) {
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

    // Recalculate stamina based on new level
    const baseStamina = 15;
    const kitStamina = hero.kit?.stamina || 0;
    const levelBonus = nextLevel >= 2 ? nextLevel * 6 : 0;
    const newMaxStamina = baseStamina + kitStamina + levelBonus;

    updates.stamina = {
      current: newMaxStamina, // Full heal on level up
      max: newMaxStamina,
      winded: Math.floor(newMaxStamina / 2),
    };

    updateHero(updates);
    onClose();
  };

  return (
    <div className="level-up-overlay" onClick={onClose}>
      <div className="level-up-modal" onClick={(e) => e.stopPropagation()}>
        <div className="level-up-header">
          <h2>Level Up to {nextLevel}</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>

        <div className="level-up-content">
          <h3>New Features</h3>

          {filteredFeatures.map((feature) => (
            <div key={feature.id} className="feature-section">
              <h4>{feature.name}</h4>
              <p className="feature-description">{feature.description}</p>

              {feature.type === 'choice' && feature.choices && (
                <div className="feature-choices">
                  {feature.choices.map((choice) => (
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
              )}
            </div>
          ))}

          {progression.statChanges && (
            <div className="stat-changes-section">
              <h4>Automatic Changes</h4>
              <ul>
                {progression.statChanges.reason && (
                  <li>Reason increases to {progression.statChanges.reason}</li>
                )}
                {progression.statChanges.minionCap && (
                  <li>Minion cap increases by +{progression.statChanges.minionCap}</li>
                )}
                {progression.statChanges.allStats && (
                  <li>All characteristics increase by +{progression.statChanges.allStats}</li>
                )}
                {progression.statChanges.essencePerTurn && (
                  <li>Essence per turn increases to {progression.statChanges.essencePerTurn}</li>
                )}
                {progression.statChanges.freeSummonCount && (
                  <li>Free summon count increases by +{progression.statChanges.freeSummonCount}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="level-up-actions">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button
            onClick={handleLevelUp}
            className="confirm-btn"
            disabled={!hasAllRequiredChoices()}
          >
            Confirm Level Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUp;
