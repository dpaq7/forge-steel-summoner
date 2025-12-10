import React from 'react';
import './CircularTracker.css';

interface CircularTrackerProps {
  stamina: { current: number; max: number };
  recoveries: { current: number; max: number };
}

const CircularTracker: React.FC<CircularTrackerProps> = ({ stamina, recoveries }) => {
  // Calculate percentages for the arcs
  const staminaPercent = (stamina.current / stamina.max) * 100;
  const recoveriesPercent = (recoveries.current / recoveries.max) * 100;

  // SVG circle parameters
  const size = 200;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash offset for each arc
  const staminaDashOffset = circumference - (staminaPercent / 100) * circumference;
  const recoveriesDashOffset = circumference - (recoveriesPercent / 100) * circumference;

  return (
    <div className="circular-tracker">
      <svg width={size} height={size} className="tracker-svg">
        {/* Background circles */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth - 4}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />

        {/* Stamina arc (outer) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#4fc3f7"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={staminaDashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="tracker-arc"
        />

        {/* Recoveries arc (inner) */}
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth - 4}
          fill="none"
          stroke="#4fc3f7"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={recoveriesDashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="tracker-arc"
        />
      </svg>

      <div className="tracker-text">
        <div className="tracker-value">
          <span className="label">Sta</span> {stamina.current}
        </div>
        <div className="tracker-divider">—</div>
        <div className="tracker-value">
          <span className="label">Rec</span> {recoveries.current}
        </div>
      </div>
    </div>
  );
};

export default CircularTracker;
