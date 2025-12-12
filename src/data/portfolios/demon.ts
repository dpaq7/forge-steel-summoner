import { MinionTemplate, FixtureTemplate, Portfolio } from '../../types';

// =============================================================================
// DEMON PORTFOLIO - SRD Section 5.1
// Circle of Blight (Demonologist)
// =============================================================================

// -----------------------------------------------------------------------------
// SIGNATURE MINIONS (1 Essence each)
// -----------------------------------------------------------------------------

const abyssalBabbler: MinionTemplate = {
  id: 'demon_abyssal_babbler',
  name: 'Abyssal Babbler',
  essenceCost: 1,
  minionsPerSummon: 1, // Signature: 1 minion per essence spent
  size: '1S',
  speed: 5,
  stamina: 2,
  stability: 0,
  freeStrike: 2,
  characteristics: {
    might: -2,
    agility: 1,
    reason: -1,
    intuition: 2,
    presence: 1,
  },
  role: 'hexer',
  keywords: ['Abyssal', 'Demon'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'psychic',
  traits: [
    {
      name: 'Shriek',
      description: 'Enemies within 2 squares of an abyssal babbler cannot Hide.',
    },
    {
      name: 'Maddening Voices',
      description: 'Enemies within 2 squares of an abyssal babbler cannot benefit from flanking.',
    },
  ],
};

const moteOfBlight: MinionTemplate = {
  id: 'demon_mote_of_blight',
  name: 'Mote of Blight',
  essenceCost: 1,
  minionsPerSummon: 1, // Signature: 1 minion per essence spent
  size: '1M',
  speed: 5,
  stamina: 2,
  stability: 0,
  freeStrike: 2,
  characteristics: {
    might: -1,
    agility: 1,
    reason: -2,
    intuition: 0,
    presence: 0,
  },
  role: 'artillery',
  keywords: ['Abyssal', 'Demon'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'corruption',
  traits: [
    {
      name: 'Ranged Free Strikes',
      description: 'A mote of blight can make free strikes at range 10.',
    },
    {
      name: 'Aura of Blight',
      description: 'At the start of each of your turns, each creature adjacent to a mote of blight takes 1 corruption damage.',
    },
  ],
};

const spineGoblin: MinionTemplate = {
  id: 'demon_spine_goblin',
  name: 'Spine Goblin',
  essenceCost: 1,
  minionsPerSummon: 1, // Signature: 1 minion per essence spent
  size: '1M',
  speed: 7,
  stamina: 2,
  stability: 0,
  freeStrike: 2,
  characteristics: {
    might: 0,
    agility: 2,
    reason: -1,
    intuition: 0,
    presence: -1,
  },
  role: 'harrier',
  keywords: ['Abyssal', 'Demon'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'untyped',
  traits: [
    {
      name: 'Spiny Death',
      description: 'When a spine goblin is reduced to 0 Stamina, each adjacent enemy takes 2 damage.',
    },
  ],
};

// -----------------------------------------------------------------------------
// 3-ESSENCE MINIONS (Summon 2)
// -----------------------------------------------------------------------------

const barbedFiend: MinionTemplate = {
  id: 'demon_barbed_fiend',
  name: 'Barbed Fiend',
  essenceCost: 3,
  minionsPerSummon: 2,
  size: '1M',
  speed: 5,
  stamina: 7,
  stability: 1,
  freeStrike: 4,
  characteristics: {
    might: 2,
    agility: 0,
    reason: -1,
    intuition: 1,
    presence: 0,
  },
  role: 'defender',
  keywords: ['Abyssal', 'Demon'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'untyped',
  traits: [
    {
      name: 'Barbed Hide',
      description: 'When a creature makes a melee attack against a barbed fiend, they take 2 damage.',
    },
  ],
  signatureAbility: {
    id: 'barbed_fiend_grapple',
    name: 'Grapple Strike',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 1',
    target: 'One creature',
    powerRoll: {
      characteristic: 'might',
      tier1: '2d10 + R damage',
      tier2: '2d10 + R damage; grabbed',
      tier3: '2d10 + R damage; grabbed and the target takes 3 damage at the start of each of their turns while grabbed',
    },
    effect: '',
  },
};

const bileSpewer: MinionTemplate = {
  id: 'demon_bile_spewer',
  name: 'Bile Spewer',
  essenceCost: 3,
  minionsPerSummon: 2,
  size: '2',
  speed: 4,
  stamina: 8,
  stability: 1,
  freeStrike: 4,
  characteristics: {
    might: 1,
    agility: -1,
    reason: -2,
    intuition: 1,
    presence: 0,
  },
  role: 'artillery',
  keywords: ['Abyssal', 'Demon'],
  immunities: [{ type: 'acid', value: undefined }],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'acid',
  traits: [
    {
      name: 'Ranged Free Strikes',
      description: 'A bile spewer can make free strikes at range 12.',
    },
    {
      name: 'Bile Pool',
      description: 'When a bile spewer is reduced to 0 Stamina, it leaves a 2x2 hazard zone that deals 3 acid damage to creatures who enter or start their turn there.',
    },
  ],
  signatureAbility: {
    id: 'bile_spewer_spray',
    name: 'Bile Spray',
    actionType: 'action',
    keywords: ['Ranged', 'Strike'],
    distance: 'Ranged 12',
    target: 'All creatures in a 2-cube',
    powerRoll: {
      characteristic: 'might',
      tier1: '2d10 + R acid damage',
      tier2: '2d10 + R acid damage; slowed (EoT)',
      tier3: '2d10 + R acid damage; slowed (save ends)',
    },
    effect: '',
  },
};

const shadowLurker: MinionTemplate = {
  id: 'demon_shadow_lurker',
  name: 'Shadow Lurker',
  essenceCost: 3,
  minionsPerSummon: 2,
  size: '1M',
  speed: 6,
  stamina: 5,
  stability: 0,
  freeStrike: 4,
  characteristics: {
    might: 1,
    agility: 2,
    reason: 0,
    intuition: 2,
    presence: 1,
  },
  role: 'ambusher',
  keywords: ['Abyssal', 'Demon'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'cold',
  traits: [
    {
      name: 'Shadow Phasing',
      description: 'A shadow lurker is invisible while in darkness or dim light.',
    },
  ],
  signatureAbility: {
    id: 'shadow_lurker_strike',
    name: 'Shadow Strike',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 1',
    target: 'One creature',
    powerRoll: {
      characteristic: 'agility',
      tier1: '2d10 + R cold damage',
      tier2: '2d10 + R cold damage. Teleport 3.',
      tier3: '2d10 + R cold damage. Teleport 5 and become invisible until end of next turn.',
    },
    effect: '',
  },
};

// -----------------------------------------------------------------------------
// 5-ESSENCE MINIONS (Summon 3)
// -----------------------------------------------------------------------------

const chaosElemental: MinionTemplate = {
  id: 'demon_chaos_elemental',
  name: 'Chaos Elemental',
  essenceCost: 5,
  minionsPerSummon: 3,
  size: '2',
  speed: 6,
  stamina: [6, 6, 6],
  stability: 1,
  freeStrike: 4,
  characteristics: {
    might: 1,
    agility: 1,
    reason: -1,
    intuition: 2,
    presence: 2,
  },
  role: 'controller',
  keywords: ['Abyssal', 'Demon', 'Elemental'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'varies',
  traits: [
    {
      name: 'Wild Magic',
      description: 'Roll d4 when attacking: 1=fire, 2=cold, 3=lightning, 4=acid. Use that damage type.',
    },
  ],
  signatureAbility: {
    id: 'chaos_elemental_pulse',
    name: 'Chaos Pulse',
    actionType: 'action',
    keywords: ['Magic', 'Ranged', 'Strike'],
    distance: 'Ranged 10',
    target: 'All creatures in burst 2',
    powerRoll: {
      characteristic: 'presence',
      tier1: '2d10 + R damage (random type)',
      tier2: '2d10 + R damage; roll random condition (slow/prone/dazed)',
      tier3: '2d10 + R damage; two random conditions',
    },
    effect: 'Roll d4 to determine damage type.',
  },
};

const demonHound: MinionTemplate = {
  id: 'demon_demon_hound',
  name: 'Demon Hound',
  essenceCost: 5,
  minionsPerSummon: 3,
  size: '1L',
  speed: 10,
  stamina: [6, 6, 6],
  stability: 1,
  freeStrike: 5,
  characteristics: {
    might: 2,
    agility: 2,
    reason: -2,
    intuition: 2,
    presence: 0,
  },
  role: 'harrier',
  keywords: ['Abyssal', 'Demon'],
  immunities: [{ type: 'fire', value: undefined }],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'fire',
  traits: [
    {
      name: 'Pack Hunter',
      description: 'A demon hound deals +2 damage while adjacent to another demon hound.',
    },
  ],
  signatureAbility: {
    id: 'demon_hound_bite',
    name: 'Knockdown Bite',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 1',
    target: 'One creature',
    powerRoll: {
      characteristic: 'might',
      tier1: '2d10 + R fire damage',
      tier2: '2d10 + R fire damage; prone',
      tier3: '2d10 + R fire damage; prone and restrained (EoT)',
    },
    effect: '',
  },
};

const pitHorror: MinionTemplate = {
  id: 'demon_pit_horror',
  name: 'Pit Horror',
  essenceCost: 5,
  minionsPerSummon: 3,
  size: '1L',
  speed: 6,
  stamina: [7, 7, 7],
  stability: 2,
  freeStrike: 5,
  characteristics: {
    might: 3,
    agility: 0,
    reason: -1,
    intuition: 1,
    presence: 2,
  },
  role: 'brute',
  keywords: ['Abyssal', 'Demon'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'corruption',
  traits: [
    {
      name: 'Terrifying Presence',
      description: 'Enemies within 3 squares of a pit horror are frightened of it.',
    },
  ],
  signatureAbility: {
    id: 'pit_horror_rend',
    name: 'Rend',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 2',
    target: 'One creature',
    powerRoll: {
      characteristic: 'might',
      tier1: '2d10 + R corruption damage',
      tier2: '2d10 + R corruption damage; bleeding (EoT)',
      tier3: '2d10 + R corruption damage; bleeding (save ends)',
    },
    effect: '',
  },
};

// -----------------------------------------------------------------------------
// 7-ESSENCE MINIONS (Summon 1 or 2)
// -----------------------------------------------------------------------------

const greaterDemon: MinionTemplate = {
  id: 'demon_greater_demon',
  name: 'Greater Demon',
  essenceCost: 7,
  minionsPerSummon: 1,
  size: '3',
  speed: 5,
  stamina: 45,
  stability: 4,
  freeStrike: 8,
  characteristics: {
    might: 4,
    agility: 0,
    reason: 0,
    intuition: 2,
    presence: 3,
  },
  role: 'brute',
  keywords: ['Abyssal', 'Demon'],
  immunities: [{ type: 'fire', value: undefined }],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'fire',
  traits: [
    {
      name: 'Aura of Corruption',
      description: 'Enemies within 3 squares of a greater demon have -2 to all damage rolls.',
    },
  ],
  signatureAbility: {
    id: 'greater_demon_slam',
    name: 'Massive Slam',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 2',
    target: 'All enemies in 2-cube',
    powerRoll: {
      characteristic: 'might',
      tier1: '2d10 + R fire damage',
      tier2: '2d10 + R fire damage; prone',
      tier3: '2d10 + R fire damage; prone and pushed 3',
    },
    effect: '',
  },
};

const shadowDemon: MinionTemplate = {
  id: 'demon_shadow_demon',
  name: 'Shadow Demon',
  essenceCost: 7,
  minionsPerSummon: 2,
  size: '1L',
  speed: 8,
  stamina: [18, 18],
  stability: 0,
  freeStrike: 6,
  characteristics: {
    might: 1,
    agility: 3,
    reason: 1,
    intuition: 3,
    presence: 2,
  },
  role: 'ambusher',
  keywords: ['Abyssal', 'Demon'],
  immunities: [],
  weaknesses: [{ type: 'radiant', value: 5 }],
  movementModes: ['Fly'],
  freeStrikeDamageType: 'cold',
  traits: [
    {
      name: 'Incorporeal',
      description: 'A shadow demon can move through solid objects and other creatures. It cannot end its turn inside a solid object.',
    },
    {
      name: 'Shadow Pass',
      description: 'When a shadow demon moves through another creature, that creature takes 3 cold damage.',
    },
  ],
  signatureAbility: {
    id: 'shadow_demon_darkness',
    name: 'Darkness Strike',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 1',
    target: 'One creature',
    powerRoll: {
      characteristic: 'agility',
      tier1: '2d10 + R cold damage',
      tier2: '2d10 + R cold damage; blinded (EoT)',
      tier3: '2d10 + R cold damage; blinded (save ends)',
    },
    effect: '',
  },
};

const abyssalKnight: MinionTemplate = {
  id: 'demon_abyssal_knight',
  name: 'Abyssal Knight',
  essenceCost: 7,
  minionsPerSummon: 2,
  size: '1L',
  speed: 5,
  stamina: [20, 20],
  stability: 3,
  freeStrike: 7,
  characteristics: {
    might: 3,
    agility: 1,
    reason: 1,
    intuition: 2,
    presence: 2,
  },
  role: 'defender',
  keywords: ['Abyssal', 'Demon'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'fire',
  traits: [
    {
      name: 'Infernal Armor',
      description: 'An abyssal knight has damage immunity 3.',
    },
  ],
  signatureAbility: {
    id: 'abyssal_knight_challenge',
    name: "Knight's Challenge",
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 2',
    target: 'One creature',
    powerRoll: {
      characteristic: 'might',
      tier1: '2d10 + R fire damage',
      tier2: '2d10 + R fire damage; taunted (EoT)',
      tier3: '2d10 + R fire damage; taunted (save ends) and takes 5 damage when attacking other creatures',
    },
    effect: '',
  },
};

// -----------------------------------------------------------------------------
// FIXTURE: The Boil
// -----------------------------------------------------------------------------

const theBoil: FixtureTemplate = {
  id: 'fixture_the_boil',
  name: 'The Boil',
  portfolioType: 'demon',
  role: 'Hazard Support',
  baseStamina: 20, // + level
  size: 2, // becomes 3 at level 9
  traits: [
    {
      name: 'Infernal Taunt',
      description:
        'When you summon the Boil or at the start of each of your turns, each enemy within 5 squares must make a Presence resistance roll. On failure, they are taunted by the Boil until the start of your next turn.',
    },
    {
      name: 'Volatile Core',
      description:
        'When the Boil is reduced to 0 Stamina, it explodes. Each creature within 5 squares takes 2d6 fire damage.',
    },
  ],
  level5Feature: {
    id: 'the_boil_level5',
    name: 'Searing Presence',
    description:
      'The radius of Infernal Taunt increases to 10 squares. Enemies who fail their roll also take 2 fire damage.',
  },
  level9Feature: {
    id: 'the_boil_level9',
    name: 'Cataclysmic Explosion',
    description:
      'The Boil becomes size 3. Volatile Core radius increases to 10 squares and deals 4d6 fire damage.',
  },
};

// -----------------------------------------------------------------------------
// COMPLETE PORTFOLIO
// -----------------------------------------------------------------------------

export const demonPortfolio: Portfolio = {
  type: 'demon',
  signatureMinions: [abyssalBabbler, moteOfBlight, spineGoblin],
  unlockedMinions: [
    // 3-Essence
    barbedFiend,
    bileSpewer,
    shadowLurker,
    // 5-Essence
    chaosElemental,
    demonHound,
    pitHorror,
    // 7-Essence
    greaterDemon,
    shadowDemon,
    abyssalKnight,
  ],
  fixture: theBoil,
  champion: null, // Avatar of Blight - Level 8+
};
