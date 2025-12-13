import React, { useState, useMemo } from 'react';
import { MagicItem, EquipmentSlot, ALL_MAGIC_ITEMS, getItemById } from '../../data/magicItems';
import { EquippedItem } from '../../types/equipment';
import { SlotConfig } from './slotConfig';
import { useCustomItems, CustomMagicItem } from '../../hooks/useCustomItems';

// Extended type that includes custom items
type SelectableMagicItem = MagicItem | CustomMagicItem;

interface ItemSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  slotConfig: SlotConfig;
  currentItem: EquippedItem | null;
  onSelectItem: (item: MagicItem) => void;
  onUnequip: () => void;
  equippedItemIds: string[]; // Items already equipped (to prevent duplicates)
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  isOpen,
  onClose,
  slotConfig,
  currentItem,
  onSelectItem,
  onUnequip,
  equippedItemIds,
}) => {
  const { customItems } = useCustomItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [echelonFilter, setEchelonFilter] = useState<number | 'all'>('all');

  // Combine standard items with custom items
  const allItems: SelectableMagicItem[] = useMemo(() => {
    return [...ALL_MAGIC_ITEMS, ...customItems];
  }, [customItems]);

  // Filter items that can be equipped in this slot
  const availableItems = useMemo(() => {
    return allItems.filter((item) => {
      // Must have a slot that matches one of the accepted slots
      if (!item.slot) return false;
      if (!slotConfig.acceptedSlots.includes(item.slot)) return false;

      // Don't show items already equipped elsewhere (except current item)
      if (equippedItemIds.includes(item.id) && item.id !== currentItem?.itemId) {
        return false;
      }

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!item.name.toLowerCase().includes(term) && !item.effect.toLowerCase().includes(term)) {
          return false;
        }
      }

      // Apply category filter
      if (categoryFilter === 'custom') {
        if (!('isCustom' in item)) return false;
      } else if (categoryFilter !== 'all') {
        if (item.category !== categoryFilter) return false;
      }

      // Apply echelon filter
      if (echelonFilter !== 'all' && item.echelon !== echelonFilter) {
        return false;
      }

      return true;
    });
  }, [allItems, slotConfig.acceptedSlots, equippedItemIds, currentItem?.itemId, searchTerm, categoryFilter, echelonFilter]);

  // Group items by category (including custom)
  const groupedItems = useMemo(() => {
    const groups: Record<string, SelectableMagicItem[]> = {
      custom: [],
      artifact: [],
      leveled: [],
      trinket: [],
      consumable: [],
    };

    availableItems.forEach((item) => {
      if ('isCustom' in item && item.isCustom) {
        groups.custom.push(item);
      } else if (groups[item.category]) {
        groups[item.category].push(item);
      }
    });

    return groups;
  }, [availableItems]);

  if (!isOpen) return null;

  const getCategoryColor = (category: string, isCustom?: boolean): string => {
    if (isCustom) return '#4de8b2'; // Custom items get accent color
    switch (category) {
      case 'artifact': return '#ce93d8';
      case 'leveled': return '#ffb74d';
      case 'trinket': return '#64b5f6';
      case 'consumable': return '#81c784';
      case 'custom': return '#4de8b2';
      default: return '#888';
    }
  };

  return (
    <div className="item-selector-overlay" onClick={onClose}>
      <div className="item-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="selector-header">
          <h3>
            <span className="slot-icon">{slotConfig.icon}</span>
            Select {slotConfig.label} Item
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Current Item */}
        {currentItem && (
          <div className="current-item-section">
            <div className="current-item-label">Currently Equipped:</div>
            <div className="current-item-card">
              <div className="current-item-info">
                <span className="current-item-name">{currentItem.name}</span>
                <span
                  className="current-item-category"
                  style={{ color: getCategoryColor(currentItem.category) }}
                >
                  {currentItem.category}
                </span>
              </div>
              <button className="unequip-btn" onClick={onUnequip}>
                Unequip
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="selector-filters">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="custom">Custom Items</option>
            <option value="trinket">Trinkets</option>
            <option value="leveled">Leveled</option>
            <option value="artifact">Artifacts</option>
          </select>
          <select
            value={echelonFilter}
            onChange={(e) => setEchelonFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="all">All Echelons</option>
            <option value="1">1st Echelon</option>
            <option value="2">2nd Echelon</option>
            <option value="3">3rd Echelon</option>
            <option value="4">4th Echelon</option>
          </select>
        </div>

        {/* Items List */}
        <div className="items-list">
          {availableItems.length === 0 ? (
            <div className="no-items">
              No items available for this slot.
              {searchTerm && <span> Try adjusting your search.</span>}
            </div>
          ) : (
            <>
              {/* Custom items first */}
              {groupedItems.custom.length > 0 && (
                <div className="item-group">
                  <div className="group-header" style={{ borderColor: getCategoryColor('custom') }}>
                    Custom Items
                  </div>
                  {groupedItems.custom.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isCurrentItem={item.id === currentItem?.itemId}
                      onSelect={() => onSelectItem(item as MagicItem)}
                      categoryColor={getCategoryColor(item.category, true)}
                      isCustom={true}
                    />
                  ))}
                </div>
              )}

              {/* Artifacts */}
              {groupedItems.artifact.length > 0 && (
                <div className="item-group">
                  <div className="group-header" style={{ borderColor: getCategoryColor('artifact') }}>
                    Artifacts
                  </div>
                  {groupedItems.artifact.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isCurrentItem={item.id === currentItem?.itemId}
                      onSelect={() => onSelectItem(item as MagicItem)}
                      categoryColor={getCategoryColor(item.category)}
                    />
                  ))}
                </div>
              )}

              {/* Leveled items */}
              {groupedItems.leveled.length > 0 && (
                <div className="item-group">
                  <div className="group-header" style={{ borderColor: getCategoryColor('leveled') }}>
                    Leveled Treasures
                  </div>
                  {groupedItems.leveled.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isCurrentItem={item.id === currentItem?.itemId}
                      onSelect={() => onSelectItem(item as MagicItem)}
                      categoryColor={getCategoryColor(item.category)}
                    />
                  ))}
                </div>
              )}

              {/* Trinkets */}
              {groupedItems.trinket.length > 0 && (
                <div className="item-group">
                  <div className="group-header" style={{ borderColor: getCategoryColor('trinket') }}>
                    Trinkets
                  </div>
                  {groupedItems.trinket.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isCurrentItem={item.id === currentItem?.itemId}
                      onSelect={() => onSelectItem(item as MagicItem)}
                      categoryColor={getCategoryColor(item.category)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual item card in the selector
interface ItemCardProps {
  item: SelectableMagicItem;
  isCurrentItem: boolean;
  onSelect: () => void;
  categoryColor: string;
  isCustom?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, isCurrentItem, onSelect, categoryColor, isCustom }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`item-card ${isCurrentItem ? 'current' : ''} ${isCustom ? 'custom' : ''}`}
      style={{ borderLeftColor: categoryColor }}
    >
      <div
        className="item-card-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="item-main-info">
          <span className="item-name">{item.name}</span>
          <span className="item-echelon">E{item.echelon}</span>
          {isCustom && <span className="item-custom-badge">Custom</span>}
        </div>
        <button
          className="equip-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          disabled={isCurrentItem}
        >
          {isCurrentItem ? 'Equipped' : 'Equip'}
        </button>
      </div>

      {expanded && (
        <div className="item-details">
          <p className="item-effect">{item.effect}</p>
          {item.enhancements && item.enhancements.length > 0 && (
            <div className="item-enhancements">
              <span className="enhancements-label">Enhancements:</span>
              {item.enhancements.map((enh, idx) => (
                <div key={idx} className="enhancement-tier">
                  <span className="tier-level">Lv {enh.level}:</span>
                  <span className="tier-effect">{enh.effect}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemSelector;
