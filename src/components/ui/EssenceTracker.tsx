import React, { useCallback } from 'react';
import './EssenceTracker.css';

interface EssenceTrackerProps {
  current: number;
  max: number;
  onCurrentChange: (value: number) => void;
  className?: string;
}

/**
 * Essence (Heroic Resource) Tracker with horizontal hexagon shape.
 * Matches Draw Steel character sheet heroic resource display.
 */
const EssenceTracker: React.FC<EssenceTrackerProps> = ({
  current,
  max,
  onCurrentChange,
  className = '',
}) => {
  const handleIncrement = useCallback(() => {
    if (current < 99) onCurrentChange(current + 1);
  }, [current, onCurrentChange]);

  const handleDecrement = useCallback(() => {
    if (current > 0) onCurrentChange(current - 1);
  }, [current, onCurrentChange]);

  return (
    <div className={`essence-tracker ${className}`}>
      <div className="essence-hexagon-wrapper">
        <div className="essence-hexagon-border" />
        <div className="essence-hexagon-inner">
          <div className="essence-controls">
            <button
              className="essence-btn"
              onClick={handleDecrement}
              disabled={current <= 0}
              aria-label="Decrease essence"
              type="button"
            >
              -
            </button>
            <span className="essence-value">{current}</span>
            <button
              className="essence-btn"
              onClick={handleIncrement}
              disabled={current >= 99}
              aria-label="Increase essence"
              type="button"
            >
              +
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EssenceTracker;
