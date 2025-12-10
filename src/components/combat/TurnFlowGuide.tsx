import React from 'react';
import { useCombatContext } from '../../context/CombatContext';
import { TurnPhase } from '../../types';
import './TurnFlowGuide.css';

const TurnFlowGuide: React.FC = () => {
  const { turnState, advancePhase, startNewTurn } = useCombatContext();

  const phases: { id: TurnPhase; label: string; description: string }[] = [
    {
      id: 'collectResources',
      label: 'Collect Resources',
      description: 'Gain essence and spawn signature minions',
    },
    {
      id: 'summonMinions',
      label: 'Summon Minions',
      description: 'Use Call Forth or other summoning abilities',
    },
    {
      id: 'positionUnits',
      label: 'Position Units',
      description: 'Move squads and minions',
    },
    {
      id: 'executePlan',
      label: 'Execute Plan',
      description: 'Squad actions and hero abilities',
    },
  ];

  const currentPhaseIndex = phases.findIndex((p) => p.id === turnState.currentPhase);

  return (
    <div className="turn-flow-guide">
      <div className="turn-header">
        <h3>Turn {turnState.roundNumber}</h3>
        <button onClick={startNewTurn} className="new-turn-btn">
          Start New Turn
        </button>
      </div>

      <div className="phases-list">
        {phases.map((phase, index) => {
          const isCompleted = turnState.phasesCompleted.includes(phase.id);
          const isCurrent = phase.id === turnState.currentPhase;
          const isPending = index > currentPhaseIndex;

          return (
            <div
              key={phase.id}
              className={`phase-item ${
                isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
              }`}
            >
              <div className="phase-indicator">
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className="phase-content">
                <h4>{phase.label}</h4>
                <p>{phase.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {currentPhaseIndex < phases.length - 1 && (
        <button onClick={advancePhase} className="advance-phase-btn">
          Complete Phase → {phases[currentPhaseIndex + 1].label}
        </button>
      )}
    </div>
  );
};

export default TurnFlowGuide;
