import { describe, it, expect } from 'vitest';
import {
  calculateMaxStamina,
  calculateWindedThreshold,
  calculateRecoveryValue,
  calculateMaxMinions,
  calculateSignatureMinionsPerTurn,
  calculateEssencePerTurn,
  calculateMinionDeathEssence,
  calculateCombatStartMinions,
  calculateMinionLevelStaminaBonus,
  calculateMaxRecoveries,
  calculateSpeed,
  calculateStability,
  calculateEssenceCost,
  calculateMinionBonusStamina,
  calculateMinionCharacteristicBonus,
  calculateMinionFreeStrikeBonus,
  calculateFixtureStamina,
  calculateFixtureSize,
  calculateSacrificeCostReduction,
  isChampionUnlocked,
  isChampionActionUnlocked,
  canSummonOutOfCombat,
  generateId,
} from '../calculations';

describe('Stamina Calculations', () => {
  describe('calculateMaxStamina', () => {
    it('calculates base stamina for level 1 with no kit', () => {
      const hero = { level: 1 };
      expect(calculateMaxStamina(hero)).toBe(15);
    });

    it('adds kit stamina per echelon', () => {
      const hero = { level: 1, kit: { staminaPerEchelon: 3 } };
      expect(calculateMaxStamina(hero)).toBe(18); // 15 + 3
    });

    it('calculates stamina bonus for level 2+', () => {
      const hero = { level: 2 };
      expect(calculateMaxStamina(hero)).toBe(27); // 15 + (2 * 6)
    });

    it('calculates stamina for level 5 with kit', () => {
      const hero = { level: 5, kit: { staminaPerEchelon: 3 } };
      // Base 15 + kit (3 * 2 echelons) + level bonus (5 * 6)
      expect(calculateMaxStamina(hero)).toBe(15 + 6 + 30);
    });

    it('handles missing level by defaulting to 1', () => {
      const hero = {};
      expect(calculateMaxStamina(hero)).toBe(15);
    });
  });

  describe('calculateWindedThreshold', () => {
    it('returns half of max stamina rounded down', () => {
      expect(calculateWindedThreshold(30)).toBe(15);
      expect(calculateWindedThreshold(31)).toBe(15);
      expect(calculateWindedThreshold(32)).toBe(16);
    });
  });

  describe('calculateRecoveryValue', () => {
    it('returns 1/3 of max stamina rounded down', () => {
      const hero = { level: 1 };
      // Max stamina = 15, recovery = 5
      expect(calculateRecoveryValue(hero)).toBe(5);
    });
  });
});

describe('Minion Calculations', () => {
  describe('calculateMaxMinions', () => {
    it('returns base 8 minions for level 1', () => {
      expect(calculateMaxMinions('platoon', 1)).toBe(8);
    });

    it('adds 4 at level 4', () => {
      expect(calculateMaxMinions('platoon', 4)).toBe(12);
    });

    it('adds 4 more at level 7', () => {
      expect(calculateMaxMinions('platoon', 7)).toBe(16);
    });

    it('adds 4 more at level 10', () => {
      expect(calculateMaxMinions('platoon', 10)).toBe(20);
    });

    it('adds 4 for horde formation', () => {
      expect(calculateMaxMinions('horde', 1)).toBe(12);
      expect(calculateMaxMinions('horde', 10)).toBe(24);
    });
  });

  describe('calculateSignatureMinionsPerTurn', () => {
    it('returns base 3 for level 1', () => {
      expect(calculateSignatureMinionsPerTurn('platoon', 1)).toBe(3);
    });

    it('adds 1 at level 7', () => {
      expect(calculateSignatureMinionsPerTurn('platoon', 7)).toBe(4);
    });

    it('adds 1 for horde formation', () => {
      expect(calculateSignatureMinionsPerTurn('horde', 1)).toBe(4);
      expect(calculateSignatureMinionsPerTurn('horde', 7)).toBe(5);
    });
  });

  describe('calculateMinionLevelStaminaBonus', () => {
    // Signature minions (1 essence)
    it('gives signature minions +1 stamina at levels 4, 7, 10', () => {
      expect(calculateMinionLevelStaminaBonus(1, 1)).toBe(0);
      expect(calculateMinionLevelStaminaBonus(1, 4)).toBe(1);
      expect(calculateMinionLevelStaminaBonus(1, 7)).toBe(2);
      expect(calculateMinionLevelStaminaBonus(1, 10)).toBe(3);
    });

    // 3-essence minions
    it('gives 3-essence minions +3 stamina at levels 4, 7, 10', () => {
      expect(calculateMinionLevelStaminaBonus(3, 1)).toBe(0);
      expect(calculateMinionLevelStaminaBonus(3, 4)).toBe(3);
      expect(calculateMinionLevelStaminaBonus(3, 7)).toBe(6);
      expect(calculateMinionLevelStaminaBonus(3, 10)).toBe(9);
    });

    // 5-essence minions
    it('gives 5-essence minions +2 stamina at levels 4, 7, 10', () => {
      expect(calculateMinionLevelStaminaBonus(5, 1)).toBe(0);
      expect(calculateMinionLevelStaminaBonus(5, 4)).toBe(2);
      expect(calculateMinionLevelStaminaBonus(5, 7)).toBe(4);
      expect(calculateMinionLevelStaminaBonus(5, 10)).toBe(6);
    });

    // 7-essence minions
    it('gives 7-essence minions +5 stamina at levels 7 and 10 only', () => {
      expect(calculateMinionLevelStaminaBonus(7, 1)).toBe(0);
      expect(calculateMinionLevelStaminaBonus(7, 4)).toBe(0);
      expect(calculateMinionLevelStaminaBonus(7, 7)).toBe(5);
      expect(calculateMinionLevelStaminaBonus(7, 10)).toBe(10);
    });
  });
});

