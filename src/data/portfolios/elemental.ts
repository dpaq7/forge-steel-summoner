import { MinionTemplate, FixtureTemplate, Portfolio } from '../../types';

// =============================================================================
// ELEMENTAL PORTFOLIO - SRD Section 5.2
// Circle of Storms (Elementalist)
// =============================================================================

// -----------------------------------------------------------------------------
// SIGNATURE MINIONS (1 Essence each)
// -----------------------------------------------------------------------------

const emberSprite: MinionTemplate = {
  id: 'elemental_ember_sprite',
  name: 'Ember Sprite',
  essenceCost: 1,
  minionsPerSummon: 1, // Signature: 1 minion per essence spent
  size: '1S',
  speed: 6,
  stamina: 2,
  stability: 0,
  freeStrike: 2,
  characteristics: { might: -1, agility: 2, reason: -1, intuition: 1, presence: 0 },
  role: 'harrier',
  keywords: ['Elemental', 'Fire'],
  immunities: [{ type: 'fire', value: undefined }],
  weaknesses: [{ type: 'cold', value: 2 }],
  movementModes: ['Fly'],
  freeStrikeDamageType: 'fire',
  traits: [
    { name: 'Burning Touch', description: 'When an ember sprite deals damage, the target takes 1 persistent fire damage (EoT).' },
  ],
};

const stonekin: MinionTemplate = {
  id: 'elemental_stonekin',
  name: 'Stonekin',
  essenceCost: 1,
  minionsPerSummon: 1, // Signature: 1 minion per essence spent
  size: '1M',
  speed: 4,
  stamina: 3,
  stability: 2,
  freeStrike: 2,
  characteristics: { might: 2, agility: -1, reason: -2, intuition: 0, presence: -1 },
  role: 'defender',
  keywords: ['Elemental', 'Earth'],
  immunities: [],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'untyped',
  traits: [
    { name: 'Stone Skin', description: 'A stonekin has damage immunity 1.' },
  ],
};

const zephyrWisp: MinionTemplate = {
  id: 'elemental_zephyr_wisp',
  name: 'Zephyr Wisp',
  essenceCost: 1,
  minionsPerSummon: 1, // Signature: 1 minion per essence spent
  size: '1M',
  speed: 8,
  stamina: 1,
  stability: 0,
  freeStrike: 2,
  characteristics: { might: -2, agility: 2, reason: 0, intuition: 1, presence: 0 },
  role: 'artillery',
  keywords: ['Elemental', 'Air'],
  immunities: [],
  weaknesses: [],
  movementModes: ['Fly', 'Hover'],
  freeStrikeDamageType: 'lightning',
  traits: [
    { name: 'Ranged Free Strikes', description: 'A zephyr wisp can make free strikes at range 10.' },
    { name: 'Evasive', description: 'Enemies have a bane on attacks against zephyr wisps.' },
  ],
};

// -----------------------------------------------------------------------------
// 3-ESSENCE MINIONS (Summon 2)
// -----------------------------------------------------------------------------

const magmaWalker: MinionTemplate = {
  id: 'elemental_magma_walker',
  name: 'Magma Walker',
  essenceCost: 3,
  minionsPerSummon: 2,
  size: '1M',
  speed: 5,
  stamina: 7,
  stability: 1,
  freeStrike: 4,
  characteristics: { might: 2, agility: 0, reason: -1, intuition: 1, presence: 1 },
  role: 'brute',
  keywords: ['Elemental', 'Fire', 'Earth'],
  immunities: [{ type: 'fire', value: undefined }],
  weaknesses: [{ type: 'cold', value: 3 }],
  movementModes: [],
  freeStrikeDamageType: 'fire',
  traits: [
    { name: 'Molten Trail', description: 'Squares a magma walker moves through become difficult terrain that deals 2 fire damage to creatures entering.' },
  ],
  signatureAbility: {
    id: 'magma_walker_eruption',
    name: 'Eruption',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 1',
    target: 'All adjacent creatures',
    powerRoll: { characteristic: 'might', tier1: '2d10 + R fire damage', tier2: '2d10 + R fire damage; pushed 2', tier3: '2d10 + R fire damage; pushed 3 and prone' },
    effect: '',
  },
};

