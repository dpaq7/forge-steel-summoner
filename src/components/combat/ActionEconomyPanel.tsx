import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { standardManeuvers, standardTriggeredActions, moveActions, quickCommands } from '../../data/action-economy';
import { Ability } from '../../types';
import './ActionEconomyPanel.css';

type ActionCategory = 'moves' | 'maneuvers' | 'triggered' | 'commands';

const ActionEconomyPanel: React.FC = () => {
  const { hero } = useSummonerContext();
  const [activeCategory, setActiveCategory] = useState<ActionCategory>('maneuvers');

  if (!hero) return null;

  // Filter quick commands to show only those for the hero's formation
  const formationCommands = quickCommands.filter(
    cmd => cmd.formation === hero.formation
  );

  const renderAbilityCard = (ability: Ability) => (
    <div key={ability.id} className="action-card">
      <div className="action-header">
        <h4>{ability.name}</h4>
        <span className={`action-type ${ability.actionType}`}>
          {ability.actionType.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      </div>
      {ability.trigger && (
        <div className="action-trigger">
          <strong>Trigger:</strong> {ability.trigger}
        </div>
      )}
      <div className="action-targeting">
        <span><strong>Distance:</strong> {ability.distance}</span>
        <span><strong>Target:</strong> {ability.target}</span>
      </div>
      <div className="action-effect">
        {ability.effect}
      </div>
    </div>
  );

  const renderQuickCommandCard = (cmd: typeof quickCommands[0]) => (
    <div key={cmd.id} className="action-card command-card">
      <div className="action-header">
        <h4>{cmd.name}</h4>
        <span className="action-type triggered">Quick Command</span>
      </div>
      <div className="action-trigger">
        <strong>Trigger:</strong> {cmd.trigger}
      </div>
      <div className="action-effect">
        {cmd.effect}
      </div>
    </div>
  );

  return (
    <div className="action-economy-panel">
      <h3>Action Economy</h3>
      <p className="action-reminder">
        Each turn: <strong>Move</strong> + <strong>Maneuver</strong> + <strong>Main Action</strong>
        {' '}| 1 Triggered Action per round
      </p>

      <div className="action-category-tabs">
        <button
          className={activeCategory === 'moves' ? 'active' : ''}
          onClick={() => setActiveCategory('moves')}
        >
          Move Actions
        </button>
        <button
          className={activeCategory === 'maneuvers' ? 'active' : ''}
          onClick={() => setActiveCategory('maneuvers')}
        >
          Maneuvers
        </button>
        <button
          className={activeCategory === 'triggered' ? 'active' : ''}
          onClick={() => setActiveCategory('triggered')}
        >
          Triggered
        </button>
        <button
          className={activeCategory === 'commands' ? 'active' : ''}
          onClick={() => setActiveCategory('commands')}
        >
          Quick Commands
        </button>
      </div>

      <div className="action-list">
        {activeCategory === 'moves' && moveActions.map(renderAbilityCard)}
        {activeCategory === 'maneuvers' && standardManeuvers.map(renderAbilityCard)}
        {activeCategory === 'triggered' && standardTriggeredActions.map(renderAbilityCard)}
        {activeCategory === 'commands' && (
          <>
            {formationCommands.length > 0 ? (
              formationCommands.map(renderQuickCommandCard)
            ) : (
              <p className="no-commands">No quick commands available for your formation.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActionEconomyPanel;
