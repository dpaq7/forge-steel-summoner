import React from 'react';
import { useSummonerContext } from '../../context/SummonerContext';
import './VictoryTracker.css';

const VictoryTracker: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();

  if (!hero) return null;

  const adjustVictories = (delta: number) => {
    const newVictories = Math.max(0, hero.victories + delta);
    updateHero({ victories: newVictories });
  };

  return (
    <div className="victory-tracker">
      <h3>Victories</h3>
      <div className="victory-display">
        <button
          className="victory-btn minus"
          onClick={() => adjustVictories(-1)}
          disabled={hero.victories <= 0}
        >
          -
        </button>
        <span className="victory-count">{hero.victories}</span>
        <button
          className="victory-btn plus"
          onClick={() => adjustVictories(1)}
        >
          +
        </button>
      </div>
      <p className="victory-hint">
        Starting Essence in combat: {hero.victories}
      </p>
    </div>
  );
};

export default VictoryTracker;
