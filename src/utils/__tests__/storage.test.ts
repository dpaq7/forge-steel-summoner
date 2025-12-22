import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveCharacter,
  loadCharacter,
  deleteCharacter,
  getAllCharacters,
  getActiveCharacterId,
  setActiveCharacterId,
  duplicateCharacter,
  exportCharacterToJSON,
  importCharacterFromJSON,
} from '../storage';
import type { Hero, SummonerHeroV2 } from '../../types/hero';

// Helper to create a minimal valid hero for testing
const createTestHero = (overrides: Partial<SummonerHeroV2> = {}): SummonerHeroV2 => ({
  id: 'test-hero-id',
  name: 'Test Hero',
  level: 1,
  heroClass: 'summoner',
  heroicResource: { type: 'essence', current: 0, maxPerTurn: 5 },
  ancestry: { name: 'Human', description: '', size: '1M', speed: 5 },
  culture: { name: 'Urban', description: '' },
  career: { name: 'Soldier', description: '', skills: [], perkType: 'martial' },
  kit: { name: 'Panther', staminaPerEchelon: 3, speedBonus: 1, stabilityBonus: 0 },
  characteristics: { might: 0, agility: 0, reason: 2, intuition: 0, presence: 0 },
  stamina: { current: 18, max: 18, winded: 9 },
  recoveries: { current: 8, max: 8, value: 6 },
  speed: 6,
  stability: 0,
  surges: 0,
  heroTokens: 0,
  victories: 0,
  xp: 0,
  wealth: 2,
  gold: 0,
  renown: 0,
  abilities: [],
  features: [],
  skills: [],
  languages: ['caelian'],
  items: [],
  equippedItems: [],
  inventory: [],
  activeConditions: [],
  notes: '',
  portraitUrl: null,
  progressionChoices: {},
  activeProjects: [],
  subclass: 'blight',
  formation: 'platoon',
  quickCommand: { id: 'qc1', name: 'Attack', description: 'Attack!', formation: 'platoon' },
  portfolio: { type: 'demon', fixture: null, signatureMinions: [], availableMinions: [] },
  activeSquads: [],
  fixture: null,
  minionPortraits: {},
  fixturePortrait: null,
  inactiveMinions: [],
  activeChampion: null,
  championState: { isActive: false, usedActionThisEncounter: false },
  outOfCombatState: { minions: [], lastUpdated: 0 },
  ...overrides,
});

