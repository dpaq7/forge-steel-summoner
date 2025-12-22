/**
 * Stat Calculator - Computes derived stats from class + kit + equipment
 *
 * This module handles the comprehensive calculation of hero stats by combining:
 * 1. Base class stats (stamina, recoveries)
 * 2. Kit bonuses (stamina, speed, stability)
 * 3. Equipment bonuses from all equipped items
 */

import { Hero, isSummonerHero, isNullHero } from '../types/hero';
import { classDefinitions } from '../data/classes/class-definitions';
import {
  EquipmentBonuses,
  DerivedStats,
  StatSource,
  DEFAULT_EQUIPMENT_BONUSES,
  StatModifierType,
  DamageType,
} from '../types/items';
import { EquippedItem, StatBonus } from '../types/equipment';

/**
 * Calculate equipment bonuses from all equipped items
 * This aggregates bonuses from the existing equippedItems array
 */
export function calculateEquipmentBonuses(
  equippedItems: EquippedItem[],
  heroLevel: number
): EquipmentBonuses {
  // Start with default (all zeros)
  const bonuses: EquipmentBonuses = { ...DEFAULT_EQUIPMENT_BONUSES };
  // Deep copy immunities
  bonuses.immunities = { ...DEFAULT_EQUIPMENT_BONUSES.immunities };

  if (!equippedItems || equippedItems.length === 0) {
    return bonuses;
  }

  // Process each equipped item
  equippedItems.forEach((item) => {
    if (!item.bonuses) return;

    item.bonuses.forEach((bonus: StatBonus) => {
      applyStatBonus(bonuses, bonus);
    });
  });

  return bonuses;
}

/**
 * Apply a single stat bonus to the bonuses object
 */
function applyStatBonus(bonuses: EquipmentBonuses, bonus: StatBonus): void {
  switch (bonus.stat) {
    case 'stamina':
      bonuses.stamina += bonus.value;
      break;
    case 'stability':
      bonuses.stability += bonus.value;
      break;
    case 'speed':
      bonuses.speed += bonus.value;
      break;
    case 'damage':
      // Generic damage applies to all damage types
      bonuses.meleeDamage += bonus.value;
      bonuses.rangedDamage += bonus.value;
      bonuses.magicDamage += bonus.value;
      break;
    case 'savingThrow':
      bonuses.savingThrows += bonus.value;
      break;
    case 'rangeDistance':
      // This is magic distance from Crystallized Essence
      bonuses.magicDistance += bonus.value;
      break;
    // Extended stat types (for future use)
    case 'might':
    case 'agility':
    case 'reason':
    case 'intuition':
    case 'presence':
      // Characteristic bonuses are rare and handled specially
      break;
  }
}

/**
 * Calculate all derived stats for a hero
 * Combines class base stats + kit bonuses + equipment bonuses
 */
