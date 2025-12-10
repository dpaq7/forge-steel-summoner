import { useCallback, useMemo } from 'react';
import { useSummonerContext } from '../context/SummonerContext';
import { EquippedItem, StatBonus } from '../types/equipment';
import {
  MagicItem,
  EquipmentSlot,
  parseItemBonuses,
  getEnhancementTier,
  getItemById,
} from '../data/magicItems';

export interface EquipmentBonuses {
  stamina: number;
  stability: number;
  speed: number;
  damage: number;
  savingThrow: number;
  rangeDistance: number;
}

const DEFAULT_BONUSES: EquipmentBonuses = {
  stamina: 0,
  stability: 0,
  speed: 0,
  damage: 0,
  savingThrow: 0,
  rangeDistance: 0,
};

export const useEquipment = () => {
  const { hero, updateHero } = useSummonerContext();

  /**
   * Equip a magic item to the character
   * Replaces any existing item in the same slot
   */
  const equipItem = useCallback(
    (item: MagicItem) => {
      if (!hero) return;

      // Only equip items that have a slot (not consumables without slots)
      const slot = item.slot;
      if (!slot) {
        console.warn(`Cannot equip ${item.name}: no equipment slot defined`);
        return;
      }

      // Parse bonuses based on hero level
      const parsedBonuses = parseItemBonuses(item, hero.level);
      const bonuses: StatBonus[] = parsedBonuses.map((b) => ({
        stat: b.stat as StatBonus['stat'],
        value: b.value,
        conditional: b.conditional,
      }));

      const equipped: EquippedItem = {
        itemId: item.id,
        name: item.name,
        slot: slot,
        category: item.category,
        effect: item.effect,
        bonuses,
        equippedAt: Date.now(),
        currentEnhancementLevel:
          item.category === 'leveled' ? getEnhancementTier(item, hero.level) : undefined,
      };

      // Remove any existing item in the same slot, then add new item
      const currentItems = hero.equippedItems || [];
      const filteredItems = currentItems.filter((e) => e.slot !== slot);

      updateHero({
        equippedItems: [...filteredItems, equipped],
      });
    },
    [hero, updateHero]
  );

  /**
   * Unequip an item by its ID
   */
  const unequipItem = useCallback(
    (itemId: string) => {
      if (!hero) return;

      updateHero({
        equippedItems: (hero.equippedItems || []).filter((e) => e.itemId !== itemId),
      });
    },
    [hero, updateHero]
  );

  /**
   * Check if a specific item is equipped
   */
  const isEquipped = useCallback(
    (itemId: string): boolean => {
      if (!hero?.equippedItems) return false;
      return hero.equippedItems.some((e) => e.itemId === itemId);
    },
    [hero]
  );

  /**
   * Get the item equipped in a specific slot
   */
  const getItemInSlot = useCallback(
    (slot: EquipmentSlot): EquippedItem | undefined => {
      if (!hero?.equippedItems) return undefined;
      return hero.equippedItems.find((e) => e.slot === slot);
    },
    [hero]
  );

  /**
   * Calculate total bonuses from all equipped items
   */
  const totalBonuses = useMemo((): EquipmentBonuses => {
    if (!hero?.equippedItems || hero.equippedItems.length === 0) {
      return DEFAULT_BONUSES;
    }

    return hero.equippedItems.reduce((totals, item) => {
      item.bonuses.forEach((bonus) => {
        const stat = bonus.stat as keyof EquipmentBonuses;
        if (stat in totals) {
          totals[stat] += bonus.value;
        }
      });
      return totals;
    }, { ...DEFAULT_BONUSES });
  }, [hero?.equippedItems]);

  /**
   * Get all equipped items
   */
  const equippedItems = useMemo((): EquippedItem[] => {
    return hero?.equippedItems || [];
  }, [hero?.equippedItems]);

  /**
   * Update equipped item bonuses when hero level changes
   * (for leveled items that scale with level)
   */
  const refreshItemBonuses = useCallback(() => {
    if (!hero?.equippedItems || hero.equippedItems.length === 0) return;

    const updatedItems = hero.equippedItems.map((equipped) => {
      const item = getItemById(equipped.itemId);
      if (!item) return equipped;

      // Recalculate bonuses for leveled items
      if (item.category === 'leveled') {
        const newTier = getEnhancementTier(item, hero.level);
        if (newTier !== equipped.currentEnhancementLevel) {
          const parsedBonuses = parseItemBonuses(item, hero.level);
          return {
            ...equipped,
            bonuses: parsedBonuses.map((b) => ({
              stat: b.stat as StatBonus['stat'],
              value: b.value,
              conditional: b.conditional,
            })),
            currentEnhancementLevel: newTier,
          };
        }
      }
      return equipped;
    });

    updateHero({ equippedItems: updatedItems });
  }, [hero, updateHero]);

  return {
    equipItem,
    unequipItem,
    isEquipped,
    getItemInSlot,
    totalBonuses,
    equippedItems,
    refreshItemBonuses,
  };
};