const stormShard: MinionTemplate = {
  id: 'elemental_storm_shard',
  name: 'Storm Shard',
  essenceCost: 3,
  minionsPerSummon: 2,
  size: '1M',
  speed: 6,
  stamina: 5,
  stability: 0,
  freeStrike: 4,
  characteristics: { might: 0, agility: 2, reason: 0, intuition: 2, presence: 1 },
  role: 'artillery',
  keywords: ['Elemental', 'Air', 'Lightning'],
  immunities: [{ type: 'lightning', value: undefined }],
  weaknesses: [],
  movementModes: ['Fly'],
  freeStrikeDamageType: 'lightning',
  traits: [
    { name: 'Ranged Free Strikes', description: 'A storm shard can make free strikes at range 12.' },
    { name: 'Chain Lightning', description: 'When a storm shard hits with a free strike, one other creature within 3 squares takes 2 lightning damage.' },
  ],
  signatureAbility: {
    id: 'storm_shard_bolt',
    name: 'Lightning Bolt',
    actionType: 'action',
    keywords: ['Magic', 'Ranged', 'Strike'],
    distance: 'Ranged 12',
    target: 'One creature',
    powerRoll: { characteristic: 'agility', tier1: '2d10 + R lightning damage', tier2: '2d10 + R lightning damage; dazed (EoT)', tier3: '2d10 + R lightning damage; stunned (EoT)' },
    effect: '',
  },
};

const tidalServant: MinionTemplate = {
  id: 'elemental_tidal_servant',
  name: 'Tidal Servant',
  essenceCost: 3,
  minionsPerSummon: 2,
  size: '2',
  speed: 5,
  stamina: 8,
  stability: 1,
  freeStrike: 3,
  characteristics: { might: 1, agility: 1, reason: -1, intuition: 1, presence: 1 },
  role: 'controller',
  keywords: ['Elemental', 'Water'],
  immunities: [{ type: 'cold', value: undefined }],
  weaknesses: [{ type: 'fire', value: 3 }],
  movementModes: ['Swim'],
  freeStrikeDamageType: 'cold',
  traits: [
    { name: 'Fluid Form', description: 'A tidal servant can move through creatures and 1-inch spaces without squeezing.' },
  ],
  signatureAbility: {
    id: 'tidal_servant_wave',
    name: 'Crashing Wave',
    actionType: 'action',
    keywords: ['Magic', 'Ranged', 'Strike'],
    distance: 'Line 5',
    target: 'All creatures in line',
    powerRoll: { characteristic: 'might', tier1: '2d10 + R cold damage', tier2: '2d10 + R cold damage; pushed 2', tier3: '2d10 + R cold damage; pushed 3 and prone' },
    effect: '',
  },
};

// -----------------------------------------------------------------------------
// 5-ESSENCE MINIONS (Summon 3)
// -----------------------------------------------------------------------------

const fireElemental: MinionTemplate = {
  id: 'elemental_fire_elemental',
  name: 'Fire Elemental',
  essenceCost: 5,
  minionsPerSummon: 3,
  size: '1L',
  speed: 8,
  stamina: [6, 6, 6],
  stability: 0,
  freeStrike: 5,
  characteristics: { might: 2, agility: 2, reason: -1, intuition: 1, presence: 2 },
  role: 'harrier',
  keywords: ['Elemental', 'Fire'],
  immunities: [{ type: 'fire', value: undefined }],
  weaknesses: [{ type: 'cold', value: 5 }],
  movementModes: [],
  freeStrikeDamageType: 'fire',
  traits: [
    { name: 'Burning Body', description: 'Creatures that start their turn adjacent to a fire elemental take 2 fire damage.' },
  ],
  signatureAbility: {
    id: 'fire_elemental_blaze',
    name: 'Blazing Strike',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 1',
    target: 'One creature',
    powerRoll: { characteristic: 'agility', tier1: '2d10 + R fire damage', tier2: '2d10 + R fire damage; 3 persistent fire (EoT)', tier3: '2d10 + R fire damage; 5 persistent fire (save ends)' },
    effect: '',
  },
};

