import React from 'react';
import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  showArrow?: boolean;
  variant?: 'default' | 'compact' | 'subtle';
  className?: string;
}

/**
 * Decorative section header matching the Draw Steel character sheet style.
 * Features centered text with decorative line dividers and optional arrow.
 *
 * Example: ─────────── SECTION NAME ───────────
 *                         ▼
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showArrow = false,
  variant = 'default',
  className = '',
}) => {
  return (
    <div className={`section-header-component ${variant} ${className}`}>
      <div className="section-header-line">
        <span className="section-header-text">{title}</span>
      </div>
      {showArrow && (
        <div className="section-header-arrow">▼</div>
      )}
    </div>
  );
};

export default SectionHeader;
