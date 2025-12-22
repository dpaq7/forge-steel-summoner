import React from 'react';

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
}

export const NameStep: React.FC<NameStepProps> = ({ name, onNameChange }) => {
  return (
    <div className="creation-step name-step">
      <h2>Choose Your Name</h2>
      <p className="step-description">Enter a name for your hero</p>
      <div className="name-input-container">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter character name"
          autoFocus
        />
      </div>
    </div>
  );
};

export default NameStep;
