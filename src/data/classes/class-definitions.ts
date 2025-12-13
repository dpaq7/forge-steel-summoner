// Class definitions for all 10 Draw Steel hero classes
// Contains starting stats, heroic resources, subclass options, and characteristics

import { HeroClass, HeroicResourceType } from '../../types/hero';
import { Characteristic, Characteristics } from '../../types/common';

export interface SubclassOption {
  id: string;
  name: string;
  description?: string;
}

export interface ClassDefinition {
  id: HeroClass;
  name: string;
  description: string;
  role: 'Defender' | 'Controller' | 'Striker' | 'Support';
  masterClass: boolean;

  // Starting stats
  startingStamina: number;
  staminaPerLevel: number;
  startingRecoveries: number;

  // Heroic resource
  heroicResource: {
    name: string;
    type: HeroicResourceType;
    startingAmount: 'victories';
    gainPerTurn: string;
    gainTrigger: string;
  };

  // Characteristics
  startingCharacteristics: Partial<Characteristics>;
  potencyCharacteristic: Characteristic;

  // Skills
  fixedSkills: string[];
  skillGroupChoices: { groups: string[]; count: number }[];

  // Subclass info
  subclassName: string;
  subclasses: SubclassOption[];
}

export const classDefinitions: Record<HeroClass, ClassDefinition> = {
  censor: {
    id: 'censor',
    name: 'Censor',
    description: 'A trained warrior devoted to a saint or god, specializing in confronting the wicked and locking down single enemies.',
    role: 'Defender',
    masterClass: false,
    startingStamina: 21,
    staminaPerLevel: 9,
    startingRecoveries: 12,
    heroicResource: {
      name: 'Wrath',
      type: 'wrath',
      startingAmount: 'victories',
      gainPerTurn: '2',
      gainTrigger: 'First time per round a judged creature deals damage to you OR you deal damage to judged creature',
    },
    startingCharacteristics: { might: 2, presence: 2 },
    potencyCharacteristic: 'presence',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'Order',
    subclasses: [
      { id: 'inquisitor', name: 'Inquisitor', description: 'Hunters of heresy and corruption' },
      { id: 'templar', name: 'Templar', description: 'Holy warriors defending the faithful' },
      { id: 'zealot', name: 'Zealot', description: 'Fervent crusaders consumed by righteous fury' },
    ],
  },

  conduit: {
    id: 'conduit',
    name: 'Conduit',
    description: 'The devoted spellcasting priest of a saint or god who wields divine magic to smite enemies and support allies.',
    role: 'Support',
    masterClass: false,
    startingStamina: 18,
    staminaPerLevel: 6,
    startingRecoveries: 8,
    heroicResource: {
      name: 'Piety',
      type: 'piety',
      startingAmount: 'victories',
      gainPerTurn: '1d3',
      gainTrigger: 'Can Pray before rolling for chance at more Piety or Domain Effect (risk psychic damage)',
    },
    startingCharacteristics: { intuition: 2 },
    potencyCharacteristic: 'intuition',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'Domain',
    subclasses: [
      { id: 'creation', name: 'Creation', description: 'Domain of making and artifice' },
      { id: 'death', name: 'Death', description: 'Domain of endings and the beyond' },
      { id: 'fate', name: 'Fate', description: 'Domain of destiny and prophecy' },
      { id: 'knowledge', name: 'Knowledge', description: 'Domain of wisdom and secrets' },
      { id: 'love', name: 'Love', description: 'Domain of devotion and connection' },
      { id: 'nature', name: 'Nature', description: 'Domain of the wild and growth' },
      { id: 'protection', name: 'Protection', description: 'Domain of shielding and safety' },
      { id: 'storm', name: 'Storm', description: 'Domain of tempests and lightning' },
      { id: 'sun', name: 'Sun', description: 'Domain of light and radiance' },
      { id: 'trickery', name: 'Trickery', description: 'Domain of deception and cunning' },
      { id: 'war', name: 'War', description: 'Domain of battle and conquest' },
    ],
  },

  elementalist: {
    id: 'elementalist',
    name: 'Elementalist',
    description: 'A mage who wields elemental forces with a versatile array of tricks to control combat and manipulate the environment.',
    role: 'Controller',
    masterClass: false,
    startingStamina: 18,
    staminaPerLevel: 6,
    startingRecoveries: 8,
    heroicResource: {
      name: 'Essence',
      type: 'essence',
      startingAmount: 'victories',
      gainPerTurn: '2',
      gainTrigger: 'First time per round you or an ally takes elemental (non-untyped/non-holy) damage',
    },
    startingCharacteristics: { reason: 2 },
    potencyCharacteristic: 'reason',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'Element',
    subclasses: [
      { id: 'earth', name: 'Earth', description: 'Master of stone, metal, and geological forces' },
      { id: 'fire', name: 'Fire', description: 'Wielder of flame and destructive heat' },
      { id: 'green', name: 'Green', description: 'Controller of plant life and natural poison' },
      { id: 'void', name: 'Void', description: 'Manipulator of cold, darkness, and gravity' },
    ],
  },

  fury: {
    id: 'fury',
    name: 'Fury',
    description: 'A mobile warrior coursing with ferocity who deals damage up close and pushes foes around the battlefield.',
    role: 'Striker',
    masterClass: false,
    startingStamina: 21,
    staminaPerLevel: 9,
    startingRecoveries: 10,
    heroicResource: {
      name: 'Ferocity',
      type: 'ferocity',
      startingAmount: 'victories',
      gainPerTurn: '1d3',
      gainTrigger: 'First time per round you take damage (+1). First time per encounter you become winded or dying (+1d3).',
    },
    startingCharacteristics: { might: 2, agility: 2 },
    potencyCharacteristic: 'might',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'Aspect',
    subclasses: [
      { id: 'berserker', name: 'Berserker', description: 'Reckless warrior who grows stronger when wounded' },
      { id: 'reaver', name: 'Reaver', description: 'Vicious fighter who drains life from enemies' },
      { id: 'stormwight', name: 'Stormwight', description: 'Lightning-touched warrior of primal storms' },
    ],
  },

  null: {
    id: 'null',
    name: 'Null',
    description: 'An unarmed psionic warrior dedicated to discipline and order. They dampen supernatural effects and resist potencies.',
    role: 'Defender',
    masterClass: false,
    startingStamina: 21,
    staminaPerLevel: 9,
    startingRecoveries: 8,
    heroicResource: {
      name: 'Discipline',
      type: 'discipline',
      startingAmount: 'victories',
      gainPerTurn: '2',
      gainTrigger: 'First time per round an enemy in Null Field uses main action OR Director spends Malice',
    },
    startingCharacteristics: { agility: 2, intuition: 2 },
    potencyCharacteristic: 'intuition',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'Tradition',
    subclasses: [
      { id: 'chronopath', name: 'Chronopath', description: 'Time-bending warrior who manipulates temporal flow' },
      { id: 'cloister', name: 'Cloister', description: 'Mental fortress specialist who shields allies' },
      { id: 'manticore', name: 'Manticore', description: 'Aggressive null who punishes magical enemies' },
    ],
  },

  shadow: {
    id: 'shadow',
    name: 'Shadow',
    description: 'An expert infiltrator and thief utilizing magic to remain hidden. Excels at burst damage and battlefield mobility.',
    role: 'Striker',
    masterClass: false,
    startingStamina: 18,
    staminaPerLevel: 6,
    startingRecoveries: 8,
    heroicResource: {
      name: 'Insight',
      type: 'insight',
      startingAmount: 'victories',
      gainPerTurn: '1d3',
      gainTrigger: 'First time per round dealing damage with 1+ surges. Abilities cost 1 less if power roll has edge/double edge.',
    },
    startingCharacteristics: { agility: 2 },
    potencyCharacteristic: 'agility',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'College',
    subclasses: [
      { id: 'black-ash', name: 'College of Black Ash', description: 'Masters of fire and smoke who burn from the shadows' },
      { id: 'caustic-alchemy', name: 'College of Caustic Alchemy', description: 'Poisoners and alchemists who corrode their foes' },
      { id: 'harlequin-mask', name: "College of the Harlequin's Mask", description: 'Illusionists who deceive and misdirect' },
      { id: 'woven-darkness', name: 'College of Woven Darkness', description: 'Shadow-weavers who manipulate darkness itself' },
    ],
  },

  summoner: {
    id: 'summoner',
    name: 'Summoner',
    description: 'A master class focused on piercing the veil between worlds to summon minions that form an army under your command.',
    role: 'Controller',
    masterClass: true,
    startingStamina: 15,
    staminaPerLevel: 6,
    startingRecoveries: 8,
    heroicResource: {
      name: 'Essence',
      type: 'essence',
      startingAmount: 'victories',
      gainPerTurn: '2',
      gainTrigger: 'First time per round a minion dies unwillingly. Can sacrifice minions to reduce ability costs.',
    },
    startingCharacteristics: { reason: 2 },
    potencyCharacteristic: 'reason',
    fixedSkills: ['Magic', 'Strategy'],
    skillGroupChoices: [{ groups: ['intrigue', 'lore'], count: 2 }],
    subclassName: 'Circle',
    subclasses: [
      { id: 'blight', name: 'Circle of Blight', description: 'Demonologist summoning demons from Abyssal Waste' },
      { id: 'graves', name: 'Circle of Graves', description: 'Necromancer raising undead from Necropolitan Ruin' },
      { id: 'spring', name: 'Circle of Spring', description: 'Feybright beckoning fey spirits from Arcadia' },
      { id: 'storms', name: 'Circle of Storms', description: 'Storm caster summoning elementals from Quintessence' },
    ],
  },

  tactician: {
    id: 'tactician',
    name: 'Tactician',
    description: "A brilliant strategist and weapons expert who excels at commanding allies and controlling the battle's flow.",
    role: 'Support',
    masterClass: false,
    startingStamina: 21,
    staminaPerLevel: 9,
    startingRecoveries: 10,
    heroicResource: {
      name: 'Focus',
      type: 'focus',
      startingAmount: 'victories',
      gainPerTurn: '2',
      gainTrigger: 'First time per round you or ally damages marked target OR ally uses heroic ability',
    },
    startingCharacteristics: { might: 2, reason: 2 },
    potencyCharacteristic: 'reason',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'Doctrine',
    subclasses: [
      { id: 'insurgent', name: 'Insurgent', description: 'Guerrilla leader excelling at ambush and hit-and-run tactics' },
      { id: 'mastermind', name: 'Mastermind', description: 'Strategic genius who positions allies for maximum effect' },
      { id: 'vanguard', name: 'Vanguard Commander', description: 'Frontline leader who inspires through direct action' },
    ],
  },

  talent: {
    id: 'talent',
    name: 'Talent',
    description: 'A master of psionics who can bend the world to their will. Can spend Clarity below 0, becoming Strained.',
    role: 'Controller',
    masterClass: false,
    startingStamina: 18,
    staminaPerLevel: 6,
    startingRecoveries: 8,
    heroicResource: {
      name: 'Clarity',
      type: 'clarity',
      startingAmount: 'victories',
      gainPerTurn: '1d3',
      gainTrigger: 'First time per round a creature is force moved. Can spend below 0 (to -(1+Reason)), becoming Strained.',
    },
    startingCharacteristics: { reason: 2, presence: 2 },
    potencyCharacteristic: 'reason',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'Tradition',
    subclasses: [
      { id: 'empath', name: 'Empath', description: 'Mind-reader who manipulates emotions and perceptions' },
      { id: 'metamorph', name: 'Metamorph', description: 'Shape-shifter who transforms their own body' },
      { id: 'telekinetic', name: 'Telekinetic', description: 'Force manipulator who moves objects with thought' },
    ],
  },

  troubadour: {
    id: 'troubadour',
    name: 'Troubadour',
    description: 'A storytelling swashbuckler who channels battle dynamism into Drama to inspire allies and influence narrative.',
    role: 'Support',
    masterClass: false,
    startingStamina: 18,
    staminaPerLevel: 6,
    startingRecoveries: 8,
    heroicResource: {
      name: 'Drama',
      type: 'drama',
      startingAmount: 'victories',
      gainPerTurn: '1d3',
      gainTrigger: '3+ heroes same turn (+2), hero winded (+2), natural 19-20 (+3), hero dies (+10). Can resurrect at 30 Drama!',
    },
    startingCharacteristics: { agility: 2, presence: 2 },
    potencyCharacteristic: 'presence',
    fixedSkills: [],
    skillGroupChoices: [],
    subclassName: 'Class',
    subclasses: [
      { id: 'dancer', name: 'Dancer', description: 'Graceful performer who moves allies and inspires through motion' },
      { id: 'duelist', name: 'Duelist', description: 'Swashbuckling swordfighter with dramatic flair' },
      { id: 'wordsmith', name: 'Wordsmith', description: 'Orator and poet who weaponizes language itself' },
    ],
  },
};

// Get class definition by ID
export function getClassDefinition(heroClass: HeroClass): ClassDefinition {
  return classDefinitions[heroClass];
}

// Get all class definitions as array
export function getAllClassDefinitions(): ClassDefinition[] {
  return Object.values(classDefinitions);
}

// Get class role color (for UI theming)
export function getClassRoleColor(role: ClassDefinition['role']): string {
  switch (role) {
    case 'Defender':
      return '#3b82f6'; // Blue
    case 'Controller':
      return '#a855f7'; // Purple
    case 'Striker':
      return '#ef4444'; // Red
    case 'Support':
      return '#22c55e'; // Green
  }
}

// Get subclass options for a class
export function getSubclassOptions(heroClass: HeroClass): SubclassOption[] {
  return classDefinitions[heroClass].subclasses;
}

// Get subclass display name (e.g., "Circle", "Domain", "Element")
export function getSubclassTypeName(heroClass: HeroClass): string {
  return classDefinitions[heroClass].subclassName;
}
