/**
 * LevelUpConfirmation - Final review and confirmation step
 */
import React from 'react';
import { Hero } from '../../../types/hero';
import { LevelUpChoice, AutomaticFeature } from '../../../types/levelup';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/shadcn';
import './LevelUpSteps.css';

interface CharPreview {
  allStats?: number;
  changes?: { stat: string; from: number; to: number }[];
}

interface LevelUpConfirmationProps {
  hero: Hero;
  targetLevel: number;
  choices: LevelUpChoice[];
  automaticFeatures: AutomaticFeature[];
  staminaChange: { from: number; to: number };
  charPreview: CharPreview | null;
  onBack: () => void;
  onConfirm: () => void;
}

const LevelUpConfirmation: React.FC<LevelUpConfirmationProps> = ({
  hero,
  targetLevel,
  choices,
  automaticFeatures,
  staminaChange,
  charPreview,
  onBack,
  onConfirm,
}) => {
  // Get friendly type name
  const getChoiceTypeName = (type: LevelUpChoice['type']): string => {
    switch (type) {
      case 'perk':
        return 'Perk';
      case 'ability':
        return 'Ability';
      case 'skill':
        return 'Skill';
      case 'ward':
        return 'Ward';
      case 'stat-boost':
        return 'Stat Boost';
      case 'circle-upgrade':
        return 'Circle Upgrade';
      case 'subclass-feature':
        return 'Subclass';
      default:
        return 'Choice';
    }
  };

  return (
    <div className="levelup-step confirmation-step">
      {/* Success badge */}
      <div className="level-badge-large success">
        <Sparkles className="badge-icon" />
        <span className="level-to">Level {targetLevel}</span>
      </div>

      <h2 className="step-title">Confirm Level Up</h2>
      <p className="step-description">
        Review your selections before advancing to level {targetLevel}.
      </p>

      {/* Stat Changes Summary */}
      <div className="confirmation-section">
        <h3>Stat Changes</h3>
        <div className="stat-changes">
          <div className="stat-change-pill">
            <span className="stat-name">Level</span>
            <span className="stat-value">
              {hero.level} → {targetLevel}
            </span>
          </div>
          <div className="stat-change-pill">
            <span className="stat-name">Stamina</span>
            <span className="stat-value success">
              {staminaChange.from} → {staminaChange.to}
            </span>
          </div>
          {charPreview?.changes?.map((change, i) => (
            <div key={i} className="stat-change-pill">
              <span className="stat-name">{change.stat}</span>
              <span className="stat-value success">
                {change.from} → {change.to}
              </span>
            </div>
          ))}
          {charPreview?.allStats && (
            <div className="stat-change-pill">
              <span className="stat-name">All Stats</span>
              <span className="stat-value success">+{charPreview.allStats}</span>
            </div>
          )}
        </div>
      </div>

      {/* Choices Summary */}
      {choices.length > 0 && (
        <div className="confirmation-section">
          <h3>Your Choices</h3>
          <div className="choices-summary">
            {choices.map((choice, idx) => (
              <div key={idx} className="choice-summary-card">
                <div className="choice-summary-header">
                  <span className="choice-type">{getChoiceTypeName(choice.type)}</span>
                  <Check size={16} className="choice-check" />
                </div>
                <h4 className="choice-name">{choice.name}</h4>
                {choice.description && (
                  <p className="choice-description">{choice.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automatic Features Summary */}
      {automaticFeatures.length > 0 && (
        <div className="confirmation-section">
          <h3>Automatic Features</h3>
          <div className="automatic-summary">
            {automaticFeatures.map((feature) => (
              <div key={feature.id} className="automatic-summary-item">
                <span className="feature-icon">✦</span>
                <span className="feature-name">{feature.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="step-actions">
        <Button variant="chamfered" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button variant="success" size="lg" onClick={onConfirm}>
          <Check className="mr-2 h-4 w-4" />
          Confirm Level Up
        </Button>
      </div>
    </div>
  );
};

export default LevelUpConfirmation;
