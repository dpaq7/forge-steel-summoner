import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SummonerHero } from '../types';
import { Hero, SummonerHeroV2 } from '../types/hero';
import { HeroAncestry } from '../types/ancestry';
import { SelectedPerk } from '../types/perk';
import { saveCharacter, loadCharacter, getActiveCharacterId, setActiveCharacterId } from '../utils/storage';

// HeroContext supports all 10 Draw Steel hero classes
interface HeroContextType {
  hero: Hero | null;
  setHero: (hero: Hero | null) => void;
  updateHero: (updates: Partial<Hero>) => void;
  saveCurrentHero: () => void;
  loadHero: (id: string) => void;
  createNewHero: (hero: Hero) => void;
  // Ancestry selection helpers
  updateAncestrySelection: (ancestryId: string, selectedTraitIds: string[]) => void;
  // Perk helpers
  addPerk: (perk: SelectedPerk) => void;
  removePerk: (perkId: string) => void;
}

const HeroContext = createContext<HeroContextType | undefined>(undefined);

export const useHeroContext = () => {
  const context = useContext(HeroContext);
  if (!context) {
    throw new Error('useHeroContext must be used within a HeroProvider');
  }
  return context;
};

// Backward compatibility alias
export const useSummonerContext = useHeroContext;

interface HeroProviderProps {
  children: ReactNode;
}

/**
 * Convert legacy SummonerHero to polymorphic Hero type
 * Handles migration of old character data
 */
const migrateLegacyHero = (data: any): Hero => {
  // If it already has heroClass, it's already migrated
  if (data.heroClass) {
    return data as Hero;
  }

  // Legacy data without heroClass is assumed to be Summoner
  return {
    ...data,
    heroClass: 'summoner' as const,
    heroicResource: {
      type: 'essence' as const,
      current: data.essence?.current ?? 0,
      maxPerTurn: data.essence?.maxPerTurn ?? 5,
    },
  } as SummonerHeroV2;
};

export const HeroProvider: React.FC<HeroProviderProps> = ({ children }) => {
  const [hero, setHeroInternal] = useState<Hero | null>(null);

  const setHero = (newHero: Hero | null) => {
    setHeroInternal(newHero);
  };

  // Load active character on mount
  useEffect(() => {
    const activeId = getActiveCharacterId();
    if (activeId) {
      const loaded = loadCharacter(activeId);
      if (loaded) {
        // Migrate legacy data if needed
        const migratedHero = migrateLegacyHero(loaded);
        setHeroInternal(migratedHero);
      }
    }
  }, []);

  // Auto-save when hero changes
  useEffect(() => {
    if (hero) {
      saveCharacter(hero);
    }
  }, [hero]);

  const updateHero = (updates: Partial<Hero>) => {
    setHeroInternal((prev) => (prev ? { ...prev, ...updates } as Hero : null));
  };

  const saveCurrentHero = () => {
    if (hero) {
      saveCharacter(hero);
    }
  };

  const loadHero = (id: string) => {
    const loaded = loadCharacter(id);
    if (loaded) {
      const migratedHero = migrateLegacyHero(loaded);
      setHeroInternal(migratedHero);
      setActiveCharacterId(id);
    }
  };

  const createNewHero = (newHero: Hero) => {
    setHeroInternal(newHero);
    setActiveCharacterId(newHero.id);
    saveCharacter(newHero);
  };

  // Helper to update ancestry selection (ancestry ID and purchased traits)
  const updateAncestrySelection = useCallback((ancestryId: string, selectedTraitIds: string[]) => {
    const ancestrySelection: HeroAncestry = {
      ancestryId,
      selectedTraitIds,
    };
    updateHero({ ancestrySelection });
  }, []);

  // Helper to add a perk
  const addPerk = useCallback((perk: SelectedPerk) => {
    setHeroInternal((prev) => {
      if (!prev) return null;
      const updatedPerks = [...(prev.selectedPerks || []), perk];
      return { ...prev, selectedPerks: updatedPerks } as Hero;
    });
  }, []);

  // Helper to remove a perk
  const removePerk = useCallback((perkId: string) => {
    setHeroInternal((prev) => {
      if (!prev) return null;
      const updatedPerks = (prev.selectedPerks || []).filter(p => p.perkId !== perkId);
      return { ...prev, selectedPerks: updatedPerks } as Hero;
    });
  }, []);

  const value: HeroContextType = {
    hero,
    setHero,
    updateHero,
    saveCurrentHero,
    loadHero,
    createNewHero,
    updateAncestrySelection,
    addPerk,
    removePerk,
  };

  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>;
};

// Backward compatibility alias
export const SummonerProvider = HeroProvider;

// Also export the type for backward compatibility
export type SummonerContextType = HeroContextType;
