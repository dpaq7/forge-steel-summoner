// Visual slot configuration for RPG-style equipment layout
import { EquipmentSlot } from '../../data/magicItems';

export type VisualSlot =
  | 'head'
  | 'neck'
  | 'armor'
  | 'arms'
  | 'hands'
  | 'waist'
  | 'feet'
  | 'ring1'
  | 'ring2'
  | 'mainHand'
  | 'offHand'
  | 'mount';

export interface SlotPosition {
  gridArea: string;
  size: 'small' | 'medium' | 'large';
}

export interface SlotConfig {
  visualSlot: VisualSlot;
  label: string;
  icon: string;
  acceptedSlots: EquipmentSlot[]; // Which equipment slot types can go here
  position: SlotPosition;
}

// Map visual slots to their configuration
export const SLOT_CONFIG: Record<VisualSlot, SlotConfig> = {
  head: {
    visualSlot: 'head',
    label: 'Head',
    icon: '👑',
    acceptedSlots: ['head'],
    position: { gridArea: 'head', size: 'medium' },
  },
  neck: {
    visualSlot: 'neck',
    label: 'Neck',
    icon: '📿',
    acceptedSlots: ['neck'],
    position: { gridArea: 'neck', size: 'small' },
  },
  armor: {
    visualSlot: 'armor',
    label: 'Armor',
    icon: '🛡️',
    acceptedSlots: ['armor'],
    position: { gridArea: 'armor', size: 'large' },
  },
  arms: {
    visualSlot: 'arms',
    label: 'Arms',
    icon: '💪',
    acceptedSlots: ['arms'],
    position: { gridArea: 'arms', size: 'medium' },
  },
  hands: {
    visualSlot: 'hands',
    label: 'Hands',
    icon: '🧤',
    acceptedSlots: ['hands'],
    position: { gridArea: 'hands', size: 'medium' },
  },
  waist: {
    visualSlot: 'waist',
    label: 'Waist',
    icon: '🎗️',
    acceptedSlots: ['waist'],
    position: { gridArea: 'waist', size: 'medium' },
  },
  feet: {
    visualSlot: 'feet',
    label: 'Feet',
    icon: '👢',
    acceptedSlots: ['feet'],
    position: { gridArea: 'feet', size: 'medium' },
  },
  ring1: {
    visualSlot: 'ring1',
    label: 'Ring',
    icon: '💍',
    acceptedSlots: ['ring'],
    position: { gridArea: 'ring1', size: 'small' },
  },
  ring2: {
    visualSlot: 'ring2',
    label: 'Ring',
    icon: '💍',
    acceptedSlots: ['ring'],
    position: { gridArea: 'ring2', size: 'small' },
  },
  mainHand: {
    visualSlot: 'mainHand',
    label: 'Main Hand',
    icon: '⚔️',
    acceptedSlots: ['weapon', 'implement', 'held'],
    position: { gridArea: 'mainHand', size: 'large' },
  },
  offHand: {
    visualSlot: 'offHand',
    label: 'Off Hand',
    icon: '🛡️',
    acceptedSlots: ['weapon', 'implement', 'held'],
    position: { gridArea: 'offHand', size: 'large' },
  },
  mount: {
    visualSlot: 'mount',
    label: 'Mount',
    icon: '🐎',
    acceptedSlots: ['mount'],
    position: { gridArea: 'mount', size: 'large' },
  },
};

// Visual slots in display order (top to bottom, left to right)
export const VISUAL_SLOTS: VisualSlot[] = [
  'head',
  'neck',
  'arms',
  'armor',
  'ring1',
  'hands',
  'ring2',
  'mainHand',
  'waist',
  'offHand',
  'feet',
  'mount',
];

// Map to track which visual slots have items (for dual ring support)
export const getVisualSlotKey = (visualSlot: VisualSlot): string => {
  return visualSlot;
};
