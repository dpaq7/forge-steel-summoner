import React, { useState, useMemo } from 'react';
import { useSummonerContext } from '../../context/HeroContext';
import { useRollHistory } from '../../context/RollHistoryContext';
import { standardManeuvers, standardTriggeredActions, moveActions, quickCommands } from '../../data/action-economy';
import { Ability, Characteristic } from '../../types';
import { isSummonerHero } from '../../types/hero';
import { PowerRollResult } from '../../utils/dice';
import { ActionType, ActionTag } from '../../types/action';
import AbilityCard from '../shared/AbilityCard';
import ActionCard from '../ui/ActionCard';
import { ClassAbilityWidget } from './classWidgets';
import LevelProgressionSection from './LevelProgressionSection';
import './AbilitiesView.css';

type ReferenceSection = 'overview' | 'moves' | 'maneuvers' | 'triggered' | 'commands' | null;

const AbilitiesView: React.FC = () => {
  const { hero } = useSummonerContext();
  const { addRoll } = useRollHistory();
  const [openSection, setOpenSection] = useState<ReferenceSection>(null);

  if (!hero) return null;

  // Check if Summoner for formation-specific commands
  const isSummoner = isSummonerHero(hero);
  const heroFormation = isSummoner ? hero.formation : null;

  const handleAbilityRoll = (ability: Ability, result: PowerRollResult) => {
    addRoll(result, ability.name, 'ability');
  };

  const toggleSection = (section: ReferenceSection) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  // Filter quick commands for hero's formation (Summoner only)
  const formationCommands = heroFormation
    ? quickCommands.filter(cmd => cmd.formation === heroFormation)
    : [];

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

  // Parse power roll characteristic from kit signature ability text
  // e.g., "Might or Agility" -> { characteristic: 'might', alternativeCharacteristics: ['agility'] }
  const parseKitPowerRoll = (powerRollText: string): { characteristic: Characteristic; alternativeCharacteristics?: Characteristic[] } | null => {
    const charMap: Record<string, Characteristic> = {
      'might': 'might',
      'agility': 'agility',
      'reason': 'reason',
      'intuition': 'intuition',
      'presence': 'presence',
    };

    const text = powerRollText.toLowerCase();
    const chars: Characteristic[] = [];

    for (const [name, char] of Object.entries(charMap)) {
      if (text.includes(name)) {
        chars.push(char);
      }
    }

    if (chars.length === 0) return null;

    return {
      characteristic: chars[0],
      alternativeCharacteristics: chars.length > 1 ? chars.slice(1) : undefined,
    };
  };

  // Convert kit signature ability to Ability format for AbilityCard
  const kitSignatureAbility: Ability | null = useMemo(() => {
    const sig = hero.kit?.signatureAbility;
    if (!sig) return null;

    const powerRollInfo = parseKitPowerRoll(sig.powerRoll);

    // Build effect text with tier results and optional effect
    let effectText = sig.effect || '';

    return {
      id: `kit-sig-${hero.kit.id}`,
      name: sig.name,
      flavorText: sig.description,
      actionType: 'action' as const,
      keywords: sig.keywords,
      distance: sig.distance,
      target: sig.target,
      powerRoll: powerRollInfo ? {
        characteristic: powerRollInfo.characteristic,
        alternativeCharacteristics: powerRollInfo.alternativeCharacteristics,
        tier1: sig.tier1,
        tier2: sig.tier2,
        tier3: sig.tier3,
      } : undefined,
      effect: effectText,
    };
  }, [hero.kit]);

  const handleKitAbilityRoll = (ability: Ability, result: PowerRollResult) => {
    addRoll(result, `${hero.kit?.name}: ${ability.name}`, 'ability');
  };

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

        {/* Class-Specific Widget */}
        <ClassAbilityWidget hero={hero} />

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

      {/* Kit Signature Ability Section */}
      {kitSignatureAbility && (
        <section className="kit-signature-section">
          <div className="section-header-row">
            <h2>Kit: {hero.kit.name}</h2>
            <div className="kit-bonuses-inline">
              {hero.kit.meleeDamageBonus && (
                <span className="kit-bonus melee">Melee {hero.kit.meleeDamageBonus}</span>
              )}
              {hero.kit.rangedDamageBonus && (
                <span className="kit-bonus ranged">Ranged {hero.kit.rangedDamageBonus}</span>
              )}
              {(hero.kit.meleeDistanceBonus ?? 0) > 0 && (
                <span className="kit-bonus distance">+{hero.kit.meleeDistanceBonus} Reach</span>
              )}
              {(hero.kit.rangedDistanceBonus ?? 0) > 0 && (
                <span className="kit-bonus distance">+{hero.kit.rangedDistanceBonus} Range</span>
              )}
              {(hero.kit.disengageBonus ?? 0) > 0 && (
                <span className="kit-bonus disengage">+{hero.kit.disengageBonus} Disengage</span>
              )}
            </div>
          </div>
          <div className="kit-signature-ability-card">
            <AbilityCard
              ability={kitSignatureAbility}
              characteristics={hero.characteristics}
              onRoll={handleKitAbilityRoll}
            />
          </div>
        </section>
      )}

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
        {/* Quick Commands - Summoner Only */}
        {isSummoner && heroFormation && (
        <div className="reference-accordion">
          <button
            className={`accordion-header ${openSection === 'commands' ? 'open' : ''}`}
            onClick={() => toggleSection('commands')}
          >
            <span className="accordion-icon">{openSection === 'commands' ? '−' : '+'}</span>
            <span>Quick Commands ({heroFormation.charAt(0).toUpperCase() + heroFormation.slice(1)})</span>
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
        )}
      </section>

      {/* Level Progression Section */}
      <LevelProgressionSection hero={hero} />
    </div>
  );
};

export default AbilitiesView;
