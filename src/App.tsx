import { useState, useEffect } from 'react';
import { useSummonerContext } from './context/SummonerContext';
import { useCombatContext } from './context/CombatContext';
import { useRollHistory } from './context/RollHistoryContext';
import CharacterCreation from './components/creation/CharacterCreation';
import CharacterManager from './components/character/CharacterManager';
import CharacterStatsPanel from './components/character/CharacterStatsPanel';
import CharacterDetailsView from './components/character/CharacterDetailsView';
import LevelUp from './components/character/LevelUp';
import CombatView from './components/combat/CombatView';
import ActionsView from './components/combat/ActionsView';
import ProjectsView from './components/projects/ProjectsView';
import MagicItemsView from './components/items/MagicItemsView';
import InventoryView from './components/inventory/InventoryView';
import AbilityCard from './components/shared/AbilityCard';
import RollHistoryPanel from './components/shared/RollHistoryPanel';
import { Ability } from './types';
import { PowerRollResult } from './utils/dice';
import './App.css';

type View = 'character' | 'abilities' | 'actions' | 'combat' | 'projects' | 'items' | 'inventory';

function App() {
  const { hero, setHero } = useSummonerContext();
  const { isInCombat, startCombat, endCombat, setOnCombatStartCallback } = useCombatContext();
  const { addRoll } = useRollHistory();
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

  const handleAbilityRoll = (ability: Ability, result: PowerRollResult) => {
    addRoll(result, ability.name, 'ability');
  };

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
          <div className="combat-toggle">
            {!isInCombat ? (
              <button onClick={startCombat} className="start-combat-btn">
                Start Combat
              </button>
            ) : (
              <button onClick={endCombat} className="end-combat-btn">
                End Combat
              </button>
            )}
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="mode-toggle">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Persistent Character Stats Panel */}
      <CharacterStatsPanel onLevelUp={() => setShowLevelUp(true)} />

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
          className={activeView === 'actions' ? 'active' : ''}
          onClick={() => setActiveView('actions')}
        >
          Actions
        </button>
        <button
          className={activeView === 'combat' ? 'active' : ''}
          onClick={() => setActiveView('combat')}
        >
          Combat & Minions
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

        {activeView === 'actions' && <ActionsView />}

        {activeView === 'abilities' && (
          <div className="abilities-view">
            <div className="abilities-grid">
              {/* Formation & Quick Command */}
              <div className="info-card formation-card">
                <h3>Formation: {hero.formation.charAt(0).toUpperCase() + hero.formation.slice(1)}</h3>
                <div className="quick-command">
                  <strong>{hero.quickCommand.name}</strong>
                  <p>{hero.quickCommand.description}</p>
                </div>
              </div>

              {/* Portfolio Summary */}
              <div className="info-card portfolio-card">
                <h3>Portfolio: {hero.portfolio.type.charAt(0).toUpperCase() + hero.portfolio.type.slice(1)}</h3>
                <div className="portfolio-summary">
                  <p><strong>Signatures:</strong> {hero.portfolio.signatureMinions.map(m => m.name).join(', ')}</p>
                  <p><strong>Unlocked:</strong> {hero.portfolio.unlockedMinions.length} minion types</p>
                </div>
              </div>
            </div>

            {/* Abilities */}
            <div className="abilities-section">
              <h3>Class Abilities</h3>
              <div className="abilities-list">
                {hero.abilities.map((ability) => (
                  <AbilityCard
                    key={ability.id}
                    ability={ability}
                    characteristics={hero.characteristics}
                    onRoll={handleAbilityRoll}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

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
