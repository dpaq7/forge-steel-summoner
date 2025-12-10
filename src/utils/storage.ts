import { SummonerHero } from '../types';
import { portfolios } from '../data/portfolios';
import { circleToPortfolio } from '../types/summoner';
import { calculateMaxStamina, calculateRecoveryValue, calculateMaxRecoveries } from './calculations';

const STORAGE_KEY = 'summoner_characters';
const ACTIVE_CHARACTER_KEY = 'active_character_id';

/**
 * Migrate older character data to include new fields and refresh portfolio data
 */
const migrateCharacter = (character: Partial<SummonerHero>): SummonerHero => {
  // Refresh portfolio data from current definitions
  let portfolio = character.portfolio;
  if (character.circle && portfolio) {
    const portfolioType = circleToPortfolio[character.circle];
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
  let recoveries = character.recoveries;
  if (character.circle && recoveries) {
    const maxRecoveries = calculateMaxRecoveries(character.circle);
    const recoveryValue = calculateRecoveryValue(character);
    recoveries = {
      ...recoveries,
      max: maxRecoveries,
      value: recoveryValue,
    };
  }

  return {
    ...character,
    // Add missing fields with defaults
    victories: character.victories ?? 0,
    progressionChoices: character.progressionChoices ?? {},
    activeConditions: character.activeConditions ?? [],
    equippedItems: character.equippedItems ?? [],
    // Refresh portfolio with latest data
    portfolio: portfolio ?? character.portfolio,
    // Refresh recovery values
    recoveries: recoveries ?? character.recoveries,
  } as SummonerHero;
};

export interface StoredCharacter {
  id: string;
  name: string;
  level: number;
  lastModified: number;
  data: SummonerHero;
}

/**
 * Get all stored characters
 */
export const getAllCharacters = (): StoredCharacter[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading characters:', error);
    return [];
  }
};

/**
 * Save a character to localStorage
 */
export const saveCharacter = (character: SummonerHero): void => {
  try {
    const characters = getAllCharacters();
    const existingIndex = characters.findIndex((c) => c.id === character.id);

    const storedCharacter: StoredCharacter = {
      id: character.id,
      name: character.name,
      level: character.level,
      lastModified: Date.now(),
      data: character,
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
export const loadCharacter = (id: string): SummonerHero | null => {
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
  return localStorage.getItem(ACTIVE_CHARACTER_KEY);
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
export const exportCharacterToJSON = (character: SummonerHero): string => {
  return JSON.stringify(character, null, 2);
};

/**
 * Import character from JSON
 */
export const importCharacterFromJSON = (json: string): SummonerHero | null => {
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
export const autoSaveCharacter = (character: SummonerHero): void => {
  saveCharacter(character);
};
