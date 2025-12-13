import React, { useState, useEffect, useMemo } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { SummonerHero, SummonerCircle, Formation, Ancestry, Culture, Career, Kit, MinionTemplate } from '../../types';
import { HeroClass } from '../../types/hero';
import { ancestries, cultures, careers, kits, getSelectableLanguages, languages as allLanguages } from '../../data/reference-data';
import { portfolios } from '../../data/portfolios';
import { formations } from '../../data/formations';
import { circleToPortfolio } from '../../types/summoner';
import { summonerAbilitiesByLevel } from '../../data/abilities/summoner-abilities';
import { skills, getSkillsByGroup, SkillGroup, Skill, isSkillGroup, findSkillByName } from '../../data/skills';
import { classDefinitions, getClassRoleColor, getSubclassTypeName } from '../../data/classes/class-definitions';
import ClassSelector from './ClassSelector';
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

type Step = 'name' | 'class' | 'subclass' | 'ancestry' | 'culture' | 'cultureSkills' | 'career' | 'careerSkills' | 'languages' | 'circle' | 'signatureMinions' | 'formation' | 'kit' | 'characteristics';

// Base steps that all classes share
const BASE_STEPS: Step[] = ['name', 'class', 'ancestry', 'culture', 'cultureSkills', 'career', 'careerSkills', 'languages', 'kit', 'characteristics'];

// Summoner-specific steps (inserted after languages)
const SUMMONER_STEPS: Step[] = ['circle', 'signatureMinions', 'formation'];

