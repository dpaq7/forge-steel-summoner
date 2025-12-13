import React from 'react';
import { PortraitSettings, PortraitPosition, PortraitBorder } from '../../types/portrait';

interface PortraitControlsProps {
  settings: PortraitSettings;
  onChange: (settings: Partial<PortraitSettings>) => void;
}

const PortraitControls: React.FC<PortraitControlsProps> = ({ settings, onChange }) => {
  return (
    <div className="portrait-controls">
      {/* Opacity Slider */}
      <div className="portrait-controls__slider">
        <label>Opacity</label>
        <input
          type="range"
          min="0.05"
          max="0.5"
          step="0.05"
          value={settings.opacity}
          onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
        />
        <span className="value">{Math.round(settings.opacity * 100)}%</span>
      </div>

      {/* Scale Slider */}
      <div className="portrait-controls__slider">
        <label>Scale</label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.scale}
          onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
        />
        <span className="value">{settings.scale.toFixed(1)}x</span>
      </div>

      {/* Position Toggle */}
      <div className="portrait-controls__toggle-group">
        <label>Position</label>
        <div className="toggle-buttons">
          {(['top', 'center', 'bottom'] as PortraitPosition[]).map((pos) => (
            <button
              key={pos}
              className={`toggle-btn ${settings.position === pos ? 'active' : ''}`}
              onClick={() => onChange({ position: pos })}
            >
              {pos.charAt(0).toUpperCase() + pos.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grayscale Toggle */}
      <div className="portrait-controls__checkbox">
        <label>
          <input
            type="checkbox"
            checked={settings.grayscale}
            onChange={(e) => onChange({ grayscale: e.target.checked })}
          />
          <span>Grayscale</span>
        </label>
      </div>

      {/* Border Style */}
      <div className="portrait-controls__select">
        <label>Border</label>
        <select
          value={settings.border}
          onChange={(e) => onChange({ border: e.target.value as PortraitBorder })}
        >
          <option value="none">None</option>
          <option value="frame">Frame</option>
          <option value="vignette">Vignette</option>
        </select>
      </div>
    </div>
  );
};

export default PortraitControls;
