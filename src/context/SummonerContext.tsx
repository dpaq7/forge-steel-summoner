import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SummonerHero } from '../types';
import { saveCharacter, loadCharacter, getActiveCharacterId, setActiveCharacterId } from '../utils/storage';

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

export const SummonerProvider: React.FC<SummonerProviderProps> = ({ children }) => {
  const [hero, setHero] = useState<SummonerHero | null>(null);

  // Load active character on mount
  useEffect(() => {
    const activeId = getActiveCharacterId();
    if (activeId) {
      const loaded = loadCharacter(activeId);
      if (loaded) {
        setHero(loaded);
      }
    }
  }, []);

  // Auto-save when hero changes
  useEffect(() => {
    if (hero) {
      saveCharacter(hero);
    }
  }, [hero]);

  const updateHero = (updates: Partial<SummonerHero>) => {
    setHero((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const saveCurrentHero = () => {
    if (hero) {
      saveCharacter(hero);
    }
  };

  const loadHero = (id: string) => {
    const loaded = loadCharacter(id);
    if (loaded) {
      setHero(loaded);
      setActiveCharacterId(id);
    }
  };

  const createNewHero = (newHero: SummonerHero) => {
    setHero(newHero);
    setActiveCharacterId(newHero.id);
    saveCharacter(newHero);
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
