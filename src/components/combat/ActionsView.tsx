import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { standardManeuvers, standardTriggeredActions, moveActions, quickCommands } from '../../data/action-economy';
import { Ability } from '../../types';
import './ActionsView.css';

// Action economy reference view

type ActionCategory = 'overview' | 'moves' | 'maneuvers' | 'triggered' | 'commands';

const ActionsView: React.FC = () => {
  const { hero } = useSummonerContext();
  const [activeCategory, setActiveCategory] = useState<ActionCategory>('overview');

  if (!hero) return null;

  // Filter quick commands to show only those for the hero's formation
  const formationCommands = quickCommands.filter(
    cmd => cmd.formation === hero.formation
  );

  const renderAbilityCard = (ability: Ability, showKeywords = false) => (
    <div key={ability.id} className="action-card-full">
      <div className="action-header">
        <h3>{ability.name}</h3>
        <span className={`action-type-badge ${ability.actionType}`}>
          {ability.actionType.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      </div>

      {ability.trigger && (
        <div className="action-trigger">
          <strong>Trigger:</strong> {ability.trigger}
        </div>
      )}

      <div className="action-details">
        <div className="detail-row">
          <span className="detail-label">Distance:</span>
          <span className="detail-value">{ability.distance}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Target:</span>
          <span className="detail-value">{ability.target}</span>
        </div>
        {showKeywords && ability.keywords.length > 0 && (
          <div className="detail-row">
            <span className="detail-label">Keywords:</span>
            <span className="detail-value keywords">
              {ability.keywords.map((kw, i) => (
                <span key={i} className="keyword">{kw}</span>
              ))}
            </span>
          </div>
        )}
      </div>

      <div className="action-effect">
        <strong>Effect:</strong> {ability.effect}
      </div>
    </div>
  );

  const renderQuickCommandCard = (cmd: typeof quickCommands[0]) => (
    <div key={cmd.id} className="action-card-full command">
      <div className="action-header">
        <h3>{cmd.name}</h3>
        <span className="action-type-badge triggered">Quick Command</span>
      </div>

      <div className="action-trigger">
        <strong>Trigger:</strong> {cmd.trigger}
      </div>

      <div className="action-effect">
        <strong>Effect:</strong> {cmd.effect}
      </div>
    </div>
  );

  return (
    <div className="actions-view">
      <div className="actions-header">
        <h2>Action Economy Reference</h2>
        <p className="action-summary">
          Each turn you get: <strong>Move Action</strong> + <strong>Maneuver</strong> + <strong>Main Action</strong>
        </p>
        <p className="action-summary secondary">
          You can use <strong>1 Triggered Action</strong> per round (resets at start of your turn)
        </p>
      </div>

      <div className="actions-nav">
        <button
          className={activeCategory === 'overview' ? 'active' : ''}
          onClick={() => setActiveCategory('overview')}
        >
          Overview
        </button>
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
          Triggered Actions
        </button>
        <button
          className={activeCategory === 'commands' ? 'active' : ''}
          onClick={() => setActiveCategory('commands')}
        >
          Quick Commands
        </button>
      </div>

      <div className="actions-content">
        {activeCategory === 'overview' && (
          <div className="overview-section">
            <div className="overview-grid">
              <div className="overview-card move">
                <h3>Move Action</h3>
                <p>Use your movement to reposition on the battlefield.</p>
                <ul>
                  <li><strong>Advance:</strong> Move up to your Speed. Provokes opportunity attacks.</li>
                  <li><strong>Disengage:</strong> Shift 1 square safely (no opportunity attacks).</li>
                </ul>
              </div>

              <div className="overview-card maneuver">
                <h3>Maneuver</h3>
                <p>Minor actions that don't require your full attention.</p>
                <ul>
                  <li>Aid Attack (grant ally Edge)</li>
                  <li>Catch Breath (spend Recovery)</li>
                  <li>Drink a Potion</li>
                  <li>Grab, Hide, Search</li>
                  <li>Make or Assist a Test</li>
                </ul>
              </div>

              <div className="overview-card main">
                <h3>Main Action</h3>
                <p>Your primary action each turn - use class abilities.</p>
                <ul>
                  <li>Use a class ability (Action type)</li>
                  <li>Call Forth minions</li>
                  <li>Summoner Strike</li>
                  <li>Other action abilities</li>
                </ul>
              </div>

              <div className="overview-card triggered">
                <h3>Triggered Action</h3>
                <p>React to events - 1 per round.</p>
                <ul>
                  <li>Opportunity Attack</li>
                  <li>Free Strike (when triggered)</li>
                  <li>Quick Commands (formation-based)</li>
                </ul>
              </div>
            </div>

            <div className="turn-structure">
              <h3>Turn Structure</h3>
              <div className="turn-flow">
                <div className="turn-phase">
                  <span className="phase-number">1</span>
                  <span className="phase-name">Start of Turn</span>
                  <span className="phase-desc">Gain resources, triggered action resets</span>
                </div>
                <div className="turn-arrow">→</div>
                <div className="turn-phase">
                  <span className="phase-number">2</span>
                  <span className="phase-name">Your Actions</span>
                  <span className="phase-desc">Move + Maneuver + Main (any order)</span>
                </div>
                <div className="turn-arrow">→</div>
                <div className="turn-phase">
                  <span className="phase-number">3</span>
                  <span className="phase-name">End of Turn</span>
                  <span className="phase-desc">End-of-turn effects resolve</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'moves' && (
          <div className="actions-list">
            <h3>Move Actions</h3>
            <p className="section-desc">Choose one move action per turn.</p>
            <div className="actions-cards-grid">
              {moveActions.map(action => renderAbilityCard(action))}
            </div>
          </div>
        )}

        {activeCategory === 'maneuvers' && (
          <div className="actions-list">
            <h3>Standard Maneuvers</h3>
            <p className="section-desc">You get one maneuver per turn. These are available to all heroes.</p>
            <div className="actions-cards-grid">
              {standardManeuvers.map(action => renderAbilityCard(action))}
            </div>
          </div>
        )}

        {activeCategory === 'triggered' && (
          <div className="actions-list">
            <h3>Triggered Actions</h3>
            <p className="section-desc">You can use one triggered action per round. Free triggered actions don't count against this limit.</p>
            <div className="actions-cards-grid">
              {standardTriggeredActions.map(action => renderAbilityCard(action, true))}
            </div>
          </div>
        )}

        {activeCategory === 'commands' && (
          <div className="actions-list">
            <h3>Quick Commands ({hero.formation.charAt(0).toUpperCase() + hero.formation.slice(1)} Formation)</h3>
            <p className="section-desc">
              These triggered actions are specific to your {hero.formation} formation.
            </p>
            {formationCommands.length > 0 ? (
              <div className="actions-cards-grid">
                {formationCommands.map(cmd => renderQuickCommandCard(cmd))}
              </div>
            ) : (
              <p className="no-commands">No quick commands defined for your formation yet.</p>
            )}

            <div className="other-formations">
              <h4>Other Formation Commands (for reference)</h4>
              {['horde', 'platoon', 'elite', 'leader']
                .filter(f => f !== hero.formation)
                .map(formation => {
                  const cmds = quickCommands.filter(c => c.formation === formation);
                  if (cmds.length === 0) return null;
                  return (
                    <div key={formation} className="formation-group">
                      <h5>{formation.charAt(0).toUpperCase() + formation.slice(1)}</h5>
                      {cmds.map(cmd => (
                        <div key={cmd.id} className="mini-command">
                          <strong>{cmd.name}:</strong> {cmd.effect.substring(0, 100)}...
                        </div>
                      ))}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsView;
