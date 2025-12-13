import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SummonerHero } from '../types';
import { Hero, SummonerHeroV2, isSummonerHero } from '../types/hero';
import { saveCharacter, loadCharacter, getActiveCharacterId, setActiveCharacterId } from '../utils/storage';

// For backward compatibility, we continue to expose SummonerHero type
// but internally we work with the new Hero/SummonerHeroV2 types
interface SummonerContextType {
  hero: SummonerHero | null;
  setHero: (hero: SummonerHero | null) => void;
  updateHero: (updates: Partial<SummonerHero>) => void;
  saveCurrentHero: () => void;
  loadHero: (id: string) => void;
  createNewHero: (hero: SummonerHero) => void;
}

const SummonerContext = createContext<SummonerContextType | undefined>(undefined);

export const useSummonerContext = () => {
  const context = useContext(SummonerContext);
  if (!context) {
    throw new Error('useSummonerContext must be used within a SummonerProvider');
  }
  return context;
};

interface SummonerProviderProps {
  children: ReactNode;
}

/**
 * Convert a Hero to SummonerHero for backward compatibility
 * Only works for summoner-class heroes
 */
const heroToSummoner = (hero: Hero): SummonerHero | null => {
  if (!isSummonerHero(hero)) {
    return null;
  }

  // SummonerHeroV2 is compatible with SummonerHero except for:
  // - heroClass (new field)
  // - heroicResource (replaces essence)
  // We need to convert heroicResource back to essence format
  const summonerV2 = hero as SummonerHeroV2;

  return {
    ...summonerV2,
    essence: {
      current: summonerV2.heroicResource.current,
      maxPerTurn: summonerV2.heroicResource.maxPerTurn,
    },
  } as SummonerHero;
};

/**
 * Convert a SummonerHero to Hero (SummonerHeroV2)
 */
const summonerToHero = (summoner: SummonerHero): Hero => {
  // Check if it already has heroClass (already migrated)
  if ('heroClass' in summoner && (summoner as any).heroClass) {
    return summoner as unknown as Hero;
  }

  return {
    ...summoner,
    heroClass: 'summoner' as const,
    heroicResource: {
      type: 'essence' as const,
      current: summoner.essence?.current ?? 0,
      maxPerTurn: summoner.essence?.maxPerTurn ?? 5,
    },
  } as SummonerHeroV2;
};

export const SummonerProvider: React.FC<SummonerProviderProps> = ({ children }) => {
  const [hero, setHeroInternal] = useState<SummonerHero | null>(null);

  // Wrapper to handle Hero -> SummonerHero conversion
  const setHero = (newHero: SummonerHero | null) => {
    setHeroInternal(newHero);
  };

  // Load active character on mount
  useEffect(() => {
    const activeId = getActiveCharacterId();
    if (activeId) {
      const loaded = loadCharacter(activeId);
      if (loaded) {
        // Convert Hero to SummonerHero for backward compatibility
        const summonerHero = heroToSummoner(loaded);
        if (summonerHero) {
          setHeroInternal(summonerHero);
        }
      }
    }
  }, []);

  // Auto-save when hero changes
  useEffect(() => {
    if (hero) {
      // Convert to Hero type before saving
      const heroData = summonerToHero(hero);
      saveCharacter(heroData);
    }
  }, [hero]);

  const updateHero = (updates: Partial<SummonerHero>) => {
    setHeroInternal((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const saveCurrentHero = () => {
    if (hero) {
      const heroData = summonerToHero(hero);
      saveCharacter(heroData);
    }
  };

  const loadHero = (id: string) => {
    const loaded = loadCharacter(id);
    if (loaded) {
      const summonerHero = heroToSummoner(loaded);
      if (summonerHero) {
        setHeroInternal(summonerHero);
        setActiveCharacterId(id);
      }
    }
  };

  const createNewHero = (newHero: SummonerHero) => {
    setHeroInternal(newHero);
    setActiveCharacterId(newHero.id);
    const heroData = summonerToHero(newHero);
    saveCharacter(heroData);
  };

  const value: SummonerContextType = {
    hero,
    setHero,
    updateHero,
    saveCurrentHero,
    loadHero,
    createNewHero,
  };

  return <SummonerContext.Provider value={value}>{children}</SummonerContext.Provider>;
};
