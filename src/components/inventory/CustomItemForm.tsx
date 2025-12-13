import React, { useState, useCallback } from 'react';
import { ItemCategory, EquipmentSlot, ItemEnhancement } from '../../data/magicItems';
import { CustomMagicItem, createBlankCustomItem } from '../../hooks/useCustomItems';

interface CustomItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<CustomMagicItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => void;
  editItem?: CustomMagicItem; // If provided, we're editing an existing item
}

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'trinket', label: 'Trinket' },
  { value: 'leveled', label: 'Leveled Treasure' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'artifact', label: 'Artifact' },
];

const EQUIPMENT_SLOTS: { value: EquipmentSlot; label: string }[] = [
  { value: 'head', label: 'Head' },
  { value: 'neck', label: 'Neck' },
  { value: 'armor', label: 'Armor' },
  { value: 'arms', label: 'Arms' },
  { value: 'hands', label: 'Hands' },
  { value: 'waist', label: 'Waist' },
  { value: 'feet', label: 'Feet' },
  { value: 'ring', label: 'Ring' },
  { value: 'held', label: 'Held' },
  { value: 'weapon', label: 'Weapon' },
  { value: 'implement', label: 'Implement' },
  { value: 'mount', label: 'Mount' },
];

const CustomItemForm: React.FC<CustomItemFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [formData, setFormData] = useState(() =>
    editItem
      ? {
          name: editItem.name,
          category: editItem.category,
          echelon: editItem.echelon,
          slot: editItem.slot,
          effect: editItem.effect,
          projectGoal: editItem.projectGoal,
          imageUrl: editItem.imageUrl,
          enhancements: editItem.enhancements || [],
        }
      : {
          ...createBlankCustomItem(),
          enhancements: [] as ItemEnhancement[],
        }
  );

  const [showEnhancements, setShowEnhancements] = useState(
    editItem?.category === 'leveled' || false
  );

  // Reset form when modal opens/closes or editItem changes
  React.useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          name: editItem.name,
          category: editItem.category,
          echelon: editItem.echelon,
          slot: editItem.slot,
          effect: editItem.effect,
          projectGoal: editItem.projectGoal,
          imageUrl: editItem.imageUrl,
          enhancements: editItem.enhancements || [],
        });
        setShowEnhancements(editItem.category === 'leveled');
      } else {
        setFormData({
          ...createBlankCustomItem(),
          enhancements: [],
        });
        setShowEnhancements(false);
      }
    }
  }, [isOpen, editItem]);

  const handleChange = useCallback(
    (field: string, value: string | number | undefined) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Auto-show enhancements for leveled items
      if (field === 'category' && value === 'leveled') {
        setShowEnhancements(true);
        // Initialize default enhancement levels if empty
        setFormData((prev) => ({
          ...prev,
          category: value as ItemCategory,
          enhancements:
            prev.enhancements && prev.enhancements.length > 0
              ? prev.enhancements
              : [
                  { level: 1, effect: '' },
                  { level: 5, effect: '' },
                  { level: 9, effect: '' },
                ],
        }));
      } else if (field === 'category') {
        setShowEnhancements(false);
      }
    },
    []
  );

  const handleEnhancementChange = useCallback(
    (index: number, effect: string) => {
      setFormData((prev) => {
        const newEnhancements = [...(prev.enhancements || [])];
        newEnhancements[index] = { ...newEnhancements[index], effect };
        return { ...prev, enhancements: newEnhancements };
      });
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name.trim()) {
        alert('Please enter an item name');
        return;
      }

      if (!formData.effect.trim()) {
        alert('Please enter an item effect/description');
        return;
      }

      const itemData: Omit<CustomMagicItem, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        category: formData.category,
        echelon: formData.echelon,
        slot: formData.category !== 'consumable' ? formData.slot : undefined,
        effect: formData.effect.trim(),
        projectGoal: formData.projectGoal || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
        enhancements:
          formData.category === 'leveled' && formData.enhancements?.some((e) => e.effect)
            ? formData.enhancements.filter((e) => e.effect)
            : undefined,
      };

      onSave(itemData);
      onClose();
    },
    [formData, onSave, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-item-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editItem ? 'Edit Custom Item' : 'Create Custom Item'}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-item-form__content">
          {/* Name */}
          <div className="form-group">
            <label htmlFor="item-name">Item Name *</label>
            <input
              id="item-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter item name..."
              required
            />
          </div>

          {/* Category & Echelon Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item-category">Category *</label>
              <select
                id="item-category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="item-echelon">Echelon *</label>
              <select
                id="item-echelon"
                value={formData.echelon}
                onChange={(e) => handleChange('echelon', parseInt(e.target.value))}
              >
                <option value={1}>1st Echelon</option>
                <option value={2}>2nd Echelon</option>
                <option value={3}>3rd Echelon</option>
                <option value={4}>4th Echelon</option>
              </select>
            </div>
          </div>

          {/* Equipment Slot (not for consumables) */}
          {formData.category !== 'consumable' && (
            <div className="form-group">
              <label htmlFor="item-slot">Equipment Slot</label>
              <select
                id="item-slot"
                value={formData.slot || ''}
                onChange={(e) =>
                  handleChange('slot', e.target.value || undefined)
                }
              >
                <option value="">-- No specific slot --</option>
                {EQUIPMENT_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Effect/Description */}
          <div className="form-group">
            <label htmlFor="item-effect">Effect / Description *</label>
            <textarea
              id="item-effect"
              value={formData.effect}
              onChange={(e) => handleChange('effect', e.target.value)}
              placeholder="Describe the item's effect... Include stat bonuses like '+6 Stamina' or '+2 damage' for automatic parsing."
              rows={4}
              required
            />
            <p className="form-hint">
              Tip: Include stat bonuses like "+6 Stamina", "+2 damage", "+1 bonus to saving throws" for automatic stat tracking.
            </p>
          </div>

          {/* Enhancements for Leveled Items */}
          {showEnhancements && formData.category === 'leveled' && (
            <div className="form-group enhancements-group">
              <label>Enhancement Tiers</label>
              <div className="enhancements-list">
                {[1, 5, 9].map((level, index) => (
                  <div key={level} className="enhancement-tier">
                    <span className="tier-label">Level {level}:</span>
                    <input
                      type="text"
                      value={formData.enhancements?.[index]?.effect || ''}
                      onChange={(e) => handleEnhancementChange(index, e.target.value)}
                      placeholder={`Enhancement at level ${level}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Goal (crafting) */}
          <div className="form-group">
            <label htmlFor="item-project-goal">Project Goal (PP to craft)</label>
            <input
              id="item-project-goal"
              type="number"
              min="0"
              value={formData.projectGoal || ''}
              onChange={(e) =>
                handleChange(
                  'projectGoal',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="Optional crafting points..."
            />
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="item-image">Image URL</label>
            <input
              id="item-image"
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://example.com/item-image.png"
            />
            {formData.imageUrl && (
              <div className="image-preview">
                <img
                  src={formData.imageUrl}
                  alt="Item preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editItem ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomItemForm;
