import { useRef, useState, useCallback, ChangeEvent } from 'react';
import { MinionTemplate, Formation } from '../../types';
import {
  calculateMinionBonusStamina,
  calculateMinionLevelStaminaBonus,
} from '../../utils/calculations';
import './SummonMinionCard.css';

// Summonability states for visual styling
export type SummonState =
  | 'available'      // Can summon: full color, interactive
  | 'insufficient'   // Not enough essence: dimmed but not greyed
  | 'at-capacity'    // Pool/squad full: dimmed, show capacity info
  | 'locked';        // Level requirement not met: greyscale

interface SummonMinionCardProps {
  minion: MinionTemplate;
  isSignature: boolean;
  isActive?: boolean;
  canSummon: boolean;
  reason: string;
  summonState: SummonState;
  totalMinions: number;
  totalCost: number;
  multiplier: number;
  maxSummonable: number;
  formation: Formation;
  heroLevel: number;
  currentEssence: number;
  imageUrl?: string | null;
  onSummon: () => void;
  onAdjustMultiplier: (delta: number) => void;
  onImageChange?: (imageUrl: string | null) => void;
  onToggleActive?: () => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const SummonMinionCard = ({
  minion,
  isSignature,
  isActive = true,
  canSummon,
  reason,
  summonState,
  totalMinions,
  totalCost,
  multiplier,
  maxSummonable,
  formation,
  heroLevel,
  currentEssence,
  imageUrl,
  onSummon,
  onAdjustMultiplier,
  onImageChange,
  onToggleActive,
}: SummonMinionCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageHover, setImageHover] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Calculate formation-adjusted stats
  const formationStaminaBonus = calculateMinionBonusStamina(formation);
  const levelStaminaBonus = calculateMinionLevelStaminaBonus(minion.essenceCost, heroLevel);
  const formationStabilityBonus = formation === 'elite' ? 1 : 0;

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

  // Get stamina display value with formation and level bonuses
  const getStaminaDisplay = () => {
    const baseStamina = Array.isArray(minion.stamina)
      ? minion.stamina[0]
      : minion.stamina;
    return baseStamina + formationStaminaBonus + levelStaminaBonus;
  };

  // Get stability display value with formation bonus
  const getStabilityDisplay = () => {
    return minion.stability + formationStabilityBonus;
  };

  // Calculate total bonus for display
  const totalStaminaBonus = formationStaminaBonus + levelStaminaBonus;

  // Format characteristics for display
  const getCharacteristicValue = (value: number) => {
    if (value >= 0) return `+${value}`;
    return value.toString();
  };

  // Determine the CSS state class based on summonState
  const getStateClass = () => {
    if (!isActive) return 'is-inactive';
    switch (summonState) {
      case 'available': return 'state-available';
      case 'insufficient': return 'state-insufficient';
      case 'at-capacity': return 'state-at-capacity';
      case 'locked': return 'state-locked';
      default: return '';
    }
  };

