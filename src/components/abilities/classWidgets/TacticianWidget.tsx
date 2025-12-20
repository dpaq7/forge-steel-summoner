import React, { useState, useCallback } from 'react';
import { TacticianHero, TacticianDoctrine } from '../../../types/hero';
import { useHeroContext } from '../../../context/HeroContext';

interface TacticianWidgetProps {
  hero: TacticianHero;
}

const DOCTRINE_INFO: Record<TacticianDoctrine, { name: string; description: string }> = {
  insurgent: {
    name: 'Insurgent',
    description: 'Guerrilla leader who uses unconventional tactics and ambushes.',
  },
  mastermind: {
    name: 'Mastermind',
    description: 'Strategic genius who sees the battlefield several moves ahead.',
  },
  vanguard: {
    name: 'Vanguard',
    description: 'Front-line commander who leads from the front.',
  },
};

export const TacticianWidget: React.FC<TacticianWidgetProps> = ({ hero }) => {
  const { updateHero } = useHeroContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  const { heroicResource, markedTargets = [], subclass: doctrine, level, characteristics } = hero;
  const currentFocus = heroicResource?.current ?? 0;

  // Calculate potency based on Reason
  const reason = characteristics?.reason ?? 2;

  const handleFocusChange = useCallback((delta: number) => {
    const newValue = Math.max(0, currentFocus + delta);
    updateHero({
      heroicResource: {
        ...heroicResource,
        current: newValue,
      },
    } as Partial<TacticianHero>);
  }, [currentFocus, heroicResource, updateHero]);

  const handleAddMark = useCallback(() => {
    if (targetInput.trim() && !markedTargets.includes(targetInput.trim())) {
      updateHero({
        markedTargets: [...markedTargets, targetInput.trim()],
      } as Partial<TacticianHero>);
      setTargetInput('');
    }
  }, [targetInput, markedTargets, updateHero]);

  const handleRemoveMark = useCallback((target: string) => {
    updateHero({
      markedTargets: markedTargets.filter(t => t !== target),
    } as Partial<TacticianHero>);
  }, [markedTargets, updateHero]);

  const doctrineData = doctrine ? DOCTRINE_INFO[doctrine] : null;
  const hasMarks = markedTargets.length > 0;

  return (
    <div className="class-widget class-widget--tactician">
      {/* Compact Summary */}
      <div className="class-widget__summary">
        <div className="class-widget__quick-stat">
          <span className="class-widget__quick-stat-label">Focus</span>
          <span className="class-widget__quick-stat-value">{currentFocus}</span>
        </div>
        <div className="class-widget__quick-stat">
          <span className="class-widget__quick-stat-label">Marked</span>
          <span className="class-widget__quick-stat-value">
            {markedTargets.length > 0 ? markedTargets.length : '—'}
          </span>
        </div>
        <div className="class-widget__quick-stat">
          <span className="class-widget__quick-stat-label">Potency</span>
          <span className="class-widget__quick-stat-value">R+{reason}</span>
        </div>
      </div>

      {/* Collapsible Header */}
      <div
        className="class-widget__header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="class-widget__header-left">
          <h3 className="class-widget__title">Tactician</h3>
          {doctrineData && (
            <span className="class-widget__badge">{doctrineData.name}</span>
          )}
        </div>
        <span className={`class-widget__toggle ${isExpanded ? 'class-widget__toggle--open' : ''}`}>
          ▼
        </span>
      </div>

      {/* Expanded Content */}
      <div className={`class-widget__content ${!isExpanded ? 'class-widget__content--collapsed' : ''}`}>
        {/* Focus Tracker */}
        <div className="class-widget__resource">
          <span className="class-widget__resource-name">Focus</span>
          <div className="class-widget__resource-controls">
            <button
              className="class-widget__resource-btn"
              onClick={() => handleFocusChange(-1)}
            >
              −
            </button>
            <span className="class-widget__resource-value">{currentFocus}</span>
            <button
              className="class-widget__resource-btn"
              onClick={() => handleFocusChange(1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Mark Mechanic */}
        <div className="class-widget__mechanic">
          <div className="class-widget__mechanic-header">
            <h4 className="class-widget__mechanic-title">Mark</h4>
            <span className={`class-widget__mechanic-status ${hasMarks ? 'class-widget__mechanic-status--active' : 'class-widget__mechanic-status--inactive'}`}>
              {hasMarks ? `${markedTargets.length} Target${markedTargets.length > 1 ? 's' : ''}` : 'None'}
            </span>
          </div>
          <p className="class-widget__mechanic-description">
            Allies have <strong>Edge</strong> on attacks against marked targets.
          </p>

          {/* Active Marks */}
          {hasMarks && (
            <div style={{ marginTop: '0.5rem' }}>
              {markedTargets.map(target => (
                <div key={target} className="class-widget__active-target" style={{ marginBottom: '0.25rem' }}>
                  <span className="class-widget__active-target-name">{target}</span>
                  <button
                    className="class-widget__target-btn class-widget__target-btn--danger"
                    onClick={() => handleRemoveMark(target)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Mark Input */}
          <div className="class-widget__target">
            <label className="class-widget__target-label">Mark a target:</label>
            <div className="class-widget__target-input-group">
              <input
                type="text"
                className="class-widget__target-input"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="Target name..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddMark()}
              />
              <button
                className="class-widget__target-btn"
                onClick={handleAddMark}
                disabled={!targetInput.trim()}
              >
                Mark
              </button>
            </div>
          </div>
        </div>

        {/* Field Arsenal Reminder */}
        <div className="class-widget__mechanic" style={{ borderLeftColor: '#64b5f6' }}>
          <div className="class-widget__mechanic-header">
            <h4 className="class-widget__mechanic-title">Field Arsenal</h4>
          </div>
          <p className="class-widget__mechanic-description">
            You can equip <strong>two different Kits</strong> and switch between them as a maneuver.
          </p>
        </div>

        {/* Doctrine Info */}
        {doctrineData && (
          <div className="class-widget__mechanic">
            <div className="class-widget__mechanic-header">
              <h4 className="class-widget__mechanic-title">{doctrineData.name} Doctrine</h4>
            </div>
            <p className="class-widget__mechanic-description">
              {doctrineData.description}
            </p>
          </div>
        )}

        {/* Focus Gain Reminder */}
        <div className="class-widget__gain-section">
          <h4 className="class-widget__gain-title">Focus Gain</h4>
          <ul className="class-widget__gain-list">
            <li className="class-widget__gain-item">
              Start of turn: <strong>+2 Focus</strong>
            </li>
            <li className="class-widget__gain-item">
              First time/round an ally deals damage to marked target: <strong>+1 Focus</strong>
            </li>
            <li className="class-widget__gain-item">
              When an ally uses a heroic ability: <strong>+1 Focus</strong>
            </li>
          </ul>
        </div>

        {/* Potency Display */}
        <div className="class-widget__potency">
          <div className="class-widget__potency-item">
            <span className="class-widget__potency-label">Weak</span>
            <span className="class-widget__potency-value">R-2 ({reason - 2})</span>
          </div>
          <div className="class-widget__potency-item">
            <span className="class-widget__potency-label">Average</span>
            <span className="class-widget__potency-value">R-1 ({reason - 1})</span>
          </div>
          <div className="class-widget__potency-item class-widget__potency-item--strong">
            <span className="class-widget__potency-label">Strong</span>
            <span className="class-widget__potency-value">R ({reason})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticianWidget;
