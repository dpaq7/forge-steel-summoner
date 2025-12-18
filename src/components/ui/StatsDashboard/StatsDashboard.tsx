import * as React from 'react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { TooltipProvider } from '@/components/ui/shadcn/tooltip';

import { DashboardHeader } from './DashboardHeader';
import { StatChipsRow } from './StatChipsRow';
import { PinnedCardsGrid } from './PinnedCardsGrid';

import type { StatsDashboardProps, StatCardType, TurnPhaseId } from './types';
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
    onAddCondition,
    onRemoveCondition,
    onUpdateConditionEndType,
    onManageCharacters,
    onCreateCharacter,
    onImportCharacter,
    onExportCharacter,
    onDuplicateCharacter,
    onShowAbout,
    onLevelUp,
    rollHistory = [],
    onRoll,
    onClearRollHistory,
    onRollCharacteristic,
    // Turn tracking
    turnNumber = 1,
    completedPhases = new Set<TurnPhaseId>(),
    onTogglePhase,
    onEndTurn,
    onResetTurn,
    // Portrait
    onPortraitChange,
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

  // Track previous combat state for auto-pin
  const prevIsInCombatRef = useRef(isInCombat);

  // Auto-pin turn tracker when combat starts, auto-unpin when combat ends
  useEffect(() => {
    if (isInCombat && !prevIsInCombatRef.current) {
      // Combat just started - auto-pin turn tracker
      setPinnedCards((prev) => {
        const next = new Set(prev);
        next.add('turn');
        return next;
      });
    } else if (!isInCombat && prevIsInCombatRef.current) {
      // Combat just ended - auto-unpin turn tracker
      setPinnedCards((prev) => {
        const next = new Set(prev);
        next.delete('turn');
        return next;
      });
    }
    prevIsInCombatRef.current = isInCombat;
  }, [isInCombat]);

  // Persist pinned state to localStorage (exclude 'turn' from persistence)
  useEffect(() => {
    try {
      const toSave = [...pinnedCards].filter((card) => card !== 'turn');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
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
      'turn', // Turn tracker first when in combat
      'stamina',
      'recoveries',
      'heroicResource',
      'surges',
      'victories',
      'conditions',
      'characteristics',
      'combat',
      'dice',
    ];

    const result = order.filter((type) => {
      if (!pinnedCards.has(type)) return false;
      // Only include turn when in combat
      if (type === 'turn' && !isInCombat) return false;
      return true;
    });
    return result;
  }, [pinnedCards, isInCombat]);

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
          onImportCharacter={onImportCharacter}
          onExportCharacter={onExportCharacter}
          onDuplicateCharacter={onDuplicateCharacter}
          onShowAbout={onShowAbout}
          onPortraitChange={onPortraitChange}
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
            turnNumber={turnNumber}
            completedPhases={completedPhases}
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
                onAddCondition={onAddCondition}
                onRemoveCondition={onRemoveCondition}
                onUpdateConditionEndType={onUpdateConditionEndType}
                onStartCombat={onStartCombat}
                onEndCombat={onEndCombat}
                onRespite={onRespite}
                rollHistory={rollHistory}
                onRoll={onRoll ?? (() => {})}
                onClearRollHistory={onClearRollHistory ?? (() => {})}
                onRollCharacteristic={onRollCharacteristic ?? (() => {})}
                turnNumber={turnNumber}
                completedPhases={completedPhases}
                onTogglePhase={onTogglePhase}
                onEndTurn={onEndTurn}
                onResetTurn={onResetTurn}
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </TooltipProvider>
  );
};

export default StatsDashboard;
