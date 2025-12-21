import { useState, useEffect, useCallback } from 'react';
import { useHeroContext } from './context/HeroContext';
import { useCombatContext } from './context/CombatContext';
import type { DiceRoll, DiceType, TurnPhaseId, CharacteristicId } from './components/ui/StatsDashboard/types';
import { CHARACTERISTICS } from './components/ui/StatsDashboard/types';
import CharacterCreation from './components/creation/CharacterCreation';
import CharacterManager from './components/character/CharacterManager';
import CharacterDetailsView from './components/character/CharacterDetailsView';
import LevelUpWizard from './components/character/LevelUpWizard';
import CombatView from './components/combat/CombatView';
import AbilitiesView from './components/abilities/AbilitiesView';
import ProjectsView from './components/projects/ProjectsView';
import MagicItemsView from './components/items/MagicItemsView';
import InventoryView from './components/inventory/InventoryView';
import RollHistoryPanel from './components/shared/RollHistoryPanel';
import LegalModal from './components/shared/LegalModal';
import { ImportCharacterDialog } from './components/shared/ImportCharacterDialog';
import { DeleteCharacterDialog } from './components/shared/DeleteCharacterDialog';
import {
  downloadCharacterJSON,
  duplicateCharacter,
  saveCharacter,
  deleteCharacter,
  getAllCharacters,
} from './utils/storage';
import type { Hero } from './types';
import { StatsDashboard } from './components/ui/StatsDashboard';
import { StrainView } from './components/classDetails/TalentDetails/StrainView';
import { NullFieldView } from './components/classDetails/NullDetails/NullFieldView';
import { RoutinesView } from './components/classDetails/TroubadourDetails';
import { FerocityTrackerView } from './components/classDetails/FuryDetails';
import { InsightView } from './components/classDetails/ShadowDetails';
import { JudgmentView } from './components/classDetails/CensorDetails';
import { TacticsView } from './components/classDetails/TacticianDetails';
import { PersistentMagicView } from './components/classDetails/ElementalistDetails';
import { DomainView } from './components/classDetails/ConduitDetails';
import { getTabsForClass, ViewType } from './data/class-tabs';
import { getResourceConfig } from './data/class-resources';
import { HeroClass } from './types/hero';
import type { ConditionId, ConditionEndType } from './types/common';
import { getDefaultEndType } from './data/conditions';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Button,
  RadixTabs,
  RadixTabsList,
  RadixTabsTrigger,
  RadixTabsContent,
} from '@/components/ui/shadcn';
import './App.css';

type View = ViewType;

