import React from 'react';
import { useRollHistory, RollHistoryEntry } from '../../context/RollHistoryContext';
import { getTierColor } from '../../utils/dice';
import './RollHistoryPanel.css';

const RollHistoryPanel: React.FC = () => {
  const { history, clearHistory, isHistoryOpen, toggleHistory } = useRollHistory();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getSourceIcon = (sourceType: RollHistoryEntry['sourceType']) => {
    switch (sourceType) {
      case 'ability':
        return 'A';
      case 'minion':
        return 'M';
      case 'hero':
        return 'H';
      default:
        return '?';
    }
  };

  return (
    <>
      {isHistoryOpen && (
        <div className="roll-history-panel">
          <div className="history-header">
            <h3>Roll History</h3>
            <button className="clear-btn" onClick={clearHistory} title="Clear History">
              Clear
            </button>
          </div>

          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty">
                No rolls yet. Use abilities or minion attacks to start rolling!
              </div>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className={`history-entry tier-${entry.result.tier}`}
                >
                  <div className="entry-header">
                    <span
                      className="source-icon"
                      title={entry.sourceType}
                    >
                      {getSourceIcon(entry.sourceType)}
                    </span>
                    <span className="source-name">{entry.source}</span>
                    <span className="entry-time">{formatTime(entry.timestamp)}</span>
                  </div>
                  <div className="entry-result">
                    <span
                      className="result-total"
                      style={{ color: getTierColor(entry.result.tier) }}
                    >
                      {entry.result.total}
                    </span>
                    <span className="result-details">
                      [{entry.result.dice[0]}+{entry.result.dice[1]}]
                      {entry.result.secondRoll !== undefined && entry.result.secondDice && (
                        <span className="discarded">
                          /[{entry.result.secondDice[0]}+{entry.result.secondDice[1]}]
                        </span>
                      )}
                      {entry.result.modifier !== 0 && (
                        <> {entry.result.modifier >= 0 ? '+' : ''}{entry.result.modifier}</>
                      )}
                    </span>
                    <span
                      className="result-tier"
                      style={{ background: getTierColor(entry.result.tier) }}
                    >
                      T{entry.result.tier}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RollHistoryPanel;
