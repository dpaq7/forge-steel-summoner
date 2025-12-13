import { SummonerHero } from '../types';
import { Hero, SummonerHeroV2, HeroClass, isSummonerHero } from '../types/hero';
import { portfolios } from '../data/portfolios';
import { circleToPortfolio } from '../types/summoner';
import { calculateMaxStamina, calculateRecoveryValue, calculateMaxRecoveries } from './calculations';

// New storage keys for Mettle
const STORAGE_KEY = 'mettle-heroes';
const ACTIVE_CHARACTER_KEY = 'mettle-active-hero-id';

// Legacy storage keys for migration
const LEGACY_STORAGE_KEY = 'summoner_characters';
const LEGACY_ACTIVE_KEY = 'active_character_id';

/**
 * Check if we have legacy data that needs migration
 */
const hasLegacyData = (): boolean => {
  const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
  const newData = localStorage.getItem(STORAGE_KEY);
  return legacyData !== null && newData === null;
};

/**
 * Migrate legacy SummonerHero to new SummonerHeroV2 format
 */
const migrateSummonerToV2 = (legacy: Partial<SummonerHero>): SummonerHeroV2 => {
  // Refresh portfolio data from current definitions
  let portfolio = legacy.portfolio;
  if (legacy.circle && portfolio) {
    const portfolioType = circleToPortfolio[legacy.circle];
    const currentPortfolio = portfolios[portfolioType];

    // Keep user's selected signature minions but update with fresh data
    const selectedSignatureIds = portfolio.signatureMinions.map(m => m.id);
    const freshSignatureMinions = currentPortfolio.signatureMinions.filter(
      m => selectedSignatureIds.includes(m.id)
    );

    portfolio = {
      ...currentPortfolio,
      signatureMinions: freshSignatureMinions.length > 0
        ? freshSignatureMinions
        : portfolio.signatureMinions,
    };
  }

  // Recalculate recovery values with correct formula
  let recoveries = legacy.recoveries;
  if (legacy.circle && recoveries) {
    const maxRecoveries = calculateMaxRecoveries(legacy.circle);
    const recoveryValue = calculateRecoveryValue(legacy);
    recoveries = {
      ...recoveries,
      max: maxRecoveries,
      value: recoveryValue,
    };
  }

  // Convert essence pool to new heroic resource format
  const heroicResource = {
    type: 'essence' as const,
    current: legacy.essence?.current ?? 0,
    maxPerTurn: legacy.essence?.maxPerTurn ?? 5,
  };

  return {
    ...legacy,
    heroClass: 'summoner' as const,
    heroicResource,
    // Add missing fields with defaults
    victories: legacy.victories ?? 0,
    xp: legacy.xp ?? 0,
    wealth: legacy.wealth ?? 2,
    gold: legacy.gold ?? 0,
    renown: legacy.renown ?? 0,
    heroTokens: legacy.heroTokens ?? 0,
    surges: legacy.surges ?? 0,
    progressionChoices: legacy.progressionChoices ?? {},
    activeConditions: legacy.activeConditions ?? [],
    equippedItems: legacy.equippedItems ?? [],
    minionPortraits: legacy.minionPortraits ?? {},
    fixturePortrait: legacy.fixturePortrait ?? null,
    inactiveMinions: legacy.inactiveMinions ?? [],
    activeProjects: legacy.activeProjects ?? [],
    inventory: legacy.inventory ?? [],
    // Refresh portfolio with latest data
    portfolio: portfolio ?? legacy.portfolio,
    // Refresh recovery values
    recoveries: recoveries ?? legacy.recoveries,
  } as SummonerHeroV2;
};

/**
 * Migrate older character data to include new fields and refresh portfolio data
 * This handles both legacy SummonerHero and already-migrated Hero data
 */
const migrateCharacter = (character: Partial<SummonerHero> | Partial<Hero>): Hero => {
  // Check if this is already a new Hero type (has heroClass field)
  if ('heroClass' in character && character.heroClass) {
    // Already migrated, just ensure all fields are present
    if (character.heroClass === 'summoner') {
      return migrateSummonerToV2(character as Partial<SummonerHero>);
    }
    // For other classes, return as-is for now (they will be created with new system)
    return character as Hero;
  }

  // Legacy SummonerHero without heroClass - migrate to V2
  return migrateSummonerToV2(character as Partial<SummonerHero>);
};

/**
 * Migrate legacy storage to new format
 */
