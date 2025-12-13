import { useRef, useState, useCallback, ChangeEvent } from 'react';
import './SignatureMinionCard.css';

export interface SignatureMinion {
  id: string;
  role: string;
  isSignature: boolean;
  isActive: boolean; // Whether this minion is currently available for summoning
  imageUrl: string | null;
  cost: number;
  count: number;
  size: string;
  speed: number;
  stamina: number;
  stability: number;
  freeStrike: number;
  damageImmunity: string;
  damageWeakness: string;
  additionalMovement: string;
  freeStrikeDamageType: string;
  characteristics: {
    might: number | boolean;
    agility: number | boolean;
    reason: number | boolean;
    intuition: number | boolean;
    presence: number | boolean;
  };
  keywords: string;
}

interface SignatureMinionCardProps {
  minion: SignatureMinion;
  onMinionChange: (updates: Partial<SignatureMinion>) => void;
  onDelete?: () => void;
  isEditable?: boolean;
  className?: string;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB for minion images

export const SignatureMinionCard = ({
  minion,
  onMinionChange,
  onDelete,
  isEditable = true,
  className = '',
}: SignatureMinionCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageHover, setImageHover] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // ============ IMAGE HANDLING ============
  const handleImageClick = useCallback(() => {
    if (isEditable) {
      fileInputRef.current?.click();
    }
  }, [isEditable]);

  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      onMinionChange({ imageUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  }, [onMinionChange]);

