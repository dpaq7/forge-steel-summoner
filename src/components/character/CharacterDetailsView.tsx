import React from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import { languages as allLanguages } from '../../data/reference-data';
import './CharacterDetailsView.css';

const CharacterDetailsView: React.FC = () => {
  const { hero } = useSummonerContext();

  if (!hero) return null;

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
              <p>Skills: {cultureEnvironment.skills?.join(', ') || 'None'}</p>
            </div>
          )}

          {cultureOrganization && (
            <div className="culture-aspect">
              <h4>Organization: {cultureOrganization.name}</h4>
            </div>
          )}

          {cultureUpbringing && (
            <div className="culture-aspect">
              <h4>Upbringing: {cultureUpbringing.name}</h4>
              <p>Skills: {cultureUpbringing.skills?.join(', ') || 'None'}</p>
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

        <div className="formation-info">
          <h4>Formation: {hero.formation.charAt(0).toUpperCase() + hero.formation.slice(1)}</h4>
          <div className="quick-command-detail">
            <strong>{hero.quickCommand.name}</strong>
            <p>{hero.quickCommand.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CharacterDetailsView;