  return (
    <div className={`summon-minion-card ${isSignature ? 'is-signature' : ''} ${!isActive ? 'is-inactive' : ''} ${getStateClass()}`}>
      <div className="summon-card-border" />

      <div className="summon-card-content">
        {/* Header Section */}
        <div className="summon-header">
          {/* Portrait */}
          <div
            className={`summon-portrait ${imageUrl ? 'has-image' : ''} ${onImageChange ? 'editable' : ''}`}
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
                className="summon-portrait-input"
              />
            )}

            <div className="summon-portrait-border" />
            <div className="summon-portrait-inner">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={`${minion.name} portrait`}
                    className="summon-portrait-image"
                  />
                  {imageHover && onImageChange && (
                    <div className="summon-portrait-overlay">
                      <button
                        className="summon-portrait-remove"
                        onClick={handleImageRemove}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="summon-portrait-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="placeholder-icon">
                    <path d="M12 2C8 2 5 5 5 8c0 2 1 4 3 5-3 1-6 4-6 7h20c0-3-3-6-6-7 2-1 3-3 3-5 0-3-3-6-7-6z" />
                    <circle cx="12" cy="8" r="3" />
                  </svg>
                </div>
              )}
            </div>

            {imageError && (
              <div className="summon-portrait-error">{imageError}</div>
            )}
          </div>

          {/* Identity */}
          <div className="summon-identity">
            <h4 className="summon-name">{minion.name}</h4>
            <div className="summon-role-row">
              <span className={`summon-role role-${minion.role.toLowerCase()}`}>{minion.role}</span>
              {isSignature && <span className="signature-badge">Signature</span>}
              {isSignature && onToggleActive && (
                <button
                  className={`active-toggle ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive();
                  }}
                  title={isActive ? 'Click to deactivate minion' : 'Click to activate minion'}
                >
                  {isActive ? '✓' : '✗'}
                </button>
              )}
            </div>
          </div>

          {/* Cost/Count */}
          <div className="summon-cost-count">
            <div className="cost-item">
              <span className="cost-circle">{totalCost}</span>
              <span className="cost-label">Cost</span>
            </div>
            <div className="cost-item">
              <span className="cost-circle">{totalMinions}</span>
              <span className="cost-label">Count</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="summon-stats-row">
          <div className="summon-stat">
            <span className="stat-value">{minion.size}</span>
            <span className="stat-label">Size</span>
          </div>
          <div className="summon-stat">
            <span className="stat-value">{minion.speed}</span>
            <span className="stat-label">Speed</span>
          </div>
          <div className="summon-stat has-bonus">
            <span className="stat-value">
              {getStaminaDisplay()}
              {totalStaminaBonus > 0 && (
                <span className="stat-bonus">+{totalStaminaBonus}</span>
              )}
            </span>
            <span className="stat-label">Stamina</span>
          </div>
          <div className="summon-stat has-bonus">
            <span className="stat-value">
              {getStabilityDisplay()}
              {formationStabilityBonus > 0 && (
                <span className="stat-bonus">+{formationStabilityBonus}</span>
              )}
            </span>
            <span className="stat-label">Stability</span>
          </div>
          <div className="summon-stat wide">
            <span className="stat-value">{minion.freeStrike}</span>
            <span className="stat-label">Free Strike</span>
          </div>
        </div>

        {/* Detail Fields */}
        <div className="summon-details">
          {minion.immunities.length > 0 && (
            <div className="summon-detail-row">
              <span className="detail-label">Immunity</span>
              <span className="detail-value">{minion.immunities.join(', ')}</span>
            </div>
          )}
          {minion.weaknesses.length > 0 && (
            <div className="summon-detail-row">
              <span className="detail-label">Weakness</span>
              <span className="detail-value">{minion.weaknesses.join(', ')}</span>
            </div>
          )}
          {minion.movementModes.length > 0 && (
            <div className="summon-detail-row">
              <span className="detail-label">Movement</span>
              <span className="detail-value">{minion.movementModes.join(', ')}</span>
            </div>
          )}
          <div className="summon-detail-row">
            <span className="detail-label">Free Strike Type</span>
            <span className="detail-value damage-type">{minion.freeStrikeDamageType}</span>
          </div>
        </div>

        {/* Characteristics */}
        <div className="summon-characteristics">
          <div className={`char-item ${minion.characteristics.might !== 0 ? 'active' : ''}`}>
            <span className="char-circle">{getCharacteristicValue(minion.characteristics.might)}</span>
            <span className="char-name">Might</span>
          </div>
          <div className={`char-item ${minion.characteristics.agility !== 0 ? 'active' : ''}`}>
            <span className="char-circle">{getCharacteristicValue(minion.characteristics.agility)}</span>
            <span className="char-name">Agility</span>
          </div>
          <div className={`char-item ${minion.characteristics.reason !== 0 ? 'active' : ''}`}>
            <span className="char-circle">{getCharacteristicValue(minion.characteristics.reason)}</span>
            <span className="char-name">Reason</span>
          </div>
          <div className={`char-item ${minion.characteristics.intuition !== 0 ? 'active' : ''}`}>
            <span className="char-circle">{getCharacteristicValue(minion.characteristics.intuition)}</span>
            <span className="char-name">Intuition</span>
          </div>
          <div className={`char-item ${minion.characteristics.presence !== 0 ? 'active' : ''}`}>
            <span className="char-circle">{getCharacteristicValue(minion.characteristics.presence)}</span>
            <span className="char-name">Presence</span>
          </div>
        </div>

        {/* Keywords */}
        <div className="summon-keywords">
          {minion.keywords.map((kw, i) => (
            <span key={i} className="keyword-tag">{kw}</span>
          ))}
        </div>

        {/* Traits (collapsed summary) */}
        {minion.traits.length > 0 && (
          <div className="summon-traits">
            {minion.traits.map((trait, i) => (
              <div key={i} className="trait-item">
                <span className="trait-name">{trait.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Signature Ability */}
        {minion.signatureAbility && (
          <div className="summon-sig-ability">
            <span className="sig-name">{minion.signatureAbility.name}</span>
            <span className="sig-meta">{minion.signatureAbility.distance} · {minion.signatureAbility.target}</span>
          </div>
        )}

        {/* Summon Controls */}
        <div className="summon-controls">
          <button
            className={`qty-btn qty-minus ${multiplier <= 1 ? 'disabled' : ''}`}
            onClick={() => onAdjustMultiplier(-1)}
            disabled={multiplier <= 1}
            aria-label="Decrease summon count"
          >
            −
          </button>

          <div className="summon-count-display">
            <span className="count-value">{totalMinions}</span>
            {maxSummonable > 0 && summonState === 'available' && (
              <span className="count-max">/{maxSummonable}</span>
            )}
          </div>

          <button
            className={`qty-btn qty-plus ${totalMinions >= maxSummonable || summonState !== 'available' ? 'disabled' : ''}`}
            onClick={() => onAdjustMultiplier(1)}
            disabled={totalMinions >= maxSummonable || summonState !== 'available'}
            aria-label="Increase summon count"
          >
            +
          </button>

          <button
            className={`summon-btn ${canSummon ? '' : 'disabled'}`}
            onClick={onSummon}
            disabled={!canSummon}
            title={canSummon ? `Summon ${totalMinions}x ${minion.name}` : reason}
          >
            {canSummon ? (
              <>
                <span className="summon-action">Summon</span>
                <span className="summon-cost-text">{totalCost} Essence</span>
              </>
            ) : (
              <span className="summon-reason">{reason}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummonMinionCard;
