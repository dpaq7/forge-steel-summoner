// Standard action economy options from Draw Steel
import { Ability } from '../types';

// Standard Maneuvers available to all heroes
export const standardManeuvers: Ability[] = [
  {
    id: 'aid_attack',
    name: 'Aid Attack',
    actionType: 'maneuver',
    keywords: [],
    distance: 'Reach 1',
    target: 'One ally',
    effect: 'The target gains an Edge on their next attack roll before the end of their next turn.',
  },
  {
    id: 'catch_breath',
    name: 'Catch Breath',
    actionType: 'maneuver',
    keywords: [],
    distance: 'Self',
    target: 'Self',
    effect: 'Spend one Recovery to regain Stamina equal to your Recovery Value.',
  },
  {
    id: 'drink_potion',
    name: 'Drink a Potion',
    actionType: 'maneuver',
    keywords: [],
    distance: 'Self',
    target: 'Self',
    effect: 'Consume a potion you are carrying and gain its effects.',
  },
  {
    id: 'grab',
    name: 'Grab',
    actionType: 'maneuver',
    keywords: [],
    distance: 'Reach 1',
    target: 'One creature your size or smaller',
    effect: 'Make a Might test vs the target\'s Might. On success, the target is grabbed (restrained until they escape or you release them).',
  },
  {
    id: 'hide',
    name: 'Hide',
    actionType: 'maneuver',
    keywords: [],
    distance: 'Self',
    target: 'Self',
    effect: 'Make an Agility test to become hidden if you are concealed or behind cover. Enemies cannot target you with abilities that require line of sight until you attack or move into the open.',
  },
  {
    id: 'make_assist_test',
    name: 'Make or Assist a Test',
    actionType: 'maneuver',
    keywords: [],
    distance: 'Varies',
    target: 'Varies',
    effect: 'Make a skill test (climbing, jumping, etc.) or assist an ally with their test, granting them an Edge.',
  },
  {
    id: 'search',
    name: 'Search',
    actionType: 'maneuver',
    keywords: [],
    distance: 'Self',
    target: 'Area within 10 squares',
    effect: 'Make an Intuition test to search for hidden creatures or objects in the area.',
  },
  {
    id: 'stand_up',
    name: 'Stand Up',
    actionType: 'maneuver',
    keywords: [],
    distance: 'Self',
    target: 'Self',
    effect: 'If you are prone, you stand up.',
  },
];

// Standard Triggered Actions available to all heroes
export const standardTriggeredActions: Ability[] = [
  {
    id: 'opportunity_attack',
    name: 'Opportunity Attack',
    actionType: 'triggered',
    trigger: 'An enemy within your reach moves away from you without disengaging',
    keywords: ['Melee', 'Weapon'],
    distance: 'Reach 1',
    target: 'The triggering enemy',
    effect: 'Make a free strike against the target.',
  },
  {
    id: 'free_strike',
    name: 'Free Strike',
    actionType: 'triggered',
    trigger: 'When triggered by an ability or opportunity',
    keywords: ['Weapon'],
    distance: 'Varies by weapon',
    target: 'One creature',
    effect: 'Make a basic attack dealing your weapon damage. Usually triggered by opportunity attacks or abilities that grant free strikes.',
  },
];

// Move action options
export const moveActions: Ability[] = [
  {
    id: 'advance',
    name: 'Advance',
    actionType: 'action',
    keywords: ['Move'],
    distance: 'Self',
    target: 'Self',
    effect: 'Move up to your Speed in squares. Provokes opportunity attacks if you leave an enemy\'s reach.',
  },
  {
    id: 'disengage',
    name: 'Disengage',
    actionType: 'action',
    keywords: ['Move'],
    distance: 'Self',
    target: 'Self',
    effect: 'Shift 1 square. This movement does not provoke opportunity attacks.',
  },
];

// Summoner-specific quick commands (triggered actions from formations)
export interface QuickCommand {
  id: string;
  name: string;
  formation: string;
  trigger: string;
  effect: string;
}

export const quickCommands: QuickCommand[] = [
  // Horde Formation
  {
    id: 'swarm_strike',
    name: 'Swarm Strike',
    formation: 'horde',
    trigger: 'You use a triggered action to make a Free Strike or use a Signature Ability',
    effect: 'Roll 1d10. On 11+: Up to 3 minion targets make a free strike. On Crit (19-20): Each minion target makes a free strike.',
  },
  {
    id: 'sacrificial_shield',
    name: 'Sacrificial Shield',
    formation: 'horde',
    trigger: 'You would take damage',
    effect: 'Redirect the damage to one of your minions within Summoner\'s Range. The minion takes the damage instead.',
  },
  // Platoon Formation
  {
    id: 'tactical_repositioning',
    name: 'Tactical Repositioning',
    formation: 'platoon',
    trigger: 'An ally ends their turn',
    effect: 'One of your minions within Summoner\'s Range can shift up to 2 squares.',
  },
  {
    id: 'coordinated_assault',
    name: 'Coordinated Assault',
    formation: 'platoon',
    trigger: 'One of your minions hits with an attack',
    effect: 'The next ally to attack that target before the end of your next turn gains an Edge.',
  },
  // Elite Formation
  {
    id: 'champion_strike',
    name: 'Champion Strike',
    formation: 'elite',
    trigger: 'You use your action to command a single minion',
    effect: 'That minion deals +R damage on their next attack this turn.',
  },
  {
    id: 'bodyguard',
    name: 'Bodyguard',
    formation: 'elite',
    trigger: 'An ally within 3 squares of one of your minions would take damage',
    effect: 'Your minion can take some or all of the damage instead.',
  },
  // Leader Formation
  {
    id: 'inspiring_presence',
    name: 'Inspiring Presence',
    formation: 'leader',
    trigger: 'You score a critical hit or reduce an enemy to 0 Stamina',
    effect: 'All your minions within Summoner\'s Range regain 1 Stamina.',
  },
  {
    id: 'rally_the_troops',
    name: 'Rally the Troops',
    formation: 'leader',
    trigger: 'One of your minions would be reduced to 0 Stamina',
    effect: 'That minion is instead reduced to 1 Stamina (once per round).',
  },
];

// All action economy options grouped
export const actionEconomy = {
  moveActions,
  standardManeuvers,
  standardTriggeredActions,
  quickCommands,
};