describe('Essence Calculations', () => {
  describe('calculateEssencePerTurn', () => {
    it('always returns 2 regardless of level', () => {
      expect(calculateEssencePerTurn(1)).toBe(2);
      expect(calculateEssencePerTurn(5)).toBe(2);
      expect(calculateEssencePerTurn(10)).toBe(2);
    });
  });

  describe('calculateMinionDeathEssence', () => {
    it('always returns 1 regardless of level', () => {
      expect(calculateMinionDeathEssence(1)).toBe(1);
      expect(calculateMinionDeathEssence(10)).toBe(1);
    });
  });

  describe('calculateEssenceCost', () => {
    it('reduces cost by 1 for elite formation on 5+ cost minions', () => {
      expect(calculateEssenceCost(5, 'elite')).toBe(4);
      expect(calculateEssenceCost(7, 'elite')).toBe(6);
    });

    it('does not reduce cost below 1', () => {
      expect(calculateEssenceCost(1, 'elite')).toBe(1);
    });

    it('does not reduce cost for non-elite formations', () => {
      expect(calculateEssenceCost(5, 'platoon')).toBe(5);
      expect(calculateEssenceCost(5, 'horde')).toBe(5);
    });

    it('does not reduce cost for minions under 5 essence', () => {
      expect(calculateEssenceCost(3, 'elite')).toBe(3);
    });
  });
});

describe('Formation Bonuses', () => {
  describe('calculateMinionBonusStamina', () => {
    it('returns 3 for elite formation', () => {
      expect(calculateMinionBonusStamina('elite')).toBe(3);
    });

    it('returns 0 for other formations', () => {
      expect(calculateMinionBonusStamina('platoon')).toBe(0);
      expect(calculateMinionBonusStamina('horde')).toBe(0);
      expect(calculateMinionBonusStamina('leader')).toBe(0);
    });
  });

  describe('calculateMinionCharacteristicBonus', () => {
    it('returns 1 for elite formation', () => {
      expect(calculateMinionCharacteristicBonus('elite')).toBe(1);
    });

    it('returns 0 for other formations', () => {
      expect(calculateMinionCharacteristicBonus('platoon')).toBe(0);
    });
  });

  describe('calculateMinionFreeStrikeBonus', () => {
    it('returns 1 for platoon formation', () => {
      expect(calculateMinionFreeStrikeBonus('platoon')).toBe(1);
    });

    it('returns 0 for other formations', () => {
      expect(calculateMinionFreeStrikeBonus('elite')).toBe(0);
      expect(calculateMinionFreeStrikeBonus('horde')).toBe(0);
    });
  });
});

describe('Recovery Calculations', () => {
  describe('calculateMaxRecoveries', () => {
    it('returns base 8 for most circles', () => {
      expect(calculateMaxRecoveries('blight')).toBe(8);
      expect(calculateMaxRecoveries('graves')).toBe(8);
      expect(calculateMaxRecoveries('storms')).toBe(8);
    });

    it('returns 10 for spring circle (Pixie Dust bonus)', () => {
      expect(calculateMaxRecoveries('spring')).toBe(10);
    });

    it('handles undefined circle', () => {
      expect(calculateMaxRecoveries(undefined)).toBe(8);
    });
  });
});

