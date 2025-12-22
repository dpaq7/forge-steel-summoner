import { useState, useCallback } from 'react';
import type { DiceRoll, DiceType, CharacteristicId } from '@/components/ui/StatsDashboard/types';
import { CHARACTERISTICS } from '@/components/ui/StatsDashboard/types';

/**
 * Calculate power roll tier from total
 */
function calculatePowerRollTier(total: number): { tier: number; label: string } {
  if (total <= 2) return { tier: 1, label: 'Tier 1 (Critical Fail)' };
  if (total <= 6) return { tier: 1, label: 'Tier 1' };
  if (total <= 11) return { tier: 2, label: 'Tier 2' };
  if (total <= 16) return { tier: 3, label: 'Tier 3' };
  return { tier: 3, label: 'Tier 3+ (Critical!)' };
}

/**
 * Custom hook for dice rolling and roll history management
 */
export function useDiceRolling() {
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);

  /**
   * Roll dice of a specific type
   */
  const handleRoll = useCallback((type: DiceType, label?: string) => {
    let results: number[];

    switch (type) {
      case '2d10':
      case 'power':
        results = [
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 10) + 1,
        ];
        break;
      case 'd10':
        results = [Math.floor(Math.random() * 10) + 1];
        break;
      case 'd6':
        results = [Math.floor(Math.random() * 6) + 1];
        break;
      case 'd3':
        results = [Math.floor(Math.random() * 3) + 1];
        break;
      default:
        results = [0];
    }

    const total = results.reduce((a, b) => a + b, 0);
    const isPowerRoll = type === '2d10' || type === 'power';
    const tierInfo = isPowerRoll ? calculatePowerRollTier(total) : undefined;

    const roll: DiceRoll = {
      id: crypto.randomUUID(),
      type,
      results,
      total,
      finalTotal: total,
      tier: tierInfo?.tier,
      tierLabel: tierInfo?.label,
      timestamp: Date.now(),
      label: label || (isPowerRoll ? 'Power Roll' : undefined),
    };

    // Add to history (newest first, keep last 50)
    setRollHistory((prev) => [roll, ...prev].slice(0, 50));
  }, []);

  /**
   * Roll a characteristic check (2d10 + modifier)
   */
  const handleRollCharacteristic = useCallback(
    (characteristicId: CharacteristicId, modifier: number) => {
      // Roll 2d10
      const results = [
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1,
      ];

      const total = results.reduce((a, b) => a + b, 0);
      const finalTotal = total + modifier;

      // Calculate tier based on final total (with modifier)
      const tierInfo = calculatePowerRollTier(finalTotal);

      // Get characteristic display name
      const charInfo = CHARACTERISTICS.find((c) => c.id === characteristicId);
      const modifierName = charInfo?.name || characteristicId;

      const roll: DiceRoll = {
        id: crypto.randomUUID(),
        type: 'power',
        results,
        total,
        modifier,
        modifierName,
        finalTotal,
        tier: tierInfo.tier,
        tierLabel: tierInfo.label,
        timestamp: Date.now(),
        label: 'Power Roll',
      };

      setRollHistory((prev) => [roll, ...prev].slice(0, 50));
    },
    []
  );

  /**
   * Clear all roll history
   */
  const handleClearRollHistory = useCallback(() => {
    setRollHistory([]);
  }, []);

  return {
    rollHistory,
    handleRoll,
    handleRollCharacteristic,
    handleClearRollHistory,
  };
}

export default useDiceRolling;