describe('Storage Functions', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveCharacter', () => {
    it('saves a character to localStorage', () => {
      const hero = createTestHero();
      saveCharacter(hero);

      const stored = JSON.parse(localStorage.getItem('mettle-heroes') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('test-hero-id');
      expect(stored[0].name).toBe('Test Hero');
    });

    it('updates an existing character', () => {
      const hero = createTestHero();
      saveCharacter(hero);

      const updatedHero = createTestHero({ name: 'Updated Hero' });
      saveCharacter(updatedHero);

      const stored = JSON.parse(localStorage.getItem('mettle-heroes') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Updated Hero');
    });

    it('adds multiple characters', () => {
      saveCharacter(createTestHero({ id: 'hero-1', name: 'Hero 1' }));
      saveCharacter(createTestHero({ id: 'hero-2', name: 'Hero 2' }));

      const stored = JSON.parse(localStorage.getItem('mettle-heroes') || '[]');
      expect(stored).toHaveLength(2);
    });
  });

  describe('loadCharacter', () => {
    it('loads a character by ID', () => {
      const hero = createTestHero();
      saveCharacter(hero);

      const loaded = loadCharacter('test-hero-id');
      expect(loaded).not.toBeNull();
      expect(loaded?.name).toBe('Test Hero');
    });

    it('returns null for non-existent ID', () => {
      const loaded = loadCharacter('non-existent');
      expect(loaded).toBeNull();
    });
  });

  describe('deleteCharacter', () => {
    it('removes a character from storage', () => {
      saveCharacter(createTestHero({ id: 'hero-1' }));
      saveCharacter(createTestHero({ id: 'hero-2' }));

      deleteCharacter('hero-1');

      const stored = getAllCharacters();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('hero-2');
    });

    it('clears active character if deleted', () => {
      const hero = createTestHero();
      saveCharacter(hero);
      setActiveCharacterId(hero.id);

      deleteCharacter(hero.id);

      expect(getActiveCharacterId()).toBeNull();
    });
  });

  describe('getAllCharacters', () => {
    it('returns empty array when no characters', () => {
      const characters = getAllCharacters();
      expect(characters).toEqual([]);
    });

    it('returns all saved characters', () => {
      saveCharacter(createTestHero({ id: 'hero-1' }));
      saveCharacter(createTestHero({ id: 'hero-2' }));

      const characters = getAllCharacters();
      expect(characters).toHaveLength(2);
    });
  });

  describe('Active Character ID', () => {
    it('sets and gets active character ID', () => {
      setActiveCharacterId('hero-123');
      expect(getActiveCharacterId()).toBe('hero-123');
    });

    it('clears active character ID when set to null', () => {
      setActiveCharacterId('hero-123');
      setActiveCharacterId(null);
      expect(getActiveCharacterId()).toBeNull();
    });
  });

  describe('duplicateCharacter', () => {
    it('creates a copy with new ID', () => {
      const original = createTestHero();
      const copy = duplicateCharacter(original);

      expect(copy.id).not.toBe(original.id);
      expect(copy.name).toBe('Test Hero (Copy)');
    });

    it('resets combat state on duplicate', () => {
      const original = createTestHero({
        stamina: { current: 5, max: 18, winded: 9 },
        recoveries: { current: 3, max: 8, value: 6 },
        surges: 5,
        activeConditions: [{ conditionId: 'bleeding', appliedAt: 0, endType: 'eot' }],
      });

      const copy = duplicateCharacter(original);

      expect(copy.stamina.current).toBe(18); // Reset to max
      expect(copy.recoveries.current).toBe(8); // Reset to max
      expect(copy.surges).toBe(0);
      expect(copy.activeConditions).toEqual([]);
    });
  });

  describe('exportCharacterToJSON', () => {
    it('exports character with metadata wrapper', () => {
      const hero = createTestHero();
      const json = exportCharacterToJSON(hero);
      const parsed = JSON.parse(json);

      expect(parsed.schemaVersion).toBe('1.0.0');
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.character.name).toBe('Test Hero');
    });
  });

  describe('importCharacterFromJSON', () => {
    it('imports valid wrapped format', () => {
      const hero = createTestHero();
      const json = exportCharacterToJSON(hero);

      const result = importCharacterFromJSON(json);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.hero).not.toBeNull();
      expect(result.hero?.name).toBe('Test Hero');
      expect(result.hero?.id).not.toBe(hero.id); // New ID generated
    });

    it('imports raw hero format with warning', () => {
      const hero = createTestHero();
      const json = JSON.stringify(hero);

      const result = importCharacterFromJSON(json);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('legacy format');
    });

    it('rejects invalid JSON', () => {
      const result = importCharacterFromJSON('not valid json');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.hero).toBeNull();
    });

    it('rejects missing required fields', () => {
      const result = importCharacterFromJSON(JSON.stringify({ foo: 'bar' }));

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects empty name', () => {
      const hero = createTestHero({ name: '' });
      const json = JSON.stringify(hero);

      const result = importCharacterFromJSON(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Character name must be a non-empty string');
    });

    it('rejects invalid level', () => {
      const hero = createTestHero({ level: 15 });
      const json = JSON.stringify(hero);

      const result = importCharacterFromJSON(json);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Character level must be a number between 1 and 10');
    });

    it('rejects invalid heroClass', () => {
      const hero = { ...createTestHero(), heroClass: 'invalid' };
      const json = JSON.stringify(hero);

      const result = importCharacterFromJSON(json);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid heroClass');
    });
  });
});
