// Turn Tracker Types for Draw Steel Combat

export type TurnPhase =
  | 'claim'
  | 'move'
  | 'maneuver'
  | 'mainAction'
  | 'triggered'
  | 'endTurn';

export interface TurnPhaseConfig {
  id: TurnPhase;
  label: string;
  shortLabel: string;
  description: string;
}

export const TURN_PHASES: TurnPhaseConfig[] = [
  {
    id: 'claim',
    label: 'Claim Turn',
    shortLabel: 'Claim',
    description: 'Claim your turn in the initiative order',
  },
  {
    id: 'move',
    label: 'Move',
    shortLabel: 'Move',
    description: 'Move up to your speed',
  },
  {
    id: 'maneuver',
    label: 'Maneuver',
    shortLabel: 'Maneuver',
    description: 'Take a maneuver action (Aid, Catch Breath, etc.)',
  },
  {
    id: 'mainAction',
    label: 'Main Action',
    shortLabel: 'Action',
    description: 'Take your main action (Attack, Ability, etc.)',
  },
  {
    id: 'triggered',
    label: 'Triggered Action',
    shortLabel: 'Triggered',
    description: 'Use triggered actions and free triggered actions',
  },
  {
    id: 'endTurn',
    label: 'End Turn',
    shortLabel: 'End',
    description: 'End your turn and process conditions',
  },
];

export interface TurnState {
  completedPhases: Set<TurnPhase>;
  turnNumber: number;
}
