import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeDefinition } from '../../types/theme';
import './ThemeSelector.css';

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (!isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId as typeof currentTheme);
    setIsOpen(false);
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent, themeId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeSelect(themeId);
    }
  };

  return (
    <div
      className={`theme-selector ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        className="theme-selector__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select theme"
      >
        Themes
      </button>

      <div className={`theme-selector__dropdown ${isOpen ? 'theme-selector__dropdown--open' : ''}`}>
        <div className="theme-selector__header">Select Theme</div>
        <ul className="theme-selector__list" role="listbox" aria-label="Available themes">
          {themes.map((theme) => (
            <ThemeOption
              key={theme.id}
              theme={theme}
              isSelected={currentTheme === theme.id}
              onSelect={() => handleThemeSelect(theme.id)}
              onKeyDown={(e) => handleOptionKeyDown(e, theme.id)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

interface ThemeOptionProps {
  theme: ThemeDefinition;
  isSelected: boolean;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  theme,
  isSelected,
  onSelect,
  onKeyDown,
}) => {
  return (
    <li
      className={`theme-option ${isSelected ? 'theme-option--selected' : ''}`}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      <div className="theme-option__radio">
        {isSelected && <div className="theme-option__radio-dot" />}
      </div>
      <div className="theme-option__content">
        <div className="theme-option__name">{theme.name}</div>
        <div className="theme-option__description">{theme.description}</div>
      </div>
      <div className="theme-option__swatches">
        <div
          className="theme-option__swatch"
          style={{ backgroundColor: theme.previewColors.bg }}
          title="Background"
        />
        <div
          className="theme-option__swatch"
          style={{ backgroundColor: theme.previewColors.primary }}
          title="Primary"
        />
        <div
          className="theme-option__swatch"
          style={{ backgroundColor: theme.previewColors.secondary }}
          title="Secondary"
        />
      </div>
    </li>
  );
};

export default ThemeSelector;
