/**
 * LevelUpOverview - First step showing what will be gained
 */
import React from 'react';
import { Hero } from '../../../types/hero';
import { LevelUpStep, AutomaticFeature, STEP_ICONS } from '../../../types/levelup';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/shadcn';
import './LevelUpSteps.css';

interface CharPreview {
  allStats?: number;
  changes?: { stat: string; from: number; to: number }[];
}

interface LevelUpOverviewProps {
  hero: Hero;
  targetLevel: number;
  requiredSteps: LevelUpStep[];
  automaticFeatures: AutomaticFeature[];
  staminaChange: { from: number; to: number };
  charPreview: CharPreview | null;
  minionCap?: number;
  essencePerTurn?: number;
  onBegin: () => void;
}

const LevelUpOverview: React.FC<LevelUpOverviewProps> = ({
  hero,
  targetLevel,
  requiredSteps,
  automaticFeatures,
  staminaChange,
  charPreview,
  minionCap,
  essencePerTurn,
  onBegin,
}) => {
  // Count choices to make (exclude overview and confirmation)
  const choiceSteps = requiredSteps.filter(
    (s) => s !== 'overview' && s !== 'confirmation'
  );
  const choiceCount = choiceSteps.length;

  return (
    <div className="levelup-step overview-step">
      {/* Level badge */}
      <div className="level-badge-large">
        <span className="level-from">Level {hero.level}</span>
        <ArrowRight className="level-arrow-icon" />
        <span className="level-to">Level {targetLevel}</span>
      </div>

      <h2 className="step-title">
        <Sparkles className="h-5 w-5" />
        Level Up!
      </h2>
      <p className="step-description">
        {hero.name} is ready to advance to level {targetLevel}.
      </p>

      {/* Stats Summary */}
      <div className="overview-section stats-summary-section">
        <h3>Stat Changes</h3>
        <div className="stats-grid">
          <div className="stat-change-item">
            <span className="stat-label">Stamina</span>
            <div className="stat-values">
              <span className="old-value">{staminaChange.from}</span>
              <ArrowRight size={14} className="arrow-icon" />
              <span className="new-value highlight">{staminaChange.to}</span>
              <span className="delta">(+{staminaChange.to - staminaChange.from})</span>
            </div>
          </div>

          {charPreview?.changes?.map((change, i) => (
            <div key={i} className="stat-change-item">
              <span className="stat-label">{change.stat}</span>
              <div className="stat-values">
                <span className="old-value">{change.from}</span>
                <ArrowRight size={14} className="arrow-icon" />
                <span className="new-value highlight">{change.to}</span>
              </div>
            </div>
          ))}

          {charPreview?.allStats && (
            <div className="stat-change-item">
              <span className="stat-label">All Stats</span>
              <div className="stat-values">
                <span className="new-value highlight">+{charPreview.allStats}</span>
              </div>
            </div>
          )}

          {minionCap && (
            <div className="stat-change-item">
              <span className="stat-label">Minion Cap</span>
              <div className="stat-values">
                <span className="new-value">+{minionCap}</span>
              </div>
            </div>
          )}

          {essencePerTurn && (
            <div className="stat-change-item">
              <span className="stat-label">Essence/Turn</span>
              <div className="stat-values">
                <span className="new-value">{essencePerTurn}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Automatic Features */}
      {automaticFeatures.length > 0 && (
        <div className="overview-section">
          <h3>You will gain:</h3>
          <ul className="gains-list">
            {automaticFeatures.map((feature) => (
              <li key={feature.id} className="gain-item">
                <span className="gain-icon">✦</span>
                <div className="gain-content">
                  <span className="gain-name">{feature.name}</span>
                  <span className="gain-description">{feature.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Choices to make */}
      {choiceCount > 0 && (
        <div className="overview-section">
          <h3>Choices to make:</h3>
          <ul className="choices-preview">
            {choiceSteps.map((step) => (
              <li key={step} className="choice-item">
                <span className="choice-icon">{STEP_ICONS[step]}</span>
                <span className="choice-text">
                  {step === 'perk' && 'Choose a perk'}
                  {step === 'ability' && 'Choose class features'}
                  {step === 'skill' && 'Choose a new skill'}
                  {step === 'subclass' && 'Choose a subclass feature'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action */}
      <div className="step-actions centered">
        <Button variant="success" size="lg" onClick={onBegin}>
          {choiceCount > 0 ? 'Begin Level Up' : 'Confirm Level Up'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LevelUpOverview;
