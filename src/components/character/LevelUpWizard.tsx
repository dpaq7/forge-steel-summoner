/**
 * LevelUpWizard - Multi-step wizard for character level advancement
 * Redesigned from single-popup to step-by-step flow
 */
import React, { useState, useMemo, useCallback } from 'react';
import { useSummonerContext } from '../../context/HeroContext';
import { getProgressionForLevel, getCircleUpgrades } from '../../data/progression';
import {
  getFuryProgressionWithAspect,
  calculateFuryStamina,
} from '../../data/fury/progression';
import { classPerkAtLevel, getAvailablePerkCategories } from '../../data/perks';
import { LevelUpStep, LevelUpChoice, AutomaticFeature } from '../../types/levelup';
import { WardType, ProgressionChoices } from '../../types/progression';
import { SelectedPerk } from '../../types/perk';
import { Characteristic } from '../../types/common';
import { isSummonerHero, isFuryHero, SummonerHeroV2, FuryHero, Hero } from '../../types/hero';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from '@/components/ui/shadcn';
import { Sparkles, X } from 'lucide-react';

// Step components
import LevelUpOverview from './levelup/LevelUpOverview';
import LevelUpPerkStep from './levelup/LevelUpPerkStep';
import LevelUpChoiceStep from './levelup/LevelUpChoiceStep';
import LevelUpConfirmation from './levelup/LevelUpConfirmation';
import LevelUpProgress from './levelup/LevelUpProgress';

import './LevelUpWizard.css';

interface LevelUpWizardProps {
  onClose: () => void;
}

