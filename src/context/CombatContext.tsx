import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { EssenceEconomy, TurnState, TurnPhase, Squad, Minion, MinionTemplate } from '../types';
import { useSummonerContext } from './SummonerContext';
import { generateId, calculateMinionBonusStamina } from '../utils/calculations';

// SRD Constants
const ESSENCE_PER_TURN = 2; // Flat +2 essence per turn (SRD)
const MINION_DEATH_ESSENCE = 1; // +1 essence when minion dies (1/round limit)
const FREE_SUMMONS_COMBAT_START = 2; // Free signature minions at combat start
const FREE_SUMMONS_TURN_START = 3; // Free signature minions at start of each turn

interface CombatContextType {
  essenceState: EssenceEconomy;
  turnState: TurnState;
  isInCombat: boolean;
  startCombat: () => void;
  endCombat: () => void;
  startNewTurn: () => void;
  advancePhase: () => void;
  spendEssence: (amount: number) => boolean;
  gainEssence: (amount: number) => void;
  onMinionDeath: () => void; // Trigger essence gain from minion death
  setOnCombatStartCallback: (callback: (() => void) | null) => void;
  hasSacrificedThisTurn: boolean;
  sacrificeMinion: () => boolean; // Sacrifice a signature minion for 1 essence (1/turn)
}

const CombatContext = createContext<CombatContextType | undefined>(undefined);

export const useCombatContext = () => {
  const context = useContext(CombatContext);
  if (!context) {
    throw new Error('useCombatContext must be used within a CombatProvider');
  }
  return context;
};

interface CombatProviderProps {
  children: ReactNode;
}

