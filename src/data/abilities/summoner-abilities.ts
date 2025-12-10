import { Ability } from '../../types';

// Level 1 Abilities
export const summonerStrike: Ability = {
  id: 'summoner_strike',
  name: 'Summoner Strike',
  flavorText: 'You channel essence through your weapon, striking with otherworldly power.',
  actionType: 'action',
  keywords: ['Magic', 'Melee', 'Strike', 'Weapon'],
  distance: 'Reach 1',
  target: 'One creature',
  powerRoll: {
    characteristic: 'presence',
    tier1: '2 + Presence damage',
    tier2: '6 + Presence damage',
    tier3: '9 + Presence damage',
  },
  effect: 'You gain 1 essence.',
};

export const strikeForMe: Ability = {
  id: 'strike_for_me',
  name: 'Strike For Me',
  flavorText: 'With a gesture, you command your minion to attack.',
  actionType: 'maneuver',
  keywords: ['Magic'],
  distance: 'Summoner\'s Range',
  target: 'One of your minions',
  effect:
    'The target minion makes a free strike. You can use this ability even if the minion has already acted this turn.',
};

export const minionBridge: Ability = {
  id: 'minion_bridge',
  name: 'Minion Bridge',
  flavorText: 'Your minions form a living pathway for your movement.',
  actionType: 'freeManeuver',
  keywords: [],
  distance: 'Self',
  target: 'Self',
  effect:
    'You can move through squares occupied by your minions without penalty. Additionally, once per turn when you move through a square occupied by one of your minions, you can teleport up to 3 squares.',
};

export const callForth: Ability = {
  id: 'call_forth',
  name: 'Call Forth',
  flavorText: 'You tear open a rift and summon creatures from beyond.',
  actionType: 'action',
  keywords: ['Magic'],
  distance: 'Summoner\'s Range',
  target: 'Special',
  effect:
    'Choose one minion template from your portfolio and spend essence equal to its cost. A new squad of that minion type appears in unoccupied squares within distance. The number of minions summoned is determined by the template. The squad can act on the turn it is summoned.',
  spendEssence:
    'You can spend additional essence when using this ability to summon multiple squads, following the normal essence spending limits.',
};

// Level 2 Abilities
export const summonersDominion: Ability = {
  id: 'summoners_dominion',
  name: 'Summoner\'s Dominion',
  flavorText: 'You establish your fixture, a monument to your otherworldly connection.',
  actionType: 'action',
  essenceCost: 2,
  keywords: ['Magic'],
  distance: 'Summoner\'s Range',
  target: 'Special',
  effect:
    'Your portfolio\'s fixture appears in unoccupied squares within distance. The fixture remains until it is reduced to 0 Stamina or until you summon it again in a new location. The fixture is an object with the stamina, size, and traits listed in its template.',
};

export const notYet: Ability = {
  id: 'not_yet',
  name: 'Not Yet!',
  flavorText: 'You refuse to let your minion fall.',
  actionType: 'freeTriggered',
  trigger: 'One of your minions is reduced to 0 Stamina',
  essenceCost: 5,
  keywords: ['Magic'],
  distance: 'Summoner\'s Range',
  target: 'The triggering minion',
  effect:
    'The minion is instead reduced to 1 Stamina and can immediately shift up to their speed.',
};

// Level 3 Abilities
export const summonersKit: Ability = {
  id: 'summoners_kit',
  name: 'Summoner\'s Kit',
  actionType: 'maneuver',
  essenceCost: 7,
  keywords: ['Magic'],
  distance: 'Self',
  target: 'Self',
  effect:
    'Your equipped kit transforms, taking on the characteristics of your portfolio. You gain one of the following benefits until the end of the encounter:\n\n• **Demon**: Your weapon attacks deal +5 fire damage and enemies you damage are taunted by you (EoT)\n• **Elemental**: You gain a fly speed equal to your speed and resistance 5 to one damage type of your choice\n• **Fey**: You can teleport up to 5 squares as a free maneuver once per round and you have concealment\n• **Undead**: You gain damage immunity 5 and your weapon attacks slow enemies (EoT)',
};

export const rise: Ability = {
  id: 'rise',
  name: 'Rise!',
  flavorText: 'Even in death, your minions return to serve.',
  actionType: 'freeTriggered',
  trigger: 'One of your minions is reduced to 0 Stamina',
  essenceCost: 7,
  keywords: ['Magic'],
  distance: 'Summoner\'s Range',
  target: 'Special',
  effect:
    'A new squad of signature minions from your portfolio appears in squares adjacent to the triggering minion. This does not count against your maximum number of minions.',
};

// Level 6 Abilities
export const minionMachinations: Ability = {
  id: 'minion_machinations',
  name: 'Minion Machinations',
  actionType: 'maneuver',
  essenceCost: 9,
  keywords: ['Magic'],
  distance: 'Summoner\'s Range',
  target: 'Up to three of your minions',
  effect:
    'Each target can immediately take a turn (move and use an action). This does not count as them having acted for the purposes of squad tracking.',
};

export const returnToTheSource: Ability = {
  id: 'return_to_the_source',
  name: 'Return to the Source',
  flavorText: 'You recall your minions, converting them back to essence.',
  actionType: 'freeManeuver',
  keywords: ['Magic'],
  distance: 'Summoner\'s Range',
  target: 'Any number of your minions',
  effect:
    'Dismiss any number of your minions. For each minion dismissed, gain 1 essence (up to your maximum essence per turn).',
};

// Level 9 Abilities
export const stewardOfTwoWorlds: Ability = {
  id: 'steward_of_two_worlds',
  name: 'Steward of Two Worlds',
  flavorText: 'You exist in both worlds simultaneously.',
  actionType: 'maneuver',
  essenceCost: 11,
  keywords: ['Magic'],
  distance: 'Self',
  target: 'Self',
  effect:
    'Until the end of the encounter, you gain the following benefits:\n\n• You can use Call Forth as a maneuver instead of an action\n• Your maximum essence per turn is increased by 3\n• Whenever one of your minions is reduced to 0 Stamina, you gain 2 essence\n• You can see through the eyes of any of your minions',
};

// Organize by level
export const summonerAbilitiesByLevel: Record<number, Ability[]> = {
  1: [summonerStrike, strikeForMe, minionBridge, callForth],
  2: [summonersDominion, notYet],
  3: [summonersKit, rise],
  6: [minionMachinations, returnToTheSource],
  9: [stewardOfTwoWorlds],
};

// Flat list of all abilities
export const allSummonerAbilities: Ability[] = Object.values(
  summonerAbilitiesByLevel
).flat();
