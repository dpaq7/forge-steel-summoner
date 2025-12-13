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
 * Edge/Bane state for a roll
 * Draw Steel Rules:
 * - Single Edge: +2 bonus to the roll
 * - Single Bane: -2 penalty to the roll
 * - Double Edge (2+ edges, 0 banes): No bonus, tier +1 (max tier 3)
 * - Double Bane (2+ banes, 0 edges): No penalty, tier -1 (min tier 1)
 * - Edges and banes cancel each other out
 */
export interface EdgeBaneState {
  edges: number;
  banes: number;
}

/**
 * Resolved edge/bane effect after cancellation
 */
export type ResolvedEdgeBane =
  | { type: 'normal' }
  | { type: 'edge'; bonus: number }      // +2 bonus
  | { type: 'bane'; penalty: number }    // -2 penalty
  | { type: 'doubleEdge' }               // Tier +1
  | { type: 'doubleBane' };              // Tier -1

/**
 * Resolve edges and banes after cancellation
 * Rules:
 * - 1 edge + 1 bane = normal
 * - Double edge + double bane = normal
 * - Double edge + 1 bane = single edge (+2)
 * - Double bane + 1 edge = single bane (-2)
 */
export const resolveEdgeBane = (state: EdgeBaneState): ResolvedEdgeBane => {
  const netEdges = state.edges - state.banes;

  if (netEdges === 0) {
    return { type: 'normal' };
  } else if (netEdges === 1) {
    return { type: 'edge', bonus: 2 };
  } else if (netEdges >= 2) {
    return { type: 'doubleEdge' };
  } else if (netEdges === -1) {
    return { type: 'bane', penalty: 2 };
  } else {
    // netEdges <= -2
    return { type: 'doubleBane' };
  }
};

/**
 * Get display text for resolved edge/bane
 */
export const getEdgeBaneDisplay = (resolved: ResolvedEdgeBane): string => {
  switch (resolved.type) {
    case 'normal': return 'Normal';
    case 'edge': return 'Edge (+2)';
    case 'bane': return 'Bane (-2)';
    case 'doubleEdge': return '2× Edge (Tier +1)';
    case 'doubleBane': return '2× Bane (Tier -1)';
  }
};

/**
 * Detailed roll result for UI display
 */
export interface PowerRollResult {
  naturalRoll: number;
  dice: [number, number];
  modifier: number;           // Characteristic modifier
  edgeBaneBonus: number;      // +2 for edge, -2 for bane, 0 for normal/double
  total: number;              // naturalRoll + modifier + edgeBaneBonus
  baseTier: 1 | 2 | 3;        // Tier before double edge/bane adjustment
  tier: 1 | 2 | 3;            // Final tier after adjustments
  tierAdjustment: number;     // +1 for double edge, -1 for double bane, 0 otherwise
  edgeBaneState: EdgeBaneState;
  resolvedEdgeBane: ResolvedEdgeBane;
  timestamp: number;
  // Legacy compatibility fields
  hadEdge: boolean;
  hadBane: boolean;
}

/**
 * Legacy roll modifier type (for backward compatibility)
 */
export type RollModifier = 'normal' | 'edge' | 'bane' | 'doubleEdge' | 'doubleBane';

/**
 * Convert legacy RollModifier to EdgeBaneState
 */
export const rollModifierToEdgeBane = (modifier: RollModifier): EdgeBaneState => {
  switch (modifier) {
    case 'normal': return { edges: 0, banes: 0 };
    case 'edge': return { edges: 1, banes: 0 };
    case 'bane': return { edges: 0, banes: 1 };
    case 'doubleEdge': return { edges: 2, banes: 0 };
    case 'doubleBane': return { edges: 0, banes: 2 };
  }
};

/**
 * Convert EdgeBaneState to display RollModifier (for UI cycling)
 */
export const edgeBaneToRollModifier = (state: EdgeBaneState): RollModifier => {
  const resolved = resolveEdgeBane(state);
  switch (resolved.type) {
    case 'normal': return 'normal';
    case 'edge': return 'edge';
    case 'bane': return 'bane';
    case 'doubleEdge': return 'doubleEdge';
    case 'doubleBane': return 'doubleBane';
  }
};

/**
 * Perform a full power roll with Draw Steel edge/bane mechanics
 *
 * Rules:
 * - Roll 2d10 + characteristic modifier
 * - Single Edge: Add +2 to the roll
 * - Single Bane: Subtract 2 from the roll
 * - Double Edge: Don't modify roll, but increase tier by 1 (max tier 3)
 * - Double Bane: Don't modify roll, but decrease tier by 1 (min tier 1)
 */
export const performPowerRoll = (
  characteristicValue: number,
  rollModifierOrState: RollModifier | EdgeBaneState = 'normal'
): PowerRollResult => {
  // Convert legacy modifier to edge/bane state
  const edgeBaneState: EdgeBaneState = typeof rollModifierOrState === 'string'
    ? rollModifierToEdgeBane(rollModifierOrState)
    : rollModifierOrState;

  // Resolve edge/bane after cancellation
  const resolved = resolveEdgeBane(edgeBaneState);

  // Roll 2d10
  const roll = rollPowerRoll();
  const naturalRoll = roll.total;
  const dice = roll.dice;

  // Calculate edge/bane bonus (only for single edge/bane)
  let edgeBaneBonus = 0;
  if (resolved.type === 'edge') {
    edgeBaneBonus = resolved.bonus; // +2
  } else if (resolved.type === 'bane') {
    edgeBaneBonus = -resolved.penalty; // -2
  }

  // Calculate total
  const total = naturalRoll + characteristicValue + edgeBaneBonus;

  // Determine base tier
  const baseTier = getPowerRollTier(total);

  // Apply tier adjustment for double edge/bane
  let tierAdjustment = 0;
  let finalTier: 1 | 2 | 3 = baseTier;

  if (resolved.type === 'doubleEdge') {
    tierAdjustment = 1;
    finalTier = Math.min(3, baseTier + 1) as 1 | 2 | 3;
  } else if (resolved.type === 'doubleBane') {
    tierAdjustment = -1;
    finalTier = Math.max(1, baseTier - 1) as 1 | 2 | 3;
  }

  return {
    naturalRoll,
    dice,
    modifier: characteristicValue,
    edgeBaneBonus,
    total,
    baseTier,
    tier: finalTier,
    tierAdjustment,
    edgeBaneState,
    resolvedEdgeBane: resolved,
    timestamp: Date.now(),
    // Legacy compatibility
    hadEdge: resolved.type === 'edge' || resolved.type === 'doubleEdge',
    hadBane: resolved.type === 'bane' || resolved.type === 'doubleBane',
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
