import React from 'react';
import { EquippedItem } from '../../types/equipment';
import { SlotConfig } from './slotConfig';

interface EquipmentSlotProps {
  config: SlotConfig;
  item: EquippedItem | null;
  onClick: () => void;
  disabled?: boolean;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  config,
  item,
  onClick,
  disabled = false,
}) => {
  const isEmpty = !item;
  const sizeClass = `slot-${config.position.size}`;

  return (
    <div
      className={`equipment-slot ${sizeClass} ${isEmpty ? 'empty' : 'filled'} ${disabled ? 'disabled' : ''}`}
      style={{ gridArea: config.position.gridArea }}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title={item ? `${item.name} (Click to manage)` : `${config.label} - Click to equip`}
    >
      <div className="slot-frame">
        <div className="slot-inner">
          {isEmpty ? (
            <div className="slot-empty">
              <span className="slot-icon">{config.icon}</span>
              <span className="slot-label">{config.label}</span>
              <span className="slot-hint">+</span>
            </div>
          ) : (
            <div className="slot-filled">
              <span className="slot-icon">{config.icon}</span>
              <span className="item-name">{item.name}</span>
              {item.bonuses.length > 0 && (
                <span className="item-bonus">
                  {item.bonuses.map((b) => `+${b.value}`).join(', ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="slot-label-external">{config.label}</div>
    </div>
  );
};

export default EquipmentSlot;
