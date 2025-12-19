/**
 * Summoner Minion Validation Utility
 *
 * Implements Draw Steel SRD summoning constraints:
 * 1. Essence - Must have sufficient essence (or free summon available)
 * 2. Max Minions - Cannot exceed max minion limit (8 base, 12 for Horde, +4 at L4)
 * 3. Max Squads - Cannot exceed 2 squads (unless adding to existing compatible squad)
 * 4. Squad Composition - All minions in a squad must share the same template
 * 5. Squad Size - Individual squad max is 8 minions
 */

import { SummonerHeroV2, Formation } from '../types/hero';
import { MinionTemplate, Squad } from '../types/minion';
import {
  calculateEssenceCost,
  calculateMaxMinions as calcMaxMinions,
  calculateSignatureMinionsPerTurn,
  calculateCombatStartMinions,
} from './calculations';

// =============================================================================
// TYPES
// =============================================================================

export type SummonConstraint =
  | 'essence'
  | 'maxMinions'
  | 'maxSquads'
  | 'squadComposition'
  | 'squadSize'
  | 'fixtureLevel';

export interface SummonValidationResult {
  canSummon: boolean;
  failedConstraint?: SummonConstraint;
  message: string;
  details: SummonValidationDetails;
}

export interface SummonValidationDetails {
  currentEssence: number;
  requiredEssence: number;
  currentMinions: number;
  maxMinions: number;
  currentSquads: number;
  maxSquads: number;
  minionsToSummon: number;
  isFreeSummon: boolean;
  targetSquadSize?: number;
}

export interface SummonOptions {
  targetSquadId?: string;
  isFreeSummon?: boolean;
  sacrificeCount?: number; // Minions sacrificed to reduce cost
}

// =============================================================================
// CONSTANTS (Summoner v1.0 SRD)
// =============================================================================

const MAX_SQUADS = 2;
const MAX_SQUAD_SIZE = 8;

// Note: Max minions and free summon counts are now calculated dynamically
// based on level and formation via functions in calculations.ts

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get maximum minions allowed based on formation and level
 * Summoner v1.0 SRD:
 * - Base: 8 minions
 * - Level 4+: +4 minions
 * - Level 7+: +4 minions
 * - Level 10: +4 minions
 * - Horde Formation: +4 additional
 *
 * Uses the central calculation from calculations.ts
 */
export function getMaxMinions(formation: Formation | undefined, level: number = 1): number {
  return calcMaxMinions(formation ?? 'platoon', level);
}

/**
 * Get number of free signature minions that can be summoned at turn/combat start
 * Summoner v1.0 SRD:
 * - Combat Start: 2 minions (base), +2 per 2 Victories at Level 10
 * - Turn Start: 3 minions (base), +1 at Level 7+, +1 for Horde
 *
 * Uses the central calculations from calculations.ts
 */
export function getFreeSummonCount(
  level: number,
  formation: Formation | undefined,
  isCombatStart: boolean,
  victories: number = 0
): number {
  if (isCombatStart) {
    return calculateCombatStartMinions(level, victories);
  }

  // Start of turn
  return calculateSignatureMinionsPerTurn(formation ?? 'platoon', level);
}

/**
 * Count total active minions across all squads
 */
export function countActiveMinions(squads: Squad[] | undefined): number {
  if (!squads || squads.length === 0) return 0;
  return squads.reduce((sum, squad) => sum + (squad.members?.length ?? 0), 0);
}

/**
 * Count alive minions across all squads
 */
export function countAliveMinions(squads: Squad[] | undefined): number {
  if (!squads || squads.length === 0) return 0;
  return squads.reduce((sum, squad) => {
    const aliveInSquad = squad.members?.filter(m => m.isAlive).length ?? 0;
    return sum + aliveInSquad;
  }, 0);
}

/**
 * Find a squad that can accept minions of the given template
 * Returns the squad if one exists with room, or null
 */
export function findCompatibleSquad(
  squads: Squad[] | undefined,
  templateId: string,
  minionsToAdd: number
): Squad | null {
  if (!squads) return null;

  return squads.find(
    s => s.templateId === templateId &&
         (s.members?.length ?? 0) + minionsToAdd <= MAX_SQUAD_SIZE
  ) ?? null;
}

/**
 * Check if minion template is a signature minion (1 essence cost)
 */