const LevelUpWizard: React.FC<LevelUpWizardProps> = ({ onClose }) => {
  const { hero, updateHero } = useSummonerContext();

  if (!hero) return null;

  // Check hero class for class-specific features
  const isSummoner = isSummonerHero(hero);
  const isFury = isFuryHero(hero);
  const summonerHero = isSummoner ? (hero as SummonerHeroV2) : null;
  const furyHero = isFury ? (hero as FuryHero) : null;

  const targetLevel = hero.level + 1;

  // Check if this level grants a perk
  const grantsPerks = classPerkAtLevel(hero.heroClass, targetLevel);
  const existingPerkIds = (hero.selectedPerks || []).map((p) => p.perkId);

  // Get progression based on hero class
  const progression = useMemo(() => {
    if (isFury && furyHero?.subclass) {
      return getFuryProgressionWithAspect(targetLevel, furyHero.subclass);
    }
    return getProgressionForLevel(targetLevel);
  }, [targetLevel, isFury, furyHero?.subclass]);

  // Filter class-specific upgrades for current subclass
  const filteredFeatures = useMemo(() => {
    if (!progression) return [];

    // Fury: already has aspect-specific features from getFuryProgressionWithAspect
    if (isFury) {
      return progression.features;
    }

    // Summoner: filter circle-specific upgrades
    return progression.features.map((feature) => {
      if (feature.category === 'circle-upgrade' && summonerHero?.subclass) {
        const circleChoices = getCircleUpgrades(summonerHero.subclass);
        return {
          ...feature,
          choices: circleChoices.map((u) => ({
            id: u.id,
            name: u.name,
            description: u.description,
          })),
        };
      }
      return feature;
    });
  }, [progression, summonerHero?.subclass, isFury]);

  const automaticFeatures = filteredFeatures.filter((f) => f.type === 'automatic');
  const choiceFeatures = filteredFeatures.filter((f) => f.type === 'choice');

  // Compute required steps based on what this level grants
  const requiredSteps = useMemo((): LevelUpStep[] => {
    const steps: LevelUpStep[] = ['overview'];

    // Add ability/choice step if there are choices to make
    if (choiceFeatures.length > 0) {
      steps.push('ability');
    }

    // Add perk step if this level grants a perk
    if (grantsPerks) {
      steps.push('perk');
    }

    steps.push('confirmation');
    return steps;
  }, [choiceFeatures.length, grantsPerks]);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<LevelUpStep>('overview');
  const [choices, setChoices] = useState<LevelUpChoice[]>([]);

  // Navigation
  const currentStepIndex = requiredSteps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === requiredSteps.length - 1;

  const goNext = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(requiredSteps[currentStepIndex + 1]);
    }
  }, [currentStepIndex, requiredSteps, isLastStep]);

  const goBack = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(requiredSteps[currentStepIndex - 1]);
    }
  }, [currentStepIndex, requiredSteps, isFirstStep]);

  // Choice handlers
  const addChoice = useCallback((choice: LevelUpChoice) => {
    setChoices((prev) => {
      // Replace existing choice of same type and category
      const filtered = prev.filter(
        (c) => !(c.type === choice.type && c.category === choice.category)
      );
      return [...filtered, choice];
    });
  }, []);

  const getChoiceByType = (type: LevelUpChoice['type'], category?: string) => {
    return choices.find((c) => c.type === type && (!category || c.category === category));
  };

  const getChoiceById = (id: string) => {
    return choices.find((c) => c.id === id);
  };

  // Calculate stamina changes - CLASS-SPECIFIC
  const currentStamina = hero.stamina.max;
  const echelon = Math.ceil(targetLevel / 3);
  const kitStamina = (hero.kit?.staminaPerEchelon || 0) * echelon;

  let newMaxStamina: number;
  if (isFury) {
    // Fury: Base 21 + 9 per level after 1
    newMaxStamina = calculateFuryStamina(targetLevel, kitStamina);
  } else {
    // Default (Summoner): Base 15 + 6 per level
    const baseStamina = 15;
    const levelBonus = targetLevel >= 2 ? targetLevel * 6 : 0;
    newMaxStamina = baseStamina + kitStamina + levelBonus;
  }

  // Check if all required choices are made
  const hasAllRequiredChoices = useCallback(() => {
    // Check class feature choices
    const hasClassChoices = choiceFeatures.every((feature) =>
      choices.some((c) => c.category === feature.category)
    );
    // Check perk choice if required
    const hasPerkChoice = !grantsPerks || choices.some((c) => c.type === 'perk');
    return hasClassChoices && hasPerkChoice;
  }, [choiceFeatures, choices, grantsPerks]);

  // Confirm level-up
  const handleConfirm = useCallback(() => {
    if (!hasAllRequiredChoices()) {
      return;
    }

    // Build the new progression choices
    const newProgressionChoices: ProgressionChoices = { ...hero.progressionChoices };

    // Apply choices based on category
    choices.forEach((choice) => {
      switch (choice.category) {
        // Summoner categories
        case 'ward':
          newProgressionChoices.ward = choice.id as WardType;
          break;
        case 'second-ward':
          newProgressionChoices.secondWard = choice.id as WardType;
          break;
        case '7-essence':
          newProgressionChoices.sevenEssenceAbility = choice.id;
          break;
        case '9-essence':
          newProgressionChoices.nineEssenceAbility = choice.id;
          break;
        case '11-essence':
          newProgressionChoices.elevenEssenceAbility = choice.id;
          break;
        case 'circle-upgrade':
          newProgressionChoices.circleUpgrade = choice.id;
          break;
        case 'stat-boost':
          newProgressionChoices.statBoost = choice.id as Characteristic;
          break;
        // Fury categories
        case '7-ferocity':
          newProgressionChoices.sevenFerocityAbility = choice.id;
          break;
        case '9-ferocity':
          newProgressionChoices.nineFerocityAbility = choice.id;
          break;
        case '11-ferocity':
          newProgressionChoices.elevenFerocityAbility = choice.id;
          break;
        case 'aspect-5-ferocity':
          newProgressionChoices.aspectFiveFerocity = choice.id;
          break;
        case 'aspect-9-ferocity':
          newProgressionChoices.aspectNineFerocity = choice.id;
          break;
        case 'aspect-11-ferocity':
          newProgressionChoices.aspectElevenFerocity = choice.id;
          break;
      }
    });

    // Apply stat changes
    const updates: Partial<Hero> = {
      level: targetLevel,
      progressionChoices: newProgressionChoices,
    };

    // Add selected perk if one was chosen
    const perkChoice = choices.find((c) => c.type === 'perk');
    if (perkChoice) {
      const selectedPerk: SelectedPerk = {
        perkId: perkChoice.id,
        selectedAtLevel: targetLevel,
        source: 'class',
      };
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
            reason: Math.min(
              4,
              (updates.characteristics?.reason || hero.characteristics.reason) + sc.allStats
            ),
            intuition: Math.min(4, hero.characteristics.intuition + sc.allStats),
            presence: Math.min(4, hero.characteristics.presence + sc.allStats),
          };
        }

        // Apply stat boost choice (Summoner Level 4)
        const statBoostChoice = choices.find((c) => c.category === 'stat-boost');
        if (statBoostChoice && targetLevel === 4) {
          const stat = statBoostChoice.id as Characteristic;
          updates.characteristics = {
            ...(updates.characteristics || hero.characteristics),
            [stat]: Math.min(
              4,
              (updates.characteristics?.[stat] || hero.characteristics[stat]) + 1
            ),
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
  }, [
    hero,
    targetLevel,
    choices,
    progression,
    isFury,
    newMaxStamina,
    updateHero,
    onClose,
    hasAllRequiredChoices,
  ]);

  // Handle dialog open change
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  // Calculate characteristic preview
  const getCharPreview = () => {
    if (!progression?.statChanges) return null;
    const sc = progression.statChanges;
    const changes: { stat: string; from: number; to: number }[] = [];

    // Fury-specific stat previews
    if (isFury) {
      if (sc.might !== undefined && sc.might !== hero.characteristics.might) {
        changes.push({ stat: 'Might', from: hero.characteristics.might, to: sc.might });
      }
      if (sc.agility !== undefined && sc.agility !== hero.characteristics.agility) {
        changes.push({ stat: 'Agility', from: hero.characteristics.agility, to: sc.agility });
      }
    }

    // Summoner-specific stat previews
    if (sc.reason !== undefined && sc.reason !== hero.characteristics.reason) {
      changes.push({ stat: 'Reason', from: hero.characteristics.reason, to: sc.reason });
    }

    // Note: allStats are handled separately
    if (sc.allStats !== undefined) {
      return { allStats: sc.allStats, changes };
    }

    return changes.length > 0 ? { changes } : null;
  };

  // Maximum level check
  if (targetLevel > 10) {
    return (
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent variant="compact" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Maximum Level Reached</DialogTitle>
            <DialogDescription>
              Your character is already at level 10, the maximum level.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button variant="chamfered" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Prepare automatic features for display
  const automaticFeaturesForDisplay: AutomaticFeature[] = automaticFeatures.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
  }));

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'overview':
        return (
          <LevelUpOverview
            hero={hero}
            targetLevel={targetLevel}
            requiredSteps={requiredSteps}
            automaticFeatures={automaticFeaturesForDisplay}
            staminaChange={{ from: currentStamina, to: newMaxStamina }}
            charPreview={getCharPreview()}
            minionCap={progression?.statChanges?.minionCap}
            essencePerTurn={progression?.statChanges?.essencePerTurn}
            onBegin={goNext}
          />
        );

      case 'ability':
        return (
          <LevelUpChoiceStep
            hero={hero}
            targetLevel={targetLevel}
            choiceFeatures={choiceFeatures}
            currentChoices={choices}
            onSelect={(choice) => addChoice(choice)}
            onBack={goBack}
            onContinue={goNext}
          />
        );

      case 'perk':
        return (
          <LevelUpPerkStep
            hero={hero}
            targetLevel={targetLevel}
            allowedCategories={getAvailablePerkCategories(hero.heroClass, targetLevel)}
            existingPerkIds={existingPerkIds}
            selectedPerkId={choices.find((c) => c.type === 'perk')?.id}
            onSelect={(perkId, perkName, description) => {
              addChoice({ type: 'perk', id: perkId, name: perkName, description });
            }}
            onBack={goBack}
            onContinue={goNext}
          />
        );

      case 'confirmation':
        return (
          <LevelUpConfirmation
            hero={hero}
            targetLevel={targetLevel}
            choices={choices}
            automaticFeatures={automaticFeaturesForDisplay}
            staminaChange={{ from: currentStamina, to: newMaxStamina }}
            charPreview={getCharPreview()}
            onBack={goBack}
            onConfirm={handleConfirm}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent variant="scroll" className="levelup-wizard-dialog max-w-3xl">
        {/* Custom header with progress */}
        <div className="levelup-wizard-header">
          <div className="levelup-wizard-title">
            <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
            <span>Level Up</span>
          </div>
          <LevelUpProgress
            steps={requiredSteps}
            currentStep={currentStep}
            choices={choices}
          />
        </div>

        {/* Step content */}
        <div className="levelup-wizard-content">{renderStep()}</div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpWizard;
