// ============================================================================
// SKILLS - Draw Steel Skill System
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  group: SkillGroup;
  description: string;
}

export type SkillGroup = 'crafting' | 'exploration' | 'interpersonal' | 'intrigue' | 'lore';

export const skillGroups: Record<SkillGroup, { name: string; description: string }> = {
  crafting: {
    name: 'Crafting',
    description: 'Skills for creating and repairing items.',
  },
  exploration: {
    name: 'Exploration',
    description: 'Skills for navigating and surviving in the world.',
  },
  interpersonal: {
    name: 'Interpersonal',
    description: 'Skills for social interaction and communication.',
  },
  intrigue: {
    name: 'Intrigue',
    description: 'Skills for deception, stealth, and subterfuge.',
  },
  lore: {
    name: 'Lore',
    description: 'Skills for knowledge and research.',
  },
};

// All specific skills organized by group
export const skills: Skill[] = [
  // Crafting Skills
  { id: 'alchemy', name: 'Alchemy', group: 'crafting', description: 'Creating potions and alchemical items.' },
  { id: 'architecture', name: 'Architecture', group: 'crafting', description: 'Designing and understanding structures.' },
  { id: 'blacksmithing', name: 'Blacksmithing', group: 'crafting', description: 'Forging metal items and weapons.' },
  { id: 'fletching', name: 'Fletching', group: 'crafting', description: 'Creating arrows and ranged ammunition.' },
  { id: 'forgery', name: 'Forgery', group: 'crafting', description: 'Creating fake documents and signatures.' },
  { id: 'jewelry', name: 'Jewelry', group: 'crafting', description: 'Crafting rings, necklaces, and gems.' },
  { id: 'leatherworking', name: 'Leatherworking', group: 'crafting', description: 'Working with leather and hides.' },
  { id: 'mechanics', name: 'Mechanics', group: 'crafting', description: 'Building and repairing mechanisms.' },
  { id: 'tailoring', name: 'Tailoring', group: 'crafting', description: 'Creating and repairing clothing.' },
  { id: 'woodworking', name: 'Woodworking', group: 'crafting', description: 'Crafting wooden items and structures.' },

  // Exploration Skills
  { id: 'alertness', name: 'Alertness', group: 'exploration', description: 'Noticing threats and hidden dangers.' },
  { id: 'climb', name: 'Climb', group: 'exploration', description: 'Scaling walls, cliffs, and surfaces.' },
  { id: 'drive', name: 'Drive', group: 'exploration', description: 'Operating vehicles and mounts.' },
  { id: 'endurance', name: 'Endurance', group: 'exploration', description: 'Withstanding physical hardship.' },
  { id: 'gymnastics', name: 'Gymnastics', group: 'exploration', description: 'Acrobatics and physical agility.' },
  { id: 'handle-animals', name: 'Handle Animals', group: 'exploration', description: 'Training and controlling animals.' },
  { id: 'heal', name: 'Heal', group: 'exploration', description: 'Treating wounds and ailments.' },
  { id: 'jump', name: 'Jump', group: 'exploration', description: 'Leaping across gaps and obstacles.' },
  { id: 'lift', name: 'Lift', group: 'exploration', description: 'Carrying and moving heavy objects.' },
  { id: 'navigate', name: 'Navigate', group: 'exploration', description: 'Finding your way through terrain.' },
  { id: 'ride', name: 'Ride', group: 'exploration', description: 'Riding mounts in and out of combat.' },
  { id: 'swim', name: 'Swim', group: 'exploration', description: 'Moving through water.' },
  { id: 'track', name: 'Track', group: 'exploration', description: 'Following trails and footprints.' },

  // Interpersonal Skills
  { id: 'brag', name: 'Brag', group: 'interpersonal', description: 'Boasting and impressing others.' },
  { id: 'empathize', name: 'Empathize', group: 'interpersonal', description: 'Understanding others\' feelings.' },
  { id: 'flirt', name: 'Flirt', group: 'interpersonal', description: 'Charming and attracting others.' },
  { id: 'gamble', name: 'Gamble', group: 'interpersonal', description: 'Games of chance and reading opponents.' },
  { id: 'handle-animals-int', name: 'Handle Animals', group: 'interpersonal', description: 'Communicating with animals.' },
  { id: 'interrogate', name: 'Interrogate', group: 'interpersonal', description: 'Extracting information forcefully.' },
  { id: 'intimidate', name: 'Intimidate', group: 'interpersonal', description: 'Frightening others into compliance.' },
  { id: 'lead', name: 'Lead', group: 'interpersonal', description: 'Inspiring and directing others.' },
  { id: 'lie', name: 'Lie', group: 'interpersonal', description: 'Deceiving through false statements.' },
  { id: 'music', name: 'Music', group: 'interpersonal', description: 'Playing instruments and singing.' },
  { id: 'perform', name: 'Perform', group: 'interpersonal', description: 'Acting, dancing, and entertaining.' },
  { id: 'persuade', name: 'Persuade', group: 'interpersonal', description: 'Convincing others through reason.' },
  { id: 'read-person', name: 'Read Person', group: 'interpersonal', description: 'Discerning motivations and lies.' },

  // Intrigue Skills
  { id: 'conceal', name: 'Conceal', group: 'intrigue', description: 'Hiding objects on your person.' },
  { id: 'criminal-underworld', name: 'Criminal Underworld', group: 'intrigue', description: 'Knowledge of criminal organizations.' },
  { id: 'disguise', name: 'Disguise', group: 'intrigue', description: 'Altering your appearance.' },
  { id: 'eavesdrop', name: 'Eavesdrop', group: 'intrigue', description: 'Listening to private conversations.' },
  { id: 'escape-artist', name: 'Escape Artist', group: 'intrigue', description: 'Freeing yourself from restraints.' },
  { id: 'hide', name: 'Hide', group: 'intrigue', description: 'Remaining unseen.' },
  { id: 'pick-lock', name: 'Pick Lock', group: 'intrigue', description: 'Opening locks without keys.' },
  { id: 'pick-pocket', name: 'Pick Pocket', group: 'intrigue', description: 'Stealing from others unnoticed.' },
  { id: 'sabotage', name: 'Sabotage', group: 'intrigue', description: 'Disabling devices and structures.' },
  { id: 'search', name: 'Search', group: 'intrigue', description: 'Finding hidden objects and clues.' },
  { id: 'sneak', name: 'Sneak', group: 'intrigue', description: 'Moving silently.' },

  // Lore Skills
  { id: 'culture', name: 'Culture', group: 'lore', description: 'Knowledge of societies and customs.' },
  { id: 'history', name: 'History', group: 'lore', description: 'Knowledge of past events.' },
  { id: 'magic', name: 'Magic', group: 'lore', description: 'Understanding of arcane forces.' },
  { id: 'monsters', name: 'Monsters', group: 'lore', description: 'Knowledge of creatures and beasts.' },
  { id: 'nature', name: 'Nature', group: 'lore', description: 'Knowledge of plants, animals, and terrain.' },
  { id: 'psionics', name: 'Psionics', group: 'lore', description: 'Understanding of mental powers.' },
  { id: 'religion', name: 'Religion', group: 'lore', description: 'Knowledge of gods and religious practices.' },
  { id: 'rumors', name: 'Rumors', group: 'lore', description: 'Knowledge of gossip and news.' },
  { id: 'science', name: 'Science', group: 'lore', description: 'Knowledge of natural laws.' },
  { id: 'strategy', name: 'Strategy', group: 'lore', description: 'Knowledge of tactics and warfare.' },
  { id: 'timescape', name: 'Timescape', group: 'lore', description: 'Knowledge of the timescape and planar travel.' },
];

// Helper to get skills by group
export const getSkillsByGroup = (group: SkillGroup): Skill[] => {
  return skills.filter(s => s.group === group);
};

// Helper to get skill by ID
export const getSkillById = (id: string): Skill | undefined => {
  return skills.find(s => s.id === id);
};

// Helper to parse skill group from string (used for culture/career data)
export const parseSkillGroup = (skillStr: string): SkillGroup | null => {
  const normalized = skillStr.toLowerCase();
  if (normalized === 'crafting') return 'crafting';
  if (normalized === 'exploration') return 'exploration';
  if (normalized === 'interpersonal') return 'interpersonal';
  if (normalized === 'intrigue') return 'intrigue';
  if (normalized === 'lore') return 'lore';
  return null;
};

// Check if a string is a skill group or a specific skill
export const isSkillGroup = (skillStr: string): boolean => {
  return parseSkillGroup(skillStr) !== null;
};

// Find a specific skill by name (case-insensitive)
export const findSkillByName = (name: string): Skill | undefined => {
  const normalized = name.toLowerCase();
  return skills.find(s => s.name.toLowerCase() === normalized || s.id === normalized);
};
