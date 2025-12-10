import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PowerRollResult } from '../utils/dice';

export interface RollHistoryEntry {
  id: string;
  result: PowerRollResult;
  source: string; // e.g., "Summoner Strike", "Skeleton Free Strike"
  sourceType: 'ability' | 'minion' | 'hero' | 'other';
  timestamp: number;
}

interface RollHistoryContextType {
  history: RollHistoryEntry[];
  addRoll: (result: PowerRollResult, source: string, sourceType: RollHistoryEntry['sourceType']) => void;
  clearHistory: () => void;
  isHistoryOpen: boolean;
  toggleHistory: () => void;
}

const RollHistoryContext = createContext<RollHistoryContextType | undefined>(undefined);

const MAX_HISTORY_SIZE = 50;

export const RollHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<RollHistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const addRoll = useCallback(
    (result: PowerRollResult, source: string, sourceType: RollHistoryEntry['sourceType']) => {
      const entry: RollHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        result,
        source,
        sourceType,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const newHistory = [entry, ...prev];
        return newHistory.slice(0, MAX_HISTORY_SIZE);
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const toggleHistory = useCallback(() => {
    setIsHistoryOpen((prev) => !prev);
  }, []);

  return (
    <RollHistoryContext.Provider
      value={{
        history,
        addRoll,
        clearHistory,
        isHistoryOpen,
        toggleHistory,
      }}
    >
      {children}
    </RollHistoryContext.Provider>
  );
};

export const useRollHistory = (): RollHistoryContextType => {
  const context = useContext(RollHistoryContext);
  if (!context) {
    throw new Error('useRollHistory must be used within a RollHistoryProvider');
  }
  return context;
};
