/**
 * Roll a die with the specified number of sides
 */
export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Roll multiple dice and return the sum
 */
export const rollDice = (count: number, sides: number): number => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += rollDie(sides);
  }
  return total;
};

/**
 * Roll 2d10 for a power roll (Draw Steel uses 2d10, not d20)
 */
export const rollPowerRoll = (): { total: number; dice: [number, number] } => {
  const die1 = rollDie(10);
  const die2 = rollDie(10);
  return { total: die1 + die2, dice: [die1, die2] };
};

/**
 * Roll a d6 for a characteristic roll (in Draw Steel, you add characteristic scores, not modifiers)
 */
export const rollCharacteristic = (): number => {
  return rollDie(6);
};

/**
 * Determine power roll tier based on the roll
 * Tier 1: 2-11
 * Tier 2: 12-16
 * Tier 3: 17+
 */
export const getPowerRollTier = (roll: number): 1 | 2 | 3 => {
  if (roll >= 17) return 3;
  if (roll >= 12) return 2;
  return 1;
};

/**
 * Roll with advantage (edge in Draw Steel terms) - roll twice, take higher
 */
export const rollWithEdge = (): number => {
  const roll1 = rollPowerRoll();
  const roll2 = rollPowerRoll();
  return Math.max(roll1.total, roll2.total);
};

/**
 * Roll with disadvantage (bane in Draw Steel terms) - roll twice, take lower
 */
export const rollWithBane = (): number => {
  const roll1 = rollPowerRoll();
  const roll2 = rollPowerRoll();
  return Math.min(roll1.total, roll2.total);
};

/**
 * Parse dice notation like "2d6" or "1d20"
 */
export const parseDiceNotation = (notation: string): { count: number; sides: number } | null => {
  const match = notation.match(/^(\d+)d(\d+)$/i);
  if (!match) return null;

  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
  };
};

/**
 * Roll dice from notation like "2d6"
 */
export const rollDiceNotation = (notation: string): number | null => {
  const parsed = parseDiceNotation(notation);
  if (!parsed) return null;

  return rollDice(parsed.count, parsed.sides);
};

/**
 * Format a roll result for display
 */
export const formatRollResult = (roll: number, modifier: number = 0): string => {
  const total = roll + modifier;
  if (modifier === 0) return `${total}`;
  if (modifier > 0) return `${total} (${roll} + ${modifier})`;
  return `${total} (${roll} - ${Math.abs(modifier)})`;
};

/**
 * Detailed roll result for UI display
 */
export interface PowerRollResult {
  naturalRoll: number;
  dice: [number, number]; // The two d10s that made up the natural roll
  secondRoll?: number; // For edge/bane - the discarded 2d10 total
  secondDice?: [number, number]; // For edge/bane - the discarded dice
  modifier: number;
  total: number;
  tier: 1 | 2 | 3;
  hadEdge: boolean;
  hadBane: boolean;
  timestamp: number;
}

/**
 * Roll type for edges and banes
 */
export type RollModifier = 'normal' | 'edge' | 'bane' | 'doubleEdge' | 'doubleBane';

/**
 * Perform a full power roll with characteristic modifier (2d10 system)
 */
export const performPowerRoll = (
  characteristicValue: number,
  rollModifier: RollModifier = 'normal'
): PowerRollResult => {
  let naturalRoll: number;
  let dice: [number, number];
  let secondRoll: number | undefined;
  let secondDice: [number, number] | undefined;

  if (rollModifier === 'normal') {
    const roll = rollPowerRoll();
    naturalRoll = roll.total;
    dice = roll.dice;
  } else if (rollModifier === 'edge') {
    const roll1 = rollPowerRoll();
    const roll2 = rollPowerRoll();
    if (roll1.total >= roll2.total) {
      naturalRoll = roll1.total;
      dice = roll1.dice;
      secondRoll = roll2.total;
      secondDice = roll2.dice;
    } else {
      naturalRoll = roll2.total;
      dice = roll2.dice;
      secondRoll = roll1.total;
      secondDice = roll1.dice;
    }
  } else if (rollModifier === 'bane') {
    const roll1 = rollPowerRoll();
    const roll2 = rollPowerRoll();
    if (roll1.total <= roll2.total) {
      naturalRoll = roll1.total;
      dice = roll1.dice;
      secondRoll = roll2.total;
      secondDice = roll2.dice;
    } else {
      naturalRoll = roll2.total;
      dice = roll2.dice;
      secondRoll = roll1.total;
      secondDice = roll1.dice;
    }
  } else if (rollModifier === 'doubleEdge') {
    const roll1 = rollPowerRoll();
    const roll2 = rollPowerRoll();
    const roll3 = rollPowerRoll();
    const rolls = [roll1, roll2, roll3].sort((a, b) => b.total - a.total);
    naturalRoll = rolls[0].total;
    dice = rolls[0].dice;
    secondRoll = rolls[1].total;
    secondDice = rolls[1].dice;
  } else {
    // doubleBane
    const roll1 = rollPowerRoll();
    const roll2 = rollPowerRoll();
    const roll3 = rollPowerRoll();
    const rolls = [roll1, roll2, roll3].sort((a, b) => a.total - b.total);
    naturalRoll = rolls[0].total;
    dice = rolls[0].dice;
    secondRoll = rolls[1].total;
    secondDice = rolls[1].dice;
  }

  const total = naturalRoll + characteristicValue;
  const tier = getPowerRollTier(total);

  return {
    naturalRoll,
    dice,
    secondRoll,
    secondDice,
    modifier: characteristicValue,
    total,
    tier,
    hadEdge: rollModifier === 'edge' || rollModifier === 'doubleEdge',
    hadBane: rollModifier === 'bane' || rollModifier === 'doubleBane',
    timestamp: Date.now(),
  };
};

/**
 * Get tier description text
 */
export const getTierName = (tier: 1 | 2 | 3): string => {
  switch (tier) {
    case 1:
      return 'Tier 1';
    case 2:
      return 'Tier 2';
    case 3:
      return 'Tier 3';
  }
};

/**
 * Get tier color for styling
 */
export const getTierColor = (tier: 1 | 2 | 3): string => {
  switch (tier) {
    case 1:
      return '#ef5350'; // Red
    case 2:
      return '#ffa726'; // Orange
    case 3:
      return '#66bb6a'; // Green
  }
};
