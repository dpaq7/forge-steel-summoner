import React from 'react';
import { Culture } from '@/types';
import { cultures } from '@/data/reference-data';

interface CultureStepProps {
  selectedCulture: Culture | null;
  onSelect: (culture: Culture) => void;
}

export const CultureStep: React.FC<CultureStepProps> = ({ selectedCulture, onSelect }) => {
  return (
    <div className="creation-step">
      <h2>Choose Your Culture</h2>
      <div className="options-grid">
        {cultures.map((culture) => (
          <div
            key={culture.id}
            className={`option-card ${selectedCulture?.id === culture.id ? 'selected' : ''}`}
            onClick={() => onSelect(culture)}
          >
            <h3>{culture.name}</h3>
            <p className="description">{culture.description}</p>
            <p>
              <strong>Environment:</strong> {culture.environment.name} ({culture.environment.skills.join(', ')})
            </p>
            <p>
              <strong>Organization:</strong> {culture.organization.name}
            </p>
            <p>
              <strong>Upbringing:</strong> {culture.upbringing.name} ({culture.upbringing.skills.join(', ')})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CultureStep;
