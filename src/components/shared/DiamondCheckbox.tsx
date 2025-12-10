import React from 'react';
import './DiamondCheckbox.css';

interface DiamondCheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'essence' | 'danger' | 'warning' | 'success';
}

/**
 * Diamond-shaped checkbox matching the Draw Steel character sheet aesthetic.
 * Uses ◇ empty and ◆ filled states.
 */
const DiamondCheckbox: React.FC<DiamondCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  color = 'accent',
}) => {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onChange) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      className={`diamond-checkbox ${size} ${color} ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <span className="diamond-shape" aria-hidden="true" />
      {label && <span className="diamond-label">{label}</span>}
    </div>
  );
};

export default DiamondCheckbox;
