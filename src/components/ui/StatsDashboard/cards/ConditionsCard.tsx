import * as React from 'react';
import { useState } from 'react';
import { AlertTriangle, Pin, Plus, X, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/shadcn/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';

import { CONDITIONS, ALL_CONDITIONS, performSavingThrow, getDefaultEndType } from '@/data/conditions';
import { END_TYPE_CONFIG } from '../types';
import type { ConditionsCardProps, ConditionId, ConditionEndType } from '../types';

interface SaveResult {
  conditionId: ConditionId;
  roll: number;
  success: boolean;
  timestamp: number;
}

export const ConditionsCard: React.FC<ConditionsCardProps> = ({
  conditions,
  onAddCondition,
  onRemoveCondition,
  onUpdateConditionEndType,
  onUnpin,
}) => {
  const [lastSaveResult, setLastSaveResult] = useState<SaveResult | null>(null);

  // Get conditions not currently active
  const activeConditionIds = new Set(conditions.map((c) => c.conditionId));
  const availableToAdd = ALL_CONDITIONS.filter((c) => !activeConditionIds.has(c.id));

  // Roll save for a condition (6+ on d10)
  const handleRollSave = (conditionId: ConditionId) => {
    const { roll, success } = performSavingThrow();

    setLastSaveResult({
      conditionId,
      roll,
      success,
      timestamp: Date.now(),
    });

    if (success) {
      // Delay removal slightly to show the result
      setTimeout(() => {
        onRemoveCondition(conditionId);
        setLastSaveResult(null);
      }, 1500);
    } else {
      // Clear result after showing
      setTimeout(() => {
        setLastSaveResult(null);
      }, 2000);
    }
  };

  return (
    <div className={`stat-card conditions-card ${conditions.length > 0 ? 'has-conditions' : ''}`}>
      {/* Header */}
      <div className="stat-card-header">
        <div className="stat-card-title">
          <AlertTriangle className="stat-card-icon" />
          <span>Conditions</span>
          {conditions.length > 0 && (
            <span className="condition-count-badge">{conditions.length}</span>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="unpin-btn" onClick={onUnpin}>
              <Pin className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Unpin</TooltipContent>
        </Tooltip>
      </div>

      {/* Content */}
      <div className="stat-card-content">
        {/* Active Conditions List */}
        {conditions.length === 0 ? (
          <div className="no-conditions">
            <span className="no-conditions-text">No active conditions</span>
          </div>
        ) : (
          <div className="conditions-list">
            <AnimatePresence mode="popLayout">
              {conditions.map((activeCondition) => {
                const conditionDef = CONDITIONS[activeCondition.conditionId];
                if (!conditionDef) return null;

                const saveResult =
                  lastSaveResult?.conditionId === activeCondition.conditionId
                    ? lastSaveResult
                    : null;

                const endType = activeCondition.endType || 'manual';
                const endTypeConfig = END_TYPE_CONFIG[endType];

                return (
                  <motion.div
                    key={activeCondition.conditionId}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`condition-row debuff ${saveResult ? (saveResult.success ? 'save-success' : 'save-failure') : ''}`}
                  >
                    {/* Condition Info */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="condition-info">
                          <span className="condition-icon">{conditionDef.icon}</span>
                          <span className="condition-name">{conditionDef.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="condition-tooltip">
                        <p className="condition-tooltip-desc">{conditionDef.primaryEffect}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Save Result Display (shown after rolling) */}
                    <AnimatePresence>
                      {saveResult && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className={`save-result ${saveResult.success ? 'success' : 'failure'}`}
                        >
                          <span className="save-roll">🎲 {saveResult.roll}</span>
                          <span className="save-status">
                            {saveResult.success ? '✓' : '✗'}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Controls (hidden during save result display) */}
                    {!saveResult && (
                      <>
                        {/* Roll Save Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="condition-roll-btn"
                              onClick={() => handleRollSave(activeCondition.conditionId)}
                              aria-label={`Roll save for ${conditionDef.name}`}
                            >
                              <Dices className="w-3 h-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Roll Save (6+ on d10)
                          </TooltipContent>
                        </Tooltip>

                        {/* End Type Toggle Selector */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="condition-end-type">
                              <Select
                                value={endType}
                                onValueChange={(value: ConditionEndType) =>
                                  onUpdateConditionEndType(activeCondition.conditionId, value)
                                }
                              >
                                <SelectTrigger
                                  className="end-type-trigger"
                                  data-end-type={endType}
                                >
                                  <SelectValue>
                                    {endTypeConfig.shortLabel}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="end-type-content">
                                  <SelectItem value="eot" className="end-type-item">
                                    <div className="end-type-option">
                                      <span
                                        className="end-type-label"
                                        style={{ color: END_TYPE_CONFIG.eot.color }}
                                      >
                                        EoT
                                      </span>
                                      <span className="end-type-desc">
                                        End of Turn
                                      </span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="roll" className="end-type-item">
                                    <div className="end-type-option">
                                      <span
                                        className="end-type-label"
                                        style={{ color: END_TYPE_CONFIG.roll.color }}
                                      >
                                        Roll
                                      </span>
                                      <span className="end-type-desc">
                                        Save (6+ on d10)
                                      </span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="manual" className="end-type-item">
                                    <div className="end-type-option">
                                      <span
                                        className="end-type-label"
                                        style={{ color: END_TYPE_CONFIG.manual.color }}
                                      >
                                        —
                                      </span>
                                      <span className="end-type-desc">
                                        Manual
                                      </span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {endTypeConfig.description}
                          </TooltipContent>
                        </Tooltip>

                        {/* Remove Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="condition-remove-btn"
                              onClick={() => onRemoveCondition(activeCondition.conditionId)}
                              aria-label={`Remove ${conditionDef.name}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Remove</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Add Condition Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="add-condition-btn"
              disabled={availableToAdd.length === 0}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="dropdown-fantasy conditions-dropdown">
            {availableToAdd.map((condition) => {
              const defaultEndType = getDefaultEndType(condition.id);
              return (
                <DropdownMenuItem
                  key={condition.id}
                  onClick={() => onAddCondition(condition.id)}
                  className="condition-menu-item"
                >
                  <span className="condition-menu-icon">{condition.icon}</span>
                  <span className="condition-menu-name">{condition.name}</span>
                  <span className="condition-menu-end-hint">
                    {END_TYPE_CONFIG[defaultEndType].shortLabel}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ConditionsCard;
