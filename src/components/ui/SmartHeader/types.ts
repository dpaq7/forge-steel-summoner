import { ReactElement } from 'react';
import { Hero, HeroClass } from '@/types/hero';
import { Characteristics } from '@/types/common';

// Resource configuration type (matches class-resources.ts structure)
export interface HeroicResourceConfig {
  current: number;
  name: string;
  abbreviation: string;
  color: string;
  minValue: number;
}

// Compact data for quick stats display
export interface CompactStatData {
  name: string;
  level: number;
  portraitUrl: string | null;
  heroClass: HeroClass;
  stamina: { current: number; max: number };
  heroicResource: HeroicResourceConfig;
  recoveries: { current: number; max: number };
  recoveryValue: number;
  surges: number;
  victories: number;
  maxVictories: number;
  characteristics: Characteristics;
  speed: number;
  stability: number;
}

export interface SmartHeaderProps {
  hero: Hero | null;
  isInCombat: boolean;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;
  onManageCharacters: () => void;
  onCreateCharacter: () => void;
  onShowAbout: () => void;
  onLevelUp: () => void;

  // Heroic resource handling (generic for all classes)
  onResourceChange?: (newValue: number) => void;

  // Stamina actions
  onCatchBreath: (healAmount: number) => void;
  onStaminaChange: (newValue: number) => void;

  // Recoveries
  onRecoveriesChange: (newValue: number) => void;

  // Victories
  onVictoriesChange: (newValue: number) => void;

  // Surges
  onSurgesChange: (newValue: number) => void;

  // Children (expanded stats panel content)
  children?: ReactElement;

  // Resource configuration (from getResourceConfig)
  resourceConfig: {
    name: string;
    abbreviation: string;
    color: string;
    minValue: number;
  };
}

export interface QuickStatsProps {
  stamina: { current: number; max: number };
  recoveries: { current: number; max: number };
  recoveryValue: number;
  heroicResource: HeroicResourceConfig;
  surges: number;
  victories: number;
  isInCombat: boolean;
  heroClass: HeroClass;
  onResourceChange?: (newValue: number) => void;
  onCatchBreath?: (healAmount: number) => void;
  onVictoriesChange?: (newVictories: number) => void;
}

export interface HeaderActionsProps {
  isInCombat: boolean;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;
  onManageCharacters: () => void;
  onShowAbout: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}
