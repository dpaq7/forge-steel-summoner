// Magic Items Data from Draw Steel

export type ItemCategory = 'consumable' | 'trinket' | 'leveled' | 'artifact';
export type EquipmentSlot = 'head' | 'neck' | 'arms' | 'hands' | 'waist' | 'feet' | 'ring' | 'held' | 'mount' | 'armor' | 'weapon' | 'implement';

export interface MagicItem {
  id: string;
  name: string;
  category: ItemCategory;
  echelon: number; // 1-4
  slot?: EquipmentSlot;
  projectGoal?: number; // PP to craft
  effect: string;
  enhancements?: ItemEnhancement[];
}

export interface ItemEnhancement {
  level: number;
  effect: string;
}

export const CONSUMABLE_ITEMS: MagicItem[] = [
  // 1st Echelon Consumables
  { id: 'black-ash-dart', name: 'Black Ash Dart', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Ranged strike deals extra damage and teleports target (T1/T2/T3 dependent).' },
  { id: 'blood-essence-vial', name: 'Blood Essence Vial', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver to drink, regain Stamina (half damage dealt/full damage if 1 HR spent).' },
  { id: 'buzz-balm', name: 'Buzz Balm', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver, end Bleeding/Weakened, +2 speed (EoT).' },
  { id: 'catapult-dust', name: 'Catapult Dust', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Main action, area effect launches targets 6+1d6 squares horizontally.' },
  { id: 'giants-blood-flame', name: "Giant's-Blood Flame", category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Coat weapon (+2 fire damage), OR throw (burns 1 hr, 5 fire damage EoT).' },
  { id: 'growth-potion', name: 'Growth Potion', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Drink: doubles max Stamina/Stability/Might for duration, size +1.' },
  { id: 'healing-potion', name: 'Healing Potion', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver, regain Stamina (Recovery Value) without spending a Recovery.' },
  { id: 'imps-tongue', name: "Imp's Tongue", category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver, speak/understand any language (1 hour).' },
  { id: 'lachomp-tooth', name: 'Lachomp Tooth', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver, extra psychic damage to one target. Next strike hits multiple targets.' },
  { id: 'mirror-token', name: 'Mirror Token', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Triggered action, ignore ranged strike damage/effects, half damage reflected back.' },
  { id: 'pocket-homunculus', name: 'Pocket Homunculus', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver, summon duplicate (15 Stamina).' },
  { id: 'portable-cloud', name: 'Portable Cloud', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver, throw glass sphere, creates 4 cube fog/cloud (10 min). Variants apply status/damage.' },
  { id: 'quaff-n-huff-snuff', name: "Professor Veratismo's Quaff 'n Huff Snuff", category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver, target speaks only truth (1 hr).' },
  { id: 'snapdragon', name: 'Snapdragon', category: 'consumable', echelon: 1, projectGoal: 45, effect: 'Maneuver, inhale, next damaging ability deals +5 damage, +2 forced movement.' },
  // 2nd Echelon Consumables
  { id: 'breath-of-dawn', name: 'Breath of Dawn', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Maneuver, end Frightened/Slowed/Taunted, +8 Stability (EoE).' },
  { id: 'bull-shot', name: 'Bull Shot', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Maneuver, grow horns, Charge strike grabs target and inflicts bleeding.' },
  { id: 'chocolate-of-immovability', name: 'Chocolate of Immovability', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Maneuver, gain 15 Temp Stamina, +10 Stability (EoE).' },
  { id: 'concealment-potion', name: 'Concealment Potion', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Maneuver, gain Double Edge on Hide/Sneak, Hide even if observed (10 min).' },
  { id: 'float-powder', name: 'Float Powder', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Maneuver, fly/hover (1 hr), Stability 0.' },
  { id: 'purified-jelly', name: 'Purified Jelly', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Maneuver, breathe water/ignore inhaled poisons (1 hr).' },
  { id: 'scroll-of-resurrection', name: 'Scroll of Resurrection', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Respite activity, revive creature died < 1 yr (consumed).' },
  { id: 'telemagnet', name: 'Telemagnet', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Maneuver, snap wand, vertical pull target size 3 or less (Distance 6/3/1 sq).' },
  { id: 'vial-of-ethereal-attack', name: 'Vial of Ethereal Attack', category: 'consumable', echelon: 2, projectGoal: 90, effect: 'Maneuver, throw, 2 cube ethereal vortex (EoE/Dismissal). Damages targets EoT/on entry.' },
  // 3rd Echelon Consumables
  { id: 'anamorphic-larva', name: 'Anamorphic Larva', category: 'consumable', echelon: 3, projectGoal: 180, effect: 'Maneuver, creates 10 wall of larval flesh. Targets take psychic damage EoT.' },
  { id: 'bottled-paradox', name: 'Bottled Paradox', category: 'consumable', echelon: 3, projectGoal: 180, effect: 'Drink: reroll failed test (last minute). OR Throw: area effect alters recent events.' },
  { id: 'gallios-visiting-card', name: "G'Allios Visiting Card", category: 'consumable', echelon: 3, projectGoal: 180, effect: 'Triggered action (take damage), ignore damage/effects, summon devil to redirect effect.' },
  { id: 'personal-effigy', name: 'Personal Effigy', category: 'consumable', echelon: 3, projectGoal: 120, effect: 'Maneuver, burn effigy of recently dead creature, revive creature (Temp Stamina).' },
  { id: 'stygian-liquor', name: 'Stygian Liquor', category: 'consumable', echelon: 3, projectGoal: 180, effect: 'Dying state extended to negative max Stamina (24 hrs). Dying damage halved.' },
  { id: 'timesplitter', name: 'Timesplitter', category: 'consumable', echelon: 3, projectGoal: 180, effect: 'Maneuver, ranged free strike, extra 1d6 psychic damage. Area effect imposes Slowed (save ends).' },
  { id: 'ward-token', name: 'Ward Token', category: 'consumable', echelon: 3, projectGoal: 180, effect: 'Maneuver, shatter, enemy abilities targeting user double bane (EoE).' },
  { id: 'wellness-tonic', name: 'Wellness Tonic', category: 'consumable', echelon: 3, projectGoal: 180, effect: 'Maneuver, end up to 3 conditions/effects. Ignore negative effects (EoT).' },
  // 4th Echelon Consumables
  { id: 'breath-of-creation', name: 'Breath of Creation', category: 'consumable', echelon: 4, projectGoal: 360, effect: 'Maneuver, inhale, earn +1 Renown, create Size 2 portal/demiplane (20 cube) until dismissal.' },
  { id: 'elixir-of-saint-elspeth', name: 'Elixir of Saint Elspeth', category: 'consumable', echelon: 4, projectGoal: 360, effect: 'Maneuver, enemy abilities targeting user auto-Tier 1 outcome (rounds=Victories).' },
  { id: 'page-solaris', name: 'Page From the Infinite Library: Solaris', category: 'consumable', echelon: 4, projectGoal: 360, effect: 'Maneuver, spend 1 HR, destroy page, create sun energy (4 cube) (EoE).' },
  { id: 'restorative-bright-court', name: 'Restorative of the Bright Court', category: 'consumable', echelon: 4, projectGoal: 360, effect: 'Maneuver, open vial, user/ally regain 1d6 Recoveries.' },
];

export const TRINKET_ITEMS: MagicItem[] = [
  // 1st Echelon Trinkets
  { id: 'color-cloak', name: 'Color Cloak (Any)', category: 'trinket', echelon: 1, slot: 'neck', effect: 'Level-based elemental immunity (Cold/Fire/Lightning). Triggered Action to ignore damage/gain damage boost.' },
  { id: 'deadweight', name: 'Deadweight', category: 'trinket', echelon: 1, slot: 'held', effect: 'Maneuver, free melee strike during fall. +1 damage per square fallen.' },
  { id: 'displacing-bracer', name: 'Displacing Replacement Bracer', category: 'trinket', echelon: 1, slot: 'arms', effect: 'Maneuver, swap held object (Size 1S/1T) with object 10 sq away.' },
  { id: 'divine-vine', name: 'Divine Vine', category: 'trinket', echelon: 1, slot: 'held', effect: 'Maneuver, ranged Grab (Distance 5).' },
  { id: 'flameshade-gloves', name: 'Flameshade Gloves', category: 'trinket', echelon: 1, slot: 'hands', effect: 'Move action, move through 1 square of solid matter.' },
  { id: 'gecko-gloves', name: 'Gecko Gloves', category: 'trinket', echelon: 1, slot: 'hands', effect: 'Cannot be disarmed/lose grip. Grabbed creature takes bane on Escape Grab.' },
  { id: 'hellcharger-helm', name: 'Hellcharger Helm', category: 'trinket', echelon: 1, slot: 'head', effect: 'Charge main action: +5 speed (EoT). Maneuver: Knockback (any size).' },
  { id: 'mask-of-many', name: 'Mask of the Many', category: 'trinket', echelon: 1, slot: 'head', effect: 'Maneuver, transform to human/animal (Size 1) illusion. Strike/Disengage ends illusion = 1 surge.' },
  { id: 'quantum-satchel', name: 'Quantum Satchel', category: 'trinket', echelon: 1, slot: 'held', effect: 'Teleport held items into satchel from linked location via opal brooch.' },
  { id: 'snakerattle-bangle', name: 'Snakerattle Bangle', category: 'trinket', echelon: 1, slot: 'arms', effect: 'Melee free strikes inflict frightened (EoT).' },
  { id: 'unbinder-boots', name: 'Unbinder Boots', category: 'trinket', echelon: 1, slot: 'feet', effect: 'Maneuver, fly 3 squares (fall EoT).' },
  // 2nd Echelon Trinkets
  { id: 'bastion-belt', name: 'Bastion Belt', category: 'trinket', echelon: 2, slot: 'waist', effect: '+3 Stamina, +1 Stability.' },
  { id: 'evilest-eye', name: 'Evilest Eye', category: 'trinket', echelon: 2, slot: 'neck', effect: 'Maneuver, target enemy, allies adjacent to target gain 1 surge.' },
  { id: 'insightful-crown', name: 'Insightful Crown', category: 'trinket', echelon: 2, slot: 'head', effect: 'Edge on Intuition tests (read emotions/honesty). Success: ask Director question about target.' },
  { id: 'key-of-inquiry', name: 'Key of Inquiry', category: 'trinket', echelon: 2, slot: 'held', effect: 'Maneuver, target speaks truth/forgets memory (single use per target).' },
  { id: 'mediators-charm', name: "Mediator's Charm", category: 'trinket', echelon: 2, slot: 'head', effect: 'NPC Patience +1. Learn 1 Motivation/Pitfall at negotiation start.' },
  { id: 'necklace-of-bayou', name: 'Necklace of the Bayou', category: 'trinket', echelon: 2, slot: 'neck', effect: 'Breathe underwater, swim at full speed, ignore difficult terrain (water/marsh).' },
  { id: 'scannerstone', name: 'Scannerstone', category: 'trinket', echelon: 2, slot: 'held', effect: 'Hold against surface, displays rough map of other side (moving creatures visible).' },
  { id: 'stop-n-go-coin', name: "Stop-'n-Go Coin", category: 'trinket', echelon: 2, slot: 'held', effect: 'Maneuver, toss coin, outcome dictates movement effects (difficult terrain/speed boost/both).' },
  // 3rd Echelon Trinkets
  { id: 'bracers-of-strife', name: 'Bracers of Strife', category: 'trinket', echelon: 3, slot: 'arms', effect: '+2 Damage to rolled damage, +1 bonus to distance of push.' },
  { id: 'crystallized-essence', name: 'Crystallized Essence', category: 'trinket', echelon: 3, slot: 'held', effect: '+5 Ranged Magic Distance. Can be destroyed for +5 Essence immediately.' },
  { id: 'cross-puppeteer', name: 'Cross of the Scorned Puppeteer', category: 'trinket', echelon: 3, slot: 'held', effect: 'Summon/command destroyed enemy minion doubles (illusionary).' },
  { id: 'mask-of-oversight', name: 'Mask of Oversight', category: 'trinket', echelon: 3, slot: 'head', effect: 'Maneuver, gain 360-deg vision/multiple eyes. Double Edge on search/Intrigue. Maneuver: launch 3 eyes (damage).' },
  { id: 'mirage-band', name: 'Mirage Band', category: 'trinket', echelon: 3, slot: 'head', effect: 'Auto-see through Illusions/Invisibility/Concealment. Maneuver: illusionary disguise aura.' },
  { id: 'nullfield-ring', name: 'Nullfield Resonator Ring', category: 'trinket', echelon: 3, slot: 'ring', effect: 'Null only. Null Field area +1. Signature Ability: Nullring Strike (melee, psychic damage/daze/slow).' },
  { id: 'shifting-ring', name: 'Shifting Ring', category: 'trinket', echelon: 3, slot: 'ring', effect: 'Maneuver, teleport 3 squares. Teleporting from other effects: +3 squares distance.' },
  { id: 'thunder-chariot', name: 'Thunder Chariot', category: 'trinket', echelon: 3, slot: 'mount', effect: 'Size 2 Mount (Speed +3). Ride gives lightning immunity 5.' },
  { id: 'warbanner-pride', name: 'Warbanner of Pride', category: 'trinket', echelon: 3, slot: 'held', effect: '+1 bonus to saving throws/resisting potencies. Allies within 10 squares make saving throw EoT.' },
  // 4th Echelon Trinkets
  { id: 'gravekeepers-lantern', name: "Gravekeeper's Lantern", category: 'trinket', echelon: 4, slot: 'held', effect: 'Maneuver, trap nonhostile spirit (Intuition test). Presence test to question spirit.' },
  { id: 'hagbasket', name: 'Hagbasket', category: 'trinket', echelon: 4, slot: 'mount', effect: 'Size 2 Mount (Fly/Hover). Attacks targeting user have double edge.' },
  { id: 'psi-blade', name: 'Psi Blade', category: 'trinket', echelon: 4, slot: 'arms', effect: 'Maneuver, project psychic blade. Maneuver (once per turn), free strike (+3 psychic damage).' },
  { id: 'warbanner-wrath', name: 'Warbanner of Wrath', category: 'trinket', echelon: 4, slot: 'held', effect: 'Regain 1 Recovery EoE. Strike damage boost based on Recoveries remaining.' },
];

export const LEVELED_ITEMS: MagicItem[] = [
  // Armor
  {
    id: 'adaptive-second-skin',
    name: 'Adaptive Second Skin of Toxins',
    category: 'leveled',
    echelon: 1,
    slot: 'armor',
    effect: 'Stamina bonus (+6/+12/+21). Acid/Poison Immunity (Level).',
    enhancements: [
      { level: 1, effect: '+6 Stamina. Acid/Poison Immunity equal to level.' },
      { level: 5, effect: '+12 Stamina. Creatures adjacent to you take acid damage.' },
      { level: 9, effect: '+21 Stamina. Create poison gas cloud as action.' },
    ],
  },
  {
    id: 'chain-sea-sky',
    name: 'Chain of the Sea and Sky',
    category: 'leveled',
    echelon: 1,
    slot: 'armor',
    effect: 'Stamina bonus. Swim/Water Breathing. Glide and Cold Immunity.',
    enhancements: [
      { level: 1, effect: '+6 Stamina. Swim speed, water breathing.' },
      { level: 5, effect: '+12 Stamina. Glide movement, Cold Immunity.' },
      { level: 9, effect: '+21 Stamina. Cold Immunity 10, flying strike gains edge/bane.' },
    ],
  },
  {
    id: 'grand-scarab',
    name: 'Grand Scarab',
    category: 'leveled',
    echelon: 1,
    slot: 'armor',
    effect: 'Stamina bonus. Flight capabilities.',
    enhancements: [
      { level: 1, effect: '+6 Stamina. Fly (fall at end of turn).' },
      { level: 5, effect: '+12 Stamina. Fly (no falling).' },
      { level: 9, effect: '+21 Stamina. Flying strikes gain edge.' },
    ],
  },
  {
    id: 'kuranzoi-prismscale',
    name: "Kuran'zoi Prismscale",
    category: 'leveled',
    echelon: 1,
    slot: 'armor',
    effect: 'Stamina bonus. Defensive triggered actions.',
    enhancements: [
      { level: 1, effect: '+6 Stamina. Triggered Action on damage: Slow attacker.' },
      { level: 5, effect: '+12 Stamina. Attacker takes Corruption damage.' },
      { level: 9, effect: '+21 Stamina. Teleport on damage, gain Invisibility.' },
    ],
  },
  // Weapons
  {
    id: 'blade-quintessence',
    name: 'Blade of Quintessence',
    category: 'leveled',
    echelon: 1,
    slot: 'weapon',
    effect: 'Damage bonus. Elemental versatility.',
    enhancements: [
      { level: 1, effect: '+1 damage. Change elemental damage type.' },
      { level: 5, effect: '+2 damage. Ranged throw (returns on use).' },
      { level: 9, effect: '+3 damage. Extra elemental damage (Characteristic score).' },
    ],
  },
  {
    id: 'displacer-battleaxe',
    name: 'Displacer (Battleaxe)',
    category: 'leveled',
    echelon: 1,
    slot: 'weapon',
    effect: 'Damage bonus. Teleportation effects.',
    enhancements: [
      { level: 1, effect: '+1 damage. Maneuver: Teleport self/target (swap places).' },
      { level: 5, effect: '+2 damage. Teleport self/ally/target (swap places).' },
      { level: 9, effect: '+3 damage. Target weakened (EoT).' },
    ],
  },
  {
    id: 'executioners-blade',
    name: "Executioner's Blade",
    category: 'leveled',
    echelon: 1,
    slot: 'weapon',
    effect: 'Damage bonus. Extra damage vs winded targets.',
    enhancements: [
      { level: 1, effect: '+1 damage. Psychic Damage, Winded target takes extra damage.' },
      { level: 5, effect: '+2 damage. Winded target deals extra Psychic damage to self.' },
      { level: 9, effect: '+3 damage. Winded target restrained (EoT).' },
    ],
  },
  {
    id: 'icemaker-maul',
    name: 'Icemaker Maul',
    category: 'leveled',
    echelon: 1,
    slot: 'weapon',
    effect: 'Damage bonus. Cold damage and aura.',
    enhancements: [
      { level: 1, effect: '+1 damage. Cold damage strikes, Maneuver: cold damage aura (EoT).' },
      { level: 5, effect: '+2 damage. Aura size increases.' },
      { level: 9, effect: '+3 damage. Aura size increases further.' },
    ],
  },
  {
    id: 'thunderhead-bident',
    name: 'Thunderhead Bident',
    category: 'leveled',
    echelon: 1,
    slot: 'weapon',
    effect: 'Damage bonus. Sonic damage and push.',
    enhancements: [
      { level: 1, effect: '+1 damage. Sonic damage strikes, Push 1 sq.' },
      { level: 5, effect: '+2 damage. Push 3 sq. Ranged (returns on use).' },
      { level: 9, effect: '+3 damage. Vertical push.' },
    ],
  },
  // Implements
  {
    id: 'abjurers-bastion',
    name: "Abjurer's Bastion",
    category: 'leveled',
    echelon: 1,
    slot: 'implement',
    effect: 'Damage bonus. Protection field creation.',
    enhancements: [
      { level: 1, effect: '+1 damage.' },
      { level: 5, effect: '+2 damage. Maneuver: create 1 cube protection field (Damage Immunity 5).' },
      { level: 9, effect: '+3 damage. Field size increases.' },
    ],
  },
  {
    id: 'brittlebreaker',
    name: 'Brittlebreaker',
    category: 'leveled',
    echelon: 1,
    slot: 'implement',
    effect: 'Psychic Damage bonus. Critical hit amplification.',
    enhancements: [
      { level: 1, effect: '+2 Psychic damage.' },
      { level: 5, effect: '+3 Psychic damage. Damage doubled on critical hit.' },
      { level: 9, effect: '+4 Psychic damage. Damage tripled on critical hit.' },
    ],
  },
  {
    id: 'ether-fueled-vessel',
    name: 'Ether-Fueled Vessel',
    category: 'leveled',
    echelon: 1,
    slot: 'implement',
    effect: 'Damage bonus. Insubstantiality effects.',
    enhancements: [
      { level: 1, effect: '+1 damage. Damage grants insubstantiality (EoT).' },
      { level: 5, effect: '+2 damage. Insubstantial attack deals extra damage.' },
      { level: 9, effect: '+3 damage. Insubstantial ally ignores opportunity attacks.' },
    ],
  },
];

export const ARTIFACT_ITEMS: MagicItem[] = [
  {
    id: 'blade-thousand-years',
    name: 'Blade of a Thousand Years',
    category: 'artifact',
    echelon: 4,
    slot: 'weapon',
    effect: 'Suited for Victory: Takes any weapon form, +5 Holy Damage. Grants massive combat buffs (Damage Immunity 5, +15 Stamina/Max Stamina) to allies within 1 mile. Drawback: Wielder\'s soul consumed upon death before victory is achieved.',
  },
  {
    id: 'encepter',
    name: 'Encepter',
    category: 'artifact',
    echelon: 4,
    slot: 'implement',
    effect: "Shining Presence: Auto-Tier 3 Presence rolls. Champion's Lasso: Maneuver to capture targets in line of light. Obliteration: Main action to destroy lassoed targets.",
  },
  {
    id: 'mortal-coil',
    name: 'Mortal Coil',
    category: 'artifact',
    echelon: 4,
    slot: 'held',
    effect: 'Host Body: Host gains +1 Main Action but ages 10x faster and cannot regain Stamina/Recoveries. Penumbra: 10-mile field prevents healing/Stamina recovery. Mortals gain power to kill immortals/deities within the field.',
  },
];

export const ALL_MAGIC_ITEMS: MagicItem[] = [
  ...CONSUMABLE_ITEMS,
  ...TRINKET_ITEMS,
  ...LEVELED_ITEMS,
  ...ARTIFACT_ITEMS,
];

export const getItemsByCategory = (category: ItemCategory): MagicItem[] => {
  return ALL_MAGIC_ITEMS.filter(item => item.category === category);
};

export const getItemsByEchelon = (echelon: number): MagicItem[] => {
  return ALL_MAGIC_ITEMS.filter(item => item.echelon === echelon);
};

export const getItemById = (id: string): MagicItem | undefined => {
  return ALL_MAGIC_ITEMS.find(item => item.id === id);
};

// Parsed bonus interface
export interface ParsedBonus {
  stat: 'stamina' | 'stability' | 'speed' | 'damage' | 'savingThrow' | 'rangeDistance';
  value: number;
  conditional?: string;
}

/**
 * Parse stat bonuses from item effect text
 * Handles both base item effects and level-appropriate enhancements
 */
export const parseItemBonuses = (item: MagicItem, heroLevel: number = 1): ParsedBonus[] => {
  const bonuses: ParsedBonus[] = [];

  // For leveled items, find the appropriate enhancement based on hero level
  let effectText = item.effect;
  if (item.enhancements && item.category === 'leveled') {
    // Find highest applicable enhancement
    const applicable = item.enhancements.filter(enh => heroLevel >= enh.level);
    if (applicable.length > 0) {
      const best = applicable[applicable.length - 1];
      effectText = best.effect;
    } else {
      effectText = item.enhancements[0].effect;
    }
  }

  // Parse various bonus patterns from effect text
  const effect = effectText.toLowerCase();

  // Stamina bonuses: "+6 Stamina", "+12 Stamina", "+21 Stamina"
  const staminaMatch = effect.match(/\+(\d+)\s*stamina/i);
  if (staminaMatch) {
    bonuses.push({ stat: 'stamina', value: parseInt(staminaMatch[1]) });
  }

  // Stability bonuses: "+1 Stability", "+3 Stability", "+8 Stability"
  const stabilityMatch = effect.match(/\+(\d+)\s*stability/i);
  if (stabilityMatch) {
    bonuses.push({ stat: 'stability', value: parseInt(stabilityMatch[1]) });
  }

  // Speed bonuses: "+2 speed", "+3 speed"
  const speedMatch = effect.match(/\+(\d+)\s*speed/i);
  if (speedMatch) {
    bonuses.push({ stat: 'speed', value: parseInt(speedMatch[1]) });
  }

  // Damage bonuses: "+1 damage", "+2 damage", "+3 damage"
  const damageMatch = effect.match(/\+(\d+)\s*damage/i);
  if (damageMatch) {
    bonuses.push({ stat: 'damage', value: parseInt(damageMatch[1]) });
  }

  // Psychic damage (count as damage): "+2 Psychic damage"
  const psychicMatch = effect.match(/\+(\d+)\s*psychic\s*damage/i);
  if (psychicMatch && !damageMatch) {
    bonuses.push({ stat: 'damage', value: parseInt(psychicMatch[1]) });
  }

  // Saving throw bonuses: "+1 bonus to saving throws"
  const saveMatch = effect.match(/\+(\d+)\s*(?:bonus\s*to\s*)?sav(?:ing|e)/i);
  if (saveMatch) {
    bonuses.push({ stat: 'savingThrow', value: parseInt(saveMatch[1]) });
  }

  // Range/Distance bonuses: "+5 Ranged Magic Distance"
  const rangeMatch = effect.match(/\+(\d+)\s*(?:ranged\s*)?(?:magic\s*)?distance/i);
  if (rangeMatch) {
    bonuses.push({ stat: 'rangeDistance', value: parseInt(rangeMatch[1]) });
  }

  return bonuses;
};

/**
 * Get the current enhancement level for a leveled item based on hero level
 */
export const getEnhancementTier = (item: MagicItem, heroLevel: number): number => {
  if (!item.enhancements || item.category !== 'leveled') return 0;

  if (heroLevel >= 9) return 9;
  if (heroLevel >= 5) return 5;
  return 1;
};
