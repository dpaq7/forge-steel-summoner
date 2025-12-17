import React from 'react';
import SectionHeader from '../shared/SectionHeader';
import StaminaTracker from './StaminaTracker';
import RecoveriesTracker from './RecoveriesTracker';
import EssenceTracker from './EssenceTracker';
import SurgesTracker from './SurgesTracker';
import './ResourcePanel.css';

interface ResourcePanelProps {
  stamina: {
    current: number;
    max: number;
    temporary: number;
    winded: boolean;
    dying: boolean;
    dead?: boolean;
    dyingThreshold: number;
  };
  recoveries: {
    stamina: number;
    current: number;
    max: number;
  };
  essence: {
    current: number;
    max: number;
  };
  surges?: {
    current: number;
    max: number;
  };
  onStaminaChange: (updates: Partial<ResourcePanelProps['stamina']>) => void;
  onRecoveriesChange: (current: number) => void;
  onUseRecovery?: () => void;
  onEssenceChange?: (current: number) => void;
  onSurgesChange?: (current: number) => void;
  onDyingTriggered?: () => void; // Called when hero becomes dying (for bleeding condition)
  hideSurges?: boolean;
  hideEssence?: boolean;
  className?: string;
  resourceName?: string; // Class-specific resource name (Essence, Wrath, Piety, etc.)
}

/**
 * Combined Resource Panel component matching Draw Steel character sheet.
 * Displays Stamina, Recoveries, Essence (Heroic Resource), and Surges.
 */
const ResourcePanel: React.FC<ResourcePanelProps> = ({
  stamina,
  recoveries,
  essence,
  surges,
  onStaminaChange,
  onRecoveriesChange,
  onUseRecovery,
  onEssenceChange,
  onSurgesChange,
  onDyingTriggered,
  hideSurges = false,
  hideEssence = false,
  className = '',
  resourceName = 'Essence',
}) => {
  return (
    <div className={`resource-panel ${className}`}>
      <div className="resource-panel-left">
        <SectionHeader title="Stamina" variant="compact" />
        <StaminaTracker
          current={stamina.current}
          max={stamina.max}
          temporary={stamina.temporary}
          winded={stamina.winded}
          dying={stamina.dying}
          dead={stamina.dead}
          dyingThreshold={stamina.dyingThreshold}
          onCurrentChange={(v) => onStaminaChange({ current: v })}
          onTemporaryChange={(v) => onStaminaChange({ temporary: v })}
          onWindedChange={(v) => onStaminaChange({ winded: v })}
          onDyingChange={(v) => onStaminaChange({ dying: v })}
          onDeadChange={(v) => onStaminaChange({ dead: v })}
          onDyingTriggered={onDyingTriggered}
        />
      </div>

      <div className="resource-panel-center">
        <SectionHeader title="Recoveries" variant="compact" />
        <RecoveriesTracker
          stamina={recoveries.stamina}
          current={recoveries.current}
          max={recoveries.max}
          onCurrentChange={onRecoveriesChange}
          onUseRecovery={onUseRecovery}
        />
      </div>

      {!hideEssence && (
        <div className="resource-panel-right">
          <SectionHeader title={resourceName} variant="compact" />
          <div className="essence-surges-row">
            <EssenceTracker
              current={essence.current}
              max={essence.max}
              onCurrentChange={onEssenceChange!}
            />
            {!hideSurges && surges && onSurgesChange && (
              <SurgesTracker
                current={surges.current}
                max={surges.max}
                onCurrentChange={onSurgesChange}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePanel;
