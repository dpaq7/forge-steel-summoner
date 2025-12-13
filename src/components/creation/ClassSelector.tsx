// Class selection component for character creation
// Displays all 10 Draw Steel hero classes with descriptions

import React from 'react';
import { HeroClass } from '../../types/hero';
import { classDefinitions, getClassRoleColor } from '../../data/classes/class-definitions';

interface ClassSelectorProps {
  selectedClass: HeroClass | null;
  onSelect: (heroClass: HeroClass) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ selectedClass, onSelect }) => {
  const classes = Object.values(classDefinitions);

  return (
    <div className="creation-step class-selection-step">
      <h2>Choose Your Class</h2>
      <p className="step-description">
        Select a heroic class that defines your role in combat and your unique abilities.
      </p>

      <div className="options-grid class-grid">
        {classes.map((classDef) => (
          <div
            key={classDef.id}
            className={`option-card class-card ${selectedClass === classDef.id ? 'selected' : ''} ${classDef.masterClass ? 'master-class' : ''}`}
            onClick={() => onSelect(classDef.id)}
            style={{
              '--role-color': getClassRoleColor(classDef.role),
            } as React.CSSProperties}
          >
            {classDef.masterClass && <span className="master-badge">Master Class</span>}
            <div className="class-header">
              <h3>{classDef.name}</h3>
              <span
                className="role-tag"
                style={{ backgroundColor: getClassRoleColor(classDef.role) }}
              >
                {classDef.role}
              </span>
            </div>
            <p className="description">{classDef.description}</p>
            <div className="class-stats">
              <div className="stat-row">
                <span className="stat-label">Stamina:</span>
                <span className="stat-value">{classDef.startingStamina}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Resource:</span>
                <span className="stat-value resource-name">{classDef.heroicResource.name}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Potency:</span>
                <span className="stat-value">
                  {classDef.potencyCharacteristic.charAt(0).toUpperCase() +
                    classDef.potencyCharacteristic.slice(1)}
                </span>
              </div>
            </div>
            <div className="class-subclass">
              <span className="subclass-label">{classDef.subclassName}:</span>
              <span className="subclass-options">
                {classDef.subclasses.slice(0, 3).map((sub) => sub.name).join(', ')}
                {classDef.subclasses.length > 3 && '...'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="class-legend">
        <h4>Class Roles</h4>
        <div className="role-legend">
          <span className="legend-item">
            <span
              className="role-dot"
              style={{ backgroundColor: getClassRoleColor('Defender') }}
            />
            <span>Defender - Protect allies and lock down enemies</span>
          </span>
          <span className="legend-item">
            <span
              className="role-dot"
              style={{ backgroundColor: getClassRoleColor('Controller') }}
            />
            <span>Controller - Manipulate the battlefield and enemies</span>
          </span>
          <span className="legend-item">
            <span
              className="role-dot"
              style={{ backgroundColor: getClassRoleColor('Striker') }}
            />
            <span>Striker - Deal high damage to key targets</span>
          </span>
          <span className="legend-item">
            <span
              className="role-dot"
              style={{ backgroundColor: getClassRoleColor('Support') }}
            />
            <span>Support - Buff allies and provide healing</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClassSelector;
