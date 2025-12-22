import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSummonerContext } from '../context/HeroContext';
import {
  SummonerCircle,
  Formation,
  Ancestry,
  Culture,
  Career,
  Kit,
  MinionTemplate,
  HeroAncestry,
} from '../types';
import {
  HeroClass,
  Hero,
  SummonerHeroV2,
  TalentHero,
  CensorHero,
  ConduitHero,
  ElementalistHero,
  FuryHero,
  NullHero,
  ShadowHero,
  TacticianHero,
  TroubadourHero,
  NullTradition,
  PsionicAugmentation,
  FuryAspect,
  StormwightKit,
  ConduitDomain,
  TroubadourClass,
} from '../types/hero';
import { getAncestryById, isAncestryComplete } from '../data/ancestries';
import { portfolios } from '../data/portfolios';
import { formations } from '../data/formations';
import { circleToPortfolio } from '../types/summoner';
import { summonerAbilitiesByLevel } from '../data/abilities/summoner-abilities';
import { getAugmentationBonuses } from '../data/null/augmentations';
import { classDefinitions } from '../data/classes/class-definitions';
import { getPrimordialStormForKit } from '../data/fury/stormwight-kits';
import { SkillGroup, findSkillByName, isSkillGroup } from '../data/skills';
import {
  generateId,
  calculateWindedThreshold,
  calculateSpeed,
  calculateStability,
  calculateEssencePerTurn,
} from '../utils/calculations';

// Step types
export type CreationStep =
  | 'name'
  | 'class'
  | 'subclass'
  | 'furyAspect'
  | 'stormwightKit'
  | 'ancestry'
  | 'ancestryTraits'
  | 'culture'
  | 'cultureSkills'
  | 'career'
  | 'careerSkills'
  | 'languages'
  | 'circle'
  | 'signatureMinions'
  | 'formation'
  | 'nullTradition'
  | 'psionicAugmentation'
  | 'kit'
  | 'characteristics';

// Skill selection interface
export interface SkillSelection {
  source: string;
  skillGroup: SkillGroup | null;
  selectedSkillId: string | null;
  isFixed: boolean;
}

// Characteristic assignment type
export type CharacteristicAssignments = {
  might: number | null;
  agility: number | null;
  reason: number | null;
  intuition: number | null;
  presence: number | null;
};

// Standard array values
const STANDARD_ARRAY = [2, 2, 1, 0, -1];

// Base steps shared by all classes
const BASE_STEPS: CreationStep[] = [
  'name',
  'class',
  'ancestry',
  'ancestryTraits',
  'culture',
  'cultureSkills',
  'career',
  'careerSkills',
  'languages',
  'kit',
  'characteristics',
];

// Class-specific step configurations
const SUMMONER_STEPS: CreationStep[] = ['circle', 'signatureMinions', 'formation'];
const NULL_STEPS: CreationStep[] = ['nullTradition', 'psionicAugmentation'];
const FURY_STEPS: CreationStep[] = ['furyAspect'];
const SUBCLASS_STEPS: CreationStep[] = ['subclass'];

/**
 * Get the steps for a specific class
 */
export function getStepsForClass(heroClass: HeroClass | null): CreationStep[] {
  if (!heroClass) return ['name', 'class'];

  const steps = [...BASE_STEPS];

  if (heroClass === 'summoner') {
    const langIndex = steps.indexOf('languages');
    steps.splice(langIndex + 1, 0, ...SUMMONER_STEPS);
    return steps;
  }

  if (heroClass === 'null') {
    const langIndex = steps.indexOf('languages');
    steps.splice(langIndex + 1, 0, ...NULL_STEPS);
    return steps;
  }

  if (heroClass === 'fury') {
    const classIndex = steps.indexOf('class');
    steps.splice(classIndex + 1, 0, ...FURY_STEPS);
    return steps;
  }

  // All other classes: add subclass step after class selection
  const classIndex = steps.indexOf('class');
  steps.splice(classIndex + 1, 0, ...SUBCLASS_STEPS);
  return steps;
}

interface UseCharacterCreationOptions {
  onComplete?: () => void;
}

/**
 * Custom hook for managing character creation state and logic
 */