export function isSignatureMinion(template: MinionTemplate): boolean {
  return template.essenceCost === 1;
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Validate if a minion can be summoned
 * Checks ALL Draw Steel SRD constraints in order:
 * 1. Essence (unless free summon)
 * 2. Max minions
 * 3. Max squads (unless targeting existing squad or compatible squad exists)
 * 4. Squad composition (if targeting specific squad)
 * 5. Squad size (if adding to existing squad)
 */
export function validateSummon(
  hero: SummonerHeroV2,
  minionTemplate: MinionTemplate,
  options: SummonOptions = {}
): SummonValidationResult {
  const { targetSquadId, isFreeSummon = false, sacrificeCount = 0 } = options;

  // Calculate current state
  const currentEssence = hero.heroicResource?.current ?? 0;
  const activeSquads = hero.activeSquads ?? [];
  const currentMinions = countActiveMinions(activeSquads);
  const maxMinions = getMaxMinions(hero.formation, hero.level);
  const currentSquads = activeSquads.length;

  // Calculate costs
  const baseCost = minionTemplate.essenceCost;
  const formationAdjustedCost = calculateEssenceCost(baseCost, hero.formation);
  const adjustedCost = Math.max(0, formationAdjustedCost - sacrificeCount);
  const effectiveCost = isFreeSummon ? 0 : adjustedCost;
  const minionsToSummon = minionTemplate.minionsPerSummon ?? 1;

  // Build details object for debugging/UI feedback
  const details: SummonValidationDetails = {
    currentEssence,
    requiredEssence: effectiveCost,
    currentMinions,
    maxMinions,
    currentSquads,
    maxSquads: MAX_SQUADS,
    minionsToSummon,
    isFreeSummon,
  };

  // ========================================
  // CONSTRAINT 1: Essence check (skip if free summon)
  // ========================================
  if (!isFreeSummon && currentEssence < effectiveCost) {
    return {
      canSummon: false,
      failedConstraint: 'essence',
      message: `Insufficient essence: need ${effectiveCost}, have ${currentEssence}`,
      details,
    };
  }

  // ========================================
  // CONSTRAINT 2: Max minions check
  // ========================================
  if (currentMinions + minionsToSummon > maxMinions) {
    return {
      canSummon: false,
      failedConstraint: 'maxMinions',
      message: `Would exceed max minions: ${currentMinions + minionsToSummon} > ${maxMinions}`,
      details,
    };
  }

  // ========================================
  // CONSTRAINT 3: Max squads check (only if creating new squad)
  // ========================================
  if (!targetSquadId && currentSquads >= MAX_SQUADS) {
    // Check if we can add to an existing squad instead
    const compatibleSquad = findCompatibleSquad(activeSquads, minionTemplate.id, minionsToSummon);

    if (!compatibleSquad) {
      return {
        canSummon: false,
        failedConstraint: 'maxSquads',
        message: `Maximum squads reached (${currentSquads}/${MAX_SQUADS}) and no compatible squad available`,
        details,
      };
    }
    // If there's a compatible squad, we can still summon - they'll auto-join that squad
  }

  // ========================================
  // CONSTRAINT 4: Squad composition check (if targeting specific squad)
  // ========================================
  if (targetSquadId) {
    const targetSquad = activeSquads.find(s => s.id === targetSquadId);

    if (targetSquad) {
      // Check template match
      if (targetSquad.templateId !== minionTemplate.id) {
        return {
          canSummon: false,
          failedConstraint: 'squadComposition',
          message: 'All minions in a squad must have the same name',
          details,
        };
      }

      // ========================================
      // CONSTRAINT 5: Squad size check
      // ========================================
      const squadSize = targetSquad.members?.length ?? 0;
      details.targetSquadSize = squadSize;

      if (squadSize + minionsToSummon > MAX_SQUAD_SIZE) {
        return {
          canSummon: false,
          failedConstraint: 'squadSize',
          message: `Would exceed squad size: ${squadSize + minionsToSummon} > ${MAX_SQUAD_SIZE}`,
          details,
        };
      }
    }
  }

  // All constraints passed
  return {
    canSummon: true,
    message: 'Summon allowed',
    details,
  };
}

// =============================================================================
// FIXTURE VALIDATION
// =============================================================================

export interface FixtureValidationResult {
  canSummon: boolean;
  failedConstraint?: SummonConstraint;
  message: string;
  heroLevel: number;
  requiredLevel: number;
  fixtureActive: boolean;
}

/**
 * Validate if a fixture can be summoned
 * Draw Steel SRD: Fixture unlocks at Level 2 (Summoner's Dominion)
 */
export function validateFixtureSummon(hero: SummonerHeroV2): FixtureValidationResult {
  const requiredLevel = 2;
  const heroLevel = hero.level;
  const fixtureActive = hero.fixture?.isActive ?? false;

  // Check level requirement
  if (heroLevel < requiredLevel) {
    return {
      canSummon: false,
      failedConstraint: 'fixtureLevel',
      message: `Fixture unlocks at Level ${requiredLevel} (Summoner's Dominion)`,
      heroLevel,
      requiredLevel,
      fixtureActive,
    };
  }

  // Check if fixture is already active
  if (fixtureActive) {
    return {
      canSummon: false,
      message: 'Fixture is already active',
      heroLevel,
      requiredLevel,
      fixtureActive,
    };
  }

  return {
    canSummon: true,
    message: 'Fixture can be summoned',
    heroLevel,
    requiredLevel,
    fixtureActive,
  };
}

// =============================================================================
// HELPER FUNCTION: Get constraint failure reason for UI
// =============================================================================

export function getConstraintIcon(constraint: SummonConstraint): string {
  switch (constraint) {
    case 'essence':
      return '⚡'; // Essence
    case 'maxMinions':
      return '👥'; // Too many minions
    case 'maxSquads':
      return '🏴'; // Too many squads
    case 'squadComposition':
      return '🔗'; // Name mismatch
    case 'squadSize':
      return '📏'; // Squad full
    case 'fixtureLevel':
      return '🔒'; // Level locked
    default:
      return '❌';
  }
}

/**
 * Get a short reason string for UI display
 */
export function getShortFailureReason(result: SummonValidationResult): string {
  if (result.canSummon) return '';

  const { details } = result;

  switch (result.failedConstraint) {
    case 'essence':
      return `Need ${details.requiredEssence}★`;
    case 'maxMinions':
      return `${details.currentMinions}/${details.maxMinions} minions`;
    case 'maxSquads':
      return `${details.currentSquads}/${details.maxSquads} squads`;
    case 'squadComposition':
      return 'Wrong type';
    case 'squadSize':
      return 'Squad full';
    default:
      return 'Cannot summon';
  }
}
