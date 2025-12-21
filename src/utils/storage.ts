import { SummonerHero } from '../types';
import { Hero, SummonerHeroV2, HeroClass, isSummonerHero } from '../types/hero';
import { HeroAncestry } from '../types/ancestry';
import { portfolios } from '../data/portfolios';
import { circleToPortfolio } from '../types/summoner';
import { getAncestryByName, getAncestryById } from '../data/ancestries';
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
const migrateSummonerToV2 = (legacy: Partial<SummonerHero> & { subclass?: string }): SummonerHeroV2 => {
  // Get subclass (could be from new 'subclass' field or old 'circle' field)
  const subclass = (legacy.subclass || (legacy as any).circle) as SummonerHeroV2['subclass'];

  // Refresh portfolio data from current definitions
  let portfolio = legacy.portfolio;
  if (subclass && portfolio) {
    const portfolioType = circleToPortfolio[subclass];
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
  if (subclass && recoveries) {
    const maxRecoveries = calculateMaxRecoveries(subclass);
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
    subclass, // Use standardized field name
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
 * Migrate old subclass field names to standardized 'subclass' field
 * Handles: domain, element, aspect, tradition, college, circle, doctrine, class
 */
const migrateSubclassFields = (hero: Record<string, unknown>): Record<string, unknown> => {
  if (!hero.heroClass) return hero;

  const migrated = { ...hero };

  // Map of old field names to migrate per class
  const fieldMigrations: Record<string, string> = {
    conduit: 'domain',
    elementalist: 'element',
    fury: 'aspect',
    null: 'tradition',
    shadow: 'college',
    summoner: 'circle',
    tactician: 'doctrine',
    talent: 'tradition',
    troubadour: 'class',
  };

  const heroClass = hero.heroClass as string;
  const oldField = fieldMigrations[heroClass];

  // If there's an old field to migrate and subclass doesn't exist yet
  if (oldField && oldField in migrated && !('subclass' in migrated)) {
    migrated.subclass = migrated[oldField];
    delete migrated[oldField];
  }

  return migrated;
};

/**
 * Migrate Troubadour-specific data
 * - Converts old subclass values (dancer/wordsmith) to new ones (virtuoso/auteur)
 * - Adds secondaryRoutine field if missing
 */
const migrateTroubadourData = (hero: Record<string, unknown>): Record<string, unknown> => {
  if (hero.heroClass !== 'troubadour') return hero;

  const migrated = { ...hero };

  // Migrate old subclass values to new ones
  const subclassMapping: Record<string, string> = {
    'dancer': 'virtuoso',    // Dancer -> Virtuoso (both focus on performance/movement)
    'wordsmith': 'auteur',   // Wordsmith -> Auteur (both focus on narrative)
    'duelist': 'duelist',    // Duelist stays the same
  };

  if (migrated.subclass && typeof migrated.subclass === 'string') {
    const oldSubclass = migrated.subclass.toLowerCase();
    if (subclassMapping[oldSubclass]) {
      migrated.subclass = subclassMapping[oldSubclass];
    }
  }

  // Add secondaryRoutine if missing
  if (!('secondaryRoutine' in migrated)) {
    migrated.secondaryRoutine = null;
  }

  return migrated;
};

/**
 * Migrate Talent-specific data
 * - Converts old subclass values to Draw Steel SRD values
 * - empath -> telepathy
 * - metamorph -> chronopathy
 * - telekinetic -> telekinesis
 */
const migrateTalentData = (hero: Record<string, unknown>): Record<string, unknown> => {
  if (hero.heroClass !== 'talent') return hero;

  const migrated = { ...hero };

  const subclassMapping: Record<string, string> = {
    'empath': 'telepathy',
    'metamorph': 'chronopathy',
    'telekinetic': 'telekinesis',
    // Already correct values
    'chronopathy': 'chronopathy',
    'telekinesis': 'telekinesis',
    'telepathy': 'telepathy',
  };

  if (migrated.subclass && typeof migrated.subclass === 'string') {
    const oldSubclass = migrated.subclass.toLowerCase();
    if (subclassMapping[oldSubclass]) {
      migrated.subclass = subclassMapping[oldSubclass];
    }
  }

  return migrated;
};

/**
 * Migrate Censor-specific data
 * - Converts old subclass values to Draw Steel SRD values
 * - inquisitor -> exorcist
 * - templar -> paragon
 * - zealot -> oracle
 */
const migrateCensorData = (hero: Record<string, unknown>): Record<string, unknown> => {
  if (hero.heroClass !== 'censor') return hero;

  const migrated = { ...hero };

  const subclassMapping: Record<string, string> = {
    'inquisitor': 'exorcist',
    'templar': 'paragon',
    'zealot': 'oracle',
    // Already correct values
    'exorcist': 'exorcist',
    'oracle': 'oracle',
    'paragon': 'paragon',
  };

  if (migrated.subclass && typeof migrated.subclass === 'string') {
    const oldSubclass = migrated.subclass.toLowerCase();
    if (subclassMapping[oldSubclass]) {
      migrated.subclass = subclassMapping[oldSubclass];
    }
  }

  return migrated;
};

/**
 * Migrate Shadow-specific data
 * - Converts old subclass values to Draw Steel SRD values
 * - Removes woven-darkness (was not in final SRD)
 */
const migrateShadowData = (hero: Record<string, unknown>): Record<string, unknown> => {
  if (hero.heroClass !== 'shadow') return hero;

  const migrated = { ...hero };

  const subclassMapping: Record<string, string> = {
    'black-ash': 'black-ash',
    'caustic-alchemy': 'caustic-alchemy',
    'harlequin-mask': 'harlequin-mask',
    // woven-darkness was removed from final SRD - map to black-ash as default
    'woven-darkness': 'black-ash',
  };

  if (migrated.subclass && typeof migrated.subclass === 'string') {
    const oldSubclass = migrated.subclass.toLowerCase();
    if (subclassMapping[oldSubclass]) {
      migrated.subclass = subclassMapping[oldSubclass];
    }
  }

  return migrated;
};

/**
 * Migrate Null-specific data
 * - Converts old subclass/tradition values to Draw Steel SRD values
 * - chronopath -> chronokinetic
 * - cloister -> cryokinetic (closest match)
 * - manticore -> metakinetic (closest match)
 */
const migrateNullData = (hero: Record<string, unknown>): Record<string, unknown> => {
  if (hero.heroClass !== 'null') return hero;

  const migrated = { ...hero };

  const subclassMapping: Record<string, string> = {
    'chronopath': 'chronokinetic',
    'cloister': 'cryokinetic',
    'manticore': 'metakinetic',
    // Already correct values
    'chronokinetic': 'chronokinetic',
    'cryokinetic': 'cryokinetic',
    'metakinetic': 'metakinetic',
  };

  if (migrated.subclass && typeof migrated.subclass === 'string') {
    const oldSubclass = migrated.subclass.toLowerCase();
    if (subclassMapping[oldSubclass]) {
      migrated.subclass = subclassMapping[oldSubclass];
    }
  }

  return migrated;
};

/**
 * Migrate Fury-specific data
 * - Initializes furyState if missing
 * - Ensures all furyState fields are present
 */
const migrateFuryData = (hero: Record<string, unknown>): Record<string, unknown> => {
  if (hero.heroClass !== 'fury') return hero;

  const migrated = { ...hero };

  // Get aspect from subclass or existing furyState
  const existingFuryState = migrated.furyState as Record<string, unknown> | undefined;
  const aspect = existingFuryState?.aspect || migrated.subclass || 'berserker';

  // Initialize furyState if missing
  if (!migrated.furyState) {
    migrated.furyState = {
      aspect,
      stormwightKit: undefined,
      primordialStorm: undefined,
      currentForm: 'humanoid',
      growingFerocity: {
        tookDamageThisRound: false,
        becameWindedThisEncounter: false,
        becameDyingThisEncounter: false,
      },
      primordialPower: 0,
    };
  } else {
    // Ensure all fields are present in existing furyState
    const furyState = migrated.furyState as Record<string, unknown>;

    if (!furyState.aspect) {
      furyState.aspect = aspect;
    }
    if (!furyState.currentForm) {
      furyState.currentForm = 'humanoid';
    }
    if (!furyState.growingFerocity) {
      furyState.growingFerocity = {
        tookDamageThisRound: false,
        becameWindedThisEncounter: false,
        becameDyingThisEncounter: false,
      };
    }
    if (furyState.primordialPower === undefined) {
      furyState.primordialPower = 0;
    }

    migrated.furyState = furyState;
  }

  // Remove legacy growingFerocityTier if present
  if ('growingFerocityTier' in migrated) {
    delete migrated.growingFerocityTier;
  }

  return migrated;
};

/**
 * Migrate ancestry selection for existing characters
 * - Adds ancestrySelection if missing
 * - Tries to match embedded ancestry.name to data module
 * - Defaults to 'human' with no purchased traits if no match
 */
const migrateAncestrySelection = (hero: Record<string, unknown>): Record<string, unknown> => {
  // Already has ancestrySelection, no migration needed
  if (hero.ancestrySelection) return hero;

  const migrated = { ...hero };

  // Try to determine ancestry ID from embedded ancestry data
  let ancestryId = 'human'; // Default
  const embeddedAncestry = hero.ancestry as { id?: string; name?: string } | undefined;

  if (embeddedAncestry) {
    // Try to match by ID first
    if (embeddedAncestry.id && getAncestryById(embeddedAncestry.id)) {
      ancestryId = embeddedAncestry.id;
    }
    // Try to match by name if ID doesn't work
    else if (embeddedAncestry.name) {
      const matchedAncestry = getAncestryByName(embeddedAncestry.name);
      if (matchedAncestry) {
        ancestryId = matchedAncestry.id;
      }
    }
  }

  // Create default ancestrySelection with no purchased traits
  // Players will need to select traits manually for existing characters
  const ancestrySelection: HeroAncestry = {
    ancestryId,
    selectedTraitIds: [],
  };

  migrated.ancestrySelection = ancestrySelection;

  return migrated;
};

/**
 * Migrate older character data to include new fields and refresh portfolio data
 * This handles both legacy SummonerHero and already-migrated Hero data
 */
const migrateCharacter = (character: Partial<SummonerHero> | Partial<Hero>): Hero => {
  // First migrate subclass fields to standardized format
  let migrated = migrateSubclassFields(character as Record<string, unknown>);

  // Apply class-specific migrations
  migrated = migrateTroubadourData(migrated);
  migrated = migrateTalentData(migrated);
  migrated = migrateCensorData(migrated);
  migrated = migrateShadowData(migrated);
  migrated = migrateNullData(migrated);
  migrated = migrateFuryData(migrated);

  // Apply ancestry selection migration
  migrated = migrateAncestrySelection(migrated);

  // Check if this is already a new Hero type (has heroClass field)
  if ('heroClass' in migrated && migrated.heroClass) {
    // Already migrated, just ensure all fields are present
    if (migrated.heroClass === 'summoner') {
      return migrateSummonerToV2(migrated as Partial<SummonerHero>);
    }
    // For other classes, return as-is for now (they will be created with new system)
    return migrated as unknown as Hero;
  }

  // Legacy SummonerHero without heroClass - migrate to V2
  return migrateSummonerToV2(migrated as Partial<SummonerHero>);
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
 * Export character to JSON with metadata wrapper
 */
export const exportCharacterToJSON = (character: Hero): string => {
  const exportData = {
    schemaVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    appVersion: '0.4.1', // Mettle version
    character,
  };
  return JSON.stringify(exportData, null, 2);
};

/**
 * Sanitize character name for use as filename
 */
const sanitizeFilename = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Remove multiple hyphens
    .substring(0, 50);             // Limit length
};

/**
 * Export a character to a downloadable JSON file
 */
export const downloadCharacterJSON = (character: Hero): void => {
  const jsonString = exportCharacterToJSON(character);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(character.name)}.json`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Duplicate a character with a new ID and "(Copy)" suffix
 */
export const duplicateCharacter = (character: Hero): Hero => {
  return {
    ...character,
    id: crypto.randomUUID(),
    name: `${character.name} (Copy)`,
    // Reset combat state on duplicate
    stamina: {
      ...character.stamina,
      current: character.stamina.max,
    },
    recoveries: {
      ...character.recoveries,
      current: character.recoveries.max,
    },
    surges: 0,
    activeConditions: [],
    // Keep victories, XP, and other progression data
  };
};

/**
 * Validation result for imported character
 */
export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  hero: Hero | null;
}

/**
 * Validate and import character from JSON string
 * Handles both wrapped format (with schemaVersion) and raw Hero format
 */
export const importCharacterFromJSON = (json: string): ImportValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const data = JSON.parse(json);

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      errors.push('Invalid file format: expected JSON object');
      return { valid: false, errors, warnings, hero: null };
    }

    // Extract character (handle wrapped or raw format)
    let character: Record<string, unknown>;

    if ('character' in data && typeof data.character === 'object') {
      // Wrapped format (ExportedCharacter)
      character = data.character as Record<string, unknown>;

      // Check schema version
      if (data.schemaVersion && data.schemaVersion !== '1.0.0') {
        warnings.push(`Character was exported with schema version ${data.schemaVersion}`);
      }
    } else if ('name' in data && 'heroClass' in data) {
      // Raw Hero format (legacy or direct)
      character = data;
      warnings.push('Character file is in legacy format (unwrapped)');
    } else if ('name' in data && 'level' in data) {
      // Very old legacy format without heroClass
      character = data;
      warnings.push('Character file is in very old format, some data may be missing');
    } else {
      errors.push('Invalid character format: missing required fields');
      return { valid: false, errors, warnings, hero: null };
    }

    // Validate required fields
    if (!character.name || typeof character.name !== 'string' || character.name.trim().length === 0) {
      errors.push('Character name must be a non-empty string');
    }

    if (typeof character.level !== 'number' || character.level < 1 || character.level > 10) {
      errors.push('Character level must be a number between 1 and 10');
    }

    // Validate heroClass if present
    const validClasses = [
      'censor', 'conduit', 'elementalist', 'fury', 'null',
      'shadow', 'tactician', 'talent', 'troubadour', 'summoner'
    ];
    if (character.heroClass && !validClasses.includes(character.heroClass as string)) {
      errors.push(`Invalid heroClass: ${character.heroClass}`);
    }

    if (errors.length > 0) {
      return { valid: false, errors, warnings, hero: null };
    }

    // Migrate to ensure all fields are present and generate new ID
    const migratedHero = migrateCharacter(character as Partial<Hero>);
    const importedHero: Hero = {
      ...migratedHero,
      id: crypto.randomUUID(), // Always generate new ID to avoid conflicts
    };

    return { valid: true, errors, warnings, hero: importedHero };

  } catch (error) {
    errors.push(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors, warnings, hero: null };
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
