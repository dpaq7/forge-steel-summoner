import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isSummonerHero, SummonerHeroV2, SummonerCircle, Formation } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './SummonerView.css';

// Circle info
const CIRCLE_INFO: Record<SummonerCircle, { name: string; portfolio: string; description: string }> = {
  blight: {
    name: 'Circle of Blight',
    portfolio: 'Demons',
    description: 'Command fiendish entities',
  },
  graves: {
    name: 'Circle of Graves',
    portfolio: 'Undead',
    description: 'Raise the dead to serve',
  },
  spring: {
    name: 'Circle of Spring',
    portfolio: 'Fey',
    description: 'Call upon the fair folk',
  },
  storms: {
    name: 'Circle of Storms',
    portfolio: 'Elementals',
    description: 'Summon elemental forces',
  },
};

// Formation bonuses
const FORMATION_INFO: Record<Formation, { name: string; bonus: string }> = {
  horde: { name: 'Horde', bonus: '+0 Stamina' },
  platoon: { name: 'Platoon', bonus: '+3 Stamina' },
  elite: { name: 'Elite', bonus: '+6 Stamina' },
  leader: { name: 'Leader', bonus: '+9 Stamina' },
};

export const SummonerView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  onUpdateHero,
}) => {
  if (!isSummonerHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for SummonerView</p>
      </div>
    );
  }

  const summonerHero = hero as SummonerHeroV2;
  const essence = summonerHero.heroicResource?.current ?? 0;
  const circle = summonerHero.subclass;
  const formation = summonerHero.formation || 'horde';
  const activeSquads = summonerHero.activeSquads || [];

  // Calculate active minion count
  const activeMinionCount = useMemo(() => {
    return activeSquads.reduce((sum, squad) => {
      return sum + squad.members.filter((m) => m.isAlive).length;
    }, 0);
  }, [activeSquads]);

  const handleEssenceChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, essence + delta);
      onUpdateHero({
        heroicResource: {
          ...summonerHero.heroicResource,
          current: newValue,
        },
      } as Partial<SummonerHeroV2>);
    },
    [essence, summonerHero.heroicResource, onUpdateHero]
  );

  const circleInfo = circle ? CIRCLE_INFO[circle] : null;
  const formationInfo = FORMATION_INFO[formation];

  return (
    <BaseClassView
      heroClass="summoner"
      hero={hero}
      isInCombat={isInCombat}
      turnNumber={turnNumber}
      onEndTurn={onEndTurn}
      conditions={conditions}
      onRemoveCondition={onRemoveCondition}
      onUpdateHero={onUpdateHero}
    >
      {/* Essence Tracker */}
      <div className="resource-tracker essence-tracker">
        <span className="resource-tracker-label">Essence</span>
        <div className="resource-display">
          <span className="resource-current">{essence}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handleEssenceChange(-1)} disabled={essence <= 0}>
            -
          </button>
          <button onClick={() => handleEssenceChange(1)}>+</button>
        </div>
      </div>

      {/* Circle Display */}
      {circleInfo && (
        <div className="class-feature-section">
          <h4 className="class-feature-title">Circle</h4>
          <div className="circle-badge">
            <span className="circle-name">{circleInfo.name}</span>
            <span className="circle-portfolio">Portfolio: {circleInfo.portfolio}</span>
          </div>
        </div>
      )}

      {/* Formation */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Formation</h4>
        <div className="formation-badge">
          <span className="formation-name">{formationInfo.name}</span>
          <span className="formation-bonus">{formationInfo.bonus}</span>
        </div>
      </div>

      {/* Active Minions Summary */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Active Minions</h4>
        {activeSquads.length > 0 ? (
          <div className="minions-summary">
            <div className="minion-count">
              <span className="count-value">{activeMinionCount}</span>
              <span className="count-label">minions active</span>
            </div>
            <div className="squads-list">
              {activeSquads.map((squad) => (
                <div key={squad.id} className="squad-chip">
                  <span className="squad-count">
                    {squad.members.filter((m) => m.isAlive).length}x
                  </span>
                  <span className="squad-name">{squad.templateId}</span>
                  <span className="squad-stamina">
                    {squad.currentStamina}/{squad.maxStamina} HP
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="placeholder">No minions summoned</p>
        )}
      </div>
    </BaseClassView>
  );
};

export default SummonerView;
