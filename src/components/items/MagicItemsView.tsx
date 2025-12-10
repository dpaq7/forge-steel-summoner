import React, { useState } from 'react';
import { MagicItem, ItemCategory, CONSUMABLE_ITEMS, TRINKET_ITEMS, LEVELED_ITEMS, ARTIFACT_ITEMS, parseItemBonuses } from '../../data/magicItems';
import { useEquipment } from '../../hooks/useEquipment';
import { useSummonerContext } from '../../context/SummonerContext';
import './MagicItemsView.css';

type CategoryFilter = 'all' | ItemCategory;
type EchelonFilter = 'all' | 1 | 2 | 3 | 4;

const MagicItemsView: React.FC = () => {
  const { hero } = useSummonerContext();
  const { equipItem, unequipItem, isEquipped } = useEquipment();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [echelonFilter, setEchelonFilter] = useState<EchelonFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleEquipClick = (e: React.MouseEvent, item: MagicItem) => {
    e.stopPropagation();
    if (isEquipped(item.id)) {
      unequipItem(item.id);
    } else {
      equipItem(item);
    }
  };

  const getBonusPreview = (item: MagicItem): string => {
    if (!hero) return '';
    const bonuses = parseItemBonuses(item, hero.level);
    if (bonuses.length === 0) return '';
    return bonuses.map(b => `+${b.value} ${b.stat}`).join(', ');
  };

  const getFilteredItems = (): MagicItem[] => {
    let items: MagicItem[] = [];

    if (categoryFilter === 'all') {
      items = [...CONSUMABLE_ITEMS, ...TRINKET_ITEMS, ...LEVELED_ITEMS, ...ARTIFACT_ITEMS];
    } else if (categoryFilter === 'consumable') {
      items = CONSUMABLE_ITEMS;
    } else if (categoryFilter === 'trinket') {
      items = TRINKET_ITEMS;
    } else if (categoryFilter === 'leveled') {
      items = LEVELED_ITEMS;
    } else if (categoryFilter === 'artifact') {
      items = ARTIFACT_ITEMS;
    }

    if (echelonFilter !== 'all') {
      items = items.filter(item => item.echelon === echelonFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.effect.toLowerCase().includes(term)
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  const getCategoryLabel = (category: ItemCategory): string => {
    switch (category) {
      case 'consumable': return 'Consumable';
      case 'trinket': return 'Trinket';
      case 'leveled': return 'Leveled';
      case 'artifact': return 'Artifact';
    }
  };

  const getSlotLabel = (slot?: string): string => {
    if (!slot) return '';
    return slot.charAt(0).toUpperCase() + slot.slice(1);
  };

  return (
    <div className="magic-items-view">
      <div className="items-header">
        <h2>Magic Items Compendium</h2>
        <p className="items-subtitle">Browse supernatural treasures from Draw Steel</p>
      </div>

      {/* Filters */}
      <div className="items-filters">
        <div className="filter-group">
          <label>Category</label>
          <div className="filter-buttons">
            <button
              className={categoryFilter === 'all' ? 'active' : ''}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </button>
            <button
              className={categoryFilter === 'consumable' ? 'active' : ''}
              onClick={() => setCategoryFilter('consumable')}
            >
              Consumables
            </button>
            <button
              className={categoryFilter === 'trinket' ? 'active' : ''}
              onClick={() => setCategoryFilter('trinket')}
            >
              Trinkets
            </button>
            <button
              className={categoryFilter === 'leveled' ? 'active' : ''}
              onClick={() => setCategoryFilter('leveled')}
            >
              Leveled
            </button>
            <button
              className={categoryFilter === 'artifact' ? 'active' : ''}
              onClick={() => setCategoryFilter('artifact')}
            >
              Artifacts
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Echelon</label>
          <div className="filter-buttons">
            <button
              className={echelonFilter === 'all' ? 'active' : ''}
              onClick={() => setEchelonFilter('all')}
            >
              All
            </button>
            {[1, 2, 3, 4].map(e => (
              <button
                key={e}
                className={echelonFilter === e ? 'active' : ''}
                onClick={() => setEchelonFilter(e as EchelonFilter)}
              >
                {e === 1 ? '1st' : e === 2 ? '2nd' : e === 3 ? '3rd' : '4th'}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group search-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
      </div>

      {/* Items Grid */}
      <div className="items-grid">
        {filteredItems.map(item => {
          const equipped = isEquipped(item.id);
          const bonusPreview = getBonusPreview(item);
          const canEquip = item.slot !== undefined;

          return (
            <div
              key={item.id}
              className={`item-card ${item.category} ${expandedItem === item.id ? 'expanded' : ''} ${equipped ? 'equipped' : ''}`}
              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
            >
              <div className="item-header">
                <div className="item-badges">
                  <span className={`category-badge ${item.category}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="echelon-badge">
                    {item.echelon === 1 ? '1st' : item.echelon === 2 ? '2nd' : item.echelon === 3 ? '3rd' : '4th'} Echelon
                  </span>
                  {item.slot && (
                    <span className="slot-badge">{getSlotLabel(item.slot)}</span>
                  )}
                  {equipped && <span className="equipped-badge">Equipped</span>}
                </div>
                <h3>{item.name}</h3>
              </div>

              <div className="item-effect">
                {item.effect}
              </div>

              {/* Bonus Preview */}
              {bonusPreview && (
                <div className="item-bonuses">
                  <span className="bonus-label">Bonuses:</span>
                  <span className="bonus-values">{bonusPreview}</span>
                </div>
              )}

              {item.projectGoal && (
                <div className="item-craft">
                  <span className="craft-label">Craft Goal:</span>
                  <span className="craft-value">{item.projectGoal} PP</span>
                </div>
              )}

              {item.enhancements && expandedItem === item.id && (
                <div className="item-enhancements">
                  <h4>Enhancements</h4>
                  {item.enhancements.map((enh, idx) => (
                    <div key={idx} className="enhancement">
                      <span className="enh-level">Level {enh.level}</span>
                      <span className="enh-effect">{enh.effect}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Equip Button */}
              {canEquip && hero && (
                <button
                  className={`equip-btn ${equipped ? 'equipped' : ''}`}
                  onClick={(e) => handleEquipClick(e, item)}
                >
                  {equipped ? '✓ Unequip' : '+ Equip'}
                </button>
              )}

              {item.enhancements && (
                <div className="expand-hint">
                  {expandedItem === item.id ? 'Click to collapse' : 'Click for enhancements'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="no-results">
          <p>No items match your filters.</p>
          <button onClick={() => { setCategoryFilter('all'); setEchelonFilter('all'); setSearchTerm(''); }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MagicItemsView;
