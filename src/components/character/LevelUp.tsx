import React, { useState, useMemo } from 'react';
import { useSummonerContext } from '../../context/HeroContext';
import { getProgressionForLevel, getCircleUpgrades } from '../../data/progression';
import { summonerAbilitiesByLevel } from '../../data/abilities/summoner-abilities';
import {
  getFuryProgressionWithAspect,
  calculateFuryStamina,
} from '../../data/fury/progression';
import { furyAbilities, getAspectAbilitiesByCost } from '../../data/fury/abilities';
import { classPerkAtLevel } from '../../data/perks';
import { LevelFeature, ProgressionChoices, WardType } from '../../types/progression';
import { SelectedPerk } from '../../types/perk';
import { Characteristic } from '../../types/common';
import { isSummonerHero, isFuryHero, SummonerHeroV2, FuryHero } from '../../types/hero';
import { Ability } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  ScrollArea,
} from '@/components/ui/shadcn';
import { Sparkles, Check, Award } from 'lucide-react';
import PerkSelector from '../creation/PerkSelector';
import './LevelUp.css';

interface LevelUpProps {
  onClose: () => void;
}

const LevelUp: React.FC<LevelUpProps> = ({ onClose }) => {
  // Wrap onClose for Dialog's onOpenChange pattern
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };
  const { hero, updateHero } = useSummonerContext();
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<'overview' | 'perk'>('overview');
  const [selectedPerk, setSelectedPerk] = useState<SelectedPerk | null>(null);

  if (!hero) return null;

  // Check hero class for class-specific features
  const isSummoner = isSummonerHero(hero);
  const isFury = isFuryHero(hero);
  const summonerHero = isSummoner ? (hero as SummonerHeroV2) : null;
  const furyHero = isFury ? (hero as FuryHero) : null;

  const nextLevel = hero.level + 1;

  // Check if this level grants a perk
  const grantsPerks = classPerkAtLevel(hero.heroClass, nextLevel);
  const existingPerkIds = (hero.selectedPerks || []).map(p => p.perkId);

  // Handler for perk selection
  const handlePerkSelected = (perk: SelectedPerk) => {
    setSelectedPerk(perk);
    setCurrentStep('overview');
  };

  // Calculate stamina changes - CLASS-SPECIFIC
  const currentStamina = hero.stamina.max;
  const kitStamina = hero.kit?.stamina || 0;

  let newMaxStamina: number;
  if (isFury) {
    // Fury: Base 21 + 9 per level after 1
    newMaxStamina = calculateFuryStamina(nextLevel, kitStamina);
  } else {
    // Default (Summoner): Base 15 + 6 per level
    const baseStamina = 15;
    const levelBonus = nextLevel >= 2 ? nextLevel * 6 : 0;
    newMaxStamina = baseStamina + kitStamina + levelBonus;
  }

  // Get new abilities for this level (class-specific)
  let newAbilities: Ability[] = [];
  if (isSummoner) {
    newAbilities = summonerAbilitiesByLevel[nextLevel] || [];
  } else if (isFury) {
    // For Fury, abilities are gained through progression choices, not automatically
    // But we can show what abilities become available at this level
    const abilityLevelMap: Record<number, { cost: number; label: string }[]> = {
      1: [{ cost: 0, label: 'Signature' }, { cost: 3, label: '3-Ferocity' }, { cost: 5, label: '5-Ferocity' }],
      3: [{ cost: 7, label: '7-Ferocity' }],
      5: [{ cost: 9, label: '9-Ferocity' }],
      8: [{ cost: 11, label: '11-Ferocity' }],
    };
    // Get abilities that unlock at this level
    if (abilityLevelMap[nextLevel]) {
      const costs = abilityLevelMap[nextLevel];
      costs.forEach(({ cost }) => {
        const abilities = furyAbilities.filter(a => (a.essenceCost || 0) === cost);
        newAbilities.push(...abilities);
      });
    }
  }

  if (nextLevel > 10) {
    return (
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent variant="compact" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Maximum Level Reached</DialogTitle>
            <DialogDescription>
              Your character is already at level 10, the maximum level.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="chamfered" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Get progression based on hero class
  const progression = useMemo(() => {
    if (isFury && furyHero?.subclass) {
      return getFuryProgressionWithAspect(nextLevel, furyHero.subclass);
    }
    return getProgressionForLevel(nextLevel);
  }, [nextLevel, isFury, furyHero?.subclass]);

  // Filter class-specific upgrades for current subclass
  const filteredFeatures = useMemo(() => {
    if (!progression) return [];

    // Fury: already has aspect-specific features from getFuryProgressionWithAspect
    if (isFury) {
      return progression.features;
    }

    // Summoner: filter circle-specific upgrades
    return progression.features.map(feature => {
      if (feature.category === 'circle-upgrade' && summonerHero?.subclass) {
        const circleChoices = getCircleUpgrades(summonerHero.subclass);
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
  }, [progression, summonerHero?.subclass, isFury]);

  const automaticFeatures = filteredFeatures.filter(f => f.type === 'automatic');
  const choiceFeatures = filteredFeatures.filter(f => f.type === 'choice');

  const handleChoiceChange = (featureId: string, choiceId: string) => {
    setChoices(prev => ({
      ...prev,
      [featureId]: choiceId,
    }));
  };

  const hasAllRequiredChoices = () => {
    const hasClassChoices = choiceFeatures.every(feature => choices[feature.id] !== undefined);
    const hasPerkChoice = !grantsPerks || selectedPerk !== null;
    return hasClassChoices && hasPerkChoice;
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
          // Summoner categories
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
          // Fury categories
          case '7-ferocity':
            newProgressionChoices.sevenFerocityAbility = choiceId;
            break;
          case '9-ferocity':
            newProgressionChoices.nineFerocityAbility = choiceId;
            break;
          case '11-ferocity':
            newProgressionChoices.elevenFerocityAbility = choiceId;
            break;
          case 'aspect-5-ferocity':
            newProgressionChoices.aspectFiveFerocity = choiceId;
            break;
          case 'aspect-9-ferocity':
            newProgressionChoices.aspectNineFerocity = choiceId;
            break;
          case 'aspect-11-ferocity':
            newProgressionChoices.aspectElevenFerocity = choiceId;
            break;
        }
      }
    });

    // Apply stat changes
    const updates: Partial<typeof hero> = {
      level: nextLevel,
      progressionChoices: newProgressionChoices,
    };

    // Add selected perk if one was chosen
    if (selectedPerk) {
      const updatedPerks = [...(hero.selectedPerks || []), selectedPerk];
      updates.selectedPerks = updatedPerks;
    }

    if (progression?.statChanges) {
      const sc = progression.statChanges;

      // Handle Fury-specific stat changes
      if (isFury) {
        // Level 4 and 10: Set Might and Agility to specific values
        if (sc.might !== undefined && sc.agility !== undefined) {
          updates.characteristics = {
            ...hero.characteristics,
            might: sc.might,
            agility: sc.agility,
          };
        }

        // Level 7: All stats +1 (max 4)
        if (sc.allStats !== undefined) {
          const baseChars = updates.characteristics || hero.characteristics;
          updates.characteristics = {
            ...baseChars,
            might: Math.min(4, baseChars.might + sc.allStats),
            agility: Math.min(4, baseChars.agility + sc.allStats),
            reason: Math.min(4, baseChars.reason + sc.allStats),
            intuition: Math.min(4, baseChars.intuition + sc.allStats),
            presence: Math.min(4, baseChars.presence + sc.allStats),
          };
        }
      } else {
        // Summoner stat changes
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

        // Apply stat boost choice (Summoner Level 4)
        if (newProgressionChoices.statBoost && nextLevel === 4) {
          const stat = newProgressionChoices.statBoost;
          updates.characteristics = {
            ...(updates.characteristics || hero.characteristics),
            [stat]: Math.min(4, (updates.characteristics?.[stat] || hero.characteristics[stat]) + 1),
          };
        }
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

    // Fury-specific stat previews
    if (isFury) {
      if (sc.might !== undefined && sc.might !== hero.characteristics.might) {
        changes.push(`Might: ${hero.characteristics.might} → ${sc.might}`);
      }
      if (sc.agility !== undefined && sc.agility !== hero.characteristics.agility) {
        changes.push(`Agility: ${hero.characteristics.agility} → ${sc.agility}`);
      }
    }

    // Summoner-specific stat previews
    if (sc.reason !== undefined && sc.reason !== hero.characteristics.reason) {
      changes.push(`Reason: ${hero.characteristics.reason} → ${sc.reason}`);
    }

    // Shared stat changes
    if (sc.allStats !== undefined) {
      changes.push(`All Stats: +${sc.allStats}`);
    }

    return changes.length > 0 ? changes : null;
  };

  const charPreview = getCharPreview();

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent variant="scroll" className="level-up-dialog max-w-2xl">
        {/* Header */}
        <DialogHeader className="level-up-header-new">
          <div className="level-badge-container">
            <span className="level-badge old">Lv {hero.level}</span>
            <span className="level-arrow">→</span>
            <span className="level-badge new">Lv {nextLevel}</span>
          </div>
          <DialogTitle className="flex items-center gap-2 mt-2">
            <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
            Level Up!
          </DialogTitle>
          <DialogDescription>
            {hero.name} is advancing to level {nextLevel}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="level-up-scroll">
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

          {/* Perk Selection Section */}
          {grantsPerks && currentStep === 'overview' && (
            <div className="perk-selection-section">
              <h3>
                <Award className="h-4 w-4 inline mr-2" />
                Select a Perk
              </h3>
              {selectedPerk ? (
                <div className="perk-selected">
                  <div className="perk-selected-info">
                    <span className="perk-selected-label">Selected:</span>
                    <strong>{selectedPerk.perkId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
                  </div>
                  <button
                    type="button"
                    className="perk-change-btn"
                    onClick={() => setCurrentStep('perk')}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="perk-select-btn"
                  onClick={() => setCurrentStep('perk')}
                >
                  <Award className="h-4 w-4" />
                  Choose Your Perk
                </button>
              )}
            </div>
          )}

          {/* Perk Selector (full view) */}
          {currentStep === 'perk' && (
            <PerkSelector
              heroClass={hero.heroClass}
              level={nextLevel}
              existingPerkIds={existingPerkIds}
              onSelect={handlePerkSelected}
              onBack={() => setCurrentStep('overview')}
            />
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
        </ScrollArea>

        {/* Actions */}
        <DialogFooter>
          <Button variant="chamfered" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleLevelUp}
            disabled={!hasAllRequiredChoices() || currentStep === 'perk'}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm Level Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUp;