const earthElemental: MinionTemplate = {
  id: 'elemental_earth_elemental',
  name: 'Earth Elemental',
  essenceCost: 5,
  minionsPerSummon: 3,
  size: '1L',
  speed: 4,
  stamina: [8, 8, 8],
  stability: 3,
  freeStrike: 5,
  characteristics: { might: 3, agility: -1, reason: -1, intuition: 1, presence: 1 },
  role: 'defender',
  keywords: ['Elemental', 'Earth'],
  immunities: [],
  weaknesses: [],
  movementModes: ['Burrow'],
  freeStrikeDamageType: 'untyped',
  traits: [
    { name: 'Stone Body', description: 'An earth elemental has damage immunity 2.' },
  ],
  signatureAbility: {
    id: 'earth_elemental_slam',
    name: 'Earthen Slam',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 2',
    target: 'One creature',
    powerRoll: { characteristic: 'might', tier1: '2d10 + R damage', tier2: '2d10 + R damage; prone', tier3: '2d10 + R damage; prone and restrained (EoT)' },
    effect: '',
  },
};

const airElemental: MinionTemplate = {
  id: 'elemental_air_elemental',
  name: 'Air Elemental',
  essenceCost: 5,
  minionsPerSummon: 3,
  size: '1L',
  speed: 10,
  stamina: [5, 5, 5],
  stability: 0,
  freeStrike: 4,
  characteristics: { might: 1, agility: 3, reason: 0, intuition: 2, presence: 1 },
  role: 'controller',
  keywords: ['Elemental', 'Air'],
  immunities: [{ type: 'lightning', value: undefined }],
  weaknesses: [],
  movementModes: ['Fly', 'Hover'],
  freeStrikeDamageType: 'lightning',
  traits: [
    { name: 'Whirlwind', description: 'When an air elemental moves, each creature it passes through takes 2 damage and is pushed 1 square.' },
  ],
  signatureAbility: {
    id: 'air_elemental_gust',
    name: 'Gust Blast',
    actionType: 'action',
    keywords: ['Magic', 'Ranged', 'Strike'],
    distance: 'Cone 5',
    target: 'All creatures',
    powerRoll: { characteristic: 'agility', tier1: '2d10 + R lightning damage', tier2: '2d10 + R lightning damage; pushed 3', tier3: '2d10 + R lightning damage; pushed 5 and prone' },
    effect: '',
  },
};

// -----------------------------------------------------------------------------
// 7-ESSENCE MINIONS (Summon 1 or 2)
// -----------------------------------------------------------------------------

const primordialGolem: MinionTemplate = {
  id: 'elemental_primordial_golem',
  name: 'Primordial Golem',
  essenceCost: 7,
  minionsPerSummon: 1,
  size: '3',
  speed: 5,
  stamina: 45,
  stability: 4,
  freeStrike: 8,
  characteristics: { might: 4, agility: -1, reason: 0, intuition: 1, presence: 2 },
  role: 'defender',
  keywords: ['Elemental', 'Earth', 'Fire'],
  immunities: [{ type: 'fire', value: undefined }],
  weaknesses: [],
  movementModes: [],
  freeStrikeDamageType: 'fire',
  traits: [
    { name: 'Primordial Armor', description: 'A primordial golem has damage immunity 3.' },
    { name: 'Elemental Core', description: 'When reduced to 0 Stamina, explodes dealing 3d6 fire damage to all creatures within 3 squares.' },
  ],
  signatureAbility: {
    id: 'primordial_golem_smash',
    name: 'Primordial Smash',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 2',
    target: 'All enemies in 2-cube',
    powerRoll: { characteristic: 'might', tier1: '2d10 + R fire damage', tier2: '2d10 + R fire damage; prone', tier3: '2d10 + R fire damage; prone and 3 persistent fire (save ends)' },
    effect: '',
  },
};