describe('Combat Start Minions', () => {
  describe('calculateCombatStartMinions', () => {
    it('returns base 2 for levels below 10', () => {
      expect(calculateCombatStartMinions(1, 0)).toBe(2);
      expect(calculateCombatStartMinions(9, 5)).toBe(2);
    });

    it('adds +2 per 2 victories at level 10', () => {
      expect(calculateCombatStartMinions(10, 0)).toBe(2);
      expect(calculateCombatStartMinions(10, 2)).toBe(4);
      expect(calculateCombatStartMinions(10, 4)).toBe(6);
      expect(calculateCombatStartMinions(10, 5)).toBe(6); // floors at 2
    });
  });
});

describe('Kit Calculations', () => {
  describe('calculateSpeed', () => {
    it('returns base 5 with no kit', () => {
      expect(calculateSpeed(undefined)).toBe(5);
    });

    it('adds kit speed bonus', () => {
      expect(calculateSpeed({ speedBonus: 2 } as any)).toBe(7);
    });
  });

  describe('calculateStability', () => {
    it('returns 0 with no kit', () => {
      expect(calculateStability(undefined)).toBe(0);
    });

    it('returns kit stability bonus', () => {
      expect(calculateStability({ stabilityBonus: 3 } as any)).toBe(3);
    });
  });
});

describe('Fixture Calculations', () => {
  describe('calculateFixtureStamina', () => {
    it('returns 20 + level', () => {
      expect(calculateFixtureStamina(1)).toBe(21);
      expect(calculateFixtureStamina(5)).toBe(25);
      expect(calculateFixtureStamina(10)).toBe(30);
    });
  });

  describe('calculateFixtureSize', () => {
    it('returns 2 before level 9', () => {
      expect(calculateFixtureSize(1)).toBe(2);
      expect(calculateFixtureSize(8)).toBe(2);
    });

    it('returns 3 at level 9+', () => {
      expect(calculateFixtureSize(9)).toBe(3);
      expect(calculateFixtureSize(10)).toBe(3);
    });
  });
});

describe('Sacrifice Mechanics', () => {
  describe('calculateSacrificeCostReduction', () => {
    it('returns 0 for 0 minions', () => {
      expect(calculateSacrificeCostReduction(0, 5)).toBe(0);
    });

    it('returns 1 per minion before level 10', () => {
      expect(calculateSacrificeCostReduction(3, 5)).toBe(3);
      expect(calculateSacrificeCostReduction(2, 9)).toBe(2);
    });

    it('returns full essence value at level 10', () => {
      expect(calculateSacrificeCostReduction(3, 10, [1, 1, 1])).toBe(3);
      expect(calculateSacrificeCostReduction(2, 10, [3, 5])).toBe(8);
    });

    it('defaults to 1-cost minions if not specified', () => {
      expect(calculateSacrificeCostReduction(3, 10)).toBe(3);
    });
  });
});

describe('Champion Mechanics', () => {
  describe('isChampionUnlocked', () => {
    it('returns false before level 8', () => {
      expect(isChampionUnlocked(1)).toBe(false);
      expect(isChampionUnlocked(7)).toBe(false);
    });

    it('returns true at level 8+', () => {
      expect(isChampionUnlocked(8)).toBe(true);
      expect(isChampionUnlocked(10)).toBe(true);
    });
  });

  describe('isChampionActionUnlocked', () => {
    it('returns false before level 10', () => {
      expect(isChampionActionUnlocked(8)).toBe(false);
      expect(isChampionActionUnlocked(9)).toBe(false);
    });

    it('returns true at level 10', () => {
      expect(isChampionActionUnlocked(10)).toBe(true);
    });
  });
});

describe('Out of Combat Summoning', () => {
  describe('canSummonOutOfCombat', () => {
    it('always allows signature minions', () => {
      expect(canSummonOutOfCombat(1, 0, true)).toBe(true);
      expect(canSummonOutOfCombat(1, 0, false)).toBe(true); // 1-cost treated as signature
    });

    it('requires victories >= essence cost for non-signature', () => {
      expect(canSummonOutOfCombat(3, 2, false)).toBe(false);
      expect(canSummonOutOfCombat(3, 3, false)).toBe(true);
      expect(canSummonOutOfCombat(5, 4, false)).toBe(false);
      expect(canSummonOutOfCombat(5, 5, false)).toBe(true);
    });
  });
});

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('generates string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});
