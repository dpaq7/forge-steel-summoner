import type { Hero, HeroClass } from '@/types/hero';
import type { Characteristics } from '@/types/common';
import type { HeroicResourceConfig } from '@/data/class-resources';

// All available stat card types
export type StatCardType =
  | 'stamina'
  | 'recoveries'
  | 'heroicResource'
  | 'surges'
  | 'victories'
  | 'characteristics'
  | 'combat';

// Props for the main dashboard
export interface StatsDashboardProps {
  hero: Hero | null;
  isInCombat: boolean;

  // Combat actions
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;

  // Stamina
  onStaminaChange: (value: number) => void;

  // Recoveries
  onRecoveriesChange: (value: number) => void;
  onCatchBreath: (healAmount: number) => void;

  // Heroic Resource
  resourceConfig: HeroicResourceConfig;
  onResourceChange?: (value: number) => void;

  // Surges
  onSurgesChange: (value: number) => void;

  // Victories
  onVictoriesChange: (value: number) => void;

  // Navigation
  onManageCharacters: () => void;
  onCreateCharacter: () => void;
  onShowAbout: () => void;
  onLevelUp: () => void;
}

// Props for individual stat chips
export interface StatChipProps {
  id: StatCardType;
  icon: React.ElementType;
  label: string;
  value: number;
  maxValue?: number;
  displayValue?: string; // Custom display (e.g., "+2" for characteristics)
  color: string;
  isPinned: boolean;
  onTogglePin: () => void;
  onChange?: (delta: number) => void; // For +/- controls
  disabled?: boolean;
  minValue?: number;
  showProgress?: boolean;
  highlight?: boolean;
}

// Props for detail cards
export interface BaseCardProps {
  onUnpin: () => void;
}

export interface StaminaCardProps extends BaseCardProps {
  current: number;
  max: number;
  tempStamina: number;
  winded: number;
  onChange: (value: number) => void;
}

export interface RecoveriesCardProps extends BaseCardProps {
  current: number;
  max: number;
  value: number; // Recovery value
  currentStamina: number;
  maxStamina: number;
  onChange: (value: number) => void;
  onCatchBreath: (healAmount: number) => void;
}

export interface HeroicResourceCardProps extends BaseCardProps {
  name: string;
  current: number;
  minValue: number;
  color: string;
  heroClass: HeroClass;
  heroLevel: number;
  onChange: (value: number) => void;
}

export interface SurgesCardProps extends BaseCardProps {
  current: number;
  onChange: (value: number) => void;
  isInCombat: boolean;
}

export interface VictoriesCardProps extends BaseCardProps {
  current: number;
  xp: number;
  onChange: (value: number) => void;
}

export interface CharacteristicsCardProps extends BaseCardProps {
  characteristics: Characteristics;
  speed: number;
  stability: number;
}

export interface CombatCardProps extends BaseCardProps {
  isInCombat: boolean;
  surges: number;
  victories: number;
  speed: number;
  stability: number;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;
  onSurgesChange: (value: number) => void;
}
