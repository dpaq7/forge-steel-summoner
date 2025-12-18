import * as React from 'react';
import { TurnTracker } from '@/components/combat/TurnTracker';
import { CLASS_INFO } from './types';
import type { BaseClassViewProps } from './types';
import type { HeroClass } from '@/types/hero';
import './ClassView.css';

interface BaseClassViewWrapperProps extends BaseClassViewProps {
  heroClass: HeroClass;
  children: React.ReactNode;
}

export const BaseClassView: React.FC<BaseClassViewWrapperProps> = ({
  heroClass,
  hero,
  isInCombat,
  turnNumber,
  onEndTurn,
  conditions,
  onRemoveCondition,
  children,
}) => {
  const classInfo = CLASS_INFO[heroClass];

  return (
    <div
      className={`class-view class-view-${heroClass}`}
      style={{ '--class-color': classInfo.primaryColor } as React.CSSProperties}
    >
      {/* Turn Tracker - Only visible during combat */}
      <TurnTracker
        isInCombat={isInCombat}
        turnNumber={turnNumber}
        conditions={conditions}
        onEndTurn={onEndTurn}
        onRemoveCondition={onRemoveCondition}
      />

      {/* Class Header - Shows class icon and resource name */}
      <div className="class-view-header">
        <span className="class-icon">{classInfo.icon}</span>
        <div className="class-header-info">
          <h3 className="class-name">{classInfo.name}</h3>
          <span className="class-resource-name">{classInfo.heroicResource}</span>
        </div>
      </div>

      {/* Class-specific content */}
      <div className="class-view-content">{children}</div>
    </div>
  );
};

export default BaseClassView;
