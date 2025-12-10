// Combat-related types for essence economy and turn flow

import { GridPosition } from './common';

export interface EssenceEconomy {
  currentEssence: number;
  essenceGainedThisTurn: number;

  // Tracking for "first time" triggers
  turnNumber: number;
  signatureMinionsSpawnedThisTurn: boolean;

  // SRD: Gain +1 Essence when any minion dies in range (limit 1/round)
  minionDeathEssenceGainedThisRound: boolean;
}

export interface SummoningAction {
  type: 'callForth' | 'signatureSpawn' | 'fixtureRelocation';
  essenceCost: number;
  minionTemplateId?: string;
  targetPosition?: GridPosition;
}

export type TurnPhase =
  | 'collectResources'
  | 'summonMinions'
  | 'positionUnits'
  | 'executePlan';

export interface TurnState {
  currentPhase: TurnPhase;
  roundNumber: number;
  phasesCompleted: TurnPhase[];
}
