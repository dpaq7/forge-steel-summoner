import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { TooltipProvider } from '@/components/ui/shadcn/tooltip';

import { DashboardHeader } from './DashboardHeader';
import { StatChipsRow } from './StatChipsRow';
import { PinnedCardsGrid } from './PinnedCardsGrid';

import type { StatsDashboardProps, StatCardType } from './types';
import './StatsDashboard.css';

// Default pinned cards for new users
const DEFAULT_PINNED: StatCardType[] = ['stamina', 'recoveries'];

// LocalStorage key
const STORAGE_KEY = 'mettle-dashboard-pinned';

export const StatsDashboard: React.FC<StatsDashboardProps> = (props) => {
  const {
    hero,
    isInCombat,
    onStartCombat,
    onEndCombat,
    onRespite,
    onStaminaChange,
    onRecoveriesChange,
    onCatchBreath,
    resourceConfig,
    onResourceChange,
    onSurgesChange,
    onVictoriesChange,
    onManageCharacters,
    onCreateCharacter,
    onShowAbout,
    onLevelUp,
  } = props;

  // Load pinned state from localStorage
  const [pinnedCards, setPinnedCards] = useState<Set<StatCardType>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StatCardType[];
        return new Set(parsed);
      }
    } catch (e) {
      console.warn('Failed to load pinned cards from storage:', e);
    }
    return new Set(DEFAULT_PINNED);
  });

  // Persist pinned state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...pinnedCards]));
    } catch (e) {
      console.warn('Failed to save pinned cards to storage:', e);
    }
  }, [pinnedCards]);

  // Toggle pin state
  const togglePin = useCallback((cardType: StatCardType) => {
    setPinnedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardType)) {
        next.delete(cardType);
      } else {
        next.add(cardType);
      }
      return next;
    });
  }, []);

  // Check if pinned
  const isPinned = useCallback(
    (cardType: StatCardType): boolean => {
      return pinnedCards.has(cardType);
    },
    [pinnedCards]
  );

  // Unpin all
  const unpinAll = useCallback(() => {
    setPinnedCards(new Set());
  }, []);

  // Get ordered list of pinned cards (for consistent rendering)
  const pinnedCardsList = useMemo(() => {
    const order: StatCardType[] = [
      'stamina',
      'recoveries',
      'heroicResource',
      'surges',
      'victories',
      'characteristics',
      'combat',
    ];

    return order.filter((type) => pinnedCards.has(type));
  }, [pinnedCards]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`stats-dashboard ${isInCombat ? 'combat-active' : ''}`}>
        {/* Header Row: Logo, Character, Actions */}
        <DashboardHeader
          hero={hero}
          isInCombat={isInCombat}
          onStartCombat={onStartCombat}
          onEndCombat={onEndCombat}
          onRespite={onRespite}
          onManageCharacters={onManageCharacters}
          onCreateCharacter={onCreateCharacter}
          onShowAbout={onShowAbout}
        />

        {/* Stat Chips Row: All stats with +/- controls */}
        {hero && (
          <StatChipsRow
            hero={hero}
            isInCombat={isInCombat}
            resourceConfig={resourceConfig}
            pinnedCards={pinnedCards}
            onTogglePin={togglePin}
            onStaminaChange={onStaminaChange}
            onRecoveriesChange={onRecoveriesChange}
            onResourceChange={onResourceChange}
            onSurgesChange={onSurgesChange}
            onVictoriesChange={onVictoriesChange}
          />
        )}

        {/* Pinned Cards Area */}
        {hero && (
          <AnimatePresence mode="popLayout">
            {pinnedCardsList.length > 0 && (
              <PinnedCardsGrid
                pinnedCards={pinnedCardsList}
                hero={hero}
                isInCombat={isInCombat}
                resourceConfig={resourceConfig}
                onUnpin={togglePin}
                onUnpinAll={unpinAll}
                onStaminaChange={onStaminaChange}
                onRecoveriesChange={onRecoveriesChange}
                onCatchBreath={onCatchBreath}
                onResourceChange={onResourceChange}
                onSurgesChange={onSurgesChange}
                onVictoriesChange={onVictoriesChange}
                onStartCombat={onStartCombat}
                onEndCombat={onEndCombat}
                onRespite={onRespite}
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </TooltipProvider>
  );
};

export default StatsDashboard;
