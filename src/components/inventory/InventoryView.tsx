import React, { useState, useMemo, useCallback } from 'react';
import { useEquipment } from '../../hooks/useEquipment';
import { usePortrait } from '../../hooks/usePortrait';
import { useCustomItems, CustomMagicItem } from '../../hooks/useCustomItems';
import { useSummonerContext } from '../../context/SummonerContext';
import { MagicItem, EquipmentSlot } from '../../data/magicItems';
import { EquippedItem } from '../../types/equipment';
import { VisualSlot, SLOT_CONFIG } from './slotConfig';
import EquipmentLayout from './EquipmentLayout';
import ItemSelector from './ItemSelector';
import ConsumablesGrid from './ConsumablesGrid';
import ArtifactDisplay from './ArtifactDisplay';
import PortraitUploader from './PortraitUploader';
import CustomItemForm from './CustomItemForm';
import './InventoryView.css';

interface ConsumableInventoryItem {
  itemId: string;
  name: string;
  quantity: number;
}

const InventoryView: React.FC = () => {
  const { hero, updateHero } = useSummonerContext();
  const { equippedItems, equipItem, unequipItem, totalBonuses } = useEquipment();
  const {
    portrait,
    setPortrait,
    uploadPortrait,
    setPortraitUrl,
    isLoading: portraitLoading,
    error: portraitError,
  } = usePortrait();
  const {
    customItems,
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,
  } = useCustomItems();

  // State for slot selection modal
  const [selectedSlot, setSelectedSlot] = useState<VisualSlot | null>(null);
  const [showBonusDetails, setShowBonusDetails] = useState(false);
  const [showPortraitUploader, setShowPortraitUploader] = useState(false);
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [editingCustomItem, setEditingCustomItem] = useState<CustomMagicItem | undefined>(undefined);

  // Track which rings are in which visual slot
  const [ringAssignments, setRingAssignments] = useState<{
    ring1?: string;
    ring2?: string;
  }>({});

  // Consumables state (stored in hero data)
  const consumables: ConsumableInventoryItem[] = useMemo(() => {
    // Parse from hero inventory or return empty
    return hero?.inventory
      ?.filter((item) => item.category === 'consumable')
      .map((item) => ({
        itemId: item.id,
        name: item.name,
        quantity: item.quantity,
      })) || [];
  }, [hero?.inventory]);

  // Get artifacts from equipped items
  const artifacts = useMemo(() => {
    return equippedItems.filter((item) => item.category === 'artifact');
  }, [equippedItems]);

  // Get non-artifact equipped items
  const regularEquippedItems = useMemo(() => {
    return equippedItems.filter((item) => item.category !== 'artifact');
  }, [equippedItems]);

  // Get equipped item IDs for duplicate prevention
  const equippedItemIds = useMemo(() => {
    return equippedItems.map((item) => item.itemId);
  }, [equippedItems]);

  // Handle slot click
  const handleSlotClick = useCallback((visualSlot: VisualSlot) => {
    setSelectedSlot(visualSlot);
  }, []);

  // Get current item for the selected slot
  const getCurrentItemForSlot = useCallback(
    (visualSlot: VisualSlot): EquippedItem | null => {
      const config = SLOT_CONFIG[visualSlot];

      // Handle ring slots specially
      if (visualSlot === 'ring1' && ringAssignments.ring1) {
        return equippedItems.find((item) => item.itemId === ringAssignments.ring1) || null;
      }
      if (visualSlot === 'ring2' && ringAssignments.ring2) {
        return equippedItems.find((item) => item.itemId === ringAssignments.ring2) || null;
      }

      // For other slots
      return equippedItems.find((item) => config.acceptedSlots.includes(item.slot)) || null;
    },
    [equippedItems, ringAssignments]
  );

  // Handle item selection from modal
  const handleSelectItem = useCallback(
    (item: MagicItem) => {
      if (!selectedSlot) return;

      // Handle ring assignment
      if (selectedSlot === 'ring1' || selectedSlot === 'ring2') {
        // First equip the item
        equipItem(item);
        // Then track which visual slot it's in
        setRingAssignments((prev) => ({
          ...prev,
          [selectedSlot]: item.id,
        }));
      } else {
        equipItem(item);
      }

      setSelectedSlot(null);
    },
    [selectedSlot, equipItem]
  );

  // Handle unequip from modal
  const handleUnequipFromModal = useCallback(() => {
    if (!selectedSlot) return;

    const currentItem = getCurrentItemForSlot(selectedSlot);
    if (currentItem) {
      unequipItem(currentItem.itemId);

      // Clear ring assignment if applicable
      if (selectedSlot === 'ring1' || selectedSlot === 'ring2') {
        setRingAssignments((prev) => ({
          ...prev,
          [selectedSlot]: undefined,
        }));
      }
    }

    setSelectedSlot(null);
  }, [selectedSlot, getCurrentItemForSlot, unequipItem]);

  // Consumable handlers
  const handleAddConsumable = useCallback(
    (item: MagicItem, quantity: number) => {
      if (!hero) return;

      const existingInventory = hero.inventory || [];
      const existingItem = existingInventory.find((i) => i.id === item.id);

      if (existingItem) {
        // Increase quantity
        const updated = existingInventory.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
        updateHero({ inventory: updated });
      } else {
        // Add new item
        const newItem = {
          id: item.id,
          name: item.name,
          category: 'consumable' as const,
          rarity: 'uncommon' as const,
          quantity,
          description: item.effect,
        };
        updateHero({ inventory: [...existingInventory, newItem] });
      }
    },
    [hero, updateHero]
  );

  const handleUseConsumable = useCallback(
    (itemId: string) => {
      if (!hero?.inventory) return;

      const updated = hero.inventory
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);

      updateHero({ inventory: updated });
    },
    [hero, updateHero]
  );

  const handleRemoveConsumable = useCallback(
    (itemId: string) => {
      if (!hero?.inventory) return;

      const updated = hero.inventory.filter((item) => item.id !== itemId);
      updateHero({ inventory: updated });
    },
    [hero, updateHero]
  );

  const handleAdjustQuantity = useCallback(
    (itemId: string, delta: number) => {
      if (!hero?.inventory) return;

      const updated = hero.inventory
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);

      updateHero({ inventory: updated });
    },
    [hero, updateHero]
  );

  if (!hero) return null;

  // Check if any bonuses are active
  const hasAnyBonuses = Object.values(totalBonuses).some((v) => v > 0);

  return (
    <div className="inventory-view rpg-layout">
      <div className="inventory-header">
        <h2>Equipment & Inventory</h2>
        <p className="inventory-subtitle">
          Click on equipment slots to equip or manage items
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="inventory-main-layout">
        {/* Left Panel - Bonuses, Consumables, Custom Items */}
        <div className="inventory-left-panel">
          {/* Active Bonuses Summary */}
          <div className="left-panel-section bonuses-section">
            <div className="section-header">
              <h3>Active Bonuses</h3>
            </div>
            {hasAnyBonuses ? (
              <div className="bonuses-list">
                {totalBonuses.stamina > 0 && (
                  <div className="bonus-item">
                    <span className="bonus-icon">❤️</span>
                    <span className="bonus-label">Stamina</span>
                    <span className="bonus-value">+{totalBonuses.stamina}</span>
                  </div>
                )}
                {totalBonuses.stability > 0 && (
                  <div className="bonus-item">
                    <span className="bonus-icon">🛡️</span>
                    <span className="bonus-label">Stability</span>
                    <span className="bonus-value">+{totalBonuses.stability}</span>
                  </div>
                )}
                {totalBonuses.speed > 0 && (
                  <div className="bonus-item">
                    <span className="bonus-icon">⚡</span>
                    <span className="bonus-label">Speed</span>
                    <span className="bonus-value">+{totalBonuses.speed}</span>
                  </div>
                )}
                {totalBonuses.damage > 0 && (
                  <div className="bonus-item damage">
                    <span className="bonus-icon">⚔️</span>
                    <span className="bonus-label">Damage</span>
                    <span className="bonus-value">+{totalBonuses.damage}</span>
                  </div>
                )}
                {totalBonuses.savingThrow > 0 && (
                  <div className="bonus-item">
                    <span className="bonus-icon">🎲</span>
                    <span className="bonus-label">Saving Throws</span>
                    <span className="bonus-value">+{totalBonuses.savingThrow}</span>
                  </div>
                )}
                {totalBonuses.rangeDistance > 0 && (
                  <div className="bonus-item">
                    <span className="bonus-icon">🎯</span>
                    <span className="bonus-label">Range</span>
                    <span className="bonus-value">+{totalBonuses.rangeDistance}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-section-hint">No bonuses active</div>
            )}
          </div>

          {/* Consumables Section */}
          <div className="left-panel-section consumables-panel">
            <div className="section-header">
              <h3>Consumables</h3>
            </div>
            <ConsumablesGrid
              consumables={consumables}
              onAddConsumable={handleAddConsumable}
              onUseConsumable={handleUseConsumable}
              onRemoveConsumable={handleRemoveConsumable}
              onAdjustQuantity={handleAdjustQuantity}
              compact={true}
            />
          </div>

          {/* Custom Items Section */}
          <div className="left-panel-section custom-items-panel">
            <div className="section-header">
              <h3>Custom Items</h3>
              <button
                className="create-custom-item-btn-small"
                onClick={() => {
                  setEditingCustomItem(undefined);
                  setShowCustomItemForm(true);
                }}
              >
                +
              </button>
            </div>

            {customItems.length === 0 ? (
              <div className="empty-section-hint">
                No custom items yet
              </div>
            ) : (
              <div className="custom-items-list-compact">
                {customItems.map((item) => (
                  <div key={item.id} className="custom-item-compact">
                    <div className="custom-item-compact__info">
                      <span className="custom-item-compact__name">{item.name}</span>
                      <span className="custom-item-compact__meta">
                        {item.category} • E{item.echelon}
                      </span>
                    </div>
                    <div className="custom-item-compact__actions">
                      <button
                        className="edit-btn-small"
                        onClick={() => {
                          setEditingCustomItem(item);
                          setShowCustomItemForm(true);
                        }}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="delete-btn-small"
                        onClick={() => {
                          if (confirm(`Delete "${item.name}"?`)) {
                            deleteCustomItem(item.id);
                          }
                        }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Equipment Layout with Portrait */}
        <div className="inventory-right-panel">
          <div className="equipment-section">
            <EquipmentLayout
              equippedItems={regularEquippedItems}
              onSlotClick={handleSlotClick}
              ring1ItemId={ringAssignments.ring1}
              ring2ItemId={ringAssignments.ring2}
              portraitSettings={portrait}
              onEditPortrait={() => setShowPortraitUploader(true)}
            />
          </div>

          {/* Artifacts Section */}
          <ArtifactDisplay artifacts={artifacts} onUnequip={unequipItem} />
        </div>
      </div>

      {/* Item Selector Modal */}
      {selectedSlot && (
        <ItemSelector
          isOpen={true}
          onClose={() => setSelectedSlot(null)}
          slotConfig={SLOT_CONFIG[selectedSlot]}
          currentItem={getCurrentItemForSlot(selectedSlot)}
          onSelectItem={handleSelectItem}
          onUnequip={handleUnequipFromModal}
          equippedItemIds={equippedItemIds}
        />
      )}

      {/* Portrait Uploader Modal */}
      <PortraitUploader
        isOpen={showPortraitUploader}
        onClose={() => setShowPortraitUploader(false)}
        currentSettings={portrait}
        onApply={setPortrait}
        onUpload={uploadPortrait}
        onSetUrl={setPortraitUrl}
        isLoading={portraitLoading}
        error={portraitError}
      />

      {/* Custom Item Form Modal */}
      <CustomItemForm
        isOpen={showCustomItemForm}
        onClose={() => {
          setShowCustomItemForm(false);
          setEditingCustomItem(undefined);
        }}
        onSave={(itemData) => {
          if (editingCustomItem) {
            updateCustomItem(editingCustomItem.id, itemData);
          } else {
            addCustomItem(itemData);
          }
        }}
        editItem={editingCustomItem}
      />
    </div>
  );
};

export default InventoryView;
