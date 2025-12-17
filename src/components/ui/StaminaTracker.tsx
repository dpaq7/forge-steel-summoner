import React, { useCallback, useEffect, useRef } from 'react';
import './StaminaTracker.css';

interface StaminaTrackerProps {
  current: number;
  max: number;
  temporary: number;
  winded: boolean;
  dying: boolean;
  dead?: boolean;
  dyingThreshold: number;
  onCurrentChange: (value: number) => void;
  onMaxChange?: (value: number) => void;
  onTemporaryChange: (value: number) => void;
  onWindedChange: (value: boolean) => void;
  onDyingChange: (value: boolean) => void;
  onDeadChange?: (value: boolean) => void;
  onDyingTriggered?: () => void;
  className?: string;
}

/**
 * Stamina Tracker - Unified Box Layout (2-Row)
 * Top Row: [Current + ▲▼] | [Temp / Max stacked]
 * Bottom Row: ◇ Winded | ◇ Dying | ◇ Dead
 *
 * Draw Steel rules:
 * - Winded: current <= max/2
 * - Dying: current <= 0
 * - Dead: current <= -max/2
 */
const StaminaTracker: React.FC<StaminaTrackerProps> = ({
  current,
  max,
  temporary,
  winded,
  dying,
  dead = false,
  dyingThreshold: _dyingThreshold,
  onCurrentChange,
  onMaxChange,
  onTemporaryChange,
  onWindedChange,
  onDyingChange,
  onDeadChange,
  onDyingTriggered,
  className = '',
}) => {
  // Auto-calculate status thresholds per Draw Steel rules
  const windedThreshold = Math.floor(max / 2);
  const deathThreshold = -Math.floor(max / 2);

  const isAutoWinded = current <= windedThreshold;
  const isAutoDying = current <= 0;
  const isAutoDead = current <= deathThreshold;

  // Track previous dying state to detect when hero becomes dying
  const prevDyingRef = useRef(isAutoDying || dying);

  // Trigger bleeding when hero becomes dying
  useEffect(() => {
    const wasDying = prevDyingRef.current;
    const nowDying = isAutoDying || dying;

    if (!wasDying && nowDying && onDyingTriggered) {
      onDyingTriggered();
    }

    prevDyingRef.current = nowDying;
  }, [isAutoDying, dying, onDyingTriggered]);

  const handleCurrentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const minValue = deathThreshold;
      onCurrentChange(Math.max(minValue, Math.min(max + temporary, value)));
    }
  }, [max, temporary, deathThreshold, onCurrentChange]);

  const handleIncrement = useCallback(() => {
    if (current < max + temporary) {
      onCurrentChange(current + 1);
    }
  }, [current, max, temporary, onCurrentChange]);

  const handleDecrement = useCallback(() => {
    if (current > deathThreshold) {
      onCurrentChange(current - 1);
    }
  }, [current, deathThreshold, onCurrentChange]);

  const handleTemporaryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onTemporaryChange(value);
    } else if (e.target.value === '') {
      onTemporaryChange(0);
    }
  }, [onTemporaryChange]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      onMaxChange?.(value);
    }
  }, [onMaxChange]);

  return (
    <div className={`stamina-box ${className}`}>
      {/* Top Row: Current + Adjusters | Temp/Max Stack */}
      <div className="stamina-top-row">
        {/* Current Stamina Cell */}
        <div className="stamina-cell current-cell">
          <input
            type="number"
            className="stamina-input current"
            value={current}
            onChange={handleCurrentChange}
            aria-label="Current stamina"
          />
          <div className="adjust-buttons">
            <button
              className="adjust-btn up"
              onClick={handleIncrement}
              disabled={current >= max + temporary}
              aria-label="Increase stamina"
              type="button"
            >▲</button>
            <button
              className="adjust-btn down"
              onClick={handleDecrement}
              disabled={current <= deathThreshold}
              aria-label="Decrease stamina"
              type="button"
            >▼</button>
          </div>
        </div>

        {/* Temp/Max Stacked Cell */}
        <div className="stamina-cell temp-max-cell">
          <div className="stat-row">
            <span className="cell-label">Temp</span>
            <input
              type="number"
              className="stamina-input compact"
              value={temporary}
              onChange={handleTemporaryChange}
              min={0}
              aria-label="Temporary stamina"
            />
          </div>
          <div className="stat-row">
            <span className="cell-label">Max</span>
            {onMaxChange ? (
              <input
                type="number"
                className="stamina-input compact"
                value={max}
                onChange={handleMaxChange}
                min={1}
                aria-label="Maximum stamina"
              />
            ) : (
              <span className="stamina-value">{max}</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Status Diamonds (Horizontal with Labels) */}
      <div className="stamina-status-row">
        <div className="status-indicator">
          <button
            className={`status-diamond winded ${winded || isAutoWinded ? 'active' : ''}`}
            onClick={() => onWindedChange(!winded)}
            aria-label={`Winded: ${winded || isAutoWinded ? 'active' : 'inactive'}`}
            title={`Winded at ${windedThreshold} HP or less`}
            type="button"
          />
          <span className="status-label">Winded</span>
        </div>

        <div className="status-indicator">
          <button
            className={`status-diamond dying ${dying || isAutoDying ? 'active' : ''}`}
            onClick={() => onDyingChange(!dying)}
            aria-label={`Dying: ${dying || isAutoDying ? 'active' : 'inactive'}`}
            title="Dying at 0 HP or less"
            type="button"
          />
          <span className="status-label">Dying</span>
        </div>

        <div className="status-indicator">
          <button
            className={`status-diamond dead ${dead || isAutoDead ? 'active' : ''}`}
            onClick={() => onDeadChange?.(!dead)}
            disabled={!onDeadChange}
            aria-label={`Dead: ${dead || isAutoDead ? 'active' : 'inactive'}`}
            title={`Dead at ${deathThreshold} HP or less`}
            type="button"
          />
          <span className="status-label">Dead</span>
        </div>
      </div>
    </div>
  );
};

export default StaminaTracker;