const migrateLegacyStorage = (): void => {
  if (!hasLegacyData()) return;

  try {
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyData) return;

    const legacyCharacters = JSON.parse(legacyData);
    const migratedCharacters = legacyCharacters.map((stored: StoredCharacter) => ({
      ...stored,
      data: migrateCharacter(stored.data),
    }));

    // Save to new storage key
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedCharacters));

    // Migrate active character ID
    const legacyActiveId = localStorage.getItem(LEGACY_ACTIVE_KEY);
    if (legacyActiveId) {
      localStorage.setItem(ACTIVE_CHARACTER_KEY, legacyActiveId);
    }

    console.log(`Migrated ${migratedCharacters.length} characters from legacy storage`);
  } catch (error) {
    console.error('Error migrating legacy storage:', error);
  }
};

// Auto-run migration on module load
migrateLegacyStorage();

export interface StoredCharacter {
  id: string;
  name: string;
  level: number;
  lastModified: number;
  data: Hero;
  heroClass?: HeroClass; // Added for quick filtering
}

/**
 * Get all stored characters
 */
export const getAllCharacters = (): StoredCharacter[] => {
  try {
    // Try new storage key first
    let stored = localStorage.getItem(STORAGE_KEY);

    // Fall back to legacy key if new key is empty
    if (!stored) {
      stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        // Migrate on the fly
        migrateLegacyStorage();
        stored = localStorage.getItem(STORAGE_KEY);
      }
    }

    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading characters:', error);
    return [];
  }
};

/**
 * Save a character to localStorage
 */
export const saveCharacter = (character: Hero): void => {
  try {
    const characters = getAllCharacters();
    const existingIndex = characters.findIndex((c) => c.id === character.id);

    const storedCharacter: StoredCharacter = {
      id: character.id,
      name: character.name,
      level: character.level,
      lastModified: Date.now(),
      data: character,
      heroClass: character.heroClass,
    };

    if (existingIndex >= 0) {
      characters[existingIndex] = storedCharacter;
    } else {
      characters.push(storedCharacter);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  } catch (error) {
    console.error('Error saving character:', error);
  }
};

/**
 * Load a character by ID
 */
export const loadCharacter = (id: string): Hero | null => {
  try {
    const characters = getAllCharacters();
    const character = characters.find((c) => c.id === id);
    return character ? migrateCharacter(character.data) : null;
  } catch (error) {
    console.error('Error loading character:', error);
    return null;
  }
};

/**
 * Delete a character
 */
export const deleteCharacter = (id: string): void => {
  try {
    const characters = getAllCharacters();
    const filtered = characters.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // If this was the active character, clear it
    if (getActiveCharacterId() === id) {
      setActiveCharacterId(null);
    }
  } catch (error) {
    console.error('Error deleting character:', error);
  }
};

/**
 * Get active character ID
 */
export const getActiveCharacterId = (): string | null => {
  // Try new key first, fall back to legacy
  return localStorage.getItem(ACTIVE_CHARACTER_KEY) || localStorage.getItem(LEGACY_ACTIVE_KEY);
};

/**
 * Set active character ID
 */
export const setActiveCharacterId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(ACTIVE_CHARACTER_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_CHARACTER_KEY);
  }
};

/**
 * Export character to JSON
 */
export const exportCharacterToJSON = (character: Hero): string => {
  return JSON.stringify(character, null, 2);
};

/**
 * Import character from JSON
 */
export const importCharacterFromJSON = (json: string): Hero | null => {
  try {
    const character = JSON.parse(json);
    // Basic validation
    if (!character.id || !character.name || !character.level) {
      throw new Error('Invalid character data');
    }
    // Migrate to ensure all fields are present
    return migrateCharacter(character);
  } catch (error) {
    console.error('Error importing character:', error);
    return null;
  }
};

/**
 * Auto-save character (debounced in practice)
 */
export const autoSaveCharacter = (character: Hero): void => {
  saveCharacter(character);
};

/**
 * Get characters filtered by class
 */
export const getCharactersByClass = (heroClass: HeroClass): StoredCharacter[] => {
  return getAllCharacters().filter(c => c.heroClass === heroClass || c.data.heroClass === heroClass);
};

/**
 * Clear all legacy storage (after confirmed successful migration)
 */
export const clearLegacyStorage = (): void => {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem(LEGACY_ACTIVE_KEY);
};

// ===============================
// Legacy compatibility exports
// These allow existing code to work while transitioning
// ===============================

/**
 * Save a SummonerHero (legacy compatibility)
 * @deprecated Use saveCharacter with Hero type instead
 */
export const saveSummonerCharacter = (character: SummonerHero): void => {
  const migratedHero = migrateCharacter(character);
  saveCharacter(migratedHero);
};

/**
 * Load a SummonerHero by ID (legacy compatibility)
 * @deprecated Use loadCharacter with Hero type instead
 */
export const loadSummonerCharacter = (id: string): SummonerHeroV2 | null => {
  const hero = loadCharacter(id);
  if (hero && isSummonerHero(hero)) {
    return hero;
  }
  return null;
};
