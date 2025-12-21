/**
 * LevelUpChoiceStep - Class feature choice step in the level-up wizard
 * Handles ability choices, ward selections, stat boosts, etc.
 */
import React from 'react';
import { Hero } from '../../../types/hero';
import { LevelUpChoice } from '../../../types/levelup';
import { LevelFeature } from '../../../types/progression';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/shadcn';
import './LevelUpSteps.css';

interface LevelUpChoiceStepProps {
  hero: Hero;
  targetLevel: number;
  choiceFeatures: LevelFeature[];
  currentChoices: LevelUpChoice[];
  onSelect: (choice: LevelUpChoice) => void;
  onBack: () => void;
  onContinue: () => void;
}

const LevelUpChoiceStep: React.FC<LevelUpChoiceStepProps> = ({
  hero,
  targetLevel,
  choiceFeatures,
  currentChoices,
  onSelect,
  onBack,
  onContinue,
}) => {
  // Check if all choices are made
  const hasAllChoices = choiceFeatures.every((feature) =>
    currentChoices.some((c) => c.category === feature.category)
  );

  // Get the selected choice for a feature
  const getSelectedChoice = (feature: LevelFeature) => {
    return currentChoices.find((c) => c.category === feature.category);
  };

  // Handle selecting an option
  const handleSelectOption = (
    feature: LevelFeature,
    optionId: string,
    optionName: string,
    optionDescription?: string
  ) => {
    onSelect({
      type: getCategoryType(feature.category || ''),
      id: optionId,
      name: optionName,
      description: optionDescription,
      category: feature.category,
    });
  };

  // Map category to choice type
  const getCategoryType = (category: string): LevelUpChoice['type'] => {
    switch (category) {
      case 'ward':
      case 'second-ward':
        return 'ward';
      case 'stat-boost':
        return 'stat-boost';
      case 'circle-upgrade':
        return 'circle-upgrade';
      default:
        return 'ability';
    }
  };

  // Get a friendly name for the category
  const getCategoryLabel = (category?: string): string => {
    switch (category) {
      case 'ward':
        return 'Ward Selection';
      case 'second-ward':
        return 'Second Ward';
      case '7-essence':
        return '7-Essence Ability';
      case '9-essence':
        return '9-Essence Ability';
      case '11-essence':
        return '11-Essence Ability';
      case '7-ferocity':
        return '7-Ferocity Ability';
      case '9-ferocity':
        return '9-Ferocity Ability';
      case '11-ferocity':
        return '11-Ferocity Ability';
      case 'circle-upgrade':
        return 'Circle Upgrade';
      case 'stat-boost':
        return 'Characteristic Boost';
      case 'aspect-5-ferocity':
        return 'Aspect 5-Ferocity';
      case 'aspect-9-ferocity':
        return 'Aspect 9-Ferocity';
      case 'aspect-11-ferocity':
        return 'Aspect 11-Ferocity';
      default:
        return 'Choice';
    }
  };

  return (
    <div className="levelup-step choice-step">
      <h2 className="step-title">Make Your Choices</h2>
      <p className="step-description">
        Select your class features for level {targetLevel}.
      </p>

      <div className="choice-features-container">
        {choiceFeatures.map((feature) => {
          const selectedChoice = getSelectedChoice(feature);

          return (
            <div key={feature.id} className="choice-feature">
              <div className="choice-feature-header">
                <h3>{feature.name}</h3>
                <span className="choice-category-badge">
                  {getCategoryLabel(feature.category)}
                </span>
              </div>
              <p className="feature-description">{feature.description}</p>

              <div className="feature-choices">
                {feature.choices?.map((choice) => {
                  const isSelected = selectedChoice?.id === choice.id;
                  return (
                    <div
                      key={choice.id}
                      className={`choice-option ${isSelected ? 'selected' : ''}`}
                      onClick={() =>
                        handleSelectOption(
                          feature,
                          choice.id,
                          choice.name,
                          choice.description
                        )
                      }
                    >
                      <div className="choice-radio">
                        {isSelected ? (
                          <div className="radio-checked">
                            <Check size={12} />
                          </div>
                        ) : (
                          <div className="radio-unchecked" />
                        )}
                      </div>
                      <div className="choice-content">
                        <strong className="choice-name">{choice.name}</strong>
                        <span className="choice-description">
                          {choice.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="step-actions">
        <Button variant="chamfered" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button variant="success" onClick={onContinue} disabled={!hasAllChoices}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LevelUpChoiceStep;
