import React from 'react';
import './StatBox.css';

interface StatBoxProps {
  value: string | number;
  label: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent' | 'danger' | 'warning' | 'essence';
  sublabel?: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}

/**
 * Stat box matching the Draw Steel character sheet style.
 * Displays a value in a bordered box with a label below.
 *
 * ┌─────┐
 * │  5  │
 * └─────┘
 *  MIGHT
 */
const StatBox: React.FC<StatBoxProps> = ({
  value,
  label,
  onClick,
  size = 'md',
  variant = 'default',
  sublabel,
  active = false,
  disabled = false,
  title,
}) => {
  const isClickable = !!onClick && !disabled;

  return (
    <div
      className={`stat-box-component ${size} ${variant} ${isClickable ? 'clickable' : ''} ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={isClickable ? onClick : undefined}
      title={title}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="stat-box-value">{value}</div>
      <div className="stat-box-label">{label}</div>
      {sublabel && <div className="stat-box-sublabel">{sublabel}</div>}
    </div>
  );
};

export default StatBox;
