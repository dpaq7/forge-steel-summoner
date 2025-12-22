import React from 'react';
import { Career } from '@/types';
import { careers } from '@/data/reference-data';

interface CareerStepProps {
  selectedCareer: Career | null;
  onSelect: (career: Career) => void;
}

export const CareerStep: React.FC<CareerStepProps> = ({ selectedCareer, onSelect }) => {
  return (
    <div className="creation-step">
      <h2>Choose Your Career</h2>
      <div className="options-grid">
        {careers.map((career) => (
          <div
            key={career.id}
            className={`option-card ${selectedCareer?.id === career.id ? 'selected' : ''}`}
            onClick={() => onSelect(career)}
          >
            <h3>{career.name}</h3>
            <p className="description">{career.description}</p>
            <p>
              <strong>Skills:</strong> {career.skills.join(', ')}
            </p>
            <p>
              <strong>Perk Type:</strong> {career.perkType.charAt(0).toUpperCase() + career.perkType.slice(1)}
            </p>
            {(career.renown > 0 || career.wealth > 0 || career.projectPoints > 0) && (
              <p className="meta">
                {career.renown > 0 && `Renown: +${career.renown} `}
                {career.wealth > 0 && `Wealth: +${career.wealth} `}
                {career.projectPoints > 0 && `Project Points: ${career.projectPoints}`}
              </p>
            )}
            <p>
              <em>"{career.incitingIncident}"</em>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerStep;
