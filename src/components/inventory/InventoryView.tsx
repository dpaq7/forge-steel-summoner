import React from 'react';
import { useEquipment } from '../../hooks/useEquipment';
import { useSummonerContext } from '../../context/SummonerContext';
import { EQUIPMENT_SLOTS, SLOT_LABELS, SLOT_ICONS } from '../../types/equipment';
import { EquipmentSlot, getItemById } from '../../data/magicItems';
import './InventoryView.css';

const InventoryView: React.FC = () => {
  const { hero } = useSummonerContext();
  const { equippedItems, unequipItem, totalBonuses } = useEquipment();

  if (!hero) return null;

  // Check if any bonuses are non-zero
  const hasAnyBonuses = Object.values(totalBonuses).some(v => v > 0);

  const getEquippedInSlot = (slot: EquipmentSlot) => {
    return equippedItems.find(e => e.slot === slot);
  };

  return (
    <div className="inventory-view">
      <div className="inventory-header">
        <h2>Equipment & Inventory</h2>
        <p className="inventory-subtitle">
          Manage your equipped magic items
        </p>
      </div>

      {/* Total Bonuses Summary */}
      <div className="bonuses-section">
        <h3>Active Equipment Bonuses</h3>
        {hasAnyBonuses ? (
          <div className="bonuses-grid">
            {totalBonuses.stamina > 0 && (
              <div className="bonus-card">
                <span className="bonus-icon">❤️</span>
                <span className="bonus-stat">Stamina</span>
                <span className="bonus-value">+{totalBonuses.stamina}</span>
              </div>
            )}
            {totalBonuses.stability > 0 && (
              <div className="bonus-card">
                <span className="bonus-icon">🛡️</span>
                <span className="bonus-stat">Stability</span>
                <span className="bonus-value">+{totalBonuses.stability}</span>
              </div>
            )}
            {totalBonuses.speed > 0 && (
              <div className="bonus-card">
                <span className="bonus-icon">⚡</span>
                <span className="bonus-stat">Speed</span>
                <span className="bonus-value">+{totalBonuses.speed}</span>
              </div>
            )}
            {totalBonuses.damage > 0 && (
              <div className="bonus-card damage">
                <span className="bonus-icon">⚔️</span>
                <span className="bonus-stat">Damage</span>
                <span className="bonus-value">+{totalBonuses.damage}</span>
              </div>
            )}
            {totalBonuses.savingThrow > 0 && (
              <div className="bonus-card">
                <span className="bonus-icon">🎲</span>
                <span className="bonus-stat">Saving Throws</span>
                <span className="bonus-value">+{totalBonuses.savingThrow}</span>
              </div>
            )}
            {totalBonuses.rangeDistance > 0 && (
              <div className="bonus-card">
                <span className="bonus-icon">🎯</span>
                <span className="bonus-stat">Range</span>
                <span className="bonus-value">+{totalBonuses.rangeDistance}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="no-bonuses">No equipment bonuses active. Equip items from the Magic Items tab.</p>
        )}
      </div>

      {/* Equipment Slots */}
      <div className="equipment-section">
        <h3>Equipment Slots</h3>
        <div className="slots-grid">
          {EQUIPMENT_SLOTS.map(slot => {
            const equipped = getEquippedInSlot(slot);
            return (
              <div key={slot} className={`slot-card ${equipped ? 'filled' : 'empty'}`}>
                <div className="slot-header">
                  <span className="slot-icon">{SLOT_ICONS[slot]}</span>
                  <span className="slot-name">{SLOT_LABELS[slot]}</span>
                </div>
                {equipped ? (
                  <div className="equipped-item">
                    <div className="item-info">
                      <span className="item-name">{equipped.name}</span>
                      {equipped.bonuses.length > 0 && (
                        <span className="item-bonuses">
                          {equipped.bonuses.map(b => `+${b.value} ${b.stat}`).join(', ')}
                        </span>
                      )}
                    </div>
                    <button
                      className="unequip-btn"
                      onClick={() => unequipItem(equipped.itemId)}
                      title="Unequip item"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="empty-slot">
                    <span>Empty</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipped Items List */}
      {equippedItems.length > 0 && (
        <div className="equipped-list-section">
          <h3>Equipped Items ({equippedItems.length})</h3>
          <div className="equipped-list">
            {equippedItems.map(item => {
              const itemData = getItemById(item.itemId);
              return (
                <div key={item.itemId} className={`equipped-item-card ${item.category}`}>
                  <div className="item-header">
                    <span className="item-slot-badge">{SLOT_ICONS[item.slot]} {SLOT_LABELS[item.slot]}</span>
                    <span className={`item-category-badge ${item.category}`}>{item.category}</span>
                  </div>
                  <h4>{item.name}</h4>
                  <p className="item-effect">{item.effect}</p>
                  {item.bonuses.length > 0 && (
                    <div className="item-bonus-list">
                      {item.bonuses.map((bonus, idx) => (
                        <span key={idx} className="bonus-tag">
                          +{bonus.value} {bonus.stat}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.currentEnhancementLevel && (
                    <div className="enhancement-level">
                      Enhancement Tier: Level {item.currentEnhancementLevel}
                    </div>
                  )}
                  <button
                    className="unequip-btn-full"
                    onClick={() => unequipItem(item.itemId)}
                  >
                    Unequip
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
