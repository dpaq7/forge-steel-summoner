// Ancestry Trait Selector - Point-Buy UI for purchased traits
// Allows players to spend ancestry points on available traits

import React, { useState, useMemo } from 'react';
import { AncestryDefinition, AncestryPurchasedTrait } from '../../types/ancestry';
import {
  getAncestryById,
  calculateSpentPoints,
  calculateRemainingPoints,
  getQuickBuildTraitIds,
} from '../../data/ancestries';
import './AncestryTraitSelector.css';

interface AncestryTraitSelectorProps {
  ancestryId: string;
  selectedTraitIds: string[];
  onTraitsChange: (traitIds: string[]) => void;
}

const AncestryTraitSelector: React.FC<AncestryTraitSelectorProps> = ({
  ancestryId,
  selectedTraitIds,
  onTraitsChange,
}) => {
  const ancestry = getAncestryById(ancestryId);
  const [showQuickBuildFlash, setShowQuickBuildFlash] = useState(false);

  // Group traits by cost
  const traitsByCost = useMemo(() => {
    if (!ancestry) return { onePoint: [], twoPoint: [] };
    return {
      onePoint: ancestry.purchasedTraits.filter(t => t.cost === 1),
      twoPoint: ancestry.purchasedTraits.filter(t => t.cost === 2),
    };
  }, [ancestry]);

  // Get selected traits details
  const selectedTraits = useMemo(() => {
    if (!ancestry) return [];
    return selectedTraitIds
      .map(id => ancestry.purchasedTraits.find(t => t.id === id))
      .filter((t): t is AncestryPurchasedTrait => t !== undefined);
  }, [ancestry, selectedTraitIds]);

  if (!ancestry) {
    return (
      <div className="ancestry-traits ancestry-traits--error">
        <p>Ancestry not found. Please select an ancestry first.</p>
      </div>
    );
  }

  const spentPoints = calculateSpentPoints(ancestry, selectedTraitIds);
  const remainingPoints = calculateRemainingPoints(ancestry, selectedTraitIds);
  const progressPercent = (spentPoints / ancestry.ancestryPoints) * 100;

  const handleToggleTrait = (trait: AncestryPurchasedTrait) => {
    const isSelected = selectedTraitIds.includes(trait.id);

    if (isSelected) {
      // Remove trait
      onTraitsChange(selectedTraitIds.filter(id => id !== trait.id));
    } else {
      // Add trait if we have enough points
      if (trait.cost <= remainingPoints) {
        onTraitsChange([...selectedTraitIds, trait.id]);
      }
    }
  };

  const handleQuickBuild = () => {
    const quickBuildIds = getQuickBuildTraitIds(ancestry);
    onTraitsChange(quickBuildIds);
    // Flash effect
    setShowQuickBuildFlash(true);
    setTimeout(() => setShowQuickBuildFlash(false), 600);
  };

  const handleClearAll = () => {
    onTraitsChange([]);
  };

  // Check if current selection matches quick build
  const isQuickBuildActive = useMemo(() => {
    const quickBuildIds = getQuickBuildTraitIds(ancestry);
    if (quickBuildIds.length !== selectedTraitIds.length) return false;
    return quickBuildIds.every(id => selectedTraitIds.includes(id));
  }, [ancestry, selectedTraitIds]);

  const renderTraitButton = (trait: AncestryPurchasedTrait) => {
    const isSelected = selectedTraitIds.includes(trait.id);
    const canAfford = trait.cost <= remainingPoints;
    const isDisabled = !isSelected && !canAfford;
    const isQuickBuildTrait = ancestry.quickBuild.some(qb => {
      const baseName = qb.split('(')[0].trim().toLowerCase();
      return trait.name.toLowerCase().includes(baseName) ||
             baseName.includes(trait.name.toLowerCase());
    });

    return (
      <button
        key={trait.id}
        type="button"
        className={`ancestry-traits__trait ${
          isSelected ? 'ancestry-traits__trait--selected' : ''
        } ${isDisabled ? 'ancestry-traits__trait--disabled' : ''} ${
          isQuickBuildTrait ? 'ancestry-traits__trait--recommended' : ''
        }`}
        onClick={() => handleToggleTrait(trait)}
        disabled={isDisabled}
      >
        <div className="ancestry-traits__trait-header">
          <span className="ancestry-traits__trait-name">
            {trait.name}
            {isQuickBuildTrait && !isSelected && (
              <span className="ancestry-traits__trait-rec-badge">Recommended</span>
            )}
          </span>
          <span
            className={`ancestry-traits__trait-cost ancestry-traits__trait-cost--${trait.cost}`}
          >
            {trait.cost} pt{trait.cost > 1 ? 's' : ''}
          </span>
        </div>
        <p className="ancestry-traits__trait-description">
          {trait.description}
        </p>
        {isSelected && (
          <span className="ancestry-traits__trait-check">✓</span>
        )}
      </button>
    );
  };

  return (
    <div className={`ancestry-traits ${showQuickBuildFlash ? 'ancestry-traits--flash' : ''}`}>
      {/* Header with points tracker */}
      <div className="ancestry-traits__header">
        <h3 className="ancestry-traits__title">
          {ancestry.name} Traits
        </h3>
        <div className="ancestry-traits__points-container">
          <div className="ancestry-traits__points">
            <span className="ancestry-traits__points-spent">{spentPoints}</span>
            <span className="ancestry-traits__points-separator">/</span>
            <span className="ancestry-traits__points-total">{ancestry.ancestryPoints}</span>
            <span className="ancestry-traits__points-label">points</span>
          </div>
          {/* Progress bar */}
          <div className="ancestry-traits__progress">
            <div
              className={`ancestry-traits__progress-bar ${
                spentPoints === ancestry.ancestryPoints ? 'ancestry-traits__progress-bar--full' : ''
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="ancestry-traits__actions">
        <button
          type="button"
          className={`ancestry-traits__action-btn ${isQuickBuildActive ? 'ancestry-traits__action-btn--active' : ''}`}
          onClick={handleQuickBuild}
        >
          ⚡ Quick Build
        </button>
        <button
          type="button"
          className="ancestry-traits__action-btn ancestry-traits__action-btn--secondary"
          onClick={handleClearAll}
          disabled={selectedTraitIds.length === 0}
        >
          Clear All
        </button>
      </div>

      {/* Signature Trait (always included) */}
      <div className="ancestry-traits__signature">
        <div className="ancestry-traits__signature-header">
          <span className="ancestry-traits__signature-label">Signature Trait</span>
          <span className="ancestry-traits__signature-free">Free</span>
        </div>
        <div className="ancestry-traits__signature-content">
          <strong>{ancestry.signatureTrait.name}</strong>
          <p>{ancestry.signatureTrait.description}</p>
        </div>
      </div>

      {/* Purchasable Traits */}
      {ancestry.purchasedTraits.length > 0 ? (
        <div className="ancestry-traits__list">
          {/* 1-Point Traits */}
          {traitsByCost.onePoint.length > 0 && (
            <div className="ancestry-traits__cost-group">
              <h4 className="ancestry-traits__list-title ancestry-traits__list-title--1pt">
                <span className="ancestry-traits__cost-icon">◆</span>
                1-Point Traits
                <span className="ancestry-traits__count">
                  {traitsByCost.onePoint.filter(t => selectedTraitIds.includes(t.id)).length}/{traitsByCost.onePoint.length}
                </span>
              </h4>
              <div className="ancestry-traits__trait-grid">
                {traitsByCost.onePoint.map(renderTraitButton)}
              </div>
            </div>
          )}

          {/* 2-Point Traits */}
          {traitsByCost.twoPoint.length > 0 && (
            <div className="ancestry-traits__cost-group">
              <h4 className="ancestry-traits__list-title ancestry-traits__list-title--2pt">
                <span className="ancestry-traits__cost-icon">◆◆</span>
                2-Point Traits
                <span className="ancestry-traits__count">
                  {traitsByCost.twoPoint.filter(t => selectedTraitIds.includes(t.id)).length}/{traitsByCost.twoPoint.length}
                </span>
              </h4>
              <div className="ancestry-traits__trait-grid">
                {traitsByCost.twoPoint.map(renderTraitButton)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="ancestry-traits__empty">
          <p>Trait data for this ancestry is coming soon.</p>
        </div>
      )}

      {/* Selected Traits Summary */}
      {selectedTraits.length > 0 && (
        <div className="ancestry-traits__summary">
          <h4 className="ancestry-traits__summary-title">Selected Traits</h4>
          <div className="ancestry-traits__summary-list">
            {selectedTraits.map(trait => (
              <div key={trait.id} className="ancestry-traits__summary-item">
                <span className="ancestry-traits__summary-name">{trait.name}</span>
                <span className="ancestry-traits__summary-cost">{trait.cost}pt</span>
                <button
                  type="button"
                  className="ancestry-traits__summary-remove"
                  onClick={() => handleToggleTrait(trait)}
                  aria-label={`Remove ${trait.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {remainingPoints > 0 && (
            <p className="ancestry-traits__summary-remaining">
              {remainingPoints} point{remainingPoints !== 1 ? 's' : ''} unspent
            </p>
          )}
        </div>
      )}

      {/* Quick Build suggestion */}
      {ancestry.quickBuild.length > 0 && selectedTraitIds.length === 0 && (
        <div className="ancestry-traits__quickbuild-hint">
          <strong>Tip:</strong> Use Quick Build for recommended selections: {ancestry.quickBuild.join(', ')}
        </div>
      )}

      {/* Ancestry points note (for Revenant etc.) */}
      {ancestry.ancestryPointsNote && (
        <div className="ancestry-traits__note">
          <em>Note: {ancestry.ancestryPointsNote}</em>
        </div>
      )}
    </div>
  );
};

export default AncestryTraitSelector;
