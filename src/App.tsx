import { useState, useEffect } from 'react';
import { useSummonerContext } from './context/SummonerContext';
import { useCombatContext } from './context/CombatContext';
import CharacterCreation from './components/creation/CharacterCreation';
import CharacterManager from './components/character/CharacterManager';
import CharacterStatsPanel from './components/character/CharacterStatsPanel';
import CharacterDetailsView from './components/character/CharacterDetailsView';
import LevelUp from './components/character/LevelUp';
import CombatView from './components/combat/CombatView';
import AbilitiesView from './components/abilities/AbilitiesView';
import ProjectsView from './components/projects/ProjectsView';
import MagicItemsView from './components/items/MagicItemsView';
import InventoryView from './components/inventory/InventoryView';
import RollHistoryPanel from './components/shared/RollHistoryPanel';
import CollapsibleHeader from './components/ui/CollapsibleHeader';
import './App.css';

type View = 'character' | 'abilities' | 'combat' | 'projects' | 'items' | 'inventory';

function App() {
  const { hero, setHero } = useSummonerContext();
  const { isInCombat, startCombat, endCombat, setOnCombatStartCallback, essenceState } = useCombatContext();
  const [darkMode, setDarkMode] = useState(true);
  const [activeView, setActiveView] = useState<View>('character');
  const [showCharacterManager, setShowCharacterManager] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Register callback to switch to combat tab when combat starts
  useEffect(() => {
    setOnCombatStartCallback(() => setActiveView('combat'));
    return () => setOnCombatStartCallback(null);
  }, [setOnCombatStartCallback]);

  const handleCreateNew = () => {
    setHero(null);
    setShowCharacterManager(false);
    setShowCharacterCreation(true);
  };

  const handleCreationComplete = () => {
    setShowCharacterCreation(false);
  };

  if (!hero || showCharacterCreation) {
    return (
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <header className="app-header">
          <h1>Forge Steel Summoner</h1>
          <div className="header-actions">
            <button onClick={() => setShowCharacterManager(true)} className="manage-chars-btn">
              Manage Characters
            </button>
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </header>
        <main className="app-main">
          <CharacterCreation onComplete={handleCreationComplete} />
        </main>
        {showCharacterManager && (
          <CharacterManager
            onClose={() => setShowCharacterManager(false)}
            onCreateNew={handleCreateNew}
          />
        )}
      </div>
    );
  }

  // Type guard for hero
  if (!hero) return null;

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Minimal Header */}
      <header className="app-header compact">
        <h1>Forge Steel Summoner</h1>
        <div className="header-actions">
          <button onClick={() => setShowCharacterManager(true)} className="manage-chars-btn">
            Characters
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="mode-toggle">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Collapsible Character Stats Panel */}
      <CollapsibleHeader
        compactData={{
          name: hero.name,
          level: hero.level,
          portraitUrl: hero.portraitUrl || null,
          stamina: {
            current: hero.stamina.current,
            max: hero.stamina.max,
          },
          essence: essenceState.currentEssence,
          recoveries: {
            current: hero.recoveries.current,
            max: hero.recoveries.max,
          },
          surges: hero.surges,
          victories: hero.victories,
          maxVictories: 12,
          characteristics: hero.characteristics,
        }}
      >
        <CharacterStatsPanel onLevelUp={() => setShowLevelUp(true)} />
      </CollapsibleHeader>

      {/* Navigation Tabs */}
      <nav className="view-tabs">
        <button
          className={activeView === 'character' ? 'active' : ''}
          onClick={() => setActiveView('character')}
        >
          Character
        </button>
        <button
          className={activeView === 'abilities' ? 'active' : ''}
          onClick={() => setActiveView('abilities')}
        >
          Abilities
        </button>
        <button
          className={activeView === 'combat' ? 'active' : ''}
          onClick={() => setActiveView('combat')}
        >
          Minions
        </button>
        <button
          className={activeView === 'projects' ? 'active' : ''}
          onClick={() => setActiveView('projects')}
        >
          Projects
        </button>
        <button
          className={activeView === 'items' ? 'active' : ''}
          onClick={() => setActiveView('items')}
        >
          Magic Items
        </button>
        <button
          className={activeView === 'inventory' ? 'active' : ''}
          onClick={() => setActiveView('inventory')}
        >
          Inventory
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {activeView === 'character' && <CharacterDetailsView />}

        {activeView === 'abilities' && <AbilitiesView />}

        {activeView === 'combat' && <CombatView />}

        {activeView === 'projects' && <ProjectsView />}

        {activeView === 'items' && <MagicItemsView />}

        {activeView === 'inventory' && <InventoryView />}
      </main>

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

      {/* Roll History Panel - Available globally */}
      <RollHistoryPanel />
    </div>
  );
}

export default App;
