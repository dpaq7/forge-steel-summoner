import React, { useState, useCallback } from 'react';
import { ShadowHero, ShadowCollege } from '../../../types/hero';
import { useHeroContext } from '../../../context/HeroContext';

interface ShadowWidgetProps {
  hero: ShadowHero;
}

const COLLEGE_INFO: Record<ShadowCollege, { name: string; description: string; icon: string }> = {
  'black-ash': {
    name: 'Black Ash',
    description: 'Teleporting assassins who move through ash and shadow to strike unseen.',
    icon: '🔥',
  },
  'caustic-alchemy': {
    name: 'Caustic Alchemy',
    description: 'Poisoners and alchemists who coat their weapons with deadly substances.',
    icon: '🧪',
  },
  'harlequin-mask': {
    name: 'Harlequin Mask',
    description: 'Deceivers and tricksters who hide in plain sight using charm and misdirection.',
    icon: '🎭',
  },
};

export const ShadowWidget: React.FC<ShadowWidgetProps> = ({ hero }) => {
  const { updateHero } = useHeroContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const { heroicResource, isHidden, subclass: college, characteristics } = hero;
  const currentInsight = heroicResource?.current ?? 0;

  // Calculate potency based on Agility
  const agility = characteristics?.agility ?? 2;

  const handleInsightChange = useCallback((delta: number) => {
    const newValue = Math.max(0, currentInsight + delta);
    updateHero({
      heroicResource: {
        ...heroicResource,
        current: newValue,
      },
    } as Partial<ShadowHero>);
  }, [currentInsight, heroicResource, updateHero]);

  const handleToggleHidden = useCallback(() => {
    updateHero({
      isHidden: !isHidden,
    } as Partial<ShadowHero>);
  }, [isHidden, updateHero]);

  const collegeData = college ? COLLEGE_INFO[college] : null;

  return (
    <div className="class-widget class-widget--shadow">
      {/* Compact Summary */}
      <div className="class-widget__summary">
        <div className="class-widget__quick-stat">
          <span className="class-widget__quick-stat-label">Insight</span>
          <span className="class-widget__quick-stat-value">{currentInsight}</span>
        </div>
        <div className="class-widget__quick-stat">
          <span className="class-widget__quick-stat-label">Hidden</span>
          <span className="class-widget__quick-stat-value">
            {isHidden ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="class-widget__quick-stat">
          <span className="class-widget__quick-stat-label">Potency</span>
          <span className="class-widget__quick-stat-value">A+{agility}</span>
        </div>
      </div>

      {/* Collapsible Header */}
      <div
        className="class-widget__header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="class-widget__header-left">
          <h3 className="class-widget__title">Shadow</h3>
          {collegeData && (
            <span className="class-widget__badge">
              {collegeData.icon} {collegeData.name}
            </span>
          )}
        </div>
        <span className={`class-widget__toggle ${isExpanded ? 'class-widget__toggle--open' : ''}`}>
          ▼
        </span>
      </div>

      {/* Expanded Content */}
      <div className={`class-widget__content ${!isExpanded ? 'class-widget__content--collapsed' : ''}`}>
        {/* Insight Tracker */}
        <div className="class-widget__resource">
          <span className="class-widget__resource-name">Insight</span>
          <div className="class-widget__resource-controls">
            <button
              className="class-widget__resource-btn"
              onClick={() => handleInsightChange(-1)}
            >
              −
            </button>
            <span className="class-widget__resource-value">{currentInsight}</span>
            <button
              className="class-widget__resource-btn"
              onClick={() => handleInsightChange(1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Hidden Status */}
        <div className="class-widget__mechanic">
          <div className="class-widget__mechanic-header">
            <h4 className="class-widget__mechanic-title">Hidden Status</h4>
            <span className={`class-widget__mechanic-status ${isHidden ? 'class-widget__mechanic-status--active' : 'class-widget__mechanic-status--inactive'}`}>
              {isHidden ? 'Hidden' : 'Visible'}
            </span>
          </div>
          <p className="class-widget__mechanic-description">
            While hidden, you have edge on attacks and enemies can't target you with attacks.
          </p>
          <button
            className="class-widget__target-btn"
            onClick={handleToggleHidden}
            style={{ marginTop: '0.5rem' }}
          >
            {isHidden ? 'Reveal' : 'Hide'}
          </button>
        </div>

        {/* Cost Reduction Reminder */}
        <div className="class-widget__mechanic" style={{ borderLeftColor: '#9575cd' }}>
          <div className="class-widget__mechanic-header">
            <h4 className="class-widget__mechanic-title">Efficient Killer</h4>
          </div>
          <p className="class-widget__mechanic-description">
            Abilities cost <strong>−1 Insight</strong> when your power roll has edge or double edge.
          </p>
        </div>

        {/* Hesitation Is Weakness */}
        <div className="class-widget__mechanic" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="class-widget__mechanic-header">
            <h4 className="class-widget__mechanic-title">Hesitation Is Weakness</h4>
          </div>
          <p className="class-widget__mechanic-description">
            <strong>Cost:</strong> 1 Insight<br/>
            <strong>Trigger:</strong> Another hero ends their turn (not via this ability)<br/>
            <strong>Effect:</strong> Take your turn immediately after that hero's turn ends.
          </p>
        </div>

        {/* College Info */}
        {collegeData && (
          <div className="class-widget__mechanic">
            <div className="class-widget__mechanic-header">
              <h4 className="class-widget__mechanic-title">
                {collegeData.icon} {collegeData.name}
              </h4>
            </div>
            <p className="class-widget__mechanic-description">
              {collegeData.description}
            </p>
          </div>
        )}

        {/* Insight Gain Reminder */}
        <div className="class-widget__gain-section">
          <h4 className="class-widget__gain-title">Insight Gain</h4>
          <ul className="class-widget__gain-list">
            <li className="class-widget__gain-item">
              Start of turn: <strong>Roll 1d3 Insight</strong>
            </li>
            <li className="class-widget__gain-item">
              First time/round you deal damage with 1+ surges: <strong>+1 Insight</strong>
            </li>
          </ul>
        </div>

        {/* Potency Display */}
        <div className="class-widget__potency">
          <div className="class-widget__potency-item">
            <span className="class-widget__potency-label">Weak</span>
            <span className="class-widget__potency-value">A-2 ({agility - 2})</span>
          </div>
          <div className="class-widget__potency-item">
            <span className="class-widget__potency-label">Average</span>
            <span className="class-widget__potency-value">A-1 ({agility - 1})</span>
          </div>
          <div className="class-widget__potency-item class-widget__potency-item--strong">
            <span className="class-widget__potency-label">Strong</span>
            <span className="class-widget__potency-value">A ({agility})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowWidget;
