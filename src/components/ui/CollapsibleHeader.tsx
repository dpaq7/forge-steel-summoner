import { useState, useEffect, cloneElement, isValidElement, ReactElement } from 'react';
import CompactStatBar from './CompactStatBar';
import './CollapsibleHeader.css';

interface CompactStatBarData {
  name: string;
  level: number;
  portraitUrl: string | null;
  stamina: { current: number; max: number };
  essence: number;
  recoveries: { current: number; max: number };
  recoveryValue: number;
  surges: number;
  victories: number;
  maxVictories: number;
  characteristics: {
    might: number;
    agility: number;
    reason: number;
    intuition: number;
    presence: number;
  };
  speed: number;
  stability: number;
  isInCombat?: boolean;
  onStartCombat?: () => void;
  onEndCombat?: () => void;
  onRespite?: () => void;
  onEssenceChange?: (newEssence: number) => void;
  onCatchBreath?: (healAmount: number) => void;
  onVictoriesChange?: (newVictories: number) => void;
}

interface CollapsibleHeaderProps {
  children: ReactElement;
  compactData: CompactStatBarData;
  defaultCollapsed?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export const CollapsibleHeader = ({
  children,
  compactData,
  defaultCollapsed = false,
  onCollapseChange,
}: CollapsibleHeaderProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Load preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('headerCollapsed');
    if (saved !== null) {
      const savedValue = JSON.parse(saved);
      setIsCollapsed(savedValue);
      onCollapseChange?.(savedValue);
    }
  }, []);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);

    // Save preference to localStorage
    localStorage.setItem('headerCollapsed', JSON.stringify(newState));
  };

  // Keyboard shortcut: Ctrl/Cmd + Shift + H
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  // Clone children and inject onMinimize prop
  const childrenWithProps = isValidElement(children)
    ? cloneElement(children, { onMinimize: handleToggle } as any)
    : children;

  return (
    <div className={`collapsible-header ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Compact Bar (shown when collapsed) */}
      <div className={`compact-bar-container ${isCollapsed ? 'visible' : 'hidden'}`}>
        <CompactStatBar
          {...compactData}
          onExpand={handleToggle}
        />
      </div>

      {/* Full Header Content (shown when expanded) */}
      <div className={`full-header-container ${isCollapsed ? 'hidden' : 'visible'}`}>
        {childrenWithProps}
      </div>
    </div>
  );
};

export default CollapsibleHeader;
