import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSummonerContext } from '../../context/HeroContext';
import { SummonerHero, SummonerCircle, Formation, Ancestry, Culture, Career, Kit, MinionTemplate, QuickCommand, HeroAncestry } from '../../types';
import { HeroClass, Hero, SummonerHeroV2, TalentHero, CensorHero, ConduitHero, ElementalistHero, FuryHero, NullHero, ShadowHero, TacticianHero, TroubadourHero } from '../../types/hero';
import { getAncestryById, isAncestryComplete } from '../../data/ancestries';
import { ancestries, cultures, careers, kits, getSelectableLanguages, languages as allLanguages } from '../../data/reference-data';
import { portfolios } from '../../data/portfolios';
import { formations } from '../../data/formations';
import { circleToPortfolio } from '../../types/summoner';
import { summonerAbilitiesByLevel } from '../../data/abilities/summoner-abilities';
import { NULL_TRADITIONS, TraditionData } from '../../data/null/traditions';
import { PSIONIC_AUGMENTATIONS, AugmentationData, getAugmentationBonuses } from '../../data/null/augmentations';
import { NullTradition, PsionicAugmentation } from '../../types/hero';
import { skills, getSkillsByGroup, SkillGroup, Skill, isSkillGroup, findSkillByName } from '../../data/skills';
import { classDefinitions, getClassRoleColor, getSubclassTypeName, requiresMultipleSubclasses, getSubclassSelectCount } from '../../data/classes/class-definitions';
import ClassSelector from './ClassSelector';
import SubclassSelector from './SubclassSelector';
import FuryAspectSelector from './FuryAspectSelector';
import CreationNavigation from './CreationNavigation';
import AncestrySelector from './AncestrySelector';
import AncestryTraitSelector from './AncestryTraitSelector';
import { useSkillAvailability, getSourceLabel, SkillAvailabilityProvider } from '../../context/SkillAvailabilityContext';
import { TroubadourClass, FuryAspect, StormwightKit, ConduitDomain } from '../../types/hero';
import { getPrimordialStormForKit } from '../../data/fury/stormwight-kits';
import {
  generateId,
  calculateMaxStamina,
  calculateWindedThreshold,
  calculateRecoveryValue,
  calculateMaxRecoveries,
  calculateSpeed,
  calculateStability,
  calculateEssencePerTurn,
} from '../../utils/calculations';

type Step = 'name' | 'class' | 'subclass' | 'furyAspect' | 'stormwightKit' | 'ancestry' | 'ancestryTraits' | 'culture' | 'cultureSkills' | 'career' | 'careerSkills' | 'languages' | 'circle' | 'signatureMinions' | 'formation' | 'nullTradition' | 'psionicAugmentation' | 'kit' | 'characteristics';

// Base steps that all classes share
// Note: ancestryTraits is conditionally shown only if the selected ancestry has trait data
const BASE_STEPS: Step[] = ['name', 'class', 'ancestry', 'ancestryTraits', 'culture', 'cultureSkills', 'career', 'careerSkills', 'languages', 'kit', 'characteristics'];

// Summoner-specific steps (inserted after languages)
const SUMMONER_STEPS: Step[] = ['circle', 'signatureMinions', 'formation'];

// Null-specific steps (inserted after languages)
const NULL_STEPS: Step[] = ['nullTradition', 'psionicAugmentation'];

// Fury-specific steps (aspect and optional kit after class selection)
const FURY_STEPS: Step[] = ['furyAspect'];

// Generic subclass step (used by most classes)
const SUBCLASS_STEPS: Step[] = ['subclass'];

// Get steps for a specific class
function getStepsForClass(heroClass: HeroClass | null): Step[] {
  if (!heroClass) return ['name', 'class'];

  // Start with base steps
  const steps = [...BASE_STEPS];

  if (heroClass === 'summoner') {
    // Summoner uses 'circle' instead of 'subclass' - insert after languages
    const langIndex = steps.indexOf('languages');
    steps.splice(langIndex + 1, 0, ...SUMMONER_STEPS);
    return steps;
  }

  if (heroClass === 'null') {
    // Null uses 'nullTradition' step (which IS its subclass) after languages
    const langIndex = steps.indexOf('languages');
    steps.splice(langIndex + 1, 0, ...NULL_STEPS);
    return steps;
  }

  if (heroClass === 'fury') {
    // Fury uses 'furyAspect' instead of generic 'subclass'
    const classIndex = steps.indexOf('class');
    steps.splice(classIndex + 1, 0, ...FURY_STEPS);
    return steps;
  }

  // All other classes: add subclass step after class selection
  // This includes: Censor, Conduit, Elementalist, Shadow, Tactician, Talent, Troubadour
  const classIndex = steps.indexOf('class');
  steps.splice(classIndex + 1, 0, ...SUBCLASS_STEPS);
  return steps;
}

// Legacy constant for backward compatibility
const ALL_STEPS: Step[] = getStepsForClass('summoner');

interface CharacterCreationProps {
  onComplete?: () => void;
}

interface SkillSelection {
  source: string; // e.g., 'environment', 'organization', 'upbringing', 'career'
  skillGroup: SkillGroup | null; // null if it's a fixed skill
  selectedSkillId: string | null;
  isFixed: boolean; // true if this is a specific skill, not a choice
}

