import { useState, useEffect } from 'react';
import { useHeroContext } from './context/HeroContext';
import { useCombatContext } from './context/CombatContext';
import { useTheme } from './context/ThemeContext';
import CharacterCreation from './components/creation/CharacterCreation';
import CharacterManager from './components/character/CharacterManager';
import CharacterDetailsView from './components/character/CharacterDetailsView';
import LevelUp from './components/character/LevelUp';
import CombatView from './components/combat/CombatView';
import AbilitiesView from './components/abilities/AbilitiesView';
import ProjectsView from './components/projects/ProjectsView';
import MagicItemsView from './components/items/MagicItemsView';
import InventoryView from './components/inventory/InventoryView';
import RollHistoryPanel from './components/shared/RollHistoryPanel';
import LegalModal from './components/shared/LegalModal';
import { StatsDashboard } from './components/ui/StatsDashboard';
import { StrainView } from './components/classDetails/TalentDetails/StrainView';
import { NullFieldView } from './components/classDetails/NullDetails/NullFieldView';
import { RoutinesView } from './components/classDetails/TroubadourDetails';
import { FerocityTrackerView } from './components/classDetails/FuryDetails';
import { getTabsForClass, ViewType } from './data/class-tabs';
import { getResourceConfig } from './data/class-resources';
import { HeroClass } from './types/hero';
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
  const { applyThemeForHero, applyCreatorTheme } = useTheme();
  const [activeView, setActiveView] = useState<View>('character');
  const [showCharacterManager, setShowCharacterManager] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showRespiteConfirm, setShowRespiteConfirm] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);

  // Apply theme when hero changes
  useEffect(() => {
    if (hero && !showCharacterCreation) {
      const heroClass: HeroClass = hero?.heroClass ?? 'summoner';
      applyThemeForHero(hero.id, heroClass);
    } else if (!showCharacterCreation) {
      // No hero and not in creation - apply MCDM theme
      applyCreatorTheme();
    }
    // Character creation handles its own theme
  }, [hero, showCharacterCreation, applyThemeForHero, applyCreatorTheme]);

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
    });

    setShowRespiteConfirm(false);
  };

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
          />
        )}
        <LegalModal
          isOpen={showLegalModal}
          onClose={() => setShowLegalModal(false)}
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
        onEndCombat={endCombat}
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

          {/* Placeholder for other class-specific views */}
          <RadixTabsContent value="judgment">
            <div className="placeholder-view">
              <h2>Judgment</h2>
              <p className="coming-soon">This class-specific feature is coming soon.</p>
            </div>
          </RadixTabsContent>

          <RadixTabsContent value="domain">
            <div className="placeholder-view">
              <h2>Domain</h2>
              <p className="coming-soon">This class-specific feature is coming soon.</p>
            </div>
          </RadixTabsContent>

          <RadixTabsContent value="persistent">
            <div className="placeholder-view">
              <h2>Persistent</h2>
              <p className="coming-soon">This class-specific feature is coming soon.</p>
            </div>
          </RadixTabsContent>

          <RadixTabsContent value="college">
            <div className="placeholder-view">
              <h2>College</h2>
              <p className="coming-soon">This class-specific feature is coming soon.</p>
            </div>
          </RadixTabsContent>

          <RadixTabsContent value="tactics">
            <div className="placeholder-view">
              <h2>Tactics</h2>
              <p className="coming-soon">This class-specific feature is coming soon.</p>
            </div>
          </RadixTabsContent>
        </main>
      </RadixTabs>

      {/* Modals */}
      {showCharacterManager && (
        <CharacterManager
          onClose={() => setShowCharacterManager(false)}
          onCreateNew={handleCreateNew}
        />
      )}

      {showLevelUp && (
        <LevelUp onClose={() => setShowLevelUp(false)} />
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
    </div>
  );
}

export default App;
