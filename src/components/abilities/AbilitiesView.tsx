import React, { useState } from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { useRollHistory } from '../../context/RollHistoryContext';
import { standardManeuvers, standardTriggeredActions, moveActions, quickCommands } from '../../data/action-economy';
import { Ability } from '../../types';
import { PowerRollResult } from '../../utils/dice';
import { ActionType, ActionTag } from '../../types/action';
import AbilityCard from '../shared/AbilityCard';
import ActionCard from '../ui/ActionCard';
import './AbilitiesView.css';

type ReferenceSection = 'overview' | 'moves' | 'maneuvers' | 'triggered' | 'commands' | null;

const AbilitiesView: React.FC = () => {
  const { hero } = useSummonerContext();
  const { addRoll } = useRollHistory();
  const [openSection, setOpenSection] = useState<ReferenceSection>(null);

  if (!hero) return null;

  const handleAbilityRoll = (ability: Ability, result: PowerRollResult) => {
    addRoll(result, ability.name, 'ability');
  };

  const toggleSection = (section: ReferenceSection) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  // Filter quick commands for hero's formation
  const formationCommands = quickCommands.filter(
    cmd => cmd.formation === hero.formation
  );

  // Map Ability actionType to ActionCard type
  const mapActionType = (actionType: string): ActionType => {
    const typeMap: Record<string, ActionType> = {
      'main': 'main',
      'maneuver': 'maneuver',
      'triggered': 'triggered',
      'freeTriggered': 'free',
      'move': 'utility',
    };
    return typeMap[actionType] || 'utility';
  };

  // Get tags from ability
  const getTags = (ability: Ability): ActionTag[] => {
    const tags: ActionTag[] = [];
    if (ability.keywords.includes('Free Strike')) tags.push('freeStrike');
    return tags;
  };

  const renderActionCard = (ability: Ability) => (
    <ActionCard
      key={ability.id}
      id={ability.id}
      name={ability.name}
      type={mapActionType(ability.actionType)}
      tags={getTags(ability)}
      cost={0}
      target={ability.target}
      distance={ability.distance}
      trigger={ability.trigger}
      effect={ability.effect}
      keywords={ability.keywords}
      characteristicValues={hero.characteristics}
      isCompact={true}
    />
  );

  const renderQuickCommandCard = (cmd: typeof quickCommands[0]) => (
    <ActionCard
      key={cmd.id}
      id={cmd.id}
      name={cmd.name}
      type="triggered"
      tags={[]}
      cost={0}
      trigger={cmd.trigger}
      effect={cmd.effect}
      keywords={['Quick Command', cmd.formation.charAt(0).toUpperCase() + cmd.formation.slice(1)]}
      isCompact={true}
    />
  );

  return (
    <div className="abilities-view-combined">
      {/* Class Abilities Section */}
      <section className="class-abilities-section">
        <div className="section-header-row">
          <h2>Class Abilities</h2>
          <div className="turn-reminder">
            <span className="reminder-label">Each turn:</span>
            <span className="reminder-action move">Move</span>
            <span className="reminder-plus">+</span>
            <span className="reminder-action maneuver">Maneuver</span>
            <span className="reminder-plus">+</span>
            <span className="reminder-action main">Action</span>
          </div>
        </div>

        <div className="class-abilities-grid">
          {hero.abilities.map((ability) => (
            <AbilityCard
              key={ability.id}
              ability={ability}
              characteristics={hero.characteristics}
              onRoll={handleAbilityRoll}
            />
          ))}
        </div>
      </section>

      {/* Action Reference Sections (Collapsible) */}
      <section className="action-reference-section">
        <h3 className="reference-title">Action Reference</h3>

        {/* Overview */}
        <div className="reference-accordion">
          <button
            className={`accordion-header ${openSection === 'overview' ? 'open' : ''}`}
            onClick={() => toggleSection('overview')}
          >
            <span className="accordion-icon">{openSection === 'overview' ? '−' : '+'}</span>
            <span>Turn Structure Overview</span>
          </button>
          {openSection === 'overview' && (
            <div className="accordion-content">
              <div className="overview-grid">
                <div className="overview-card move">
                  <h4>Move Action</h4>
                  <ul>
                    <li><strong>Advance:</strong> Move up to your Speed</li>
                    <li><strong>Disengage:</strong> Shift 1 square safely</li>
                  </ul>
                </div>

                <div className="overview-card maneuver">
                  <h4>Maneuver</h4>
                  <ul>
                    <li>Aid Attack, Catch Breath</li>
                    <li>Drink Potion, Grab</li>
                    <li>Hide, Search, Make Test</li>
                  </ul>
                </div>

                <div className="overview-card main">
                  <h4>Main Action</h4>
                  <ul>
                    <li>Use class ability</li>
                    <li>Call Forth minions</li>
                    <li>Summoner Strike</li>
                  </ul>
                </div>

                <div className="overview-card triggered">
                  <h4>Triggered (1/round)</h4>
                  <ul>
                    <li>Opportunity Attack</li>
                    <li>Free Strike</li>
                    <li>Quick Commands</li>
                  </ul>
                </div>
              </div>

              <div className="turn-flow">
                <div className="turn-phase">
                  <span className="phase-num">1</span>
                  <span className="phase-name">Start of Turn</span>
                </div>
                <span className="flow-arrow">→</span>
                <div className="turn-phase">
                  <span className="phase-num">2</span>
                  <span className="phase-name">Your Actions</span>
                </div>
                <span className="flow-arrow">→</span>
                <div className="turn-phase">
                  <span className="phase-num">3</span>
                  <span className="phase-name">End of Turn</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Move Actions */}
        <div className="reference-accordion">
          <button
            className={`accordion-header ${openSection === 'moves' ? 'open' : ''}`}
            onClick={() => toggleSection('moves')}
          >
            <span className="accordion-icon">{openSection === 'moves' ? '−' : '+'}</span>
            <span>Move Actions</span>
            <span className="accordion-count">{moveActions.length}</span>
          </button>
          {openSection === 'moves' && (
            <div className="accordion-content">
              <div className="action-cards-grid">
                {moveActions.map(action => renderActionCard(action))}
              </div>
            </div>
          )}
        </div>

        {/* Maneuvers */}
        <div className="reference-accordion">
          <button
            className={`accordion-header ${openSection === 'maneuvers' ? 'open' : ''}`}
            onClick={() => toggleSection('maneuvers')}
          >
            <span className="accordion-icon">{openSection === 'maneuvers' ? '−' : '+'}</span>
            <span>Standard Maneuvers</span>
            <span className="accordion-count">{standardManeuvers.length}</span>
          </button>
          {openSection === 'maneuvers' && (
            <div className="accordion-content">
              <div className="action-cards-grid">
                {standardManeuvers.map(action => renderActionCard(action))}
              </div>
            </div>
          )}
        </div>

        {/* Triggered Actions */}
        <div className="reference-accordion">
          <button
            className={`accordion-header ${openSection === 'triggered' ? 'open' : ''}`}
            onClick={() => toggleSection('triggered')}
          >
            <span className="accordion-icon">{openSection === 'triggered' ? '−' : '+'}</span>
            <span>Triggered Actions</span>
            <span className="accordion-count">{standardTriggeredActions.length}</span>
          </button>
          {openSection === 'triggered' && (
            <div className="accordion-content">
              <p className="section-note">You can use one triggered action per round. Free triggered actions don't count.</p>
              <div className="action-cards-grid">
                {standardTriggeredActions.map(action => renderActionCard(action))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Commands */}
        <div className="reference-accordion">
          <button
            className={`accordion-header ${openSection === 'commands' ? 'open' : ''}`}
            onClick={() => toggleSection('commands')}
          >
            <span className="accordion-icon">{openSection === 'commands' ? '−' : '+'}</span>
            <span>Quick Commands ({hero.formation.charAt(0).toUpperCase() + hero.formation.slice(1)})</span>
            <span className="accordion-count">{formationCommands.length}</span>
          </button>
          {openSection === 'commands' && (
            <div className="accordion-content">
              {formationCommands.length > 0 ? (
                <div className="action-cards-grid">
                  {formationCommands.map(cmd => renderQuickCommandCard(cmd))}
                </div>
              ) : (
                <p className="no-content">No quick commands defined for your formation yet.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AbilitiesView;
