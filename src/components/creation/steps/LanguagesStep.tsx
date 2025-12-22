import React from 'react';
import { Career } from '@/types';
import { getSelectableLanguages } from '@/data/reference-data';

interface LanguagesStepProps {
  selectedCareer: Career | null;
  selectedLanguages: string[];
  requiredCount: number;
  onToggleLanguage: (languageId: string) => void;
}

export const LanguagesStep: React.FC<LanguagesStepProps> = ({
  selectedCareer,
  selectedLanguages,
  requiredCount,
  onToggleLanguage,
}) => {
  const selectableLanguages = getSelectableLanguages();

  // If career grants no languages, show simplified view
  if (requiredCount === 0) {
    return (
      <div className="creation-step">
        <h2>Languages</h2>
        <p className="step-description">
          Your career as a <strong>{selectedCareer?.name}</strong> does not grant additional languages.
          <br />
          All heroes automatically know <strong>Caelian</strong>, the common tongue of Orden.
        </p>
        <div className="language-info">
          <div className="known-language">
            <span className="lang-name">Caelian</span>
            <span className="lang-note">Known by all heroes</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="creation-step languages-step">
      <h2>Choose Your Languages</h2>
      <p className="step-description">
        Your career as a <strong>{selectedCareer?.name}</strong> grants you knowledge of {requiredCount} additional
        language{requiredCount > 1 ? 's' : ''}.
        <br />
        All heroes automatically know <strong>Caelian</strong>, the common tongue.
        <br />
        <strong>
          Selected: {selectedLanguages.length} / {requiredCount}
        </strong>
      </p>

      <div className="language-selection">
        <div className="known-languages">
          <h4>Already Known</h4>
          <div className="language-chip default">
            <span className="lang-name">Caelian</span>
            <span className="lang-desc">Common tongue of Orden</span>
          </div>
        </div>

        <div className="available-languages">
          <h4>
            Select {requiredCount} Language{requiredCount > 1 ? 's' : ''}
          </h4>
          <div className="languages-grid">
            {selectableLanguages.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.id);
              const canSelect = isSelected || selectedLanguages.length < requiredCount;

              return (
                <div
                  key={lang.id}
                  className={`language-option ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                  onClick={() => canSelect && onToggleLanguage(lang.id)}
                >
                  <span className="lang-name">{lang.name}</span>
                  <span className="lang-desc">{lang.relatedTo}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagesStep;
