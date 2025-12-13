import React from 'react';
import { EquippedItem } from '../../types/equipment';
import { getItemById } from '../../data/magicItems';

interface ArtifactDisplayProps {
  artifacts: EquippedItem[];
  onUnequip: (itemId: string) => void;
}

const ArtifactDisplay: React.FC<ArtifactDisplayProps> = ({ artifacts, onUnequip }) => {
  if (artifacts.length === 0) return null;

  return (
    <div className="artifacts-section">
      <h3>Artifacts</h3>
      <div className="artifacts-list">
        {artifacts.map((artifact) => {
          const itemData = getItemById(artifact.itemId);
          return (
            <div key={artifact.itemId} className="artifact-card">
              <div className="artifact-glow" />
              <div className="artifact-content">
                <div className="artifact-header">
                  <span className="artifact-icon">
                    {artifact.slot === 'weapon' && '⚔️'}
                    {artifact.slot === 'implement' && '🔮'}
                    {artifact.slot === 'held' && '✨'}
                    {!['weapon', 'implement', 'held'].includes(artifact.slot) && '💎'}
                  </span>
                  <h4 className="artifact-name">{artifact.name}</h4>
                  <span className="artifact-badge">ARTIFACT</span>
                </div>
                <p className="artifact-effect">{artifact.effect}</p>
                {artifact.bonuses.length > 0 && (
                  <div className="artifact-bonuses">
                    {artifact.bonuses.map((bonus, idx) => (
                      <span key={idx} className="artifact-bonus-tag">
                        +{bonus.value} {bonus.stat}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  className="artifact-unequip-btn"
                  onClick={() => onUnequip(artifact.itemId)}
                >
                  Unequip Artifact
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArtifactDisplay;