export function calculateDerivedStats(hero: Hero): DerivedStats {
  const classDef = classDefinitions[hero.heroClass];
  const kit = hero.kit;
  const equippedItems = hero.equippedItems || [];

  // Calculate equipment bonuses
  const equipmentBonuses = calculateEquipmentBonuses(equippedItems, hero.level);

  // ===== STAMINA CALCULATION =====
  // Formula: Class Starting + (Level-1) * Stamina Per Level + Kit (per echelon) + Equipment
  const classStartingStamina = classDef?.startingStamina ?? 18;
  const levelStaminaBonus = (hero.level - 1) * (classDef?.staminaPerLevel ?? 6);
  const echelon = Math.ceil(hero.level / 3);
  const kitStamina = (kit?.staminaPerEchelon ?? 0) * echelon;
  const equipStamina = equipmentBonuses.stamina;

  const maxStamina = classStartingStamina + levelStaminaBonus + kitStamina + equipStamina;
  const windedThreshold = Math.floor(maxStamina / 2);
  const recoveryValue = Math.floor(maxStamina / 3);

  // Track stamina sources
  const staminaSources: StatSource[] = [
    { source: `${classDef?.name ?? 'Class'} Base`, value: classStartingStamina, isEquipment: false },
  ];
  if (levelStaminaBonus > 0) {
    staminaSources.push({ source: `Level ${hero.level}`, value: levelStaminaBonus, isEquipment: false });
  }
  if (kitStamina !== 0) {
    staminaSources.push({ source: `Kit: ${kit?.name ?? 'Kit'}`, value: kitStamina, isEquipment: false });
  }
  if (equipStamina !== 0) {
    staminaSources.push({ source: 'Equipment', value: equipStamina, isEquipment: true });
  }

  // ===== RECOVERIES CALCULATION =====
  // Formula: Class Starting Recoveries + Equipment
  const baseRecoveries = classDef?.startingRecoveries ?? 8;
  const maxRecoveries = baseRecoveries + equipmentBonuses.recoveries;

  // ===== SPEED CALCULATION =====
  // Formula: Base 5 + Kit Speed Bonus + Equipment
  const baseSpeed = 5;
  const kitSpeedBonus = kit?.speedBonus ?? 0;
  const equipSpeed = equipmentBonuses.speed;

  // Speed: base + kit bonus + equipment bonus
  const speed = baseSpeed + kitSpeedBonus + equipSpeed;

  // Track speed sources
  const speedSources: StatSource[] = [
    { source: 'Base Speed', value: baseSpeed, isEquipment: false },
  ];
  if (kitSpeedBonus !== 0) {
    speedSources.push({ source: `Kit: ${kit?.name ?? 'Kit'}`, value: kitSpeedBonus, isEquipment: false });
  }
  if (equipSpeed !== 0) {
    speedSources.push({ source: 'Equipment', value: equipSpeed, isEquipment: true });
  }

  // ===== STABILITY CALCULATION =====
  // Formula: Kit + Equipment
  const kitStabilityBonus = kit?.stabilityBonus ?? 0;
  const stability = kitStabilityBonus + equipmentBonuses.stability;

  // Track stability sources
  const stabilitySources: StatSource[] = [];
  if (kitStabilityBonus !== 0) {
    stabilitySources.push({ source: `Kit: ${kit?.name ?? 'Kit'}`, value: kitStabilityBonus, isEquipment: false });
  }
  if (equipmentBonuses.stability !== 0) {
    stabilitySources.push({ source: 'Equipment', value: equipmentBonuses.stability, isEquipment: true });
  }

  // ===== DAMAGE BONUSES =====
  // Kit doesn't provide damage bonuses directly (melee/ranged/magic damage comes from abilities)
  // Equipment adds flat bonuses
  const meleeDamage = equipmentBonuses.meleeDamage;
  const rangedDamage = equipmentBonuses.rangedDamage;
  const magicDamage = equipmentBonuses.magicDamage;

  // ===== DISTANCE BONUSES =====
  // Reach: Base 1 (melee) + Equipment (rare)
  const reach = 1 + equipmentBonuses.reach;

  // Ranged/Magic distance: Equipment only
  const rangedDistance = equipmentBonuses.rangedDistance;
  const magicDistance = equipmentBonuses.magicDistance;

  // ===== CLASS-SPECIFIC STATS =====
  let summonerRange: number | undefined;
  let nullFieldArea: number | undefined;

  // Summoner Range: 5 + Reason + Equipment
  if (isSummonerHero(hero)) {
    const reasonScore = hero.characteristics?.reason ?? 2;
    summonerRange = 5 + reasonScore + equipmentBonuses.summonerRange;
  }

  // Null Field Area: Base 1 + Order bonus (at combat start) + Equipment
  if (isNullHero(hero)) {
    const baseFieldArea = 1;
    const orderBonus = hero.nullField?.bonusSize ?? 0;
    nullFieldArea = baseFieldArea + orderBonus + equipmentBonuses.nullFieldArea;
  }

  // ===== MISC STATS =====
  const careerRenown = hero.career?.renown ?? 0;
  const renown = careerRenown + equipmentBonuses.renown;

  const savingThrowBonus = equipmentBonuses.savingThrows;
  const resistPotencyBonus = equipmentBonuses.resistPotency;

  return {
    maxStamina,
    windedThreshold,
    recoveryValue,
    maxRecoveries,
    speed,
    stability,
    meleeDamage,
    rangedDamage,
    magicDamage,
    reach,
    rangedDistance,
    magicDistance,
    summonerRange,
    nullFieldArea,
    savingThrowBonus,
    resistPotencyBonus,
    renown,
    equipmentBonuses,
    staminaSources,
    speedSources,
    stabilitySources,
  };
}

/**
 * Calculate stats with a hypothetical item equipped
 * Used for stat preview when selecting items
 */
export function calculateDerivedStatsWithItem(
  hero: Hero,
  newItem: EquippedItem,
  replaceSlot: string
): DerivedStats {
  // Create a copy of equipped items, replacing the item in the target slot
  const currentItems = hero.equippedItems || [];
  const filteredItems = currentItems.filter((e) => e.slot !== replaceSlot);
  const previewItems = [...filteredItems, newItem];

  // Create a temporary hero object with the preview items
  const previewHero = {
    ...hero,
    equippedItems: previewItems,
  } as Hero;

  return calculateDerivedStats(previewHero);
}

/**
 * Calculate the difference between current stats and preview stats
 */
export function calculateStatDifference(
  current: DerivedStats,
  preview: DerivedStats
): Partial<Record<keyof DerivedStats, number>> {
  return {
    maxStamina: preview.maxStamina - current.maxStamina,
    speed: preview.speed - current.speed,
    stability: preview.stability - current.stability,
    meleeDamage: preview.meleeDamage - current.meleeDamage,
    rangedDamage: preview.rangedDamage - current.rangedDamage,
    magicDamage: preview.magicDamage - current.magicDamage,
    savingThrowBonus: preview.savingThrowBonus - current.savingThrowBonus,
  };
}

/**
 * Get display name for a stat type
 */
export function getStatDisplayName(statType: StatModifierType | string): string {
  const names: Record<string, string> = {
    stamina: 'Stamina',
    speed: 'Speed',
    stability: 'Stability',
    meleeDamage: 'Melee Damage',
    rangedDamage: 'Ranged Damage',
    magicDamage: 'Magic Damage',
    allDamage: 'All Damage',
    damage: 'Damage',
    reach: 'Reach',
    rangedDistance: 'Ranged Distance',
    magicDistance: 'Magic Distance',
    summonerRange: "Summoner's Range",
    recoveries: 'Recoveries',
    savingThrows: 'Saving Throws',
    savingThrow: 'Saving Throws',
    resistPotency: 'Resist Potency',
    renown: 'Renown',
    pushDistance: 'Push Distance',
    teleportDistance: 'Teleport Distance',
    nullFieldArea: 'Null Field Area',
    rangeDistance: 'Magic Distance',
  };
  return names[statType] || statType;
}

/**
 * Get display name for a damage type
 */
export function getDamageTypeDisplayName(damageType: DamageType): string {
  return damageType.charAt(0).toUpperCase() + damageType.slice(1);
}
