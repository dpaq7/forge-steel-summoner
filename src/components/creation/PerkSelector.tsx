// Perk Selector - Level-up perk selection UI
// Allows players to select perks from allowed categories based on class

import React, { useState, useMemo } from 'react';
import { Perk, PerkCategory, SelectedPerk } from '../../types/perk';
import { HeroClass } from '../../types/hero';
import {
  PERK_CATEGORY_INFO,
  getAvailablePerkCategories,
  getAvailablePerks,
} from '../../data/perks';
import {
  Hammer,
  Compass,
  Users,
  Search,
  BookOpen,
  Sparkles,
  Check,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import './PerkSelector.css';

interface PerkSelectorProps {
  heroClass: HeroClass;
  level: number;
  /** IDs of perks already selected by this character */
  existingPerkIds: string[];
  /** Callback when a perk is selected */
  onSelect: (perk: SelectedPerk) => void;
  /** Optional: callback to go back */
  onBack?: () => void;
}

// Map category to Lucide icon
const categoryIcons: Record<PerkCategory, LucideIcon> = {
  crafting: Hammer,
  exploration: Compass,
  interpersonal: Users,
  intrigue: Search,
  lore: BookOpen,
  supernatural: Sparkles,
};

const PerkSelector: React.FC<PerkSelectorProps> = ({
  heroClass,
  level,
  existingPerkIds,
  onSelect,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PerkCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredPerkId, setHoveredPerkId] = useState<string | null>(null);

  // Get allowed categories for this class at this level
  const allowedCategories = useMemo(
    () => getAvailablePerkCategories(heroClass, level),
    [heroClass, level]
  );

  // Get available perks (not yet selected)
  const availablePerks = useMemo(
    () => getAvailablePerks(allowedCategories, existingPerkIds),
    [allowedCategories, existingPerkIds]
  );

  // Filter by selected category and search term
  const displayedPerks = useMemo(() => {
    let perks = availablePerks;

    if (selectedCategory) {
      perks = perks.filter(p => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      perks = perks.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    return perks;
  }, [availablePerks, selectedCategory, searchTerm]);

  // Count perks per category
  const categoryPerkCounts = useMemo(() => {
    const counts: Partial<Record<PerkCategory, number>> = {};
    allowedCategories.forEach(cat => {
      counts[cat] = availablePerks.filter(p => p.category === cat).length;
    });
    return counts;
  }, [availablePerks, allowedCategories]);

  const handleSelectPerk = (perk: Perk) => {
    onSelect({
      perkId: perk.id,
      selectedAtLevel: level,
      source: 'class',
    });
  };

  const isAnyCategory = allowedCategories.length === 6;

  return (
    <div className="perk-selector">
      {/* Header */}
      <div className="perk-selector__header">
        <div className="perk-selector__title-row">
          {onBack && (
            <button className="perk-selector__back-btn" onClick={onBack}>
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="perk-selector__title">Select a Perk</h2>
        </div>
        <p className="perk-selector__level">Level {level} Perk Choice</p>
        <div className={`perk-selector__restriction ${isAnyCategory ? 'perk-selector__restriction--any' : ''}`}>
          {isAnyCategory ? (
            <>You may choose from <strong>any</strong> perk category</>
          ) : (
            <>Your class allows: <strong>{allowedCategories.map(c => PERK_CATEGORY_INFO[c].name).join(', ')}</strong></>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="perk-selector__controls">
        <input
          type="text"
          className="perk-selector__search"
          placeholder="Search perks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="perk-selector__categories">
          <button
            className={`perk-selector__category-btn ${selectedCategory === null ? 'perk-selector__category-btn--active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All ({displayedPerks.length})
          </button>
          {allowedCategories.map(cat => {
            const count = categoryPerkCounts[cat] || 0;
            const info = PERK_CATEGORY_INFO[cat];
            const Icon = categoryIcons[cat];
            return (
              <button
                key={cat}
                className={`perk-selector__category-btn perk-selector__category-btn--${cat} ${
                  selectedCategory === cat ? 'perk-selector__category-btn--active' : ''
                }`}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                <Icon size={14} />
                {info.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Perks Grid */}
      <div className="perk-selector__grid">
        {displayedPerks.length === 0 ? (
          <div className="perk-selector__empty">
            {searchTerm ? 'No perks match your search.' : 'No perks available.'}
          </div>
        ) : (
          displayedPerks.map(perk => {
            const catInfo = PERK_CATEGORY_INFO[perk.category];
            const Icon = categoryIcons[perk.category];
            const isHovered = hoveredPerkId === perk.id;
            return (
              <button
                key={perk.id}
                type="button"
                className={`perk-selector__card perk-selector__card--${perk.category} ${isHovered ? 'perk-selector__card--hovered' : ''}`}
                onClick={() => handleSelectPerk(perk)}
                onMouseEnter={() => setHoveredPerkId(perk.id)}
                onMouseLeave={() => setHoveredPerkId(null)}
              >
                <div className="perk-selector__card-header">
                  <Icon size={16} className="perk-selector__card-icon" />
                  <h3 className="perk-selector__card-name">{perk.name}</h3>
                  <span className="perk-selector__card-badge">{catInfo.name}</span>
                </div>
                <p className="perk-selector__card-description">{perk.description}</p>
                {perk.prerequisite && (
                  <p className="perk-selector__card-prereq">
                    <strong>Requires:</strong> {perk.prerequisite}
                  </p>
                )}
                <div className="perk-selector__card-select">
                  <Check size={14} />
                  Select
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="perk-selector__footer">
        <p className="perk-selector__hint">Click a perk to select it</p>
      </div>
    </div>
  );
};

export default PerkSelector;