// Get steps for a specific class
function getStepsForClass(heroClass: HeroClass | null): Step[] {
  if (!heroClass) return ['name', 'class'];

  if (heroClass === 'summoner') {
    // Insert summoner steps after languages, before kit
    const steps = [...BASE_STEPS];
    const langIndex = steps.indexOf('languages');
    steps.splice(langIndex + 1, 0, ...SUMMONER_STEPS);
    return steps;
  }

  // For other classes, use base steps (subclass can be added later)
  return BASE_STEPS;
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

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete }) => {
  const { createNewHero } = useSummonerContext();

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<HeroClass | null>(null);
  const [selectedAncestry, setSelectedAncestry] = useState<Ancestry | null>(null);
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<SummonerCircle | null>(null);
  const [selectedSignatureMinions, setSelectedSignatureMinions] = useState<MinionTemplate[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);

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

  // Apply recommended Summoner array (Presence 2, Reason 2, Intuition 1, Might 0, Agility -1)
  const applyRecommendedArray = () => {
    setCharacteristicAssignments({
      might: 0,
      agility: -1,
      reason: 2,
      intuition: 1,
      presence: 2,
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
        // Subclass selection - for now, optional
        return true;
      case 'ancestry':
        return selectedAncestry !== null;
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
      setStep(currentSteps[currentIndex + 1]);
    } else {
      createCharacter();
    }
  };

  const handleBack = () => {
    const currentIndex = currentSteps.indexOf(step);
    if (currentIndex > 0) {
      setStep(currentSteps[currentIndex - 1]);
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
    if (!selectedAncestry || !selectedCulture || !selectedCareer || !selectedCircle || !selectedFormation || !selectedKit) {
      return;
    }

    const portfolioType = circleToPortfolio[selectedCircle];
    const portfolio = portfolios[portfolioType];

    const level = 1;
    const tempHero: Partial<SummonerHero> = {
      level,
      kit: selectedKit,
      formation: selectedFormation,
    };

    const maxStamina = calculateMaxStamina(tempHero);
    const recoveryValue = calculateRecoveryValue(tempHero);
    const maxRecoveries = calculateMaxRecoveries(selectedCircle);
    const maxEssencePerTurn = calculateEssencePerTurn(level);

    const quickCommand = formations[selectedFormation].quickCommands[0];

    const newHero: SummonerHero = {
      id: generateId(),
      name,
      level,
      ancestry: selectedAncestry,
      culture: selectedCulture,
      career: selectedCareer,
      circle: selectedCircle,
      formation: selectedFormation,
      quickCommand,
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
      essence: {
        current: 0,
        maxPerTurn: maxEssencePerTurn,
      },
      surges: 0,
      heroTokens: 0,
      victories: 0,
      xp: 0,
      wealth: 2, // Default starting wealth tier (Poor)
      gold: 0, // Starting gold
      renown: 0, // Starting renown
      portfolio: {
        ...portfolio,
        signatureMinions: selectedSignatureMinions,
      },
      activeSquads: [],
      fixture: null,
      abilities: summonerAbilitiesByLevel[1] || [],
      features: [],
      skills: getAllSelectedSkills(),
      languages: ['caelian', ...selectedLanguages], // All heroes know Caelian + selected
      kit: selectedKit,
      items: [],
      notes: '',
      portraitUrl: null,
      minionPortraits: {},
      fixturePortrait: null,
      inactiveMinions: [],
      activeConditions: [],
      progressionChoices: {},
      activeProjects: [],
      inventory: [],
      equippedItems: [],
    };

    createNewHero(newHero);
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
            {availableSkills.map(skill => (
              <button
                key={skill.id}
                className={`skill-option ${selection.selectedSkillId === skill.id ? 'selected' : ''}`}
                onClick={() => onSelect(skill.id)}
              >
                <span className="skill-name">{skill.name}</span>
                <span className="skill-desc">{skill.description}</span>
              </button>
            ))}
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
            onSelect={setSelectedClass}
          />
        );

      case 'ancestry':
        return (
          <div className="creation-step">
            <h2>Choose Your Ancestry</h2>
            <div className="options-grid">
              {ancestries.map((ancestry) => (
                <div
                  key={ancestry.id}
                  className={`option-card ${selectedAncestry?.id === ancestry.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAncestry(ancestry)}
                >
                  <h3>{ancestry.name}</h3>
                  <p className="description">{ancestry.description}</p>
                  <p><strong>{ancestry.signatureFeature.name}:</strong> {ancestry.signatureFeature.description}</p>
                  <p className="meta">Size: {ancestry.size} | Speed: {ancestry.speed} | Points: {ancestry.ancestryPoints}</p>
                </div>
              ))}
            </div>
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

        return (
          <div className="creation-step">
            <h2>Choose 2 Signature Minions</h2>
            <p className="step-description">Selected: {selectedSignatureMinions.length} / 2</p>
            <div className="options-grid">
              {availableSignature.map((minion) => (
                <div
                  key={minion.id}
                  className={`option-card ${selectedSignatureMinions.find(m => m.id === minion.id) ? 'selected' : ''}`}
                  onClick={() => toggleSignatureMinion(minion)}
                >
                  <h3>{minion.name}</h3>
                  <p>Role: {minion.role}</p>
                  <p>Summons: {minion.minionsPerSummon} minions</p>
                  <p>Speed: {minion.speed} | Stamina: {Array.isArray(minion.stamina) ? minion.stamina.join('/') : minion.stamina}</p>
                </div>
              ))}
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

        return (
          <div className="creation-step characteristics-step">
            <h2>Assign Characteristics</h2>
            <p className="step-description">
              Distribute the standard array values to your characteristics. Click a characteristic, then click a value to assign it.
              <br />
              <strong>Summoners typically prioritize Presence and Reason</strong> for commanding minions.
            </p>

            <div className="characteristics-assignment">
              {/* Available Values */}
              <div className="available-values">
                <h4>Available Values</h4>
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

                  return (
                    <div
                      key={key}
                      className={`characteristic-slot ${isSelected ? 'selected' : ''} ${isAssigned ? 'assigned' : ''}`}
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
                        <span className="char-name">{name}</span>
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
                  Apply Recommended (Summoner)
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

  return (
    <div className="character-creation">
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

      {renderStep()}

      <div className="creation-actions">
        {step !== 'name' && <button onClick={handleBack}>Back</button>}
        <button onClick={handleNext} disabled={!canProceed()}>
          {step === 'characteristics' ? 'Create Character' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;