const CharacterCreationInner: React.FC<CharacterCreationProps> = ({ onComplete }) => {
  const { createNewHero } = useSummonerContext();
  const skillAvailability = useSkillAvailability();

  // Ref for scroll-to-top behavior
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top of the creation container
  const scrollToTop = useCallback(() => {
    // Scroll the creation container
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    // Also scroll the app-main container if it exists
    const appMain = document.querySelector('.app-main');
    if (appMain) {
      appMain.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<HeroClass | null>(null);
  const [selectedAncestry, setSelectedAncestry] = useState<Ancestry | null>(null);
  // New ancestry point-buy system
  const [selectedAncestryId, setSelectedAncestryId] = useState<string | null>(null);
  const [selectedAncestryTraitIds, setSelectedAncestryTraitIds] = useState<string[]>([]);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<SummonerCircle | null>(null);
  const [selectedSignatureMinions, setSelectedSignatureMinions] = useState<MinionTemplate[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);

  // Null-specific state
  const [selectedNullTradition, setSelectedNullTradition] = useState<NullTradition | null>(null);
  const [selectedPsionicAugmentation, setSelectedPsionicAugmentation] = useState<PsionicAugmentation | null>(null);

  // Fury-specific state
  const [selectedFuryAspect, setSelectedFuryAspect] = useState<FuryAspect | null>(null);
  const [selectedStormwightKit, setSelectedStormwightKit] = useState<StormwightKit | null>(null);

  // Generic subclass state (used by most classes)
  const [selectedSubclass, setSelectedSubclass] = useState<string | null>(null);
  // Multi-subclass state for Conduit (2 domains)
  const [selectedSubclasses, setSelectedSubclasses] = useState<string[]>([]);

  // Get the steps for the current class selection
  const currentSteps = useMemo(() => getStepsForClass(selectedClass), [selectedClass]);

  // Standard array values for Draw Steel: 2, 2, 1, 0, -1
  const STANDARD_ARRAY = [2, 2, 1, 0, -1];

  // Track which value is assigned to which characteristic (null = unassigned)
  const [characteristicAssignments, setCharacteristicAssignments] = useState<{
    might: number | null;
    agility: number | null;
    reason: number | null;
    intuition: number | null;
    presence: number | null;
  }>({
    might: null,
    agility: null,
    reason: null,
    intuition: null,
    presence: null,
  });

  // Track which characteristic is currently selected for assignment
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<keyof typeof characteristicAssignments | null>(null);

  // Compute characteristics object for final character creation
  const characteristics = {
    might: characteristicAssignments.might ?? 0,
    agility: characteristicAssignments.agility ?? 0,
    reason: characteristicAssignments.reason ?? 0,
    intuition: characteristicAssignments.intuition ?? 0,
    presence: characteristicAssignments.presence ?? 0,
  };

  // Get list of values that are still available to assign
  const getAvailableValues = (): number[] => {
    const assigned = Object.values(characteristicAssignments).filter(v => v !== null) as number[];
    const available = [...STANDARD_ARRAY];

    // Remove assigned values from available pool
    for (const val of assigned) {
      const idx = available.indexOf(val);
      if (idx !== -1) {
        available.splice(idx, 1);
      }
    }

    return available.sort((a, b) => b - a); // Sort descending
  };

  // Check if all characteristics have been assigned
  const allCharacteristicsAssigned = (): boolean => {
    return Object.values(characteristicAssignments).every(v => v !== null);
  };

  // Assign a value to a characteristic
  const assignValue = (characteristic: keyof typeof characteristicAssignments, value: number) => {
    setCharacteristicAssignments(prev => ({
      ...prev,
      [characteristic]: value,
    }));
    setSelectedCharacteristic(null);
  };

  // Clear a characteristic assignment
  const clearAssignment = (characteristic: keyof typeof characteristicAssignments) => {
    setCharacteristicAssignments(prev => ({
      ...prev,
      [characteristic]: null,
    }));
  };

  // Reset all assignments
  const resetAssignments = () => {
    setCharacteristicAssignments({
      might: null,
      agility: null,
      reason: null,
      intuition: null,
      presence: null,
    });
    setSelectedCharacteristic(null);
  };

  // Get recommended characteristic array based on class
  const getRecommendedArray = (): Record<string, number> => {
    if (!selectedClass) {
      return { might: 2, agility: 2, reason: 1, intuition: 0, presence: -1 };
    }

    const classDef = classDefinitions[selectedClass];
    const fixed = classDef.startingCharacteristics;
    const potency = classDef.potencyCharacteristic;

    // Start with fixed characteristics from class
    const recommended: Record<string, number> = { ...fixed };

    // Assign remaining values to prioritize potency characteristic
    const remaining = [2, 2, 1, 0, -1];
    const chars = ['might', 'agility', 'reason', 'intuition', 'presence'];

    // Remove values already used by fixed characteristics
    Object.values(fixed).forEach(val => {
      const idx = remaining.indexOf(val as number);
      if (idx !== -1) remaining.splice(idx, 1);
    });

    // Assign remaining values, prioritizing potency characteristic
    chars.forEach(char => {
      if (!(char in recommended)) {
        if (char === potency && remaining.includes(2)) {
          recommended[char] = 2;
          remaining.splice(remaining.indexOf(2), 1);
        } else {
          recommended[char] = remaining.shift() ?? 0;
        }
      }
    });

    return recommended;
  };

  // Apply recommended array based on selected class
  const applyRecommendedArray = () => {
    const recommended = getRecommendedArray();
    setCharacteristicAssignments({
      might: recommended.might ?? 0,
      agility: recommended.agility ?? 0,
      reason: recommended.reason ?? 0,
      intuition: recommended.intuition ?? 0,
      presence: recommended.presence ?? 0,
    });
    setSelectedCharacteristic(null);
  };

  // Skill selections
  const [cultureSkillSelections, setCultureSkillSelections] = useState<SkillSelection[]>([]);
  const [careerSkillSelections, setCareerSkillSelections] = useState<SkillSelection[]>([]);

  // Language selections
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Calculate how many languages the career grants
  const getRequiredLanguageCount = (): number => {
    if (!selectedCareer) return 0;
    const langEntry = selectedCareer.languages[0];
    if (!langEntry) return 0;
    const match = langEntry.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Reset language selections when career changes
  useEffect(() => {
    setSelectedLanguages([]);
  }, [selectedCareer]);

  // Clear skill availability when culture changes
  useEffect(() => {
    skillAvailability.clearSourceGrants('culture');
  }, [selectedCulture]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear skill availability when career changes
  useEffect(() => {
    skillAvailability.clearSourceGrants('career');
  }, [selectedCareer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset Null-specific selections when class changes away from Null
  useEffect(() => {
    if (selectedClass !== 'null') {
      setSelectedNullTradition(null);
      setSelectedPsionicAugmentation(null);
    }
  }, [selectedClass]);

  // Reset Fury-specific selections when class changes away from Fury
  useEffect(() => {
    if (selectedClass !== 'fury') {
      setSelectedFuryAspect(null);
      setSelectedStormwightKit(null);
    }
  }, [selectedClass]);

  // Reset subclass selections when class changes
  useEffect(() => {
    setSelectedSubclass(null);
    setSelectedSubclasses([]);
  }, [selectedClass]);

  // Reset Stormwight kit when aspect changes away from Stormwight
  useEffect(() => {
    if (selectedFuryAspect !== 'stormwight') {
      setSelectedStormwightKit(null);
    }
  }, [selectedFuryAspect]);

  // Reset ancestry trait selections when ancestry changes
  useEffect(() => {
    setSelectedAncestryTraitIds([]);
    // Also sync with legacy ancestry system for backward compat during creation
    if (selectedAncestryId) {
      const ancestryData = getAncestryById(selectedAncestryId);
      if (ancestryData) {
        // Create a minimal Ancestry object for backward compat
        setSelectedAncestry({
          id: ancestryData.id,
          name: ancestryData.name,
          description: ancestryData.description,
          size: ancestryData.size as any,
          speed: ancestryData.speed,
          signatureFeature: {
            id: 'signature',
            name: ancestryData.signatureTrait.name,
            description: ancestryData.signatureTrait.description,
          },
          purchasedTraits: ancestryData.purchasedTraits.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            cost: t.cost,
          })),
          ancestryPoints: ancestryData.ancestryPoints,
        });
      }
    }
  }, [selectedAncestryId]);

  // Toggle language selection
  const toggleLanguage = (languageId: string) => {
    const required = getRequiredLanguageCount();
    if (selectedLanguages.includes(languageId)) {
      setSelectedLanguages(selectedLanguages.filter(id => id !== languageId));
    } else if (selectedLanguages.length < required) {
      setSelectedLanguages([...selectedLanguages, languageId]);
    }
  };

  // Initialize culture skill selections when culture changes
  useEffect(() => {
    if (selectedCulture) {
      const selections: SkillSelection[] = [];

      // Environment skill (pick from one of two groups)
      selectedCulture.environment.skills.forEach((skillGroupStr, idx) => {
        const group = skillGroupStr.toLowerCase() as SkillGroup;
        if (isSkillGroup(skillGroupStr)) {
          selections.push({
            source: `environment-${idx}`,
            skillGroup: group,
            selectedSkillId: null,
            isFixed: false,
          });
        }
      });

      // Organization skill (pick from one of two groups)
      selectedCulture.organization.skills.forEach((skillGroupStr, idx) => {
        const group = skillGroupStr.toLowerCase() as SkillGroup;
        if (isSkillGroup(skillGroupStr)) {
          selections.push({
            source: `organization-${idx}`,
            skillGroup: group,
            selectedSkillId: null,
            isFixed: false,
          });
        }
      });

      // Upbringing skill (might be specific or group)
      selectedCulture.upbringing.skills.forEach((skillStr, idx) => {
        if (isSkillGroup(skillStr)) {
          selections.push({
            source: `upbringing-${idx}`,
            skillGroup: skillStr.toLowerCase() as SkillGroup,
            selectedSkillId: null,
            isFixed: false,
          });
        } else {
          // Check if it's a specific skill like "Music/Perform" or "Blacksmithing"
          const specificSkill = findSkillByName(skillStr.split('/')[0]);
          selections.push({
            source: `upbringing-${idx}`,
            skillGroup: null,
            selectedSkillId: specificSkill?.id || null,
            isFixed: specificSkill !== undefined,
          });
        }
      });

      setCultureSkillSelections(selections);
    }
  }, [selectedCulture]);

  // Initialize career skill selections when career changes
  useEffect(() => {
    if (selectedCareer) {
      const selections: SkillSelection[] = [];

      selectedCareer.skills.forEach((skillStr, idx) => {
        // Handle combined skills like "Crafting/Exploration"
        if (skillStr.includes('/') && !skillStr.includes('Music')) {
          // This is a choice between groups
          const groups = skillStr.split('/');
          selections.push({
            source: `career-choice-${idx}`,
            skillGroup: null, // Will be selected by user
            selectedSkillId: null,
            isFixed: false,
          });
        } else if (isSkillGroup(skillStr)) {
          // This is a skill group - user picks specific skill
          selections.push({
            source: `career-${idx}`,
            skillGroup: skillStr.toLowerCase() as SkillGroup,
            selectedSkillId: null,
            isFixed: false,
          });
        } else {
          // This is a specific skill
          const specificSkill = findSkillByName(skillStr.split('/')[0]);
          selections.push({
            source: `career-${idx}`,
            skillGroup: specificSkill?.group || null,
            selectedSkillId: specificSkill?.id || skillStr.toLowerCase().replace(/\s+/g, '-'),
            isFixed: true,
          });
        }
      });

      setCareerSkillSelections(selections);
    }
  }, [selectedCareer]);

  const canProceed = (): boolean => {
    switch (step) {
      case 'name':
        return name.trim().length > 0;
      case 'class':
        return selectedClass !== null;
      case 'subclass':
        // Subclass selection required for classes that have this step
        if (!selectedClass) return false;
        // Conduit requires 2 domains (multi-select)
        if (requiresMultipleSubclasses(selectedClass)) {
          return selectedSubclasses.length === getSubclassSelectCount(selectedClass);
        }
        return selectedSubclass !== null;
      case 'furyAspect':
        // Fury aspect required, and if Stormwight is selected, kit is also required
        if (!selectedFuryAspect) return false;
        if (selectedFuryAspect === 'stormwight' && !selectedStormwightKit) return false;
        return true;
      case 'ancestry':
        return selectedAncestryId !== null;
      case 'ancestryTraits':
        // Can proceed even with no traits selected (player might want to defer)
        // But if ancestry has no trait data, this step should be skipped
        return selectedAncestryId !== null;
      case 'culture':
        return selectedCulture !== null;
      case 'cultureSkills':
        // All non-fixed selections must have a skill selected
        return cultureSkillSelections.every(s => s.isFixed || s.selectedSkillId !== null);
      case 'career':
        return selectedCareer !== null;
      case 'careerSkills':
        // All non-fixed selections must have a skill selected
        return careerSkillSelections.every(s => s.isFixed || s.selectedSkillId !== null);
      case 'languages':
        // Must select required number of languages (or 0 if career grants none)
        return selectedLanguages.length === getRequiredLanguageCount();
      case 'circle':
        return selectedCircle !== null;
      case 'signatureMinions':
        return selectedSignatureMinions.length === 2;
      case 'formation':
        return selectedFormation !== null;
      case 'nullTradition':
        return selectedNullTradition !== null;
      case 'psionicAugmentation':
        return selectedPsionicAugmentation !== null;
      case 'kit':
        return selectedKit !== null;
      case 'characteristics':
        return allCharacteristicsAssigned();
      default:
        return false;
    }
  };

  const handleNext = () => {
    const currentIndex = currentSteps.indexOf(step);
    if (currentIndex < currentSteps.length - 1) {
      let nextStep = currentSteps[currentIndex + 1];

      // Skip ancestryTraits step if the selected ancestry has no trait data
      if (nextStep === 'ancestryTraits' && selectedAncestryId) {
        if (!isAncestryComplete(selectedAncestryId)) {
          // Find the step after ancestryTraits
          const traitsIndex = currentSteps.indexOf('ancestryTraits');
          if (traitsIndex >= 0 && traitsIndex < currentSteps.length - 1) {
            nextStep = currentSteps[traitsIndex + 1];
          }
        }
      }

      setStep(nextStep);
      // Scroll to top after a brief delay to allow render
      requestAnimationFrame(() => {
        scrollToTop();
      });
    } else {
      createCharacter();
    }
  };

  const handleBack = () => {
    const currentIndex = currentSteps.indexOf(step);
    if (currentIndex > 0) {
      let prevStep = currentSteps[currentIndex - 1];

      // Skip ancestryTraits step if the selected ancestry has no trait data
      if (prevStep === 'ancestryTraits' && selectedAncestryId) {
        if (!isAncestryComplete(selectedAncestryId)) {
          // Find the step before ancestryTraits
          const traitsIndex = currentSteps.indexOf('ancestryTraits');
          if (traitsIndex > 0) {
            prevStep = currentSteps[traitsIndex - 1];
          }
        }
      }

      setStep(prevStep);
      // Scroll to top after a brief delay to allow render
      requestAnimationFrame(() => {
        scrollToTop();
      });
    }
  };

  const getAllSelectedSkills = (): string[] => {
    const skillIds: string[] = [];

    // Culture skills
    cultureSkillSelections.forEach(s => {
      if (s.selectedSkillId) {
        skillIds.push(s.selectedSkillId);
      }
    });

    // Career skills
    careerSkillSelections.forEach(s => {
      if (s.selectedSkillId) {
        skillIds.push(s.selectedSkillId);
      }
    });

    // Remove duplicates
    return [...new Set(skillIds)];
  };

  const createCharacter = () => {
    // Validate common required fields
    if (!selectedClass || !selectedAncestry || !selectedCulture || !selectedCareer || !selectedKit) {
      console.error('Missing required fields:', { selectedClass, selectedAncestry, selectedCulture, selectedCareer, selectedKit });
      return;
    }

    // Validate summoner-specific fields if creating a summoner
    if (selectedClass === 'summoner') {
      if (!selectedCircle || !selectedFormation) {
        console.error('Missing summoner-specific fields:', { selectedCircle, selectedFormation });
        return;
      }
    }

    const level = 1;
    const classDef = classDefinitions[selectedClass];

    // Calculate stamina based on class
    const baseStamina = classDef.startingStamina;
    const kitStaminaBonus = selectedKit.stamina || 0;
    const maxStamina = baseStamina + kitStaminaBonus;

    // Calculate recoveries based on class
    const maxRecoveries = classDef.startingRecoveries;
    const recoveryValue = Math.floor(maxStamina / 3);

    // Build ancestry selection for the new point-buy system
    const ancestrySelection: HeroAncestry | undefined = selectedAncestryId
      ? {
          ancestryId: selectedAncestryId,
          selectedTraitIds: selectedAncestryTraitIds,
        }
      : undefined;

    // Build base hero properties shared by all classes
    const baseHeroData = {
      id: generateId(),
      name,
      level,
      ancestry: selectedAncestry,
      ancestrySelection, // New: point-buy ancestry trait selection
      culture: selectedCulture,
      career: selectedCareer,
      characteristics,
      stamina: {
        current: maxStamina,
        max: maxStamina,
        winded: calculateWindedThreshold(maxStamina),
      },
      recoveries: {
        current: maxRecoveries,
        max: maxRecoveries,
        value: recoveryValue,
      },
      speed: calculateSpeed(selectedKit),
      stability: calculateStability(selectedKit),
      surges: 0,
      heroTokens: 0,
      victories: 0,
      xp: 0,
      wealth: 2,
      gold: 0,
      renown: 0,
      abilities: [],
      features: [],
      skills: getAllSelectedSkills(),
      languages: ['caelian', ...selectedLanguages],
      kit: selectedKit,
      items: [],
      notes: '',
      portraitUrl: null,
      activeConditions: [],
      progressionChoices: {},
      activeProjects: [],
      inventory: [],
      equippedItems: [],
    };

    // Create class-specific hero using proper Hero types
    if (selectedClass === 'summoner') {
      // Summoner-specific creation
      const portfolioType = circleToPortfolio[selectedCircle!];
      const portfolio = portfolios[portfolioType];
      const maxEssencePerTurn = calculateEssencePerTurn(level);
      const quickCommand = formations[selectedFormation!].quickCommands[0];

      const newHero: SummonerHeroV2 = {
        ...baseHeroData,
        heroClass: 'summoner',
        heroicResource: {
          type: 'essence',
          current: 0,
          maxPerTurn: maxEssencePerTurn,
        },
        subclass: selectedCircle!,
        formation: selectedFormation!,
        quickCommand,
        portfolio: {
          ...portfolio,
          signatureMinions: selectedSignatureMinions,
        },
        activeSquads: [],
        fixture: null,
        abilities: summonerAbilitiesByLevel[1] || [],
        minionPortraits: {},
        fixturePortrait: null,
        inactiveMinions: [],
        // Champion state (Summoner v1.0 SRD - unlocks at Level 8)
        activeChampion: null,
        championState: {
          canSummon: true,
          summonedThisEncounter: false,
          championActionUsed: false,
          requiresVictoryToResummon: false,
        },
        // Out-of-combat state (Summoner v1.0 SRD)
        outOfCombatState: {
          activeMinions: [],
          usedAbilities: {},
          shouldDismissOnCombatStart: true,
        },
      };

      createNewHero(newHero);
    } else {
      // Create class-specific hero with proper types
      const reasonScore = baseHeroData.characteristics?.reason ?? 2;

      // Create proper Hero type based on class
      let newHero: Hero;

      switch (selectedClass) {
        case 'talent':
          newHero = {
            ...baseHeroData,
            heroClass: 'talent',
            heroicResource: {
              type: 'clarity',
              current: 0,
              minimum: -(1 + reasonScore), // Can go negative
            },
            isStrained: false,
            subclass: selectedSubclass as TalentHero['subclass'] || undefined,
          } as TalentHero;
          break;

        case 'censor':
          newHero = {
            ...baseHeroData,
            heroClass: 'censor',
            heroicResource: { type: 'wrath', current: 0 },
            judgment: { targetId: null, targetName: null },
            subclass: selectedSubclass as CensorHero['subclass'] || undefined,
          } as CensorHero;
          break;

        case 'conduit':
          // Conduit selects 2 domains
          const conduitDomains = selectedSubclasses as ConduitDomain[];
          newHero = {
            ...baseHeroData,
            heroClass: 'conduit',
            heroicResource: { type: 'piety', current: 0 },
            subclass: conduitDomains[0] || undefined, // Primary domain
            domains: conduitDomains, // Both chosen domains
            prayState: { hasPrayedThisTurn: false, lastPrayResult: null },
          } as ConduitHero;
          break;

        case 'elementalist':
          newHero = {
            ...baseHeroData,
            heroClass: 'elementalist',
            heroicResource: { type: 'essence', current: 0, persistent: 0 },
            subclass: selectedSubclass as ElementalistHero['subclass'] || undefined,
            mantleActive: false,
            persistentAbilities: [],
          } as ElementalistHero;
          break;

        case 'fury':
          newHero = {
            ...baseHeroData,
            heroClass: 'fury',
            heroicResource: { type: 'ferocity', current: 0 },
            subclass: selectedFuryAspect || undefined,
            furyState: {
              aspect: selectedFuryAspect || 'berserker',
              stormwightKit: selectedFuryAspect === 'stormwight' ? selectedStormwightKit || undefined : undefined,
              primordialStorm: selectedFuryAspect === 'stormwight' && selectedStormwightKit
                ? getPrimordialStormForKit(selectedStormwightKit)
                : undefined,
              currentForm: 'humanoid',
              growingFerocity: {
                tookDamageThisRound: false,
                becameWindedThisEncounter: false,
                becameDyingThisEncounter: false,
              },
              primordialPower: 0,
            },
          } as FuryHero;
          break;

        case 'null':
          // Apply psionic augmentation bonuses
          const augBonuses = getAugmentationBonuses(selectedPsionicAugmentation ?? undefined, level);
          const nullMaxStamina = baseHeroData.stamina.max + augBonuses.stamina;
          const nullRecoveryValue = Math.floor(nullMaxStamina / 3);
          const nullStability = baseHeroData.stability + augBonuses.stability;
          const nullSpeed = baseHeroData.speed + augBonuses.speed;

          newHero = {
            ...baseHeroData,
            heroClass: 'null',
            heroicResource: { type: 'discipline', current: 0 },
            subclass: selectedNullTradition ?? undefined,
            augmentation: selectedPsionicAugmentation ?? undefined,
            // Apply augmentation stat bonuses
            stamina: {
              current: nullMaxStamina,
              max: nullMaxStamina,
              winded: calculateWindedThreshold(nullMaxStamina),
            },
            recoveries: {
              ...baseHeroData.recoveries,
              value: nullRecoveryValue,
            },
            stability: nullStability,
            speed: nullSpeed,
            nullField: {
              isActive: false,
              baseSize: 1,
              bonusSize: 0,
              currentEnhancement: null,
              enhancementUsedThisTurn: false,
            },
            inertialShield: {
              usedThisRound: false,
              disciplineSpentOnPotencyReduction: 0,
              traditionBonusUsed: false,
            },
            order: undefined,
          } as NullHero;
          break;

        case 'shadow':
          newHero = {
            ...baseHeroData,
            heroClass: 'shadow',
            heroicResource: { type: 'insight', current: 0 },
            subclass: selectedSubclass as ShadowHero['subclass'] || undefined,
            isHidden: false,
          } as ShadowHero;
          break;

        case 'tactician':
          newHero = {
            ...baseHeroData,
            heroClass: 'tactician',
            heroicResource: { type: 'focus', current: 0 },
            markedTargets: [],
            secondaryKit: null,
            subclass: selectedSubclass as TacticianHero['subclass'] || undefined,
          } as TacticianHero;
          break;

        case 'troubadour':
          newHero = {
            ...baseHeroData,
            heroClass: 'troubadour',
            heroicResource: { type: 'drama', current: 0 },
            activeRoutine: null,
            secondaryRoutine: null,
            scenePartners: [],
            heroPartners: [],
            subclass: selectedSubclass as TroubadourClass || undefined,
          } as TroubadourHero;
          break;

        default:
          // Fallback (should never happen)
          throw new Error(`Unknown class: ${selectedClass}`);
      }

      createNewHero(newHero);
    }

    onComplete?.();
  };

  const toggleSignatureMinion = (minion: MinionTemplate) => {
    if (selectedSignatureMinions.find(m => m.id === minion.id)) {
      setSelectedSignatureMinions(selectedSignatureMinions.filter(m => m.id !== minion.id));
    } else if (selectedSignatureMinions.length < 2) {
      setSelectedSignatureMinions([...selectedSignatureMinions, minion]);
    }
  };

  const updateCultureSkillSelection = (source: string, skillId: string) => {
    setCultureSkillSelections(prev =>
      prev.map(s => s.source === source ? { ...s, selectedSkillId: skillId } : s)
    );
  };

  const updateCareerSkillSelection = (source: string, skillId: string, skillGroup?: SkillGroup) => {
    setCareerSkillSelections(prev =>
      prev.map(s => {
        if (s.source === source) {
          return { ...s, selectedSkillId: skillId, skillGroup: skillGroup || s.skillGroup };
        }
        return s;
      })
    );
  };

  const renderSkillSelector = (
    selection: SkillSelection,
    onSelect: (skillId: string, group?: SkillGroup) => void,
    sourceLabel: string
  ) => {
    if (selection.isFixed && selection.selectedSkillId) {
      const skill = skills.find(s => s.id === selection.selectedSkillId);
      return (
        <div className="skill-selection fixed" key={selection.source}>
          <h4>{sourceLabel}</h4>
          <div className="fixed-skill">
            <span className="skill-name">{skill?.name || selection.selectedSkillId}</span>
            <span className="skill-badge">Fixed</span>
          </div>
        </div>
      );
    }

    if (selection.skillGroup) {
      const availableSkills = getSkillsByGroup(selection.skillGroup);
      return (
        <div className="skill-selection" key={selection.source}>
          <h4>{sourceLabel} ({selection.skillGroup.charAt(0).toUpperCase() + selection.skillGroup.slice(1)} Skill)</h4>
          <div className="skill-options">
            {availableSkills.map(skill => {
              const isSelected = selection.selectedSkillId === skill.id;
              // Check if skill is available (not selected elsewhere)
              const isAvailable = skillAvailability.isSkillAvailable(skill.id);
              // If skill is selected in this slot, it's available for this slot
              const canSelect = isSelected || isAvailable;
              const source = !isAvailable ? skillAvailability.getSkillSource(skill.id) : null;

              const getDisabledReason = (): string | null => {
                if (!isAvailable && source) {
                  return `From ${getSourceLabel(source)}`;
                }
                return null;
              };

              const handleClick = () => {
                if (!canSelect) return;

                // If there was a previous selection, unregister it
                if (selection.selectedSkillId && selection.selectedSkillId !== skill.id) {
                  skillAvailability.unregisterSelectedSkill(selection.selectedSkillId, selection.source);
                }

                // Register the new selection (unless deselecting)
                if (!isSelected) {
                  skillAvailability.registerSelectedSkill(skill.id, selection.source);
                }

                onSelect(skill.id);
              };

              return (
                <button
                  key={skill.id}
                  className={`skill-option ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                  onClick={handleClick}
                  disabled={!canSelect}
                  aria-disabled={!canSelect}
                >
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-desc">{skill.description}</span>
                  {!canSelect && (
                    <span className="skill-source-badge">{getDisabledReason()}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderCultureSkillsStep = () => {
    if (!selectedCulture) return null;

    // Group selections by source type
    const environmentSelections = cultureSkillSelections.filter(s => s.source.startsWith('environment'));
    const organizationSelections = cultureSkillSelections.filter(s => s.source.startsWith('organization'));
    const upbringingSelections = cultureSkillSelections.filter(s => s.source.startsWith('upbringing'));

    return (
      <div className="creation-step skills-step">
        <h2>Select Your Culture Skills</h2>
        <p className="step-description">
          Your {selectedCulture.name} background grants you skills from your environment, organization, and upbringing.
          Select one skill from each available group.
        </p>

        {environmentSelections.length > 0 && (
          <div className="skill-category">
            <h3>Environment: {selectedCulture.environment.name}</h3>
            <p className="category-desc">Choose one skill from {selectedCulture.environment.skills.join(' or ')}</p>
            {environmentSelections.map((sel, idx) =>
              renderSkillSelector(
                sel,
                (skillId) => updateCultureSkillSelection(sel.source, skillId),
                `Skill ${idx + 1}`
              )
            )}
          </div>
        )}

        {organizationSelections.length > 0 && (
          <div className="skill-category">
            <h3>Organization: {selectedCulture.organization.name}</h3>
            <p className="category-desc">Choose one skill from {selectedCulture.organization.skills.join(' or ')}</p>
            {organizationSelections.map((sel, idx) =>
              renderSkillSelector(
                sel,
                (skillId) => updateCultureSkillSelection(sel.source, skillId),
                `Skill ${idx + 1}`
              )
            )}
          </div>
        )}

        {upbringingSelections.length > 0 && (
          <div className="skill-category">
            <h3>Upbringing: {selectedCulture.upbringing.name}</h3>
            <p className="category-desc">Skills from {selectedCulture.upbringing.skills.join(', ')}</p>
            {upbringingSelections.map((sel, idx) =>
              renderSkillSelector(
                sel,
                (skillId) => updateCultureSkillSelection(sel.source, skillId),
                `Skill ${idx + 1}`
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCareerSkillsStep = () => {
    if (!selectedCareer) return null;

    return (
      <div className="creation-step skills-step">
        <h2>Select Your Career Skills</h2>
        <p className="step-description">
          Your career as a {selectedCareer.name} grants you the following skills.
          Select specific skills where choices are available.
        </p>

        <div className="skill-category">
          <h3>Career Skills</h3>
          {careerSkillSelections.map((sel, idx) =>
            renderSkillSelector(
              sel,
              (skillId, group) => updateCareerSkillSelection(sel.source, skillId, group),
              `${selectedCareer.skills[idx] || `Skill ${idx + 1}`}`
            )
          )}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'name':
        return (
          <div className="creation-step name-step">
            <h2>Choose Your Name</h2>
            <p className="step-description">Enter a name for your hero</p>
            <div className="name-input-container">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter character name"
                autoFocus
              />
            </div>
          </div>
        );

      case 'class':
        return (
          <ClassSelector
            selectedClass={selectedClass}
            onSelect={(heroClass) => {
              setSelectedClass(heroClass);
              // Reset subclass when class changes
              setSelectedSubclass(null);
            }}
          />
        );

      case 'subclass':
        if (!selectedClass) return null;
        // Check if this class requires multi-select (Conduit)
        if (requiresMultipleSubclasses(selectedClass)) {
          return (
            <SubclassSelector
              heroClass={selectedClass}
              selectedSubclass={null}
              selectedSubclasses={selectedSubclasses}
              onSelect={() => {}}
              onMultiSelect={setSelectedSubclasses}
            />
          );
        }
        return (
          <SubclassSelector
            heroClass={selectedClass}
            selectedSubclass={selectedSubclass}
            onSelect={setSelectedSubclass}
          />
        );

      case 'furyAspect':
        return (
          <div className="creation-step fury-aspect-step">
            <FuryAspectSelector
              selectedAspect={selectedFuryAspect}
              onSelectAspect={setSelectedFuryAspect}
              selectedKit={selectedStormwightKit}
              onSelectKit={setSelectedStormwightKit}
            />
          </div>
        );

      case 'ancestry':
        return (
          <AncestrySelector
            selectedAncestryId={selectedAncestryId}
            onSelect={(ancestryId) => {
              setSelectedAncestryId(ancestryId);
            }}
          />
        );

      case 'ancestryTraits':
        if (!selectedAncestryId) return null;
        return (
          <div className="creation-step ancestry-traits-step">
            <h2>Choose Your Ancestry Traits</h2>
            <p className="step-description">
              Spend your ancestry points on purchased traits. You can also use the Quick Build
              option for recommended selections.
            </p>
            <AncestryTraitSelector
              ancestryId={selectedAncestryId}
              selectedTraitIds={selectedAncestryTraitIds}
              onTraitsChange={setSelectedAncestryTraitIds}
            />
          </div>
        );

      case 'culture':
        return (
          <div className="creation-step">
            <h2>Choose Your Culture</h2>
            <div className="options-grid">
              {cultures.map((culture) => (
                <div
                  key={culture.id}
                  className={`option-card ${selectedCulture?.id === culture.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCulture(culture)}
                >
                  <h3>{culture.name}</h3>
                  <p className="description">{culture.description}</p>
                  <p><strong>Environment:</strong> {culture.environment.name} ({culture.environment.skills.join(', ')})</p>
                  <p><strong>Organization:</strong> {culture.organization.name}</p>
                  <p><strong>Upbringing:</strong> {culture.upbringing.name} ({culture.upbringing.skills.join(', ')})</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cultureSkills':
        return renderCultureSkillsStep();

      case 'career':
        return (
          <div className="creation-step">
            <h2>Choose Your Career</h2>
            <div className="options-grid">
              {careers.map((career) => (
                <div
                  key={career.id}
                  className={`option-card ${selectedCareer?.id === career.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCareer(career)}
                >
                  <h3>{career.name}</h3>
                  <p className="description">{career.description}</p>
                  <p><strong>Skills:</strong> {career.skills.join(', ')}</p>
                  <p><strong>Perk Type:</strong> {career.perkType.charAt(0).toUpperCase() + career.perkType.slice(1)}</p>
                  {(career.renown > 0 || career.wealth > 0 || career.projectPoints > 0) && (
                    <p className="meta">
                      {career.renown > 0 && `Renown: +${career.renown} `}
                      {career.wealth > 0 && `Wealth: +${career.wealth} `}
                      {career.projectPoints > 0 && `Project Points: ${career.projectPoints}`}
                    </p>
                  )}
                  <p><em>"{career.incitingIncident}"</em></p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'careerSkills':
        return renderCareerSkillsStep();

      case 'languages':
        const requiredCount = getRequiredLanguageCount();
        const selectableLanguages = getSelectableLanguages();

        // If career grants no languages, skip this step automatically
        if (requiredCount === 0) {
          return (
            <div className="creation-step">
              <h2>Languages</h2>
              <p className="step-description">
                Your career as a <strong>{selectedCareer?.name}</strong> does not grant additional languages.
                <br />
                All heroes automatically know <strong>Caelian</strong>, the common tongue of Orden.
              </p>
              <div className="language-info">
                <div className="known-language">
                  <span className="lang-name">Caelian</span>
                  <span className="lang-note">Known by all heroes</span>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="creation-step languages-step">
            <h2>Choose Your Languages</h2>
            <p className="step-description">
              Your career as a <strong>{selectedCareer?.name}</strong> grants you knowledge of {requiredCount} additional language{requiredCount > 1 ? 's' : ''}.
              <br />
              All heroes automatically know <strong>Caelian</strong>, the common tongue.
              <br />
              <strong>Selected: {selectedLanguages.length} / {requiredCount}</strong>
            </p>

            <div className="language-selection">
              <div className="known-languages">
                <h4>Already Known</h4>
                <div className="language-chip default">
                  <span className="lang-name">Caelian</span>
                  <span className="lang-desc">Common tongue of Orden</span>
                </div>
              </div>

              <div className="available-languages">
                <h4>Select {requiredCount} Language{requiredCount > 1 ? 's' : ''}</h4>
                <div className="languages-grid">
                  {selectableLanguages.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang.id);
                    const canSelect = isSelected || selectedLanguages.length < requiredCount;

                    return (
                      <div
                        key={lang.id}
                        className={`language-option ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                        onClick={() => canSelect && toggleLanguage(lang.id)}
                      >
                        <span className="lang-name">{lang.name}</span>
                        <span className="lang-desc">{lang.relatedTo}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 'circle':
        return (
          <div className="creation-step">
            <h2>Choose Your Circle</h2>
            <p className="step-description">Your circle determines which portfolio of minions you can summon</p>
            <div className="options-grid">
              <div
                className={`option-card ${selectedCircle === 'blight' ? 'selected' : ''}`}
                onClick={() => setSelectedCircle('blight')}
              >
                <h3>Circle of Blight</h3>
                <p>Portfolio: Demon</p>
                <p>Summon fiends and devils from the abyss</p>
              </div>
              <div
                className={`option-card ${selectedCircle === 'graves' ? 'selected' : ''}`}
                onClick={() => setSelectedCircle('graves')}
              >
                <h3>Circle of Graves</h3>
                <p>Portfolio: Undead</p>
                <p>Raise skeletons, ghosts, and other undead minions</p>
              </div>
              <div
                className={`option-card ${selectedCircle === 'spring' ? 'selected' : ''}`}
                onClick={() => setSelectedCircle('spring')}
              >
                <h3>Circle of Spring</h3>
                <p>Portfolio: Fey</p>
                <p>Call upon sprites, pixies, and fey creatures</p>
              </div>
              <div
                className={`option-card ${selectedCircle === 'storms' ? 'selected' : ''}`}
                onClick={() => setSelectedCircle('storms')}
              >
                <h3>Circle of Storms</h3>
                <p>Portfolio: Elemental</p>
                <p>Command fire, water, earth, and air elementals</p>
              </div>
            </div>
          </div>
        );

      case 'signatureMinions':
        if (!selectedCircle) return null;
        const portfolioType = circleToPortfolio[selectedCircle];
        const availableSignature = portfolios[portfolioType].signatureMinions;
        const maxMinionsReached = selectedSignatureMinions.length >= 2;

        return (
          <div className="creation-step">
            <h2>Choose 2 Signature Minions</h2>
            <div className="selection-counter">
              <span className={selectedSignatureMinions.length >= 2 ? 'complete' : ''}>
                {selectedSignatureMinions.length} / 2 selected
              </span>
            </div>
            <div className="options-grid">
              {availableSignature.map((minion) => {
                const isSelected = selectedSignatureMinions.find(m => m.id === minion.id);
                const isDisabled = maxMinionsReached && !isSelected;

                return (
                  <div
                    key={minion.id}
                    className={`option-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'max-reached' : ''}`}
                    onClick={() => !isDisabled && toggleSignatureMinion(minion)}
                  >
                    <h3>{minion.name}</h3>
                    <p>Role: {minion.role}</p>
                    <p>Summons: {minion.minionsPerSummon} minions</p>
                    <p>Speed: {minion.speed} | Stamina: {Array.isArray(minion.stamina) ? minion.stamina.join('/') : minion.stamina}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'formation':
        return (
          <div className="creation-step">
            <h2>Choose Your Formation</h2>
            <p className="step-description">Formations determine how you command your minions</p>
            <div className="options-grid">
              {(Object.keys(formations) as Formation[]).map((formationKey) => {
                const formation = formations[formationKey];
                return (
                  <div
                    key={formation.id}
                    className={`option-card ${selectedFormation === formation.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFormation(formation.id)}
                  >
                    <h3>{formation.name}</h3>
                    <p>{formation.description}</p>
                    <ul>
                      {formation.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'nullTradition':
        const traditions = Object.values(NULL_TRADITIONS);
        return (
          <div className="creation-step null-tradition-step">
            <h2>Choose Your Null Tradition</h2>
            <p className="step-description">
              Your tradition defines your psionic combat style. This choice is permanent and
              determines your Inertial Shield bonus, Discipline Mastery benefits, and unique Level 5 feature.
            </p>
            <div className="options-grid null-options">
              {traditions.map((tradition) => (
                <div
                  key={tradition.id}
                  className={`option-card tradition-card ${selectedNullTradition === tradition.id ? 'selected' : ''}`}
                  onClick={() => setSelectedNullTradition(tradition.id)}
                >
                  <h3>{tradition.name}</h3>
                  <p className="tradition-focus">{tradition.focus}</p>
                  <div className="tradition-details">
                    <div className="detail-section">
                      <span className="detail-label">Inertial Shield Bonus:</span>
                      <span className="detail-value">{tradition.inertialShieldBonus}</span>
                    </div>
                    <div className="detail-section mastery-preview">
                      <span className="detail-label">Discipline Mastery:</span>
                      <ul className="mastery-list">
                        {tradition.masteryBenefits.slice(0, 2).map((b, idx) => (
                          <li key={idx}>At {b.threshold}: {b.benefit}</li>
                        ))}
                        <li className="more-hint">...and more at higher Discipline</li>
                      </ul>
                    </div>
                    <div className="detail-section level5-preview">
                      <span className="detail-label">Level 5 Feature:</span>
                      <span className="feature-name">{tradition.level5Feature.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedNullTradition && (
              <div className="selection-preview">
                <h4>{NULL_TRADITIONS[selectedNullTradition].level5Feature.name} (Level 5)</h4>
                <p>{NULL_TRADITIONS[selectedNullTradition].level5Feature.description}</p>
              </div>
            )}
          </div>
        );

      case 'psionicAugmentation':
        const augmentations = Object.values(PSIONIC_AUGMENTATIONS);
        return (
          <div className="creation-step augmentation-step">
            <h2>Choose Your Psionic Augmentation</h2>
            <p className="step-description">
              Your augmentation is a permanent psionic enhancement to your body. This choice
              cannot be changed and affects your core statistics throughout your career.
            </p>
            <div className="options-grid augmentation-options">
              {augmentations.map((augmentation) => (
                <div
                  key={augmentation.id}
                  className={`option-card augmentation-card ${selectedPsionicAugmentation === augmentation.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPsionicAugmentation(augmentation.id)}
                >
                  <h3>{augmentation.name}</h3>
                  <div className="augmentation-effects">
                    <span className="effects-label">Effects:</span>
                    <ul className="effects-list">
                      {augmentation.effects.map((effect, idx) => (
                        <li key={idx} className="effect-item">{effect}</li>
                      ))}
                    </ul>
                  </div>
                  {augmentation.id === 'density' && (
                    <p className="stat-preview">At Level 1: +6 Stamina, +1 Stability</p>
                  )}
                  {augmentation.id === 'force' && (
                    <p className="stat-preview">Adds to all psionic ability damage</p>
                  )}
                  {augmentation.id === 'speed' && (
                    <p className="stat-preview">Better mobility and escape options</p>
                  )}
                </div>
              ))}
            </div>
            <div className="augmentation-note">
              <strong>Note:</strong> This enhancement stacks with your kit bonuses and
              other class features. Choose based on your preferred combat role.
            </div>
          </div>
        );

      case 'kit':
        return (
          <div className="creation-step">
            <h2>Choose Your Kit</h2>
            <p className="step-description">Your kit determines your starting equipment and stats</p>
            <div className="options-grid">
              {kits.map((kit) => (
                <div
                  key={kit.id}
                  className={`option-card ${selectedKit?.id === kit.id ? 'selected' : ''}`}
                  onClick={() => setSelectedKit(kit)}
                >
                  <h3>{kit.name}</h3>
                  <p>Stamina Bonus: +{kit.stamina}</p>
                  <p>Speed: {kit.speed} | Stability: {kit.stability}</p>
                  <p>Armor: {kit.armor}</p>
                  <p>Weapons: {kit.weapons.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'characteristics':
        const availableValues = getAvailableValues();
        const characteristicsList: { key: keyof typeof characteristicAssignments; name: string; description: string }[] = [
          { key: 'might', name: 'Might', description: 'Strength, brawn, breaking things' },
          { key: 'agility', name: 'Agility', description: 'Coordination, speed, dodging' },
          { key: 'reason', name: 'Reason', description: 'Logic, education, deduction' },
          { key: 'intuition', name: 'Intuition', description: 'Instinct, observation, sensing motives' },
          { key: 'presence', name: 'Presence', description: 'Personality, willpower, social influence' },
        ];

        // Get class-specific info
        const currentClassDef = selectedClass ? classDefinitions[selectedClass] : null;
        const fixedChars = currentClassDef?.startingCharacteristics || {};
        const potencyChar = currentClassDef?.potencyCharacteristic;
        const className = currentClassDef?.name || 'Hero';

        // Get fixed characteristics display text
        const fixedCharsText = Object.entries(fixedChars)
          .map(([char, val]) => `${char.charAt(0).toUpperCase() + char.slice(1)} +${val}`)
          .join(', ');

        return (
          <div className="creation-step characteristics-step">
            <h2>Assign Characteristics</h2>
            <p className="step-description">
              Distribute the standard array values to your characteristics. Click a characteristic, then click a value to assign it.
              <br />
              <strong>{className}s</strong> have {potencyChar ? (
                <>
                  <strong>{potencyChar.charAt(0).toUpperCase() + potencyChar.slice(1)}</strong> as their potency characteristic
                </>
              ) : 'no fixed potency characteristic'}.
              {fixedCharsText && (
                <> Starting with: <strong>{fixedCharsText}</strong> (from class).</>
              )}
            </p>

            <div className="characteristics-assignment">
              {/* Available Values */}
              <div className="available-values">
                <h4>Available Values (Standard Array: +2, +2, +1, 0, -1)</h4>
                <div className="value-pool">
                  {availableValues.length > 0 ? (
                    availableValues.map((val, idx) => (
                      <button
                        key={`${val}-${idx}`}
                        className={`value-chip ${selectedCharacteristic ? 'clickable' : ''}`}
                        onClick={() => selectedCharacteristic && assignValue(selectedCharacteristic, val)}
                        disabled={!selectedCharacteristic}
                      >
                        {val >= 0 ? `+${val}` : val}
                      </button>
                    ))
                  ) : (
                    <span className="all-assigned">All values assigned!</span>
                  )}
                </div>
              </div>

              {/* Characteristics Grid */}
              <div className="characteristics-grid">
                {characteristicsList.map(({ key, name, description }) => {
                  const assignedValue = characteristicAssignments[key];
                  const isSelected = selectedCharacteristic === key;
                  const isAssigned = assignedValue !== null;
                  const isPotency = key === potencyChar;

                  return (
                    <div
                      key={key}
                      className={`characteristic-slot ${isSelected ? 'selected' : ''} ${isAssigned ? 'assigned' : ''} ${isPotency ? 'potency' : ''}`}
                      onClick={() => {
                        if (isAssigned) {
                          // If already assigned, clear it
                          clearAssignment(key);
                        } else {
                          // Select for assignment
                          setSelectedCharacteristic(isSelected ? null : key);
                        }
                      }}
                    >
                      <div className="char-header">
                        <span className="char-name">
                          {name}
                          {isPotency && <span className="potency-badge" title="Potency Characteristic">★</span>}
                        </span>
                        <span className="char-value">
                          {isAssigned
                            ? (assignedValue >= 0 ? `+${assignedValue}` : assignedValue)
                            : '—'
                          }
                        </span>
                      </div>
                      <p className="char-desc">{description}</p>
                      {isAssigned && <span className="clear-hint">Click to clear</span>}
                      {!isAssigned && isSelected && <span className="select-hint">Select a value above</span>}
                      {!isAssigned && !isSelected && <span className="click-hint">Click to select</span>}
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="characteristic-actions">
                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={applyRecommendedArray}
                >
                  Apply Recommended ({className})
                </button>
                <button
                  type="button"
                  className="quick-action-btn secondary"
                  onClick={resetAssignments}
                >
                  Reset All
                </button>
              </div>

              {/* Preview */}
              {allCharacteristicsAssigned() && (
                <div className="characteristic-preview">
                  <h4>Final Characteristics</h4>
                  <div className="preview-stats">
                    {characteristicsList.map(({ key, name }) => (
                      <div key={key} className="preview-stat">
                        <span className="stat-name">{name}</span>
                        <span className="stat-value">
                          {characteristicAssignments[key]! >= 0
                            ? `+${characteristicAssignments[key]}`
                            : characteristicAssignments[key]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isFirstStep = step === 'name';
  const isFinalStep = step === 'characteristics';
  const nextLabel = isFinalStep ? 'Create Character' : 'Next';

  return (
    <div className="character-creation" ref={containerRef}>
      <div className="creation-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentSteps.indexOf(step) + 1) / currentSteps.length) * 100}%`,
            }}
          />
        </div>
        <span className="progress-text">
          Step {currentSteps.indexOf(step) + 1} of {currentSteps.length}
        </span>
      </div>

      {/* Top Navigation */}
      <CreationNavigation
        position="top"
        onBack={handleBack}
        onNext={handleNext}
        nextLabel={nextLabel}
        nextDisabled={!canProceed()}
        showBack={!isFirstStep}
      />

      {renderStep()}

      {/* Bottom Navigation */}
      <CreationNavigation
        position="bottom"
        onBack={handleBack}
        onNext={handleNext}
        nextLabel={nextLabel}
        nextDisabled={!canProceed()}
        showBack={!isFirstStep}
      />
    </div>
  );
};

// Wrapper component that provides the SkillAvailabilityProvider
const CharacterCreation: React.FC<CharacterCreationProps> = (props) => {
  return (
    <SkillAvailabilityProvider>
      <CharacterCreationInner {...props} />
    </SkillAvailabilityProvider>
  );
};

export default CharacterCreation;