  const handleImageRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMinionChange({ imageUrl: null });
    setImageError(null);
  }, [onMinionChange]);

  // ============ FIELD HANDLERS ============
  const handleFieldChange = useCallback((field: keyof SignatureMinion, value: string | number | boolean) => {
    onMinionChange({ [field]: value });
  }, [onMinionChange]);

  const handleCharacteristicToggle = useCallback((char: keyof SignatureMinion['characteristics']) => {
    const currentValue = minion.characteristics[char];
    const newValue = typeof currentValue === 'boolean' ? !currentValue : !currentValue;
    onMinionChange({
      characteristics: {
        ...minion.characteristics,
        [char]: newValue,
      },
    });
  }, [minion.characteristics, onMinionChange]);

  // Helper to determine if characteristic is "active" (truthy number or true boolean)
  const isCharacteristicActive = (value: number | boolean): boolean => {
    if (typeof value === 'boolean') return value;
    return value !== 0;
  };

  // ============ RENDER ============
  return (
    <div className={`signature-minion-card ${minion.isSignature ? 'is-signature' : ''} ${!minion.isActive ? 'is-inactive' : ''} ${className}`}>
      {/* Card Border Layer */}
      <div className="minion-card-border" />

      {/* Card Content Layer */}
      <div className="minion-card-content">

        {/* === HEADER SECTION === */}
        <div className="minion-header">

          {/* Portrait */}
          <div
            className={`minion-portrait ${minion.imageUrl ? 'has-image' : ''}`}
            onClick={handleImageClick}
            onMouseEnter={() => setImageHover(true)}
            onMouseLeave={() => setImageHover(false)}
            role="button"
            tabIndex={isEditable ? 0 : -1}
            aria-label={minion.imageUrl ? 'Change minion image' : 'Add minion image'}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleImageChange}
              className="minion-portrait-input"
            />

            <div className="minion-portrait-border" />
            <div className="minion-portrait-inner">
              {minion.imageUrl ? (
                <>
                  <img
                    src={minion.imageUrl}
                    alt={`${minion.role} portrait`}
                    className="minion-portrait-image"
                  />
                  {imageHover && isEditable && (
                    <div className="minion-portrait-overlay">
                      <button
                        className="minion-portrait-remove"
                        onClick={handleImageRemove}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="minion-portrait-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="placeholder-icon">
                    <path d="M12 2C8 2 5 5 5 8c0 2 1 4 3 5-3 1-6 4-6 7h20c0-3-3-6-6-7 2-1 3-3 3-5 0-3-3-6-7-6z" />
                    <circle cx="12" cy="8" r="3" />
                  </svg>
                  <span className="placeholder-text">Add Image</span>
                </div>
              )}
            </div>

            {imageError && (
              <div className="minion-portrait-error">{imageError}</div>
            )}
          </div>

          {/* Role and Signature */}
          <div className="minion-identity">
            <input
              type="text"
              className="minion-role-input"
              value={minion.role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              placeholder="Minion Role"
              disabled={!isEditable}
            />

            <div className="minion-toggle-row">
              <div className="minion-toggle-item">
                <button
                  className={`diamond-checkbox ${minion.isSignature ? 'checked' : ''}`}
                  onClick={() => handleFieldChange('isSignature', !minion.isSignature)}
                  disabled={!isEditable}
                  aria-label={`Signature: ${minion.isSignature ? 'yes' : 'no'}`}
                />
                <span className="toggle-label">Signature</span>
              </div>
              <div className="minion-toggle-item">
                <button
                  className={`active-toggle ${minion.isActive ? 'active' : ''}`}
                  onClick={() => handleFieldChange('isActive', !minion.isActive)}
                  aria-label={`Active: ${minion.isActive ? 'yes' : 'no'}`}
                  title={minion.isActive ? 'Click to deactivate minion' : 'Click to activate minion'}
                >
                  {minion.isActive ? '✓' : '✗'}
                </button>
                <span className="toggle-label">{minion.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Cost and Count */}
          <div className="minion-cost-count">
            <div className="cost-count-item">
              <div className="cost-count-circle">
                <input
                  type="number"
                  value={minion.cost}
                  onChange={(e) => handleFieldChange('cost', parseInt(e.target.value) || 0)}
                  disabled={!isEditable}
                  min={0}
                />
              </div>
              <span className="cost-count-label">Cost</span>
            </div>

            <div className="cost-count-item">
              <div className="cost-count-circle">
                <input
                  type="number"
                  value={minion.count}
                  onChange={(e) => handleFieldChange('count', parseInt(e.target.value) || 0)}
                  disabled={!isEditable}
                  min={0}
                />
              </div>
              <span className="cost-count-label">Count</span>
            </div>
          </div>
        </div>

        {/* === STATS ROW === */}
        <div className="minion-stats-row">
          <StatBox
            label="Size"
            value={minion.size}
            onChange={(v) => handleFieldChange('size', v)}
            editable={isEditable}
            isText
          />
          <StatBox
            label="Speed"
            value={minion.speed}
            onChange={(v) => handleFieldChange('speed', typeof v === 'string' ? parseInt(v) || 0 : v)}
            editable={isEditable}
          />
          <StatBox
            label="Stamina"
            value={minion.stamina}
            onChange={(v) => handleFieldChange('stamina', typeof v === 'string' ? parseInt(v) || 0 : v)}
            editable={isEditable}
          />
          <StatBox
            label="Stability"
            value={minion.stability}
            onChange={(v) => handleFieldChange('stability', typeof v === 'string' ? parseInt(v) || 0 : v)}
            editable={isEditable}
          />
          <StatBox
            label="Free Strike"
            value={minion.freeStrike}
            onChange={(v) => handleFieldChange('freeStrike', typeof v === 'string' ? parseInt(v) || 0 : v)}
            editable={isEditable}
            wide
          />
        </div>

        {/* === DETAIL FIELDS === */}
        <div className="minion-details">
          <DetailField
            label="Damage Immunity"
            value={minion.damageImmunity}
            onChange={(v) => handleFieldChange('damageImmunity', v)}
            editable={isEditable}
          />
          <DetailField
            label="Damage Weakness"
            value={minion.damageWeakness}
            onChange={(v) => handleFieldChange('damageWeakness', v)}
            editable={isEditable}
          />
          <DetailField
            label="Additional Movement Options"
            value={minion.additionalMovement}
            onChange={(v) => handleFieldChange('additionalMovement', v)}
            editable={isEditable}
          />
          <DetailField
            label="Free Strike Damage Type"
            value={minion.freeStrikeDamageType}
            onChange={(v) => handleFieldChange('freeStrikeDamageType', v)}
            editable={isEditable}
          />
        </div>

        {/* === CHARACTERISTICS === */}
        <div className="minion-characteristics">
          {(['might', 'agility', 'reason', 'intuition', 'presence'] as const).map((char) => (
            <button
              key={char}
              className={`characteristic-toggle ${isCharacteristicActive(minion.characteristics[char]) ? 'active' : ''}`}
              onClick={() => handleCharacteristicToggle(char)}
              disabled={!isEditable}
              aria-label={`${char}: ${isCharacteristicActive(minion.characteristics[char]) ? 'active' : 'inactive'}`}
            >
              <span className="characteristic-circle" />
              <span className="characteristic-name">{char}</span>
            </button>
          ))}
        </div>

        {/* === KEYWORDS === */}
        <div className="minion-keywords-section">
          <span className="keywords-label">Keywords</span>
          <input
            type="text"
            className="keywords-input"
            value={minion.keywords}
            onChange={(e) => handleFieldChange('keywords', e.target.value)}
            placeholder="e.g., Undead, Flying, Magic"
            disabled={!isEditable}
          />
        </div>

        {/* === DELETE BUTTON (if provided) === */}
        {onDelete && isEditable && (
          <button
            className="minion-delete-btn"
            onClick={onDelete}
            aria-label="Delete minion"
          >
            Delete Minion
          </button>
        )}
      </div>
    </div>
  );
};

// ============ SUB-COMPONENTS ============

interface StatBoxProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  editable: boolean;
  wide?: boolean;
  isText?: boolean;
}

const StatBox = ({ label, value, onChange, editable, wide, isText }: StatBoxProps) => (
  <div className={`minion-stat-box ${wide ? 'wide' : ''}`}>
    <span className="stat-label">{label}</span>
    <input
      type={isText ? 'text' : 'number'}
      className="stat-value"
      value={value}
      onChange={(e) => onChange(isText ? e.target.value : parseInt(e.target.value) || 0)}
      disabled={!editable}
      min={isText ? undefined : 0}
    />
  </div>
);

interface DetailFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
}

const DetailField = ({ label, value, onChange, editable }: DetailFieldProps) => (
  <div className="minion-detail-field">
    <span className="detail-label">{label}</span>
    <span className="detail-separator"></span>
    <input
      type="text"
      className="detail-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!editable}
    />
  </div>
);

export default SignatureMinionCard;
