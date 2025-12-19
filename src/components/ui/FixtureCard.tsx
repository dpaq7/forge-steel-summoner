import React, { useRef, useState, useCallback, ChangeEvent } from 'react';
import { FixtureTemplate } from '../../types';
import './FixtureCard.css';

interface FixtureCardProps {
  fixture: FixtureTemplate;
  heroLevel: number;
  isActive?: boolean;
  currentStamina?: number;
  onSummon?: () => void;
  onDismiss?: () => void;
  canSummon?: boolean;
  reason?: string;
  imageUrl?: string | null;
  onImageChange?: (imageUrl: string | null) => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const FixtureCard: React.FC<FixtureCardProps> = ({
  fixture,
  heroLevel,
  isActive = false,
  currentStamina,
  onSummon,
  onDismiss,
  canSummon = true,
  reason = '',
  imageUrl,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageHover, setImageHover] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const maxStamina = fixture.baseStamina + heroLevel;
  const currentSize = heroLevel >= 9 ? 3 : fixture.size;
  const hasLevel5Feature = heroLevel >= 5;
  const hasLevel9Feature = heroLevel >= 9;

  const handleImageClick = useCallback(() => {
    if (onImageChange) {
      fileInputRef.current?.click();
    }
  }, [onImageChange]);

  const handleImageChangeEvent = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageChange) return;

    setImageError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Use JPG, PNG, WebP, or GIF');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onImageChange(event.target?.result as string);
    };
    reader.onerror = () => {
      setImageError('Failed to read image');
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  }, [onImageChange]);

  const handleImageRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageChange) {
      onImageChange(null);
    }
    setImageError(null);
  }, [onImageChange]);

  return (
    <div className={`fixture-card ${isActive ? 'is-active' : ''}`}>
      {/* Border frame */}
      <div className="fixture-card-border" />

      {/* Card content */}
      <div className="fixture-card-content">
        {/* Header */}
        <div className="fixture-header">
          {/* Portrait */}
          <div
            className={`fixture-portrait ${imageUrl ? 'has-image' : ''} ${onImageChange ? 'editable' : ''}`}
            onClick={handleImageClick}
            onMouseEnter={() => setImageHover(true)}
            onMouseLeave={() => setImageHover(false)}
            role={onImageChange ? 'button' : undefined}
            tabIndex={onImageChange ? 0 : -1}
          >
            {onImageChange && (
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handleImageChangeEvent}
                className="fixture-portrait-input"
              />
            )}

            <div className="fixture-portrait-border" />
            <div className="fixture-portrait-inner">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={`${fixture.name} portrait`}
                    className="fixture-portrait-image"
                  />
                  {imageHover && onImageChange && (
                    <div className="fixture-portrait-overlay">
                      <button
                        className="fixture-portrait-remove"
                        onClick={handleImageRemove}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="fixture-portrait-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="placeholder-icon">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01" />
                  </svg>
                </div>
              )}
            </div>

            {imageError && (
              <div className="fixture-portrait-error">{imageError}</div>
            )}
          </div>

          {/* Identity */}
          <div className="fixture-identity">
            <h3 className="fixture-name">{fixture.name}</h3>
            <div className="fixture-role-row">
              <span className="fixture-type-tag">Fixture</span>
            </div>
          </div>

          {/* Stats */}
          <div className="fixture-stats-compact">
            <div className="fixture-stat">
              <span className="stat-value">{currentSize}</span>
              <span className="stat-label">Size</span>
            </div>
            <div className="fixture-stat">
              <span className="stat-value">{maxStamina}</span>
              <span className="stat-label">Stam</span>
            </div>
          </div>
        </div>

        {/* Active stamina display */}
        {isActive && currentStamina !== undefined && (
          <div className="fixture-stamina-bar">
            <div className="stamina-bar-track">
              <div
                className="stamina-bar-fill"
                style={{ width: `${(currentStamina / maxStamina) * 100}%` }}
              />
            </div>
            <span className="stamina-text">{currentStamina}/{maxStamina}</span>
          </div>
        )}

        {/* Base Traits */}
        <div className="fixture-traits">
          <div className="traits-header">Base Effects</div>
          {fixture.traits.map((trait, index) => (
            <div key={index} className="fixture-trait">
              <span className="trait-name">{trait.name}:</span>
              <span className="trait-desc">{trait.description}</span>
            </div>
          ))}
        </div>

        {/* Level 5 Feature */}
        <div className={`fixture-feature ${hasLevel5Feature ? 'unlocked' : 'locked'}`}>
          <div className="feature-header">
            <span className="feature-level">Lv 5</span>
            <span className="feature-name">{fixture.level5Feature.name}</span>
            {!hasLevel5Feature && <span className="lock-icon">🔒</span>}
          </div>
          <p className="feature-desc">{fixture.level5Feature.description}</p>
        </div>

        {/* Level 9 Features (Size Increase + unique ability) */}
        {fixture.level9Features.map((feature, index) => (
          <div key={feature.id || index} className={`fixture-feature ${hasLevel9Feature ? 'unlocked' : 'locked'}`}>
            <div className="feature-header">
              <span className="feature-level">Lv 9</span>
              <span className="feature-name">{feature.name}</span>
              {!hasLevel9Feature && <span className="lock-icon">🔒</span>}
            </div>
            <p className="feature-desc">{feature.description}</p>
          </div>
        ))}

        {/* Summon info */}
        <div className="fixture-info">
          <p className="fixture-rules">
            <strong>Summon:</strong> Maneuver (0 Essence) · Once per encounter · Within Summoner's Range
          </p>
          <p className="fixture-rules">
            <strong>Relocate:</strong> Free Maneuver (1 Essence) · Move up to 5 squares
          </p>
          <p className="fixture-rules">
            <strong>Duration:</strong> Until end of encounter, 0 Stamina, or summoner becomes dying
          </p>
        </div>

        {/* Controls */}
        <div className="fixture-controls">
          {!isActive ? (
            <button
              className={`summon-fixture-btn ${!canSummon ? 'disabled' : ''}`}
              onClick={onSummon}
              disabled={!canSummon}
            >
              <span className="summon-action">Summon Fixture</span>
              {reason && <span className="summon-reason">{reason}</span>}
            </button>
          ) : (
            <button className="dismiss-fixture-btn" onClick={onDismiss}>
              Dismiss Fixture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
