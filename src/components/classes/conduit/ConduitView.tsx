import * as React from 'react';
import { useCallback } from 'react';
import { BaseClassView } from '../BaseClassView';
import { isConduitHero, ConduitHero } from '@/types/hero';
import type { BaseClassViewProps } from '../types';
import './ConduitView.css';

// Domain info for display
const DOMAIN_INFO: Record<string, { name: string; description: string }> = {
  creation: { name: 'Creation', description: 'Shape reality and craft wonders' },
  death: { name: 'Death', description: 'Command the power of endings' },
  fate: { name: 'Fate', description: 'Weave destiny and fortune' },
  knowledge: { name: 'Knowledge', description: 'Unlock secrets and wisdom' },
  life: { name: 'Life', description: 'Heal and restore vitality' },
  love: { name: 'Love', description: 'Inspire devotion and connection' },
  nature: { name: 'Nature', description: 'Channel primal forces' },
  protection: { name: 'Protection', description: 'Shield allies from harm' },
  storm: { name: 'Storm', description: 'Unleash elemental fury' },
  sun: { name: 'Sun', description: 'Radiate divine light' },
  trickery: { name: 'Trickery', description: 'Deceive and misdirect' },
  war: { name: 'War', description: 'Empower warriors in battle' },
};

export const ConduitView: React.FC<BaseClassViewProps> = ({
  hero,
  isInCombat,
  onUpdateHero,
}) => {
  if (!isConduitHero(hero)) {
    return (
      <div className="class-view class-view-error">
        <p>Invalid hero type for ConduitView</p>
      </div>
    );
  }

  const conduitHero = hero as ConduitHero;
  const piety = conduitHero.heroicResource?.current ?? 0;
  const domains = conduitHero.domains || (conduitHero.subclass ? [conduitHero.subclass] : []);

  const handlePietyChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(0, piety + delta);
      onUpdateHero({
        heroicResource: {
          ...conduitHero.heroicResource,
          current: newValue,
        },
      } as Partial<ConduitHero>);
    },
    [piety, conduitHero.heroicResource, onUpdateHero]
  );

  return (
    <BaseClassView
      heroClass="conduit"
      hero={hero}
      isInCombat={isInCombat}
      onUpdateHero={onUpdateHero}
    >
      {/* Piety Tracker */}
      <div className="resource-tracker piety-tracker">
        <span className="resource-tracker-label">Piety</span>
        <div className="resource-display">
          <span className="resource-current">{piety}</span>
        </div>
        <div className="resource-controls">
          <button onClick={() => handlePietyChange(-1)} disabled={piety <= 0}>
            -
          </button>
          <button onClick={() => handlePietyChange(1)}>+</button>
        </div>
      </div>

      {/* Domains Display */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Domains</h4>
        <div className="domains-list">
          {domains.length > 0 ? (
            domains.map((domain) => (
              <div key={domain} className="domain-badge">
                <span className="domain-name">{DOMAIN_INFO[domain]?.name || domain}</span>
                <span className="domain-desc">{DOMAIN_INFO[domain]?.description}</span>
              </div>
            ))
          ) : (
            <p className="placeholder">No domains selected</p>
          )}
        </div>
      </div>

      {/* Prayer Mechanic */}
      <div className="class-feature-section">
        <h4 className="class-feature-title">Prayer (Before Piety Roll)</h4>
        <div className="triggered-actions-list">
          <div className="triggered-action">
            <span className="action-trigger">Roll 1:</span>
            <span className="action-effect">+1 Piety, take Intuition psychic damage</span>
          </div>
          <div className="triggered-action">
            <span className="action-trigger">Roll 2:</span>
            <span className="action-effect">+1 extra Piety (total 1d3 + 1)</span>
          </div>
          <div className="triggered-action">
            <span className="action-trigger">Roll 3:</span>
            <span className="action-effect">+2 Piety, activate domain effect</span>
          </div>
        </div>
        <p className="class-feature-note">
          Start of turn: gain 1d3 Piety. First time ally regains Stamina or enemy takes 10+ damage: +2 Piety (domain trigger).
        </p>
      </div>
    </BaseClassView>
  );
};

export default ConduitView;
