import React from 'react';
import { useCombatContext } from '../../context/CombatContext';
import { useSummonerContext } from '../../context/SummonerContext';
import './EssenceTracker.css';

const EssenceTracker: React.FC = () => {
  const { essenceState, gainEssence, onMinionDeath } = useCombatContext();
  const { hero } = useSummonerContext();

  // Show essence as visual dots (up to a reasonable display cap)
  const renderEssenceDots = () => {
    const dots = [];
    const displayCap = 10; // Show up to 10 dots
    const filledCount = Math.min(essenceState.currentEssence, displayCap);

    for (let i = 0; i < displayCap; i++) {
      dots.push(
        <div
          key={i}
          className={`essence-dot ${i < filledCount ? 'filled' : 'empty'}`}
        >
          ★
        </div>
      );
    }
    return dots;
  };

  const canGainMinionDeathEssence = !essenceState.minionDeathEssenceGainedThisRound;

  return (
    <div className="essence-tracker">
      <h3>Essence</h3>
      <div className="essence-dots-container">{renderEssenceDots()}</div>
      <div className="essence-info">
        <span className="essence-count">
          {essenceState.currentEssence} Essence
        </span>
        <span className="essence-gained">
          (+{essenceState.essenceGainedThisTurn} this turn)
        </span>
      </div>

      <div className="essence-details">
        <span className="essence-detail">
          Starting (Victories): {hero?.victories || 0}
        </span>
        <span className="essence-detail">
          Per Turn: +2
        </span>
      </div>

      <div className="essence-controls">
        <button onClick={() => gainEssence(1)} className="gain-essence-btn">
          + Gain 1 Essence
        </button>
        <button
          onClick={onMinionDeath}
          className={`minion-death-btn ${canGainMinionDeathEssence ? '' : 'disabled'}`}
          disabled={!canGainMinionDeathEssence}
          title={canGainMinionDeathEssence ? 'Gain +1 essence (minion death)' : 'Already gained this round'}
        >
          Minion Death (+1)
        </button>
      </div>

      {!canGainMinionDeathEssence && (
        <div className="essence-note">
          Minion death essence already gained this round
        </div>
      )}
    </div>
  );
};

export default EssenceTracker;
