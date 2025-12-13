import React, { useState } from 'react';
import { MagicItem, CONSUMABLE_ITEMS } from '../../data/magicItems';

interface ConsumableInventoryItem {
  itemId: string;
  name: string;
  quantity: number;
}

interface ConsumablesGridProps {
  consumables: ConsumableInventoryItem[];
  onAddConsumable: (item: MagicItem, quantity: number) => void;
  onUseConsumable: (itemId: string) => void;
  onRemoveConsumable: (itemId: string) => void;
  onAdjustQuantity: (itemId: string, delta: number) => void;
  compact?: boolean;
}

const ConsumablesGrid: React.FC<ConsumablesGridProps> = ({
  consumables,
  onAddConsumable,
  onUseConsumable,
  onRemoveConsumable,
  onAdjustQuantity,
  compact = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConsumableInventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get consumable details from the data
  const getConsumableData = (itemId: string): MagicItem | undefined => {
    return CONSUMABLE_ITEMS.find((c) => c.id === itemId);
  };

  // Filter available consumables for the add modal
  const filteredConsumables = CONSUMABLE_ITEMS.filter((item) => {
    if (searchTerm) {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className={`consumables-section ${compact ? 'consumables-section--compact' : ''}`}>
      {!compact && (
        <div className="consumables-header">
          <h3>Consumables</h3>
          <button className="add-consumable-btn" onClick={() => setShowAddModal(true)}>
            + Add Item
          </button>
        </div>
      )}

      {consumables.length === 0 ? (
        <div className={`empty-consumables ${compact ? 'empty-consumables--compact' : ''}`}>
          {compact ? (
            <button className="add-consumable-btn-compact" onClick={() => setShowAddModal(true)}>
              + Add Consumable
            </button>
          ) : (
            <>
              <p>No consumables in inventory.</p>
              <p className="hint">Click "+ Add Item" to add consumables.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={`consumables-grid ${compact ? 'consumables-grid--compact' : ''}`}>
            {consumables.map((item) => {
              const data = getConsumableData(item.itemId);
              return (
                <div
                  key={item.itemId}
                  className={`consumable-slot ${compact ? 'consumable-slot--compact' : ''}`}
                  onClick={() => setSelectedItem(item)}
                  title={item.name}
                >
                  <div className="consumable-icon">
                    {data?.echelon === 1 && '🧪'}
                    {data?.echelon === 2 && '⚗️'}
                    {data?.echelon === 3 && '🔮'}
                    {data?.echelon === 4 && '✨'}
                  </div>
                  <div className="consumable-quantity">{item.quantity}</div>
                  <div className="consumable-name">{item.name}</div>
                </div>
              );
            })}
          </div>
          {compact && (
            <button className="add-consumable-btn-compact" onClick={() => setShowAddModal(true)}>
              + Add
            </button>
          )}
        </>
      )}

      {/* Add Consumable Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-consumable-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Consumable</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <input
              type="text"
              placeholder="Search consumables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <div className="consumables-list">
              {filteredConsumables.map((item) => (
                <div
                  key={item.id}
                  className="consumable-option"
                  onClick={() => {
                    onAddConsumable(item, 1);
                    setShowAddModal(false);
                  }}
                >
                  <span className="consumable-option-name">{item.name}</span>
                  <span className="consumable-option-echelon">E{item.echelon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Consumable Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="consumable-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.name}</h3>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            </div>

            <div className="consumable-detail-content">
              <p className="consumable-effect">
                {getConsumableData(selectedItem.itemId)?.effect}
              </p>

              <div className="quantity-controls">
                <span className="quantity-label">Quantity:</span>
                <button
                  className="qty-btn"
                  onClick={() => onAdjustQuantity(selectedItem.itemId, -1)}
                  disabled={selectedItem.quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-value">{selectedItem.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => onAdjustQuantity(selectedItem.itemId, 1)}
                >
                  +
                </button>
              </div>

              <div className="consumable-actions">
                <button
                  className="use-btn"
                  onClick={() => {
                    onUseConsumable(selectedItem.itemId);
                    if (selectedItem.quantity <= 1) {
                      setSelectedItem(null);
                    } else {
                      setSelectedItem({
                        ...selectedItem,
                        quantity: selectedItem.quantity - 1,
                      });
                    }
                  }}
                >
                  Use Item
                </button>
                <button
                  className="discard-btn"
                  onClick={() => {
                    onRemoveConsumable(selectedItem.itemId);
                    setSelectedItem(null);
                  }}
                >
                  Discard All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumablesGrid;
