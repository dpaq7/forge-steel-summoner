import React from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { languages as allLanguages } from '../../data/reference-data';
import { formations } from '../../data/formations';
import { Formation } from '../../types';
import './CharacterDetailsView.css';

const CharacterDetailsView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();

  if (!hero) return null;

  // Handle formation change
  const handleFormationChange = (newFormation: Formation) => {
    if (newFormation === hero.formation) return;

    // Get the quick command associated with this formation
    const formationData = formations[newFormation];
    const quickCommand = formationData.quickCommands.find(
      cmd => cmd.formation === newFormation
    ) || formationData.quickCommands[0];

    updateHero({
      formation: newFormation,
      quickCommand: quickCommand,
    });
  };

  // Handle both old and new data structures for ancestry
  const ancestryName = hero.ancestry?.name || 'Unknown';
  const ancestryDescription = hero.ancestry?.description || '';
  const ancestrySize = hero.ancestry?.size || '1M';
  const ancestrySpeed = hero.ancestry?.speed || 5;
  const ancestryPoints = hero.ancestry?.ancestryPoints || 0;
  const signatureFeature = hero.ancestry?.signatureFeature;
  const purchasedTraits = hero.ancestry?.purchasedTraits || [];

  // Handle both old and new data structures for culture
  const cultureName = hero.culture?.name || 'Unknown';
  const cultureDescription = hero.culture?.description || '';
  const cultureEnvironment = hero.culture?.environment;
  const cultureOrganization = hero.culture?.organization;
  const cultureUpbringing = hero.culture?.upbringing;

  // Handle both old and new data structures for career
  const careerName = hero.career?.name || 'Unknown';
  const careerDescription = hero.career?.description || '';
  const careerPerkType = hero.career?.perkType || 'exploration';
  const careerRenown = hero.career?.renown || 0;
  const careerWealth = hero.career?.wealth || 0;
  const careerProjectPoints = hero.career?.projectPoints || 0;
  const careerIncitingIncident = hero.career?.incitingIncident || '';

  // Collect all skills from culture and career
  const cultureSkills = [
    ...(cultureEnvironment?.skills || []),
    ...(cultureUpbringing?.skills || []),
  ];
  const careerSkills = hero.career?.skills || [];
  const allSkills = [...new Set([...cultureSkills, ...careerSkills])];

  // Get language names from hero's language IDs
  const getLanguageName = (langId: string): string => {
    const lang = allLanguages.find(l => l.id === langId);
    return lang?.name || langId;
  };

  // Use hero.languages if available, otherwise fall back to old logic for compatibility
  const heroLanguageIds = hero.languages || ['caelian'];
  const uniqueLanguages = heroLanguageIds.map(getLanguageName);

  // Culture aspect descriptions from Draw Steel rules
  const environmentDescriptions: Record<string, string> = {
    nomadic: 'A community that travels, never settling in one place for long.',
    rural: 'A community in farmland, villages, or countryside settlements.',
    secluded: 'A hidden or isolated community, away from the wider world.',
    urban: 'A community in a city or large town with bustling activity.',
    wilderness: 'A community in untamed lands, forests, or harsh terrain.',
  };

  const organizationDescriptions: Record<string, string> = {
    bureaucratic: 'A community led by officials, laws, and formal hierarchies.',
    communal: 'A community where decisions are made collectively by members.',
  };

  const upbringingDescriptions: Record<string, string> = {
    academic: 'Raised among scholars, books, and formal education.',
    creative: 'Raised among artists, musicians, and craftspeople.',
    labor: 'Raised doing physical work—farming, smithing, or building.',
    lawless: 'Raised outside the law, learning to survive by any means.',
    martial: 'Raised among warriors, soldiers, or guards.',
    noble: 'Raised in privilege with etiquette and social connections.',
  };

  const getEnvironmentDesc = (name: string): string => {
    return environmentDescriptions[name.toLowerCase()] || '';
  };

  const getOrganizationDesc = (name: string): string => {
    return organizationDescriptions[name.toLowerCase()] || '';
  };

  const getUpbringingDesc = (name: string): string => {
    return upbringingDescriptions[name.toLowerCase()] || '';
  };

  return (
    <div className="character-details-view">
      {/* Ancestry Section */}
      <section className="details-section ancestry-section">
        <h2>Ancestry: {ancestryName}</h2>
        {ancestryDescription && <p className="description">{ancestryDescription}</p>}

        <div className="ancestry-stats">
          <span className="stat">Size: {ancestrySize}</span>
          <span className="stat">Base Speed: {ancestrySpeed}</span>
          <span className="stat">Ancestry Points: {ancestryPoints}</span>
        </div>

        {signatureFeature && (
          <div className="feature-block signature">
            <h4>Signature Feature</h4>
            <div className="feature">
              <strong>{signatureFeature.name}</strong>
              <p>{signatureFeature.description}</p>
            </div>
          </div>
        )}

        {purchasedTraits.length > 0 && (
          <div className="feature-block purchased">
            <h4>Available Purchased Traits</h4>
            <div className="traits-list">
              {purchasedTraits.map((trait) => (
                <div key={trait.id} className="trait">
                  <strong>{trait.name}</strong>
                  {trait.cost && <span className="cost">({trait.cost} pts)</span>}
                  <p>{trait.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Culture Section */}
      <section className="details-section culture-section">
        <h2>Culture: {cultureName}</h2>
        {cultureDescription && <p className="description">{cultureDescription}</p>}

        <div className="culture-details">
          {cultureEnvironment && (
            <div className="culture-aspect">
              <h4>Environment: {cultureEnvironment.name}</h4>
              <p className="aspect-description">{getEnvironmentDesc(cultureEnvironment.name)}</p>
              {cultureEnvironment.skills && cultureEnvironment.skills.length > 0 && (
                <p className="aspect-skills">Skills: {cultureEnvironment.skills.join(', ')}</p>
              )}
            </div>
          )}

          {cultureOrganization && (
            <div className="culture-aspect">
              <h4>Organization: {cultureOrganization.name}</h4>
              <p className="aspect-description">{getOrganizationDesc(cultureOrganization.name)}</p>
            </div>
          )}

          {cultureUpbringing && (
            <div className="culture-aspect">
              <h4>Upbringing: {cultureUpbringing.name}</h4>
              <p className="aspect-description">{getUpbringingDesc(cultureUpbringing.name)}</p>
              {cultureUpbringing.skills && cultureUpbringing.skills.length > 0 && (
                <p className="aspect-skills">Skills: {cultureUpbringing.skills.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Career Section */}
      <section className="details-section career-section">
        <h2>Career: {careerName}</h2>
        {careerDescription && <p className="description">{careerDescription}</p>}

        <div className="career-details">
          {careerSkills.length > 0 && (
            <div className="career-stat">
              <strong>Skills:</strong> {careerSkills.join(', ')}
            </div>
          )}
          <div className="career-stat">
            <strong>Perk Type:</strong> {careerPerkType.charAt(0).toUpperCase() + careerPerkType.slice(1)}
          </div>
          {careerRenown > 0 && (
            <div className="career-stat">
              <strong>Renown:</strong> +{careerRenown}
            </div>
          )}
          {careerWealth > 0 && (
            <div className="career-stat">
              <strong>Wealth:</strong> +{careerWealth}
            </div>
          )}
          {careerProjectPoints > 0 && (
            <div className="career-stat">
              <strong>Project Points:</strong> {careerProjectPoints}
            </div>
          )}
        </div>

        {careerIncitingIncident && (
          <div className="inciting-incident">
            <h4>Inciting Incident</h4>
            <p><em>"{careerIncitingIncident}"</em></p>
          </div>
        )}
      </section>

      {/* Skills & Languages Section */}
      <section className="details-section skills-section">
        <h2>Skills & Languages</h2>

        <div className="skills-languages-grid">
          <div className="skills-block">
            <h4>Skills</h4>
            <ul className="skills-list">
              {allSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className="languages-block">
            <h4>Languages</h4>
            <ul className="languages-list">
              {uniqueLanguages.map((lang, idx) => (
                <li key={idx}>{lang}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Kit Section */}
      <section className="details-section kit-section">
        <h2>Kit: {hero.kit.name}</h2>

        <div className="kit-stats">
          <div className="kit-stat">
            <strong>Stamina Bonus:</strong> +{hero.kit.stamina}
          </div>
          <div className="kit-stat">
            <strong>Speed:</strong> {hero.kit.speed}
          </div>
          <div className="kit-stat">
            <strong>Stability:</strong> {hero.kit.stability}
          </div>
          <div className="kit-stat">
            <strong>Armor:</strong> {hero.kit.armor}
          </div>
        </div>

        <div className="kit-equipment">
          <div className="equipment-block">
            <h4>Weapons</h4>
            <p>{hero.kit.weapons.join(', ')}</p>
          </div>
          {hero.kit.implements && hero.kit.implements.length > 0 && (
            <div className="equipment-block">
              <h4>Implements</h4>
              <p>{hero.kit.implements.join(', ')}</p>
            </div>
          )}
          {hero.kit.items && hero.kit.items.length > 0 && (
            <div className="equipment-block">
              <h4>Starting Items</h4>
              <p>{hero.kit.items.join(', ')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Summoner Circle Section */}
      <section className="details-section circle-section">
        <h2>Circle: {hero.circle.charAt(0).toUpperCase() + hero.circle.slice(1)}</h2>

        <div className="circle-info">
          <div className="circle-stat">
            <strong>Portfolio:</strong> {hero.portfolio.type.charAt(0).toUpperCase() + hero.portfolio.type.slice(1)}
          </div>
          <div className="circle-stat">
            <strong>Signature Minions:</strong> {hero.portfolio.signatureMinions.map(m => m.name).join(', ')}
          </div>
          <div className="circle-stat">
            <strong>Fixture:</strong> {hero.portfolio.fixture?.name || 'Not yet unlocked'}
          </div>
        </div>

        {/* Formation Selector */}
        <div className="formation-selector">
          <h4>Formation</h4>
          <div className="formation-options">
            {(Object.keys(formations) as Formation[]).map((formationKey) => {
              const formationData = formations[formationKey];
              const isSelected = hero.formation === formationKey;
              return (
                <button
                  key={formationKey}
                  className={`formation-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleFormationChange(formationKey)}
                >
                  <span className="formation-name">{formationData.name}</span>
                  <span className="formation-desc">{formationData.description}</span>
                  <ul className="formation-benefits">
                    {formationData.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Command for selected formation */}
        <div className="formation-info">
          <h4>Quick Command: {hero.quickCommand.name}</h4>
          <div className="quick-command-detail">
            <p>{hero.quickCommand.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CharacterDetailsView;