export function useCharacterCreation(options: UseCharacterCreationOptions = {}) {
  const { createNewHero } = useSummonerContext();
  const { onComplete } = options;

  // Current step
  const [step, setStep] = useState<CreationStep>('name');

  // Basic info
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<HeroClass | null>(null);

  // Ancestry & Culture
  const [selectedAncestry, setSelectedAncestry] = useState<Ancestry | null>(null);
  const [selectedAncestryId, setSelectedAncestryId] = useState<string | null>(null);
  const [selectedAncestryTraitIds, setSelectedAncestryTraitIds] = useState<string[]>([]);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  // Class-specific state
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

  // Generic subclass state
  const [selectedSubclass, setSelectedSubclass] = useState<string | null>(null);
  const [selectedSubclasses, setSelectedSubclasses] = useState<string[]>([]);

  // Characteristics
  const [characteristicAssignments, setCharacteristicAssignments] = useState<CharacteristicAssignments>({
    might: null,
    agility: null,
    reason: null,
    intuition: null,
    presence: null,
  });
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<keyof CharacteristicAssignments | null>(null);

  // Skills
  const [cultureSkillSelections, setCultureSkillSelections] = useState<SkillSelection[]>([]);
  const [careerSkillSelections, setCareerSkillSelections] = useState<SkillSelection[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Computed steps
  const currentSteps = useMemo(() => getStepsForClass(selectedClass), [selectedClass]);

  // Computed characteristics
  const characteristics = {
    might: characteristicAssignments.might ?? 0,
    agility: characteristicAssignments.agility ?? 0,
    reason: characteristicAssignments.reason ?? 0,
    intuition: characteristicAssignments.intuition ?? 0,
    presence: characteristicAssignments.presence ?? 0,
  };

  // Reset class-specific state when class changes
  useEffect(() => {
    if (selectedClass !== 'null') {
      setSelectedNullTradition(null);
      setSelectedPsionicAugmentation(null);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass !== 'fury') {
      setSelectedFuryAspect(null);
      setSelectedStormwightKit(null);
    }
  }, [selectedClass]);

  useEffect(() => {
    setSelectedSubclass(null);
    setSelectedSubclasses([]);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedFuryAspect !== 'stormwight') {
      setSelectedStormwightKit(null);
    }
  }, [selectedFuryAspect]);

  // Reset ancestry traits when ancestry changes
  useEffect(() => {
    setSelectedAncestryTraitIds([]);
    if (selectedAncestryId) {
      const ancestryData = getAncestryById(selectedAncestryId);
      if (ancestryData) {
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
          purchasedTraits: ancestryData.purchasedTraits.map((t) => ({
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

  // Reset languages when career changes
  useEffect(() => {
    setSelectedLanguages([]);
  }, [selectedCareer]);

  // Initialize culture skill selections
  useEffect(() => {
    if (selectedCulture) {
      const selections: SkillSelection[] = [];

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

      selectedCulture.upbringing.skills.forEach((skillStr, idx) => {
        if (isSkillGroup(skillStr)) {
          selections.push({
            source: `upbringing-${idx}`,
            skillGroup: skillStr.toLowerCase() as SkillGroup,
            selectedSkillId: null,
            isFixed: false,
          });
        } else {
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

  // Initialize career skill selections
  useEffect(() => {
    if (selectedCareer) {
      const selections: SkillSelection[] = [];

      selectedCareer.skills.forEach((skillStr, idx) => {
        if (skillStr.includes('/') && !skillStr.includes('Music')) {
          selections.push({
            source: `career-choice-${idx}`,
            skillGroup: null,
            selectedSkillId: null,
            isFixed: false,
          });
        } else if (isSkillGroup(skillStr)) {
          selections.push({
            source: `career-${idx}`,
            skillGroup: skillStr.toLowerCase() as SkillGroup,
            selectedSkillId: null,
            isFixed: false,
          });
        } else {
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

  // Characteristic helpers
  const getAvailableValues = useCallback((): number[] => {
    const assigned = Object.values(characteristicAssignments).filter((v) => v !== null) as number[];
    const available = [...STANDARD_ARRAY];
    for (const val of assigned) {
      const idx = available.indexOf(val);
      if (idx !== -1) {
        available.splice(idx, 1);
      }
    }
    return available.sort((a, b) => b - a);
  }, [characteristicAssignments]);

  const allCharacteristicsAssigned = useCallback((): boolean => {
    return Object.values(characteristicAssignments).every((v) => v !== null);
  }, [characteristicAssignments]);

  const assignValue = useCallback((characteristic: keyof CharacteristicAssignments, value: number) => {
    setCharacteristicAssignments((prev) => ({
      ...prev,
      [characteristic]: value,
    }));
    setSelectedCharacteristic(null);
  }, []);

  const clearAssignment = useCallback((characteristic: keyof CharacteristicAssignments) => {
    setCharacteristicAssignments((prev) => ({
      ...prev,
      [characteristic]: null,
    }));
  }, []);

  const resetAssignments = useCallback(() => {
    setCharacteristicAssignments({
      might: null,
      agility: null,
      reason: null,
      intuition: null,
      presence: null,
    });
    setSelectedCharacteristic(null);
  }, []);

  const getRecommendedArray = useCallback((): Record<string, number> => {
    if (!selectedClass) {
      return { might: 2, agility: 2, reason: 1, intuition: 0, presence: -1 };
    }

    const classDef = classDefinitions[selectedClass];
    const fixed = classDef.startingCharacteristics;
    const potency = classDef.potencyCharacteristic;

    const recommended: Record<string, number> = { ...fixed };
    const remaining = [2, 2, 1, 0, -1];
    const chars = ['might', 'agility', 'reason', 'intuition', 'presence'];

    Object.values(fixed).forEach((val) => {
      const idx = remaining.indexOf(val as number);
      if (idx !== -1) remaining.splice(idx, 1);
    });

    chars.forEach((char) => {
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
  }, [selectedClass]);

  const applyRecommendedArray = useCallback(() => {
    const recommended = getRecommendedArray();
    setCharacteristicAssignments({
      might: recommended.might ?? 0,
      agility: recommended.agility ?? 0,
      reason: recommended.reason ?? 0,
      intuition: recommended.intuition ?? 0,
      presence: recommended.presence ?? 0,
    });
    setSelectedCharacteristic(null);
  }, [getRecommendedArray]);

  // Language helpers
  const getRequiredLanguageCount = useCallback((): number => {
    if (!selectedCareer) return 0;
    const langEntry = selectedCareer.languages[0];
    if (!langEntry) return 0;
    const match = langEntry.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }, [selectedCareer]);

  const toggleLanguage = useCallback(
    (languageId: string) => {
      const required = getRequiredLanguageCount();
      if (selectedLanguages.includes(languageId)) {
        setSelectedLanguages(selectedLanguages.filter((id) => id !== languageId));
      } else if (selectedLanguages.length < required) {
        setSelectedLanguages([...selectedLanguages, languageId]);
      }
    },
    [selectedLanguages, getRequiredLanguageCount]
  );

  // Skill selection helpers
  const updateCultureSkillSelection = useCallback((source: string, skillId: string) => {
    setCultureSkillSelections((prev) =>
      prev.map((s) => (s.source === source ? { ...s, selectedSkillId: skillId } : s))
    );
  }, []);

  const updateCareerSkillSelection = useCallback((source: string, skillId: string, skillGroup?: SkillGroup) => {
    setCareerSkillSelections((prev) =>
      prev.map((s) => {
        if (s.source === source) {
          return { ...s, selectedSkillId: skillId, skillGroup: skillGroup || s.skillGroup };
        }
        return s;
      })
    );
  }, []);

  const getAllSelectedSkills = useCallback((): string[] => {
    const skillIds: string[] = [];
    cultureSkillSelections.forEach((s) => {
      if (s.selectedSkillId) skillIds.push(s.selectedSkillId);
    });
    careerSkillSelections.forEach((s) => {
      if (s.selectedSkillId) skillIds.push(s.selectedSkillId);
    });
    return [...new Set(skillIds)];
  }, [cultureSkillSelections, careerSkillSelections]);

  // Minion selection
  const toggleSignatureMinion = useCallback(
    (minion: MinionTemplate) => {
      if (selectedSignatureMinions.find((m) => m.id === minion.id)) {
        setSelectedSignatureMinions(selectedSignatureMinions.filter((m) => m.id !== minion.id));
      } else if (selectedSignatureMinions.length < 2) {
        setSelectedSignatureMinions([...selectedSignatureMinions, minion]);
      }
    },
    [selectedSignatureMinions]
  );

  // Can proceed validation
  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 'name':
        return name.trim().length > 0;
      case 'class':
        return selectedClass !== null;
      case 'subclass':
        if (!selectedClass) return false;
        if (selectedClass === 'conduit') {
          return selectedSubclasses.length === 2;
        }
        return selectedSubclass !== null;
      case 'furyAspect':
        if (!selectedFuryAspect) return false;
        if (selectedFuryAspect === 'stormwight' && !selectedStormwightKit) return false;
        return true;
      case 'ancestry':
        return selectedAncestryId !== null;
      case 'ancestryTraits':
        return selectedAncestryId !== null;
      case 'culture':
        return selectedCulture !== null;
      case 'cultureSkills':
        return cultureSkillSelections.every((s) => s.isFixed || s.selectedSkillId !== null);
      case 'career':
        return selectedCareer !== null;
      case 'careerSkills':
        return careerSkillSelections.every((s) => s.isFixed || s.selectedSkillId !== null);
      case 'languages':
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
  }, [
    step,
    name,
    selectedClass,
    selectedSubclass,
    selectedSubclasses,
    selectedFuryAspect,
    selectedStormwightKit,
    selectedAncestryId,
    selectedCulture,
    cultureSkillSelections,
    selectedCareer,
    careerSkillSelections,
    selectedLanguages,
    getRequiredLanguageCount,
    selectedCircle,
    selectedSignatureMinions,
    selectedFormation,
    selectedNullTradition,
    selectedPsionicAugmentation,
    selectedKit,
    allCharacteristicsAssigned,
  ]);

  // Navigation
  const goToNextStep = useCallback(() => {
    const currentIndex = currentSteps.indexOf(step);
    if (currentIndex < currentSteps.length - 1) {
      let nextStep = currentSteps[currentIndex + 1];

      // Skip ancestryTraits if ancestry has no trait data
      if (nextStep === 'ancestryTraits' && selectedAncestryId) {
        if (!isAncestryComplete(selectedAncestryId)) {
          const traitsIndex = currentSteps.indexOf('ancestryTraits');
          if (traitsIndex >= 0 && traitsIndex < currentSteps.length - 1) {
            nextStep = currentSteps[traitsIndex + 1];
          }
        }
      }

      setStep(nextStep);
    }
  }, [currentSteps, step, selectedAncestryId]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = currentSteps.indexOf(step);
    if (currentIndex > 0) {
      let prevStep = currentSteps[currentIndex - 1];

      // Skip ancestryTraits if ancestry has no trait data
      if (prevStep === 'ancestryTraits' && selectedAncestryId) {
        if (!isAncestryComplete(selectedAncestryId)) {
          const traitsIndex = currentSteps.indexOf('ancestryTraits');
          if (traitsIndex > 0) {
            prevStep = currentSteps[traitsIndex - 1];
          }
        }
      }

      setStep(prevStep);
    }
  }, [currentSteps, step, selectedAncestryId]);

  // Create character
  const createCharacter = useCallback(() => {
    if (!selectedClass || !selectedAncestry || !selectedCulture || !selectedCareer || !selectedKit) {
      return;
    }

    if (selectedClass === 'summoner' && (!selectedCircle || !selectedFormation)) {
      return;
    }

    const level = 1;
    const classDef = classDefinitions[selectedClass];
    const baseStamina = classDef.startingStamina;
    const echelon = 1;
    const kitStaminaBonus = (selectedKit.staminaPerEchelon || 0) * echelon;
    const maxStamina = baseStamina + kitStaminaBonus;
    const maxRecoveries = classDef.startingRecoveries;
    const recoveryValue = Math.floor(maxStamina / 3);

    const ancestrySelection: HeroAncestry | undefined = selectedAncestryId
      ? { ancestryId: selectedAncestryId, selectedTraitIds: selectedAncestryTraitIds }
      : undefined;

    const baseHeroData = {
      id: generateId(),
      name,
      level,
      ancestry: selectedAncestry,
      ancestrySelection,
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

    let newHero: Hero;

    if (selectedClass === 'summoner') {
      const portfolioType = circleToPortfolio[selectedCircle!];
      const portfolio = portfolios[portfolioType];
      const maxEssencePerTurn = calculateEssencePerTurn(level);
      const quickCommand = formations[selectedFormation!].quickCommands[0];

      newHero = {
        ...baseHeroData,
        heroClass: 'summoner',
        heroicResource: { type: 'essence', current: 0, maxPerTurn: maxEssencePerTurn },
        subclass: selectedCircle!,
        formation: selectedFormation!,
        quickCommand,
        portfolio: { ...portfolio, signatureMinions: selectedSignatureMinions },
        activeSquads: [],
        fixture: null,
        abilities: summonerAbilitiesByLevel[1] || [],
        minionPortraits: {},
        fixturePortrait: null,
        inactiveMinions: [],
        activeChampion: null,
        championState: {
          canSummon: true,
          summonedThisEncounter: false,
          championActionUsed: false,
          requiresVictoryToResummon: false,
        },
        outOfCombatState: {
          activeMinions: [],
          usedAbilities: {},
          shouldDismissOnCombatStart: true,
        },
      } as SummonerHeroV2;
    } else {
      const reasonScore = baseHeroData.characteristics?.reason ?? 2;

      switch (selectedClass) {
        case 'talent':
          newHero = {
            ...baseHeroData,
            heroClass: 'talent',
            heroicResource: { type: 'clarity', current: 0, minimum: -(1 + reasonScore) },
            isStrained: false,
            subclass: (selectedSubclass as TalentHero['subclass']) || undefined,
          } as TalentHero;
          break;

        case 'censor':
          newHero = {
            ...baseHeroData,
            heroClass: 'censor',
            heroicResource: { type: 'wrath', current: 0 },
            judgment: { targetId: null, targetName: null },
            subclass: (selectedSubclass as CensorHero['subclass']) || undefined,
          } as CensorHero;
          break;

        case 'conduit':
          const conduitDomains = selectedSubclasses as ConduitDomain[];
          newHero = {
            ...baseHeroData,
            heroClass: 'conduit',
            heroicResource: { type: 'piety', current: 0 },
            subclass: conduitDomains[0] || undefined,
            domains: conduitDomains,
            prayState: { hasPrayedThisTurn: false, lastPrayResult: null },
          } as ConduitHero;
          break;

        case 'elementalist':
          newHero = {
            ...baseHeroData,
            heroClass: 'elementalist',
            heroicResource: { type: 'essence', current: 0, persistent: 0 },
            subclass: (selectedSubclass as ElementalistHero['subclass']) || undefined,
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
              stormwightKit:
                selectedFuryAspect === 'stormwight' ? selectedStormwightKit || undefined : undefined,
              primordialStorm:
                selectedFuryAspect === 'stormwight' && selectedStormwightKit
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
            stamina: {
              current: nullMaxStamina,
              max: nullMaxStamina,
              winded: calculateWindedThreshold(nullMaxStamina),
            },
            recoveries: { ...baseHeroData.recoveries, value: nullRecoveryValue },
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
            subclass: (selectedSubclass as ShadowHero['subclass']) || undefined,
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
            subclass: (selectedSubclass as TacticianHero['subclass']) || undefined,
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
            subclass: (selectedSubclass as TroubadourClass) || undefined,
          } as TroubadourHero;
          break;

        default:
          throw new Error(`Unknown class: ${selectedClass}`);
      }
    }

    createNewHero(newHero);
    onComplete?.();
  }, [
    selectedClass,
    selectedAncestry,
    selectedCulture,
    selectedCareer,
    selectedKit,
    selectedCircle,
    selectedFormation,
    selectedAncestryId,
    selectedAncestryTraitIds,
    name,
    characteristics,
    getAllSelectedSkills,
    selectedLanguages,
    selectedSignatureMinions,
    selectedSubclass,
    selectedSubclasses,
    selectedFuryAspect,
    selectedStormwightKit,
    selectedNullTradition,
    selectedPsionicAugmentation,
    createNewHero,
    onComplete,
  ]);

  // Progress info
  const currentStepIndex = currentSteps.indexOf(step);
  const totalSteps = currentSteps.length;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
  const isFirstStep = step === 'name';
  const isFinalStep = step === 'characteristics';

  return {
    // Current state
    step,
    currentSteps,
    currentStepIndex,
    totalSteps,
    progressPercent,
    isFirstStep,
    isFinalStep,

    // Basic info
    name,
    setName,
    selectedClass,
    setSelectedClass,

    // Ancestry & Culture
    selectedAncestry,
    selectedAncestryId,
    setSelectedAncestryId,
    selectedAncestryTraitIds,
    setSelectedAncestryTraitIds,
    selectedCulture,
    setSelectedCulture,
    selectedCareer,
    setSelectedCareer,

    // Class-specific
    selectedCircle,
    setSelectedCircle,
    selectedSignatureMinions,
    toggleSignatureMinion,
    selectedFormation,
    setSelectedFormation,
    selectedKit,
    setSelectedKit,

    // Null-specific
    selectedNullTradition,
    setSelectedNullTradition,
    selectedPsionicAugmentation,
    setSelectedPsionicAugmentation,

    // Fury-specific
    selectedFuryAspect,
    setSelectedFuryAspect,
    selectedStormwightKit,
    setSelectedStormwightKit,

    // Generic subclass
    selectedSubclass,
    setSelectedSubclass,
    selectedSubclasses,
    setSelectedSubclasses,

    // Characteristics
    characteristicAssignments,
    selectedCharacteristic,
    setSelectedCharacteristic,
    characteristics,
    getAvailableValues,
    allCharacteristicsAssigned,
    assignValue,
    clearAssignment,
    resetAssignments,
    getRecommendedArray,
    applyRecommendedArray,

    // Skills
    cultureSkillSelections,
    careerSkillSelections,
    updateCultureSkillSelection,
    updateCareerSkillSelection,

    // Languages
    selectedLanguages,
    toggleLanguage,
    getRequiredLanguageCount,

    // Navigation
    canProceed,
    goToNextStep,
    goToPreviousStep,
    createCharacter,
  };
}

export default useCharacterCreation;
