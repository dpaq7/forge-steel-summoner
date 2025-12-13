import React from 'react';
import { EquippedItem } from '../../types/equipment';
import { VisualSlot, SLOT_CONFIG, VISUAL_SLOTS } from './slotConfig';
import { PortraitSettings } from '../../types/portrait';
import EquipmentSlot from './EquipmentSlot';
import CharacterPortrait from './CharacterPortrait';

interface EquipmentLayoutProps {
  equippedItems: EquippedItem[];
  onSlotClick: (visualSlot: VisualSlot) => void;
  ring1ItemId?: string; // Track which ring is in slot 1
  ring2ItemId?: string; // Track which ring is in slot 2
  portraitSettings: PortraitSettings;
  onEditPortrait: () => void;
}

const EquipmentLayout: React.FC<EquipmentLayoutProps> = ({
  equippedItems,
  onSlotClick,
  ring1ItemId,
  ring2ItemId,
  portraitSettings,
  onEditPortrait,
}) => {
  // Get item for a visual slot
  const getItemForSlot = (visualSlot: VisualSlot): EquippedItem | null => {
    const config = SLOT_CONFIG[visualSlot];

    // Handle ring slots specially
    if (visualSlot === 'ring1') {
      return ring1ItemId
        ? equippedItems.find((item) => item.itemId === ring1ItemId) || null
        : null;
    }
    if (visualSlot === 'ring2') {
      return ring2ItemId
        ? equippedItems.find((item) => item.itemId === ring2ItemId) || null
        : null;
    }

    // Handle main hand / off hand - for now, show weapon/implement/held items
    if (visualSlot === 'mainHand') {
      return (
        equippedItems.find(
          (item) =>
            item.slot === 'weapon' ||
            item.slot === 'implement' ||
            (item.slot === 'held' && !['ring1', 'ring2'].includes(visualSlot))
        ) || null
      );
    }

    if (visualSlot === 'offHand') {
      // For off-hand, check if there's a second weapon/implement/held item
      // For now, keep it empty unless we implement dual-wielding tracking
      return null;
    }

    // For other slots, find by equipment slot type
    return (
      equippedItems.find((item) => config.acceptedSlots.includes(item.slot)) ||
      null
    );
  };

  const hasPortrait = portraitSettings.source !== 'default' && portraitSettings.imageData !== null;

  return (
    <div className="equipment-layout">
      {/* Character Portrait Background */}
      <CharacterPortrait settings={portraitSettings} onEdit={onEditPortrait} />

      {/* Equipment Slots Grid */}
      <div className="slots-grid-visual">
        {VISUAL_SLOTS.map((visualSlot) => (
          <EquipmentSlot
            key={visualSlot}
            config={SLOT_CONFIG[visualSlot]}
            item={getItemForSlot(visualSlot)}
            onClick={() => onSlotClick(visualSlot)}
          />
        ))}
      </div>

      {/* Floating edit button - always accessible when portrait is set */}
      {hasPortrait && (
        <button
          className="portrait-edit-btn"
          onClick={onEditPortrait}
          title="Edit Portrait"
        >
          Edit Portrait
        </button>
      )}
    </div>
  );
};

export default EquipmentLayout;