export const CombatProvider: React.FC<CombatProviderProps> = ({ children }) => {
  const { hero, updateHero } = useSummonerContext();

  const [isInCombat, setIsInCombat] = useState(false);
  const [onCombatStartCallback, setOnCombatStartCallbackState] = useState<(() => void) | null>(null);

  const setOnCombatStartCallback = useCallback((callback: (() => void) | null) => {
    setOnCombatStartCallbackState(() => callback);
  }, []);

  const [essenceState, setEssenceState] = useState<EssenceEconomy>({
    currentEssence: 0,
    essenceGainedThisTurn: 0,
    turnNumber: 0,
    signatureMinionsSpawnedThisTurn: false,
    minionDeathEssenceGainedThisRound: false,
  });

  const [hasSacrificedThisTurn, setHasSacrificedThisTurn] = useState(false);

  const [turnState, setTurnState] = useState<TurnState>({
    currentPhase: 'collectResources',
    roundNumber: 0,
    phasesCompleted: [],
  });

  // Helper function to create a squad from a minion template
  const createSquadFromTemplate = useCallback((template: MinionTemplate): Squad | null => {
    if (!hero) return null;

    const bonusStamina = calculateMinionBonusStamina(hero.formation);

    // Create minion members and calculate total pool
    const members: Minion[] = [];
    let totalStamina = 0;

    for (let i = 0; i < template.minionsPerSummon; i++) {
      const baseStamina = Array.isArray(template.stamina)
        ? template.stamina[i] || template.stamina[0]
        : template.stamina;
      const minionMaxStamina = baseStamina + bonusStamina;
      totalStamina += minionMaxStamina;

      members.push({
        id: generateId(),
        templateId: template.id,
        isAlive: true,
        maxStamina: minionMaxStamina,
        conditions: [],
      });
    }

    return {
      id: generateId(),
      templateId: template.id,
      members,
      currentStamina: totalStamina,
      maxStamina: totalStamina,
      hasMoved: false,
      hasActed: false,
    };
  }, [hero]);

  // Create a single minion (not a full squad) for free summons
  const createSingleMinion = useCallback((template: MinionTemplate): Minion | null => {
    if (!hero) return null;

    const bonusStamina = calculateMinionBonusStamina(hero.formation);
    const baseStamina = Array.isArray(template.stamina)
      ? template.stamina[0]
      : template.stamina;
    const minionMaxStamina = baseStamina + bonusStamina;

    return {
      id: generateId(),
      templateId: template.id,
      isAlive: true,
      maxStamina: minionMaxStamina,
      conditions: [],
    };
  }, [hero]);

  // Summon free signature minions (used at combat start and turn start)
  // This counts INDIVIDUAL MINIONS, not squads
  const summonFreeSignatureMinions = useCallback((minionCount: number, existingSquads: Squad[] = []): Squad[] => {
    if (!hero) return existingSquads;

    const signatureMinions = hero.portfolio.signatureMinions || [];
    if (signatureMinions.length === 0) return existingSquads;

    const newSquads = [...existingSquads];
    let summoned = 0;
    let templateIndex = 0;

    // Summon individual minions, cycling through signature templates
    while (summoned < minionCount) {
      const template = signatureMinions[templateIndex % signatureMinions.length];
      const minion = createSingleMinion(template);

      if (minion) {
        // Find existing squad of same type or create new one
        let squad = newSquads.find(s => s.templateId === template.id);

        if (squad) {
          // Add minion to existing squad
          squad.members.push(minion);
          squad.currentStamina += minion.maxStamina;
          squad.maxStamina += minion.maxStamina;
        } else {
          // Create new squad with this single minion
          squad = {
            id: generateId(),
            templateId: template.id,
            members: [minion],
            currentStamina: minion.maxStamina,
            maxStamina: minion.maxStamina,
            hasMoved: false,
            hasActed: false,
          };
          newSquads.push(squad);
        }

        summoned++;
      }

      templateIndex++;
      // Safety: prevent infinite loop if no minions can be created
      if (templateIndex > minionCount * 2) break;
    }

    return newSquads;
  }, [hero, createSingleMinion]);

  const startCombat = () => {
    if (!hero) return;

    // SRD: Start of Combat - Essence = Current Victories
    const startingEssence = hero.victories || 0;

    // SRD: Start of Combat - Summon up to 2 signature minions for free
    const freeSquads = summonFreeSignatureMinions(FREE_SUMMONS_COMBAT_START, []);

    // Update hero with the new squads
    updateHero({
      activeSquads: freeSquads,
    });

    setIsInCombat(true);
    setHasSacrificedThisTurn(false);
    setTurnState({
      currentPhase: 'collectResources',
      roundNumber: 1,
      phasesCompleted: [],
    });
    setEssenceState({
      currentEssence: startingEssence,
      essenceGainedThisTurn: 0,
      turnNumber: 1,
      signatureMinionsSpawnedThisTurn: true, // Mark that we've spawned this turn
      minionDeathEssenceGainedThisRound: false,
    });

    // Call the combat start callback (e.g., to switch to combat tab)
    if (onCombatStartCallback) {
      onCombatStartCallback();
    }
  };

  const endCombat = () => {
    setIsInCombat(false);

    // Reset squads
    if (hero) {
      updateHero({
        activeSquads: [],
        fixture: null,
      });
    }
  };

  const startNewTurn = () => {
    if (!hero) return;

    const newTurnNumber = turnState.roundNumber + 1;

    setHasSacrificedThisTurn(false);
    setTurnState({
      currentPhase: 'collectResources',
      roundNumber: newTurnNumber,
      phasesCompleted: [],
    });

    // SRD: Start of Turn - Gain +2 Essence (flat, not level-based)
    // Essence carries over between turns (no reset to 0)
    setEssenceState(prev => ({
      ...prev,
      currentEssence: prev.currentEssence + ESSENCE_PER_TURN,
      essenceGainedThisTurn: ESSENCE_PER_TURN,
      turnNumber: newTurnNumber,
      signatureMinionsSpawnedThisTurn: true, // Mark that we've spawned this turn
      minionDeathEssenceGainedThisRound: false, // Reset for new round
    }));

    // Reset squad action states and add free signature minions
    // SRD: Start of Turn - Summon up to 3 signature minions for free
    const resetSquads = hero.activeSquads.map(squad => ({
      ...squad,
      hasMoved: false,
      hasActed: false,
    }));

    // Add 3 free signature minion squads
    const squadsWithFreeMinions = summonFreeSignatureMinions(FREE_SUMMONS_TURN_START, resetSquads);

    updateHero({ activeSquads: squadsWithFreeMinions });
  };

  const advancePhase = () => {
    const phases: TurnPhase[] = ['collectResources', 'summonMinions', 'positionUnits', 'executePlan'];
    const currentIndex = phases.indexOf(turnState.currentPhase);

    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      setTurnState(prev => ({
        ...prev,
        currentPhase: nextPhase,
        phasesCompleted: [...prev.phasesCompleted, prev.currentPhase],
      }));
    }
  };

  const spendEssence = (amount: number): boolean => {
    if (essenceState.currentEssence >= amount) {
      setEssenceState(prev => ({
        ...prev,
        currentEssence: prev.currentEssence - amount,
      }));
      return true;
    }
    return false;
  };

  const gainEssence = (amount: number) => {
    setEssenceState(prev => ({
      ...prev,
      currentEssence: prev.currentEssence + amount,
      essenceGainedThisTurn: prev.essenceGainedThisTurn + amount,
    }));
  };

  // SRD: Gain +1 Essence when any minion dies in range (limit 1/round)
  const onMinionDeath = () => {
    if (!essenceState.minionDeathEssenceGainedThisRound) {
      setEssenceState(prev => ({
        ...prev,
        currentEssence: prev.currentEssence + MINION_DEATH_ESSENCE,
        essenceGainedThisTurn: prev.essenceGainedThisTurn + MINION_DEATH_ESSENCE,
        minionDeathEssenceGainedThisRound: true,
      }));
    }
  };

  // Sacrifice a signature minion to gain 1 essence (limit 1/turn)
  const sacrificeMinion = (): boolean => {
    if (hasSacrificedThisTurn) {
      return false; // Already sacrificed this turn
    }
    setHasSacrificedThisTurn(true);
    setEssenceState(prev => ({
      ...prev,
      currentEssence: prev.currentEssence + 1,
      essenceGainedThisTurn: prev.essenceGainedThisTurn + 1,
    }));
    return true;
  };

  const value: CombatContextType = {
    essenceState,
    turnState,
    isInCombat,
    startCombat,
    endCombat,
    startNewTurn,
    advancePhase,
    spendEssence,
    gainEssence,
    onMinionDeath,
    setOnCombatStartCallback,
    hasSacrificedThisTurn,
    sacrificeMinion,
  };

  return <CombatContext.Provider value={value}>{children}</CombatContext.Provider>;
};
