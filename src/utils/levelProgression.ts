/**
 * Level progression utilities for Draw Steel XP system
 *
 * Draw Steel uses a milestone-based XP system where Victories convert to XP during Respite.
 * Heroes level up when they reach the XP threshold for the next level.
 */

// XP thresholds - total XP needed to reach each level
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,    // Starting level
  2: 3,    // 3 XP to reach level 2
  3: 9,    // +6 XP (9 total)
  4: 18,   // +9 XP (18 total)
  5: 30,   // +12 XP (30 total)
  6: 45,   // +15 XP (45 total)
  7: 63,   // +18 XP (63 total)
  8: 84,   // +21 XP (84 total)
  9: 108,  // +24 XP (108 total)
  10: 135, // +27 XP (135 total - max level)
};

export const MAX_LEVEL = 10;

/**
 * Get the XP required to reach a specific level
 */
export function getXpForLevel(level: number): number {
  if (level < 1) return 0;
  if (level > MAX_LEVEL) return XP_THRESHOLDS[MAX_LEVEL];
  return XP_THRESHOLDS[level] ?? 0;
}

/**
 * Get the XP needed for the next level from current level
 * Returns 0 if at max level
 */
export function getXpToNextLevel(currentLevel: number, currentXp: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;
  const nextLevelXp = XP_THRESHOLDS[currentLevel + 1];
  return Math.max(0, nextLevelXp - currentXp);
}

/**
 * Calculate progress percentage toward next level (0-100)
 * Returns 100 if at max level
 */
export function getLevelProgress(currentLevel: number, currentXp: number): number {
  if (currentLevel >= MAX_LEVEL) return 100;

  const currentLevelXp = XP_THRESHOLDS[currentLevel];
  const nextLevelXp = XP_THRESHOLDS[currentLevel + 1];
  const xpInCurrentLevel = currentXp - currentLevelXp;
  const xpRequiredForLevel = nextLevelXp - currentLevelXp;

  if (xpRequiredForLevel <= 0) return 100;

  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForLevel) * 100));
}

/**
 * Check if hero can level up (has enough XP for next level)
 */
export function canLevelUp(currentLevel: number, currentXp: number): boolean {
  if (currentLevel >= MAX_LEVEL) return false;
  return currentXp >= XP_THRESHOLDS[currentLevel + 1];
}

/**
 * Get XP range for current level display (e.g., "18/30")
 * Returns "Max" indicator at level 10
 */
export function getXpRangeDisplay(currentLevel: number, currentXp: number): string {
  if (currentLevel >= MAX_LEVEL) return `${currentXp} (Max)`;
  const nextLevelXp = XP_THRESHOLDS[currentLevel + 1];
  return `${currentXp}/${nextLevelXp}`;
}

/**
 * Get the XP required within the current level tier
 * Useful for progress bar calculations
 */
export function getXpRequiredForCurrentLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;
  const currentLevelXp = XP_THRESHOLDS[currentLevel];
  const nextLevelXp = XP_THRESHOLDS[currentLevel + 1];
  return nextLevelXp - currentLevelXp;
}

/**
 * Get XP earned within the current level tier
 * Useful for progress bar value calculations
 */
export function getXpWithinCurrentLevel(currentLevel: number, currentXp: number): number {
  const currentLevelXp = XP_THRESHOLDS[currentLevel];
  return Math.max(0, currentXp - currentLevelXp);
}
