import React from 'react';
import { useSummonerContext } from '../../context/HeroContext';
import { languages as allLanguages } from '../../data/reference-data';
import { skills as allSkills } from '../../data/skills';
import { formations } from '../../data/formations';
import { getAncestryById, getAncestryTraitsByIds } from '../../data/ancestries';
import { getPerkById, PERK_CATEGORY_INFO } from '../../data/perks';
import { Formation, HeroClass } from '../../types';
import { isSummonerHero, SummonerHeroV2 } from '../../types/hero';
import { classDefinitions } from '../../data/classes/class-definitions';
import {
  Hammer,
  Compass,
  Users,
  Search,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import './CharacterDetailsView.css';

// Map category to Lucide icon for perks display
const perkCategoryIcons: Record<string, LucideIcon> = {
  crafting: Hammer,
  exploration: Compass,
  interpersonal: Users,
  intrigue: Search,
  lore: BookOpen,
  supernatural: Sparkles,
};

const CharacterDetailsView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();

  if (!hero) return null;

  // Get hero class and check if Summoner
  const heroClass: HeroClass = hero.heroClass || 'summoner';
  const isSummoner = isSummonerHero(hero);
  const classDef = classDefinitions[heroClass];

  // Get Summoner-specific data if applicable
  const summonerHero = isSummoner ? (hero as SummonerHeroV2) : null;

  // Handle formation change (Summoner only)
  const handleFormationChange = (newFormation: Formation) => {
    if (!summonerHero || newFormation === summonerHero.formation) return;

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
  // New system: use ancestrySelection to look up from data module
  // Old system: use embedded ancestry object
  const ancestryFromData = hero.ancestrySelection
    ? getAncestryById(hero.ancestrySelection.ancestryId)
    : null;

  // Use data module ancestry if available, otherwise fall back to embedded
  const ancestryName = ancestryFromData?.name || hero.ancestry?.name || 'Unknown';
  const ancestryDescription = ancestryFromData?.description || hero.ancestry?.description || '';
  const ancestrySize = ancestryFromData?.size || hero.ancestry?.size || '1M';
  const ancestrySpeed = ancestryFromData?.speed || hero.ancestry?.speed || 5;
  const ancestryPoints = ancestryFromData?.ancestryPoints || hero.ancestry?.ancestryPoints || 0;

  // Get signature trait from data module or embedded
  const signatureTrait = ancestryFromData?.signatureTrait || hero.ancestry?.signatureFeature;

  // Get selected purchased traits
  // New system: look up selected traits from data module
  // Old system: show all available traits from embedded data
  const selectedTraits = hero.ancestrySelection && ancestryFromData
    ? getAncestryTraitsByIds(ancestryFromData.id, hero.ancestrySelection.selectedTraitIds)
    : [];

  // For backward compatibility, still show embedded purchasedTraits if no selection made
  const embeddedTraits = hero.ancestry?.purchasedTraits || [];
  const hasNewSelection = hero.ancestrySelection && selectedTraits.length > 0;

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
  // Career skill groups (for informational display in Career section)
  const careerSkillGroups = hero.career?.skills || [];

  // Get skill name from ID
  const getSkillName = (skillId: string): string => {
    const skill = allSkills.find(s => s.id === skillId);
    return skill?.name || skillId;
  };

  // Use hero.skills directly - these are the actual selected skills from character creation
  // hero.skills contains skill IDs, so we convert them to display names
  const heroSkills = hero.skills || [];
  const skillNames = heroSkills.map(getSkillName);

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
          {!hasNewSelection && <span className="stat">Ancestry Points: {ancestryPoints}</span>}
        </div>

        {signatureTrait && (
          <div className="feature-block signature">
            <h4>Signature Trait</h4>
            <div className="feature">
              <strong>{signatureTrait.name}</strong>
              <p>{signatureTrait.description}</p>
            </div>
          </div>
        )}

        {/* New system: Show selected purchased traits */}
        {hasNewSelection && selectedTraits.length > 0 && (
          <div className="feature-block purchased">
            <h4>Purchased Traits</h4>
            <div className="traits-list">
              {selectedTraits.map((trait) => (
                <div key={trait.id} className="trait">
                  <strong>{trait.name}</strong>
                  <span className="cost">({trait.cost} pt{trait.cost > 1 ? 's' : ''})</span>
                  <p>{trait.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Old system: Show all available traits (for characters without ancestrySelection) */}
        {!hasNewSelection && embeddedTraits.length > 0 && (
          <div className="feature-block purchased">
            <h4>Available Purchased Traits</h4>
            <div className="traits-list">
              {embeddedTraits.map((trait) => (
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
                <p className="aspect-skills">Skill Categories: {cultureEnvironment.skills.join(', ')}</p>
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
                <p className="aspect-skills">Skill Categories: {cultureUpbringing.skills.join(', ')}</p>
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
          {careerSkillGroups.length > 0 && (
            <div className="career-stat">
              <strong>Skill Categories:</strong> {careerSkillGroups.join(', ')}
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
              {skillNames.length > 0 ? (
                skillNames.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))
              ) : (
                <li className="no-skills">No skills selected</li>
              )}
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

      {/* Perks Section */}
      {hero.selectedPerks && hero.selectedPerks.length > 0 && (
        <section className="details-section perks-section">
          <h2>Perks</h2>
          <div className="perks-list">
            {hero.selectedPerks.map((sp, idx) => {
              const perk = getPerkById(sp.perkId);
              if (!perk) return null;
              const catInfo = PERK_CATEGORY_INFO[perk.category];
              const Icon = perkCategoryIcons[perk.category];
              return (
                <div
                  key={idx}
                  className={`perk-display-card perk-display-card--${perk.category}`}
                >
                  <div className="perk-display-header">
                    {Icon && <Icon size={16} className="perk-display-icon" />}
                    <h4 className="perk-display-name">{perk.name}</h4>
                    <span className="perk-level-badge">Lv {sp.selectedAtLevel}</span>
                  </div>
                  <p className="perk-display-description">{perk.description}</p>
                  <span className="perk-category-tag">{catInfo.name}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Kit Section */}
      <section className="details-section kit-section">
        <h2>Kit: {hero.kit.name}</h2>

        <div className="kit-stats">
          <div className="kit-stat">
            <strong>Stamina</strong>
            <span className="stat-value">+{hero.kit.stamina}</span>
          </div>
          <div className="kit-stat">
            <strong>Speed</strong>
            <span className="stat-value">{hero.kit.speed}</span>
          </div>
          <div className="kit-stat">
            <strong>Stability</strong>
            <span className="stat-value">{hero.kit.stability}</span>
          </div>
          <div className="kit-stat">
            <strong>Armor</strong>
            <span className="stat-value">{hero.kit.armor || 'None'}</span>
          </div>
        </div>

        <div className="kit-equipment">
          {hero.kit.weapons && hero.kit.weapons.length > 0 && (
            <div className="equipment-block">
              <h4>Weapons:</h4>
              <p>{hero.kit.weapons.join(', ')}</p>
            </div>
          )}
          {hero.kit.implements && hero.kit.implements.length > 0 && (
            <div className="equipment-block">
              <h4>Implements:</h4>
              <p>{hero.kit.implements.join(', ')}</p>
            </div>
          )}
          {hero.kit.items && hero.kit.items.length > 0 && (
            <div className="equipment-block">
              <h4>Starting Items:</h4>
              <p>{hero.kit.items.join(', ')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Summoner Circle Section - Only for Summoners */}
      {isSummoner && summonerHero && (
        <section className="details-section circle-section">
          <h2>Circle: {summonerHero.subclass ? summonerHero.subclass.charAt(0).toUpperCase() + summonerHero.subclass.slice(1) : 'Unknown'}</h2>

          <div className="circle-info">
            <div className="circle-stat">
              <strong>Portfolio:</strong> {summonerHero.portfolio.type.charAt(0).toUpperCase() + summonerHero.portfolio.type.slice(1)}
            </div>
            <div className="circle-stat">
              <strong>Signature Minions:</strong> {summonerHero.portfolio.signatureMinions.map((m: { name: string }) => m.name).join(', ')}
            </div>
            <div className="circle-stat">
              <strong>Fixture:</strong> {summonerHero.portfolio.fixture?.name || 'Not yet unlocked'}
            </div>
          </div>

          {/* Formation Selector */}
          <div className="formation-selector">
            <h4>Formation</h4>
            <div className="formation-options">
              {(Object.keys(formations) as Formation[]).map((formationKey) => {
                const formationData = formations[formationKey];
                const isSelected = summonerHero.formation === formationKey;
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
            <h4>Quick Command: {summonerHero.quickCommand.name}</h4>
            <div className="quick-command-detail">
              <p>{summonerHero.quickCommand.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Class Section - For non-Summoners */}
      {!isSummoner && (
        <section className="details-section class-section">
          <h2>Class: {classDef?.name || 'Unknown'}</h2>
          <p className="description">{classDef?.description || ''}</p>

          <div className="class-info">
            <div className="class-stat">
              <strong>Role:</strong> {classDef?.role || 'Unknown'}
            </div>
            <div className="class-stat">
              <strong>Heroic Resource:</strong> {classDef?.heroicResource?.name || 'Unknown'}
            </div>
            <div className="class-stat">
              <strong>Potency:</strong> {classDef?.potencyCharacteristic ?
                classDef.potencyCharacteristic.charAt(0).toUpperCase() + classDef.potencyCharacteristic.slice(1) :
                'Unknown'}
            </div>
          </div>

          <div className="class-feature-note">
            <p className="coming-soon">
              Class-specific features for {classDef?.name || 'this class'} are coming soon.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default CharacterDetailsView;
