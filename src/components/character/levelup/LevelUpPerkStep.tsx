/**
 * LevelUpPerkStep - Perk selection step in the level-up wizard
 */
import React, { useState, useMemo } from 'react';
import { Hero } from '../../../types/hero';
import { PerkCategory } from '../../../types/perk';
import { PERK_CATEGORY_INFO, getAvailablePerks, PERKS } from '../../../data/perks';
import {
  Hammer,
  Compass,
  Users,
  Search,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn';
import './LevelUpSteps.css';

interface LevelUpPerkStepProps {
  hero: Hero;
  targetLevel: number;
  allowedCategories: PerkCategory[];
  existingPerkIds: string[];
  selectedPerkId?: string;
  onSelect: (perkId: string, perkName: string, description: string) => void;
  onBack: () => void;
  onContinue: () => void;
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

const LevelUpPerkStep: React.FC<LevelUpPerkStepProps> = ({
  hero,
  targetLevel,
  allowedCategories,
  existingPerkIds,
  selectedPerkId,
  onSelect,
  onBack,
  onContinue,
}) => {
  const [activeCategory, setActiveCategory] = useState<PerkCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get available perks (not yet selected)
  const availablePerks = useMemo(
    () => getAvailablePerks(allowedCategories, existingPerkIds),
    [allowedCategories, existingPerkIds]
  );

  // Filter by active category and search term
  const displayedPerks = useMemo(() => {
    let perks = availablePerks;

    if (activeCategory !== 'all') {
      perks = perks.filter((p) => p.category === activeCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      perks = perks.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    return perks;
  }, [availablePerks, activeCategory, searchTerm]);

  // Count perks per category
  const categoryPerkCounts = useMemo(() => {
    const counts: Partial<Record<PerkCategory, number>> = {};
    allowedCategories.forEach((cat) => {
      counts[cat] = availablePerks.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [availablePerks, allowedCategories]);

  const isAnyCategory = allowedCategories.length === 6;

  return (
    <div className="levelup-step perk-step">
      <h2 className="step-title">Choose a Perk</h2>
      <p className="step-description">
        {isAnyCategory
          ? 'You may choose from any perk category.'
          : `Available: ${allowedCategories.map((c) => PERK_CATEGORY_INFO[c].name).join(', ')}`}
      </p>

      {/* Search */}
      <div className="perk-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search perks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="perk-search-input"
        />
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All ({availablePerks.length})
        </button>
        {allowedCategories.map((cat) => {
          const count = categoryPerkCounts[cat] || 0;
          const info = PERK_CATEGORY_INFO[cat];
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <Icon size={14} className="tab-icon" />
              {info.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Perks grid */}
      <div className="options-grid perks-grid">
        {displayedPerks.map((perk) => {
          const catInfo = PERK_CATEGORY_INFO[perk.category];
          const Icon = categoryIcons[perk.category];
          const isSelected = selectedPerkId === perk.id;

          return (
            <div
              key={perk.id}
              className={`option-card perk-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(perk.id, perk.name, perk.description)}
              style={
                {
                  '--perk-color': `var(${catInfo.colorVar})`,
                } as React.CSSProperties
              }
            >
              <div className="perk-header">
                <Icon size={18} className="perk-icon" />
                <h4 className="option-name">{perk.name}</h4>
                {isSelected && <Check size={18} className="selected-check" />}
              </div>
              <p className="option-description">{perk.description}</p>
              <span className="perk-category-badge">{catInfo.name}</span>
            </div>
          );
        })}

        {displayedPerks.length === 0 && (
          <div className="no-perks-message">
            No perks found matching your search.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="step-actions">
        <Button variant="chamfered" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          variant="success"
          onClick={onContinue}
          disabled={!selectedPerkId}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LevelUpPerkStep;
