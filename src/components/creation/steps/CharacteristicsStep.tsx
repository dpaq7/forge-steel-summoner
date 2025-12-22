import React from 'react';
import { classDefinitions } from '@/data/classes/class-definitions';
import { HeroClass } from '@/types/hero';
import { CharacteristicAssignments } from '@/hooks/useCharacterCreation';

interface CharacteristicsStepProps {
  selectedClass: HeroClass | null;
  characteristicAssignments: CharacteristicAssignments;
  selectedCharacteristic: keyof CharacteristicAssignments | null;
  onSelectCharacteristic: (char: keyof CharacteristicAssignments | null) => void;
  onAssignValue: (char: keyof CharacteristicAssignments, value: number) => void;
  onClearAssignment: (char: keyof CharacteristicAssignments) => void;
  onResetAssignments: () => void;
  onApplyRecommended: () => void;
  getAvailableValues: () => number[];
  allCharacteristicsAssigned: () => boolean;
}

const CHARACTERISTICS_LIST: { key: keyof CharacteristicAssignments; name: string; description: string }[] = [
  { key: 'might', name: 'Might', description: 'Strength, brawn, breaking things' },
  { key: 'agility', name: 'Agility', description: 'Coordination, speed, dodging' },
  { key: 'reason', name: 'Reason', description: 'Logic, education, deduction' },
  { key: 'intuition', name: 'Intuition', description: 'Instinct, observation, sensing motives' },
  { key: 'presence', name: 'Presence', description: 'Personality, willpower, social influence' },
];

export const CharacteristicsStep: React.FC<CharacteristicsStepProps> = ({
  selectedClass,
  characteristicAssignments,
  selectedCharacteristic,
  onSelectCharacteristic,
  onAssignValue,
  onClearAssignment,
  onResetAssignments,
  onApplyRecommended,
  getAvailableValues,
  allCharacteristicsAssigned,
}) => {
  const availableValues = getAvailableValues();
  const currentClassDef = selectedClass ? classDefinitions[selectedClass] : null;
  const fixedChars = currentClassDef?.startingCharacteristics || {};
  const potencyChar = currentClassDef?.potencyCharacteristic;
  const className = currentClassDef?.name || 'Hero';

  const fixedCharsText = Object.entries(fixedChars)
    .map(([char, val]) => `${char.charAt(0).toUpperCase() + char.slice(1)} +${val}`)
    .join(', ');

  return (
    <div className="creation-step characteristics-step">
      <h2>Assign Characteristics</h2>
      <p className="step-description">
        Distribute the standard array values to your characteristics. Click a characteristic, then click a value to assign it.
        <br />
        <strong>{className}s</strong> have{' '}
        {potencyChar ? (
          <>
            <strong>{potencyChar.charAt(0).toUpperCase() + potencyChar.slice(1)}</strong> as their potency characteristic
          </>
        ) : (
          'no fixed potency characteristic'
        )}
        .{fixedCharsText && <> Starting with: <strong>{fixedCharsText}</strong> (from class).</>}
      </p>

      <div className="characteristics-assignment">
        {/* Available Values */}
        <div className="available-values">
          <h4>Available Values (Standard Array: +2, +2, +1, 0, -1)</h4>
          <div className="value-pool">
            {availableValues.length > 0 ? (
              availableValues.map((val, idx) => (
                <button
                  key={`${val}-${idx}`}
                  className={`value-chip ${selectedCharacteristic ? 'clickable' : ''}`}
                  onClick={() => selectedCharacteristic && onAssignValue(selectedCharacteristic, val)}
                  disabled={!selectedCharacteristic}
                >
                  {val >= 0 ? `+${val}` : val}
                </button>
              ))
            ) : (
              <span className="all-assigned">All values assigned!</span>
            )}
          </div>
        </div>

        {/* Characteristics Grid */}
        <div className="characteristics-grid">
          {CHARACTERISTICS_LIST.map(({ key, name, description }) => {
            const assignedValue = characteristicAssignments[key];
            const isSelected = selectedCharacteristic === key;
            const isAssigned = assignedValue !== null;
            const isPotency = key === potencyChar;

            return (
              <div
                key={key}
                className={`characteristic-slot ${isSelected ? 'selected' : ''} ${isAssigned ? 'assigned' : ''} ${isPotency ? 'potency' : ''}`}
                onClick={() => {
                  if (isAssigned) {
                    onClearAssignment(key);
                  } else {
                    onSelectCharacteristic(isSelected ? null : key);
                  }
                }}
              >
                <div className="char-header">
                  <span className="char-name">
                    {name}
                    {isPotency && <span className="potency-badge" title="Potency Characteristic">★</span>}
                  </span>
                  <span className="char-value">
                    {isAssigned ? (assignedValue >= 0 ? `+${assignedValue}` : assignedValue) : '—'}
                  </span>
                </div>
                <p className="char-desc">{description}</p>
                {isAssigned && <span className="clear-hint">Click to clear</span>}
                {!isAssigned && isSelected && <span className="select-hint">Select a value above</span>}
                {!isAssigned && !isSelected && <span className="click-hint">Click to select</span>}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="characteristic-actions">
          <button type="button" className="quick-action-btn" onClick={onApplyRecommended}>
            Apply Recommended ({className})
          </button>
          <button type="button" className="quick-action-btn secondary" onClick={onResetAssignments}>
            Reset All
          </button>
        </div>

        {/* Preview */}
        {allCharacteristicsAssigned() && (
          <div className="characteristic-preview">
            <h4>Final Characteristics</h4>
            <div className="preview-stats">
              {CHARACTERISTICS_LIST.map(({ key, name }) => (
                <div key={key} className="preview-stat">
                  <span className="stat-name">{name}</span>
                  <span className="stat-value">
                    {characteristicAssignments[key]! >= 0
                      ? `+${characteristicAssignments[key]}`
                      : characteristicAssignments[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacteristicsStep;
