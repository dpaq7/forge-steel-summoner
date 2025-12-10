import { Formation, QuickCommand } from '../types';

export interface FormationData {
  id: Formation;
  name: string;
  description: string;
  benefits: string[];
  quickCommands: QuickCommand[];
}

// SRD Quick Commands - can be selected with any formation
const quickCommands: QuickCommand[] = [
  {
    id: 'qc_focus_fire',
    name: 'Focus Fire!',
    description:
      'Trigger: Ally deals damage. Effect: Target gains 1 Surge per adjacent minion (Max 3). Spend 1 Essence: Add Edge to the triggering power roll.',
    formation: 'horde', // Default assignment
  },
  {
    id: 'qc_halt',
    name: 'Halt!',
    description:
      'Trigger: Creature moves or starts turn in range. Effect: Summon Signature Minion adjacent to target OR Shift existing minion to target. If target force-moved into minion, you can negate collision damage.',
    formation: 'platoon', // Default assignment
  },
  {
    id: 'qc_not_yet',
    name: 'Not Yet!',
    description:
      'Cost: 3 Essence. Trigger: Ally or Minion (if last in squad) would die. Effect: Negate death; target remains at 1 Stamina.',
    formation: 'elite', // Default assignment
  },
  {
    id: 'qc_shield',
    name: 'Shield!',
    description:
      'Trigger: Ally or Self targeted by strike. Effect: Adjacent minion becomes new target. Spend 1 Essence: Summon new Signature Minion adjacent to target to take the hit.',
    formation: 'leader', // Default assignment
  },
];

export const formations: Record<Formation, FormationData> = {
  horde: {
    id: 'horde',
    name: 'Horde',
    description:
      'You overwhelm your enemies with sheer numbers, commanding a vast army of minions.',
    benefits: [
      'Maximum minions increased to 12 (from 8)',
      'Start of turn summon count increased to 4 (from 3)',
    ],
    quickCommands: quickCommands,
  },
  platoon: {
    id: 'platoon',
    name: 'Platoon',
    description:
      'Your squad damage abilities deal +R damage to one target.',
    benefits: [
      'Squad damage abilities deal +Reason damage to one target',
    ],
    quickCommands: quickCommands,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    description:
      'All your minions are tougher and more resilient.',
    benefits: [
      'All minions get +3 Stamina',
      'All minions get +1 Stability',
    ],
    quickCommands: quickCommands,
  },
  leader: {
    id: 'leader',
    name: 'Leader',
    description:
      'You fight alongside your minions, protecting them and being protected in turn.',
    benefits: [
      'Ignore overflow damage from squad wipe',
      'Can take damage for minion in range',
      'Allows Light Armor/Weapon usage',
    ],
    quickCommands: quickCommands,
  },
};

// Export the unique list of quick commands
export const allQuickCommands: QuickCommand[] = quickCommands;
