// Tab configuration per class
// Each class needs specific tabs based on their unique mechanics

import { HeroClass } from '../types/hero';

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  component: string; // Component name to render
  classSpecific?: boolean;
  description?: string;
}

// Common tabs shared by all classes
export const commonTabs: TabConfig[] = [
  {
    id: 'character',
    label: 'Character',
    component: 'CharacterDetailsView',
    description: 'View character details, stats, and conditions',
  },
  {
    id: 'abilities',
    label: 'Abilities',
    component: 'AbilitiesView',
    description: 'View and use character abilities',
  },
  {
    id: 'projects',
    label: 'Projects',
    component: 'ProjectsView',
    description: 'Track crafting and research projects',
  },
  {
    id: 'items',
    label: 'Magic Items',
    component: 'MagicItemsView',
    description: 'Manage equipped magic items',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    component: 'InventoryView',
    description: 'Manage inventory and equipment',
  },
];

// Class-specific tabs
export const classSpecificTabs: Record<HeroClass, TabConfig[]> = {
  censor: [
    {
      id: 'judgment',
      label: 'Judgment',
      component: 'JudgmentView',
      classSpecific: true,
      description: 'Track your judged target and wrath management',
    },
  ],

  conduit: [
    {
      id: 'domain',
      label: 'Domain',
      component: 'DomainView',
      classSpecific: true,
      description: 'Domain powers and prayer mechanics',
    },
  ],

  elementalist: [
    {
      id: 'persistent',
      label: 'Persistent Magic',
      component: 'PersistentMagicView',
      classSpecific: true,
      description: 'Track maintained abilities and essence lock',
    },
  ],

  fury: [
    {
      id: 'ferocity',
      label: 'Growing Ferocity',
      component: 'FerocityTrackerView',
      classSpecific: true,
      description: 'Track ferocity tiers and rage abilities',
    },
  ],

  null: [
    {
      id: 'nullfield',
      label: 'Null Field',
      component: 'NullFieldView',
      classSpecific: true,
      description: 'Manage null field radius and effects',
    },
  ],

  shadow: [
    {
      id: 'college',
      label: 'College',
      component: 'CollegeView',
      classSpecific: true,
      description: 'College abilities and stealth tracking',
    },
  ],

  summoner: [
    {
      id: 'minions',
      label: 'Minions',
      component: 'CombatView',
      classSpecific: true,
      description: 'Manage summoned minions and squads',
    },
  ],

  tactician: [
    {
      id: 'tactics',
      label: 'Tactics',
      component: 'TacticsView',
      classSpecific: true,
      description: 'Marked targets and tactical commands',
    },
  ],

  talent: [
    {
      id: 'strain',
      label: 'Strain',
      component: 'StrainView',
      classSpecific: true,
      description: 'Track strain status and clarity management',
    },
  ],

  troubadour: [
    {
      id: 'routines',
      label: 'Routines',
      component: 'RoutinesView',
      classSpecific: true,
      description: 'Active routines and scene partners',
    },
  ],
};

// Get tabs for a specific class
export function getTabsForClass(heroClass: HeroClass): TabConfig[] {
  const classSpecific = classSpecificTabs[heroClass] || [];

  // Insert class-specific tabs after Abilities
  const result = [...commonTabs];
  const abilitiesIndex = result.findIndex((t) => t.id === 'abilities');

  if (abilitiesIndex !== -1) {
    result.splice(abilitiesIndex + 1, 0, ...classSpecific);
  } else {
    // If abilities tab not found, append at end
    result.push(...classSpecific);
  }

  return result;
}

// Get just the class-specific tabs for a class
export function getClassSpecificTabs(heroClass: HeroClass): TabConfig[] {
  return classSpecificTabs[heroClass] || [];
}

// Get label for the class-specific tab (e.g., "Minions" for Summoner)
export function getClassTabLabel(heroClass: HeroClass): string {
  const tabs = classSpecificTabs[heroClass];
  return tabs.length > 0 ? tabs[0].label : 'Class';
}

// Check if a tab ID is class-specific
export function isClassSpecificTab(tabId: string): boolean {
  return Object.values(classSpecificTabs)
    .flat()
    .some((tab) => tab.id === tabId);
}

// Get all unique tab IDs across all classes
export function getAllTabIds(): string[] {
  const commonIds = commonTabs.map((t) => t.id);
  const classIds = Object.values(classSpecificTabs)
    .flat()
    .map((t) => t.id);

  return [...new Set([...commonIds, ...classIds])];
}

// Get component name for a tab ID
export function getComponentForTab(tabId: string, heroClass?: HeroClass): string | null {
  // Check common tabs first
  const commonTab = commonTabs.find((t) => t.id === tabId);
  if (commonTab) return commonTab.component;

  // Check class-specific tabs
  if (heroClass) {
    const classTab = classSpecificTabs[heroClass]?.find((t) => t.id === tabId);
    if (classTab) return classTab.component;
  }

  // Check all class tabs
  for (const tabs of Object.values(classSpecificTabs)) {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) return tab.component;
  }

  return null;
}

// Default view when no character is loaded
export const defaultView = 'character';

// View type that includes all possible tabs
export type ViewType =
  | 'character'
  | 'abilities'
  | 'projects'
  | 'items'
  | 'inventory'
  // Class-specific
  | 'judgment'
  | 'domain'
  | 'persistent'
  | 'ferocity'
  | 'nullfield'
  | 'college'
  | 'minions'
  | 'tactics'
  | 'strain'
  | 'routines';
