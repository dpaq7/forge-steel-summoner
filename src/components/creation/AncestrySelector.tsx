// Ancestry selection component for character creation
// Displays all Draw Steel ancestries with their stats and traits

import React from 'react';
import { AncestryDefinition } from '../../types/ancestry';
import { ANCESTRIES, getCompleteAncestries, getIncompleteAncestries } from '../../data/ancestries';
import './AncestrySelector.css';

interface AncestrySelectorProps {
  selectedAncestryId: string | null;
  onSelect: (ancestryId: string) => void;
}

const AncestrySelector: React.FC<AncestrySelectorProps> = ({
  selectedAncestryId,
  onSelect,
}) => {
  const completeAncestries = getCompleteAncestries();
  const incompleteAncestries = getIncompleteAncestries();

  return (
    <div className="creation-step ancestry-selection-step">
      <h2>Choose Your Ancestry</h2>
      <p className="step-description">
        Your ancestry determines your heritage and grants a signature trait plus ancestry points
        to spend on additional purchased traits.
      </p>

      <div className="options-grid ancestry-grid">
        {completeAncestries.map((ancestry) => (
          <button
            key={ancestry.id}
            type="button"
            className={`option-card ancestry-card ${
              selectedAncestryId === ancestry.id ? 'selected' : ''
            }`}
            onClick={() => onSelect(ancestry.id)}
          >
            <div className="ancestry-header">
              <h3>{ancestry.name}</h3>
              <div className="ancestry-stats-row">
                <span className="ancestry-stat">Size {ancestry.size}</span>
                <span className="ancestry-stat">Speed {ancestry.speed}</span>
                <span className="ancestry-stat ancestry-points">{ancestry.ancestryPoints} pts</span>
              </div>
            </div>
            <p className="ancestry-description">{ancestry.description}</p>
            <div className="ancestry-signature">
              <span className="signature-label">Signature Trait:</span>
              <span className="signature-name">{ancestry.signatureTrait.name}</span>
            </div>
            {ancestry.purchasedTraits.length > 0 && (
              <div className="ancestry-trait-count">
                {ancestry.purchasedTraits.length} purchasable trait{ancestry.purchasedTraits.length !== 1 ? 's' : ''}
              </div>
            )}
          </button>
        ))}
      </div>

      {incompleteAncestries.length > 0 && (
        <div className="ancestry-coming-soon">
          <h4>Coming Soon</h4>
          <div className="coming-soon-list">
            {incompleteAncestries.map((ancestry) => (
              <span key={ancestry.id} className="coming-soon-item">
                {ancestry.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AncestrySelector;