function App() {
  const { hero, setHero, updateHero } = useHeroContext();
  const { isInCombat, startCombat, endCombat, setOnCombatStartCallback } = useCombatContext();
  const [activeView, setActiveView] = useState<View>('character');
  const [showCharacterManager, setShowCharacterManager] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showRespiteConfirm, setShowRespiteConfirm] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Hero | null>(null);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);

  // Turn tracking state
  const [turnNumber, setTurnNumber] = useState(1);
  const [completedPhases, setCompletedPhases] = useState<Set<TurnPhaseId>>(new Set());

  // Register callback to switch to minions tab when combat starts (Summoner only)
  useEffect(() => {
    // Only switch to minions tab for Summoners
    const heroClass: HeroClass = hero?.heroClass ?? 'summoner';
    if (heroClass === 'summoner') {
      setOnCombatStartCallback(() => setActiveView('minions'));
    } else {
      setOnCombatStartCallback(null);
    }
    return () => setOnCombatStartCallback(null);
  }, [setOnCombatStartCallback, hero]);

  const handleCreateNew = () => {
    setHero(null);
    setShowCharacterManager(false);
    setShowCharacterCreation(true);
  };

  // Handler for when a character is loaded from the manager dialog
  // This exits both the dialog AND the character creation view
  const handleCharacterLoaded = () => {
    setShowCharacterManager(false);
    setShowCharacterCreation(false);
  };

  // ════════════════════════════════════════════════════════════════
  // CHARACTER MANAGEMENT HANDLERS
  // ════════════════════════════════════════════════════════════════

  // Export current character to JSON file
  const handleExportCharacter = useCallback(() => {
    if (hero) {
      downloadCharacterJSON(hero);
    }
  }, [hero]);

  // Import character - opens the import dialog
  const handleImportCharacter = useCallback(() => {
    setShowImportDialog(true);
  }, []);

  // Handle imported character - save and switch to it
  const handleImportComplete = useCallback((importedHero: Hero) => {
    setHero(importedHero);
    setShowCharacterCreation(false);
    setShowCharacterManager(false);
  }, [setHero]);

  // Duplicate current character
  const handleDuplicateCharacter = useCallback(() => {
    if (hero) {
      const duplicate = duplicateCharacter(hero);
      saveCharacter(duplicate);
      setHero(duplicate);
    }
  }, [hero, setHero]);

  // Delete character - opens confirmation dialog
  const handleDeleteCharacterClick = useCallback(() => {
    if (hero) {
      setCharacterToDelete(hero);
      setShowDeleteDialog(true);
    }
  }, [hero]);

  // Confirm delete - remove character and switch to another
  const handleConfirmDelete = useCallback(() => {
    if (!characterToDelete) return;

    // Get all characters to find another one to switch to
    const allCharacters = getAllCharacters();
    const remainingCharacters = allCharacters.filter(c => c.id !== characterToDelete.id);

    // Delete the character
    deleteCharacter(characterToDelete.id);

    // Switch to another character or show creation
    if (remainingCharacters.length > 0) {
      setHero(remainingCharacters[0].data);
    } else {
      setHero(null);
      setShowCharacterCreation(true);
    }

    // Close dialog and clear state
    setShowDeleteDialog(false);
    setCharacterToDelete(null);
  }, [characterToDelete, setHero]);

  const handleCreationComplete = () => {
    setShowCharacterCreation(false);
  };

  const handleRespite = () => {
    if (!hero) return;
    // Convert victories to XP and reset resources
    const xpGained = hero.victories;
    const newXp = (hero.xp || 0) + xpGained;

    updateHero({
      xp: newXp,
      victories: 0,
      stamina: { ...hero.stamina, current: hero.stamina.max },
      recoveries: { ...hero.recoveries, current: hero.recoveries.max },
      surges: 0,
      activeSquads: [], // Dismiss all minions during respite
      activeConditions: [], // Clear all conditions during respite
    });

    setShowRespiteConfirm(false);
  };

  const handleAddCondition = (conditionId: ConditionId) => {
    if (!hero) return;
    // Check if condition already exists
    if (hero.activeConditions.some((c) => c.conditionId === conditionId)) return;

    updateHero({
      activeConditions: [
        ...hero.activeConditions,
        {
          conditionId,
          appliedAt: Date.now(),
          endType: getDefaultEndType(conditionId),
        },
      ],
    });
  };

  const handleRemoveCondition = (conditionId: ConditionId) => {
    if (!hero) return;
    updateHero({
      activeConditions: hero.activeConditions.filter((c) => c.conditionId !== conditionId),
    });
  };

  const handleUpdateConditionEndType = (conditionId: ConditionId, endType: ConditionEndType) => {
    if (!hero) return;
    updateHero({
      activeConditions: hero.activeConditions.map((c) =>
        c.conditionId === conditionId ? { ...c, endType } : c
      ),
    });
  };

  // Power roll tier calculation
  const calculatePowerRollTier = (total: number): { tier: number; label: string } => {
    if (total <= 2) return { tier: 1, label: 'Tier 1 (Critical Fail)' };
    if (total <= 6) return { tier: 1, label: 'Tier 1' };
    if (total <= 11) return { tier: 2, label: 'Tier 2' };
    if (total <= 16) return { tier: 3, label: 'Tier 3' };
    return { tier: 3, label: 'Tier 3+ (Critical!)' };
  };

  // Dice roll handler
  const handleRoll = useCallback((type: DiceType, label?: string) => {
    let results: number[];

    switch (type) {
      case '2d10':
      case 'power':
        results = [
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 10) + 1,
        ];
        break;
      case 'd10':
        results = [Math.floor(Math.random() * 10) + 1];
        break;
      case 'd6':
        results = [Math.floor(Math.random() * 6) + 1];
        break;
      case 'd3':
        results = [Math.floor(Math.random() * 3) + 1];
        break;
      default:
        results = [0];
    }

    const total = results.reduce((a, b) => a + b, 0);
    const isPowerRoll = type === '2d10' || type === 'power';
    const tierInfo = isPowerRoll ? calculatePowerRollTier(total) : undefined;

    const roll: DiceRoll = {
      id: crypto.randomUUID(),
      type,
      results,
      total,
      finalTotal: total,
      tier: tierInfo?.tier,
      tierLabel: tierInfo?.label,
      timestamp: Date.now(),
      label: label || (isPowerRoll ? 'Power Roll' : undefined),
    };

    // Add to history (newest first, keep last 50)
    setRollHistory((prev) => [roll, ...prev].slice(0, 50));
  }, []);

  // Characteristic roll handler (rolls 2d10 + modifier)
  const handleRollCharacteristic = useCallback((
    characteristicId: CharacteristicId,
    modifier: number
  ) => {
    // Roll 2d10
    const results = [
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 10) + 1,
    ];

    const total = results.reduce((a, b) => a + b, 0);
    const finalTotal = total + modifier;

    // Calculate tier based on final total (with modifier)
    const tierInfo = calculatePowerRollTier(finalTotal);

    // Get characteristic display name
    const charInfo = CHARACTERISTICS.find(c => c.id === characteristicId);
    const modifierName = charInfo?.name || characteristicId;

    const roll: DiceRoll = {
      id: crypto.randomUUID(),
      type: 'power',
      results,
      total,
      modifier,
      modifierName,
      finalTotal,
      tier: tierInfo.tier,
      tierLabel: tierInfo.label,
      timestamp: Date.now(),
      label: 'Power Roll',
    };

    setRollHistory((prev) => [roll, ...prev].slice(0, 50));
  }, []);

  // Clear roll history
  const handleClearRollHistory = useCallback(() => {
    setRollHistory([]);
  }, []);

  // Turn tracking handlers
  const handleTogglePhase = useCallback((phaseId: TurnPhaseId) => {
    setCompletedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  }, []);

  // End turn - called after processing conditions
  const handleEndTurn = useCallback(() => {
    setTurnNumber((prev) => prev + 1);
    setCompletedPhases(new Set());
  }, []);

  // Reset current turn (don't advance turn number)
  const handleResetTurn = useCallback(() => {
    setCompletedPhases(new Set());
  }, []);

  // Reset turn tracking when combat ends
  const handleEndCombatWithTurnReset = useCallback(() => {
    endCombat();
    setTurnNumber(1);
    setCompletedPhases(new Set());
  }, [endCombat]);

  // Portrait change handler
  const handlePortraitChange = useCallback((portraitUrl: string | null) => {
    updateHero({ portraitUrl });
  }, [updateHero]);

  if (!hero || showCharacterCreation) {
    return (
      <div className="app dark-mode">
        <StatsDashboard
          hero={null}
          isInCombat={false}
          onStartCombat={() => {}}
          onEndCombat={() => {}}
          onRespite={() => {}}
          onManageCharacters={() => setShowCharacterManager(true)}
          onCreateCharacter={handleCreateNew}
          onShowAbout={() => setShowLegalModal(true)}
          onLevelUp={() => {}}
          onCatchBreath={() => {}}
          onStaminaChange={() => {}}
          onRecoveriesChange={() => {}}
          onVictoriesChange={() => {}}
          onSurgesChange={() => {}}
          onAddCondition={() => {}}
          onRemoveCondition={() => {}}
          onUpdateConditionEndType={() => {}}
          onImportCharacter={handleImportCharacter}
          resourceConfig={{
            name: 'Resource',
            abbreviation: 'RES',
            color: 'var(--accent-primary)',
            minValue: 0,
          }}
        />
        <main className="app-main">
          <CharacterCreation onComplete={handleCreationComplete} />
        </main>
        {showCharacterManager && (
          <CharacterManager
            onClose={() => setShowCharacterManager(false)}
            onCreateNew={handleCreateNew}
            onCharacterLoaded={handleCharacterLoaded}
          />
        )}
        <LegalModal
          isOpen={showLegalModal}
          onClose={() => setShowLegalModal(false)}
        />
        <ImportCharacterDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onImport={handleImportComplete}
          existingNames={getAllCharacters().map(c => c.name)}
        />
      </div>
    );
  }

  // Type guard for hero
  if (!hero) return null;

  // Get hero class (handle both old SummonerHero and new Hero types)
  const heroClass: HeroClass = hero?.heroClass ?? 'summoner';

  // Get dynamic tabs based on hero's class
  const tabs = getTabsForClass(heroClass);

  // Check if hero is a Summoner
  const isSummoner = heroClass === 'summoner';

  // Get resource config for current hero
  const resourceConfig = getResourceConfig(hero.heroClass);

  return (
    <div className="app dark-mode">
      {/* StatsDashboard - Unified Pinnable Stats Dashboard */}
      <StatsDashboard
        hero={hero}
        isInCombat={isInCombat}
        onStartCombat={startCombat}
        onEndCombat={handleEndCombatWithTurnReset}
        onRespite={() => setShowRespiteConfirm(true)}
        onManageCharacters={() => setShowCharacterManager(true)}
        onCreateCharacter={handleCreateNew}
        onShowAbout={() => setShowLegalModal(true)}
        onLevelUp={() => setShowLevelUp(true)}
        resourceConfig={resourceConfig}
        onResourceChange={(newValue: number) => {
          const updatedResource = {
            ...hero.heroicResource,
            current: Math.max(resourceConfig.minValue, newValue),
          };
          updateHero({ heroicResource: updatedResource } as Partial<typeof hero>);
        }}
        onCatchBreath={(healAmount: number) => {
          if (hero.recoveries.current > 0) {
            const newStamina = Math.min(hero.stamina.current + healAmount, hero.stamina.max);
            updateHero({
              stamina: { ...hero.stamina, current: newStamina },
              recoveries: { ...hero.recoveries, current: hero.recoveries.current - 1 },
            });
          }
        }}
        onStaminaChange={(newValue: number) => {
          updateHero({ stamina: { ...hero.stamina, current: newValue } });
        }}
        onRecoveriesChange={(newValue: number) => {
          updateHero({ recoveries: { ...hero.recoveries, current: newValue } });
        }}
        onVictoriesChange={(newValue: number) => {
          updateHero({ victories: newValue });
        }}
        onSurgesChange={(newValue: number) => {
          updateHero({ surges: newValue });
        }}
        onAddCondition={handleAddCondition}
        onRemoveCondition={handleRemoveCondition}
        onUpdateConditionEndType={handleUpdateConditionEndType}
        rollHistory={rollHistory}
        onRoll={handleRoll}
        onClearRollHistory={handleClearRollHistory}
        onRollCharacteristic={handleRollCharacteristic}
        // Turn tracking
        turnNumber={turnNumber}
        completedPhases={completedPhases}
        onTogglePhase={handleTogglePhase}
        onEndTurn={handleEndTurn}
        onResetTurn={handleResetTurn}
        // Portrait
        onPortraitChange={handlePortraitChange}
        // Character management
        onExportCharacter={handleExportCharacter}
        onImportCharacter={handleImportCharacter}
        onDuplicateCharacter={handleDuplicateCharacter}
      />

      {/* Navigation Tabs - Dynamic based on hero class */}
      <RadixTabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as View)}
        className="view-tabs-container"
      >
        <RadixTabsList variant="fantasy" className="view-tabs">
          {tabs.map((tab) => (
            <RadixTabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </RadixTabsTrigger>
          ))}
        </RadixTabsList>

        {/* Main Content */}
        <main className="app-main">
          <RadixTabsContent value="character">
            <CharacterDetailsView />
          </RadixTabsContent>

          <RadixTabsContent value="abilities">
            <AbilitiesView />
          </RadixTabsContent>

          {/* Summoner-specific: Minions tab */}
          <RadixTabsContent value="minions">
            <CombatView />
          </RadixTabsContent>

          <RadixTabsContent value="projects">
            <ProjectsView />
          </RadixTabsContent>

          <RadixTabsContent value="items">
            <MagicItemsView />
          </RadixTabsContent>

          <RadixTabsContent value="inventory">
            <InventoryView />
          </RadixTabsContent>

          {/* Talent Strain View */}
          <RadixTabsContent value="strain">
            <StrainView />
          </RadixTabsContent>

          {/* Null Field View */}
          <RadixTabsContent value="nullfield">
            <NullFieldView />
          </RadixTabsContent>

          {/* Troubadour Routines View */}
          <RadixTabsContent value="routines">
            <RoutinesView />
          </RadixTabsContent>

          {/* Fury Ferocity View */}
          <RadixTabsContent value="ferocity">
            <FerocityTrackerView />
          </RadixTabsContent>

          {/* Class-specific views */}
          <RadixTabsContent value="judgment">
            <JudgmentView />
          </RadixTabsContent>

          <RadixTabsContent value="domain">
            <DomainView />
          </RadixTabsContent>

          <RadixTabsContent value="persistent">
            <PersistentMagicView />
          </RadixTabsContent>

          <RadixTabsContent value="college">
            <InsightView />
          </RadixTabsContent>

          <RadixTabsContent value="tactics">
            <TacticsView />
          </RadixTabsContent>
        </main>
      </RadixTabs>

      {/* Modals */}
      {showCharacterManager && (
        <CharacterManager
          onClose={() => setShowCharacterManager(false)}
          onCreateNew={handleCreateNew}
          onCharacterLoaded={handleCharacterLoaded}
        />
      )}

      {showLevelUp && (
        <LevelUpWizard onClose={() => setShowLevelUp(false)} />
      )}

      {/* Respite Confirmation Modal */}
      <AlertDialog open={showRespiteConfirm} onOpenChange={setShowRespiteConfirm}>
        <AlertDialogContent variant="fantasy">
          <AlertDialogHeader>
            <AlertDialogTitle>Take a Respite?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-left">
                <p className="mb-3">
                  During a respite, you rest and recover. This will:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)] mb-3">
                  <li>Convert <strong className="text-[var(--accent-bright)]">{hero.victories} victories</strong> to <strong className="text-[var(--xp)]">{hero.victories} XP</strong></li>
                  <li>Restore stamina to maximum ({hero.stamina.max})</li>
                  <li>Restore all recoveries ({hero.recoveries.max})</li>
                  <li>Reset surges to 0</li>
                  {isSummoner && <li>Dismiss all active minions</li>}
                </ul>
                {hero.victories > 0 && (
                  <p className="text-[var(--xp)] font-medium">
                    New XP total: {(hero.xp || 0) + hero.victories}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRespite}>
              Take Respite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Roll History Panel - Available globally */}
      <RollHistoryPanel />

      {/* Legal/About Modal */}
      <LegalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />

      {/* Import Character Dialog */}
      <ImportCharacterDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportComplete}
        existingNames={getAllCharacters().map(c => c.name)}
      />

      {/* Delete Character Confirmation Dialog */}
      <DeleteCharacterDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        character={characterToDelete}
        onConfirm={handleConfirmDelete}
        isCurrentCharacter={characterToDelete?.id === hero?.id}
      />
    </div>
  );
}

export default App;
