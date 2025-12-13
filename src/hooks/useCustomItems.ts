import { useState, useEffect, useCallback } from 'react';
import { MagicItem, ItemCategory, EquipmentSlot, ItemEnhancement } from '../data/magicItems';

const CUSTOM_ITEMS_STORAGE_KEY = 'summoner_custom_items';

export interface CustomMagicItem extends MagicItem {
  isCustom: true;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Hook for managing custom magic items stored in localStorage
 */
export function useCustomItems() {
  const [customItems, setCustomItems] = useState<CustomMagicItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load custom items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_ITEMS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CustomMagicItem[];
        setCustomItems(parsed);
      }
    } catch (e) {
      console.error('Failed to load custom items:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  const saveItems = useCallback((items: CustomMagicItem[]) => {
    try {
      localStorage.setItem(CUSTOM_ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save custom items:', e);
    }
  }, []);

  // Generate a unique ID for new items
  const generateId = useCallback(() => {
    return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add a new custom item
  const addCustomItem = useCallback(
    (item: Omit<CustomMagicItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => {
      const newItem: CustomMagicItem = {
        ...item,
        id: generateId(),
        isCustom: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setCustomItems((prev) => {
        const updated = [...prev, newItem];
        saveItems(updated);
        return updated;
      });

      return newItem;
    },
    [generateId, saveItems]
  );

  // Update an existing custom item
  const updateCustomItem = useCallback(
    (id: string, updates: Partial<Omit<CustomMagicItem, 'id' | 'isCustom' | 'createdAt'>>) => {
      setCustomItems((prev) => {
        const updated = prev.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedAt: Date.now() }
            : item
        );
        saveItems(updated);
        return updated;
      });
    },
    [saveItems]
  );

  // Delete a custom item
  const deleteCustomItem = useCallback(
    (id: string) => {
      setCustomItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveItems(updated);
        return updated;
      });
    },
    [saveItems]
  );

  // Get a specific custom item by ID
  const getCustomItem = useCallback(
    (id: string): CustomMagicItem | undefined => {
      return customItems.find((item) => item.id === id);
    },
    [customItems]
  );

  // Check if an item ID belongs to a custom item
  const isCustomItem = useCallback(
    (id: string): boolean => {
      return customItems.some((item) => item.id === id);
    },
    [customItems]
  );

  // Export custom items to JSON
  const exportCustomItems = useCallback(() => {
    const dataStr = JSON.stringify(customItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-magic-items.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [customItems]);

  // Import custom items from JSON
  const importCustomItems = useCallback(
    (jsonString: string, merge: boolean = true) => {
      try {
        const imported = JSON.parse(jsonString) as CustomMagicItem[];

        // Validate and sanitize imported items
        const validItems = imported.filter(
          (item) =>
            item.id &&
            item.name &&
            item.category &&
            item.echelon >= 1 &&
            item.echelon <= 4
        ).map((item) => ({
          ...item,
          isCustom: true as const,
          id: merge ? generateId() : item.id, // Generate new IDs if merging
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now(),
        }));

        if (merge) {
          setCustomItems((prev) => {
            const updated = [...prev, ...validItems];
            saveItems(updated);
            return updated;
          });
        } else {
          setCustomItems(validItems);
          saveItems(validItems);
        }

        return validItems.length;
      } catch (e) {
        console.error('Failed to import custom items:', e);
        return 0;
      }
    },
    [generateId, saveItems]
  );

  return {
    customItems,
    isLoaded,
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,
    getCustomItem,
    isCustomItem,
    exportCustomItems,
    importCustomItems,
  };
}

// Helper to create a blank custom item template
export function createBlankCustomItem(): Omit<CustomMagicItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    category: 'trinket',
    echelon: 1,
    slot: undefined,
    effect: '',
    enhancements: undefined,
    projectGoal: undefined,
    imageUrl: undefined,
  };
}
