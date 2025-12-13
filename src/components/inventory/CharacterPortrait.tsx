import React, { useState } from 'react';
import { PortraitSettings } from '../../types/portrait';

interface CharacterPortraitProps {
  settings: PortraitSettings;
  onEdit: () => void;
  className?: string;
}

const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  settings,
  onEdit,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine image source
  const getImageSrc = (): string | null => {
    if (settings.source === 'default' || !settings.imageData) {
      return null;
    }
    return settings.imageData;
  };

  const imageSrc = getImageSrc();
  const isDefault = !imageSrc || imageError;

  // CSS custom properties for dynamic styling
  const style = {
    '--portrait-opacity': settings.opacity,
    '--portrait-scale': settings.scale,
    '--portrait-position':
      settings.position === 'top' ? 'top' : settings.position === 'bottom' ? 'bottom' : 'center',
  } as React.CSSProperties;

  // Build class names
  const classNames = [
    'inventory-portrait',
    className,
    settings.grayscale ? 'inventory-portrait--grayscale' : '',
    settings.border !== 'none' ? `inventory-portrait--border-${settings.border}` : '',
    isDefault ? 'inventory-portrait--default' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isDefault ? (
        <img
          src={imageSrc!}
          alt="Character portrait"
          className="inventory-portrait__image"
          onError={() => setImageError(true)}
          draggable={false}
        />
      ) : (
        <div className="inventory-portrait__default">
          {/* Default silhouette SVG */}
          <svg viewBox="0 0 200 400" className="inventory-portrait__silhouette">
            {/* Head */}
            <ellipse cx="100" cy="45" rx="30" ry="35" />
            {/* Neck */}
            <rect x="90" y="75" width="20" height="20" />
            {/* Torso */}
            <path d="M60 95 L140 95 L150 200 L50 200 Z" />
            {/* Arms */}
            <path d="M60 95 L30 180 L45 185 L65 110" />
            <path d="M140 95 L170 180 L155 185 L135 110" />
            {/* Hands */}
            <ellipse cx="30" cy="195" rx="12" ry="15" />
            <ellipse cx="170" cy="195" rx="12" ry="15" />
            {/* Legs */}
            <path d="M65 200 L55 350 L75 350 L85 200" />
            <path d="M135 200 L145 350 L125 350 L115 200" />
            {/* Feet */}
            <ellipse cx="65" cy="365" rx="20" ry="12" />
            <ellipse cx="135" cy="365" rx="20" ry="12" />
          </svg>
        </div>
      )}

      {/* Edit overlay - show on hover or always visible for default */}
      <div
        className={`inventory-portrait__edit-overlay ${isHovered || isDefault ? 'visible' : ''}`}
        onClick={onEdit}
        title="Edit Portrait"
      >
        <div className="inventory-portrait__edit-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
          </svg>
          <span>{isDefault ? 'Set Portrait' : 'Edit Portrait'}</span>
        </div>
      </div>
    </div>
  );
};

export default CharacterPortrait;