const stormLord: MinionTemplate = {
  id: 'elemental_storm_lord',
  name: 'Storm Lord',
  essenceCost: 7,
  minionsPerSummon: 2,
  size: '1L',
  speed: 8,
  stamina: [18, 18],
  stability: 1,
  freeStrike: 7,
  characteristics: { might: 2, agility: 3, reason: 1, intuition: 2, presence: 3 },
  role: 'artillery',
  keywords: ['Elemental', 'Air', 'Lightning'],
  immunities: [{ type: 'lightning', value: undefined }],
  weaknesses: [],
  movementModes: ['Fly', 'Hover'],
  freeStrikeDamageType: 'lightning',
  traits: [
    { name: 'Ranged Free Strikes', description: 'Range 15.' },
    { name: 'Storm Aura', description: 'Enemies within 3 squares have a bane on ranged attacks.' },
  ],
  signatureAbility: {
    id: 'storm_lord_tempest',
    name: 'Tempest Strike',
    actionType: 'action',
    keywords: ['Magic', 'Ranged', 'Strike'],
    distance: 'Ranged 15',
    target: 'Up to 3 creatures',
    powerRoll: { characteristic: 'presence', tier1: '2d10 + R lightning damage', tier2: '2d10 + R lightning damage; dazed (EoT)', tier3: '2d10 + R lightning damage; stunned (EoT)' },
    effect: '',
  },
};

const tsunamiSpirit: MinionTemplate = {
  id: 'elemental_tsunami_spirit',
  name: 'Tsunami Spirit',
  essenceCost: 7,
  minionsPerSummon: 2,
  size: '2',
  speed: 6,
  stamina: [17, 17],
  stability: 2,
  freeStrike: 6,
  characteristics: { might: 2, agility: 2, reason: 0, intuition: 2, presence: 2 },
  role: 'controller',
  keywords: ['Elemental', 'Water'],
  immunities: [{ type: 'cold', value: undefined }],
  weaknesses: [],
  movementModes: ['Swim'],
  freeStrikeDamageType: 'cold',
  traits: [
    { name: 'Fluid Form', description: 'Can move through creatures and narrow spaces.' },
    { name: 'Engulf', description: 'Creatures grabbed by a tsunami spirit are suffocating.' },
  ],
  signatureAbility: {
    id: 'tsunami_spirit_wave',
    name: 'Tidal Crush',
    actionType: 'action',
    keywords: ['Melee', 'Strike'],
    distance: 'Reach 2',
    target: 'One creature',
    powerRoll: { characteristic: 'might', tier1: '2d10 + R cold damage', tier2: '2d10 + R cold damage; grabbed', tier3: '2d10 + R cold damage; grabbed and restrained (save ends)' },
    effect: '',
  },
};

// -----------------------------------------------------------------------------
// FIXTURE: Primordial Crystal
// -----------------------------------------------------------------------------

const primordialCrystal: FixtureTemplate = {
  id: 'fixture_primordial_crystal',
  name: 'Primordial Crystal',
  portfolioType: 'elemental',
  role: 'Relic Artillery',
  flavorText: 'The storm of elements from Quintessence coalesce into a hardened, crystalline structure. It magnifies the elemental composition of any matter that passes through it and emits supernatural colors while doing so.',
  baseStamina: 20,
  size: 2,
  traits: [
    {
      name: 'Magnetic Pull',
      description: 'Each enemy that starts their turn within 3 squares of the crystal is vertically pulled 3.',
    },
    {
      name: 'Elemental Boost',
      description: 'When you or an ally uses a ranged ability that draws a line through the crystal, the distance increases by 5.',
    },
  ],
  level5Feature: {
    id: 'primordial_crystal_level5',
    name: 'Terra Resonance',
    description: 'Each round, you gain a surge the first time an area of terrain gains a supernatural effect (excluding auras) while you have line of effect to the crystal. You can choose to give the surge to an ally who also has line of effect to the crystal.',
    levelRequired: 5,
  },
  level9Features: [
    {
      id: 'primordial_crystal_level9_size',
      name: 'Size Increase',
      description: 'The crystal is now size 3.',
      levelRequired: 9,
    },
    {
      id: 'primordial_crystal_level9_magnified',
      name: 'Magnified Strike',
      description: 'When you or an ally makes a ranged strike that draws a line through the crystal, the user gains a surge which they can use on the ability.',
      levelRequired: 9,
    },
  ],
};

// -----------------------------------------------------------------------------
// COMPLETE PORTFOLIO
// -----------------------------------------------------------------------------

export const elementalPortfolio: Portfolio = {
  type: 'elemental',
  signatureMinions: [emberSprite, stonekin, zephyrWisp],
  unlockedMinions: [
    magmaWalker, stormShard, tidalServant,
    fireElemental, earthElemental, airElemental,
    primordialGolem, stormLord, tsunamiSpirit,
  ],
  fixture: primordialCrystal,
  champion: null,
};
