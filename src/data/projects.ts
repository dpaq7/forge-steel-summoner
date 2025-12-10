// Project Templates and Data

import { ProjectTemplate, LoreTier, LORE_GOALS } from '../types/projects';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // Research Projects
  {
    id: 'discover-lore-common',
    name: 'Discover Common Lore',
    type: 'research',
    description: 'Research commonly available information about a subject.',
    fixedGoal: LORE_GOALS.common,
    applicableSkills: ['history', 'monsters', 'nature', 'culture', 'religion', 'rumors', 'psionics', 'magic', 'timescape'],
    prerequisites: 'Access to a library, scholar, or other knowledge source',
    outcome: 'Uncover common knowledge about the subject',
  },
  {
    id: 'discover-lore-obscure',
    name: 'Discover Obscure Lore',
    type: 'research',
    description: 'Research hidden or specialized information known only to experts.',
    fixedGoal: LORE_GOALS.obscure,
    applicableSkills: ['history', 'monsters', 'nature', 'culture', 'religion', 'rumors', 'psionics', 'magic', 'timescape'],
    prerequisites: 'Access to specialized sources or expert tutors',
    outcome: 'Uncover obscure knowledge about the subject',
  },
  {
    id: 'discover-lore-lost',
    name: 'Discover Lost Lore',
    type: 'research',
    description: 'Research ancient or forgotten information thought lost to time.',
    fixedGoal: LORE_GOALS.lost,
    applicableSkills: ['history', 'monsters', 'nature', 'culture', 'religion', 'rumors', 'psionics', 'magic', 'timescape'],
    prerequisites: 'Access to rare texts, ancient ruins, or powerful entities',
    outcome: 'Uncover lost knowledge about the subject',
  },
  {
    id: 'discover-lore-forbidden',
    name: 'Discover Forbidden Lore',
    type: 'research',
    description: 'Research dangerous or prohibited information actively suppressed.',
    fixedGoal: LORE_GOALS.forbidden,
    applicableSkills: ['history', 'monsters', 'nature', 'culture', 'religion', 'rumors', 'psionics', 'magic', 'timescape'],
    prerequisites: 'Access to forbidden archives, dark entities, or sealed vaults',
    outcome: 'Uncover forbidden knowledge about the subject',
  },
  {
    id: 'find-cure',
    name: 'Find a Cure',
    type: 'research',
    description: 'Research and develop an antidote for a specific disease, curse, or affliction.',
    goalRange: { min: 50, max: 500 }, // 50 x creature level
    applicableSkills: ['alchemy', 'medicine', 'nature', 'magic'],
    prerequisites: 'Sample of the affliction or access to afflicted creature',
    outcome: 'Create an antidote that cures the specific affliction',
  },
  {
    id: 'learn-language',
    name: 'Learn New Language',
    type: 'research',
    description: 'Study and become fluent in a new language.',
    fixedGoal: 120,
    applicableSkills: ['culture', 'history'],
    prerequisites: 'Access to a native speaker or comprehensive texts',
    outcome: 'Gain fluency in the chosen language',
  },
  {
    id: 'hone-career-skills',
    name: 'Hone Career Skills',
    type: 'research',
    description: 'Intensive training to master your career abilities.',
    fixedGoal: 240,
    applicableSkills: [], // Varies by career
    prerequisites: 'Access to training facilities or expert mentor',
    outcome: 'Gain Edge on tests using career skills',
  },
  {
    id: 'hone-career-skills-advanced',
    name: 'Hone Career Skills (Advanced)',
    type: 'research',
    description: 'Master-level training in career abilities.',
    fixedGoal: 360,
    applicableSkills: [], // Varies by career
    prerequisites: 'Must have completed basic career skill training',
    outcome: 'Gain Double Edge on tests using career skills',
  },

  // Crafting Projects
  {
    id: 'craft-treasure',
    name: 'Craft Treasure',
    type: 'crafting',
    description: 'Create a supernatural weapon, armor, implement, or consumable.',
    goalRange: { min: 50, max: 500 }, // Varies by item tier
    applicableSkills: ['alchemy', 'architecture', 'blacksmithing', 'fletching', 'forgery', 'jewelry', 'mechanics', 'tailoring'],
    prerequisites: 'Appropriate raw materials and crafting tools',
    outcome: 'Create the specified supernatural item',
  },
  {
    id: 'imbue-treasure-1',
    name: 'Imbue Treasure (1st Level)',
    type: 'crafting',
    description: 'Apply a 1st-level enhancement to an existing leveled treasure.',
    fixedGoal: 150,
    applicableSkills: ['alchemy', 'blacksmithing', 'magic', 'jewelry'],
    prerequisites: 'A leveled treasure (weapon, armor, or implement)',
    outcome: 'Add a 1st-level enhancement to the item',
  },
  {
    id: 'imbue-treasure-5',
    name: 'Imbue Treasure (5th Level)',
    type: 'crafting',
    description: 'Apply a 5th-level enhancement to an existing leveled treasure.',
    fixedGoal: 300,
    applicableSkills: ['alchemy', 'blacksmithing', 'magic', 'jewelry'],
    prerequisites: 'A leveled treasure with 1st-level enhancement',
    outcome: 'Add a 5th-level enhancement to the item',
  },
  {
    id: 'imbue-treasure-9',
    name: 'Imbue Treasure (9th Level)',
    type: 'crafting',
    description: 'Apply a 9th-level enhancement to an existing leveled treasure.',
    fixedGoal: 450,
    applicableSkills: ['alchemy', 'blacksmithing', 'magic', 'jewelry'],
    prerequisites: 'A leveled treasure with 5th-level enhancement',
    outcome: 'Add a 9th-level enhancement to the item',
  },
  {
    id: 'perfect-recipe',
    name: 'Perfect New Recipe',
    type: 'crafting',
    description: 'Create a signature dish that grants temporary benefits.',
    fixedGoal: 100,
    applicableSkills: ['alchemy'], // Cooking uses similar skills
    prerequisites: 'Access to quality ingredients and kitchen',
    outcome: 'Create food that grants temporary benefits (e.g., Hearty for extra Recoveries)',
  },

  // Other Projects
  {
    id: 'community-service',
    name: 'Community Service',
    type: 'other',
    description: 'Spend time helping the local community through various means.',
    fixedGoal: 75,
    applicableSkills: ['architecture', 'blacksmithing', 'medicine', 'mechanics'],
    prerequisites: 'Access to a community in need',
    outcome: 'Earn Renown or receive consumable treasures from grateful locals',
  },
  {
    id: 'spend-time-loved-ones',
    name: 'Spend Time with Loved Ones',
    type: 'other',
    description: 'Reconnect with friends and family to restore your spirit.',
    fixedGoal: 60,
    applicableSkills: [], // No skills apply - purely personal time
    prerequisites: 'Access to loved ones or companions',
    outcome: 'Temporarily increase maximum Stamina',
  },
];

// Project roll modifiers
export const PROJECT_MODIFIERS = {
  APPLICABLE_SKILL: 2,
  EDGE: 2,
  DOUBLE_EDGE: 4,
  BANE: -2,
  DOUBLE_BANE: -4,
  RELATED_LANGUAGE_BARRIER: -2, // Treated as bane
  UNKNOWN_LANGUAGE_BARRIER: -4, // Treated as double bane
};

// Breakthrough threshold (natural 19 or 20)
export const BREAKTHROUGH_THRESHOLD = 19;

// Automatic breakthrough bonus
export const AUTOMATIC_BREAKTHROUGH_POINTS = 20;

export const getProjectTemplate = (id: string): ProjectTemplate | undefined => {
  return PROJECT_TEMPLATES.find(p => p.id === id);
};

export const getProjectsByType = (type: 'research' | 'crafting' | 'other'): ProjectTemplate[] => {
  return PROJECT_TEMPLATES.filter(p => p.type === type);
};
