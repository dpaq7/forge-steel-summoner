// Draw Steel Ancestries Data Module
// Contains ancestry definitions and helper functions for point-buy system

import { AncestryDefinition, AncestryPurchasedTrait } from '../../types/ancestry';
import ancestryDataJson from './draw-steel-ancestries.json';

// Type assertion for the JSON data
const ancestryData = ancestryDataJson as {
  _meta: {
    description: string;
    usage: string;
    source: string;
    license: string;
    totalAncestries: number;
  };
  ancestries: AncestryDefinition[];
};

/**
 * All ancestry definitions from the Draw Steel SRD
 */
export const ANCESTRIES: AncestryDefinition[] = ancestryData.ancestries;

/**
 * Get an ancestry by its ID
 */
export function getAncestryById(id: string): AncestryDefinition | undefined {
  return ANCESTRIES.find(a => a.id === id);
}

/**
 * Get an ancestry by its name (case-insensitive)
 */
export function getAncestryByName(name: string): AncestryDefinition | undefined {
  return ANCESTRIES.find(a => a.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get a purchased trait by ID within an ancestry
 */
export function getAncestryTraitById(
  ancestryId: string,
  traitId: string
): AncestryPurchasedTrait | undefined {
  const ancestry = getAncestryById(ancestryId);
  return ancestry?.purchasedTraits.find(t => t.id === traitId);
}

/**
 * Get multiple purchased traits by their IDs within an ancestry
 */
export function getAncestryTraitsByIds(
  ancestryId: string,
  traitIds: string[]
): AncestryPurchasedTrait[] {
  const ancestry = getAncestryById(ancestryId);
  if (!ancestry) return [];

  return traitIds
    .map(id => ancestry.purchasedTraits.find(t => t.id === id))
    .filter((t): t is AncestryPurchasedTrait => t !== undefined);
}

/**
 * Calculate total points spent on selected traits
 */
export function calculateSpentPoints(
  ancestry: AncestryDefinition,
  selectedTraitIds: string[]
): number {
  return selectedTraitIds.reduce((total, traitId) => {
    const trait = ancestry.purchasedTraits.find(t => t.id === traitId);
    return total + (trait?.cost ?? 0);
  }, 0);
}

/**
 * Calculate remaining points after selection
 */
export function calculateRemainingPoints(
  ancestry: AncestryDefinition,
  selectedTraitIds: string[]
): number {
  return ancestry.ancestryPoints - calculateSpentPoints(ancestry, selectedTraitIds);
}

/**
 * Get trait IDs for the quick build recommendation
 * Matches trait names from quickBuild array to actual trait IDs
 */
export function getQuickBuildTraitIds(ancestry: AncestryDefinition): string[] {
  return ancestry.purchasedTraits
    .filter(trait =>
      ancestry.quickBuild.some(qb => {
        // Handle cases like "Psionic Gift (Psionic Bolt)" by extracting the base name
        const baseName = qb.split('(')[0].trim().toLowerCase();
        return trait.name.toLowerCase().includes(baseName) ||
               baseName.includes(trait.name.toLowerCase());
      })
    )
    .map(t => t.id);
}

/**
 * Check if a trait selection is valid (within point budget)
 */
export function isValidTraitSelection(
  ancestry: AncestryDefinition,
  selectedTraitIds: string[]
): boolean {
  const spent = calculateSpentPoints(ancestry, selectedTraitIds);
  return spent <= ancestry.ancestryPoints;
}

/**
 * Get ancestries that have complete trait data (purchasedTraits.length > 0)
 */
export function getCompleteAncestries(): AncestryDefinition[] {
  return ANCESTRIES.filter(a => a.purchasedTraits.length > 0);
}

/**
 * Get ancestries that are missing trait data (incomplete)
 */
export function getIncompleteAncestries(): AncestryDefinition[] {
  return ANCESTRIES.filter(a => a.purchasedTraits.length === 0);
}

/**
 * Check if an ancestry has complete trait data
 */
export function isAncestryComplete(ancestryId: string): boolean {
  const ancestry = getAncestryById(ancestryId);
  return ancestry ? ancestry.purchasedTraits.length > 0 : false;
}

/**
 * Get all ancestry IDs
 */
export function getAllAncestryIds(): string[] {
  return ANCESTRIES.map(a => a.id);
}

/**
 * Get ancestry metadata
 */
export function getAncestryMeta() {
  return ancestryData._meta;
}
