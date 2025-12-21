/**
 * LevelUpProgress - Progress indicator for the level-up wizard
 */
import React from 'react';
import { LevelUpStep, LevelUpChoice, STEP_LABELS } from '../../../types/levelup';
import { Check } from 'lucide-react';
import './LevelUpSteps.css';

interface LevelUpProgressProps {
  steps: LevelUpStep[];
  currentStep: LevelUpStep;
  choices: LevelUpChoice[];
}

const LevelUpProgress: React.FC<LevelUpProgressProps> = ({
  steps,
  currentStep,
  choices,
}) => {
  const currentIndex = steps.indexOf(currentStep);

  const isStepComplete = (step: LevelUpStep): boolean => {
    const stepIndex = steps.indexOf(step);
    if (stepIndex < currentIndex) return true;
    if (step === 'overview') return currentIndex > 0;
    if (step === 'confirmation') return false;
    if (step === 'perk') return choices.some((c) => c.type === 'perk');
    if (step === 'ability') {
      // Ability step is complete if we've passed it
      return stepIndex < currentIndex;
    }
    return false;
  };

  return (
    <div className="levelup-progress">
      {steps.map((step, idx) => {
        const isCurrent = step === currentStep;
        const isComplete = isStepComplete(step);
        const isPast = idx < currentIndex;

        return (
          <React.Fragment key={step}>
            <div
              className={`progress-step ${isCurrent ? 'current' : ''} ${
                isComplete ? 'complete' : ''
              } ${isPast ? 'past' : ''}`}
            >
              <div className="step-indicator">
                {isComplete ? <Check size={14} /> : idx + 1}
              </div>
              <span className="step-label">{STEP_LABELS[step]}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`progress-connector ${isPast ? 'active' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default LevelUpProgress;
