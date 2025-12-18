import * as React from 'react';
import { motion } from 'motion/react';
import { Palette, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/shadcn/dropdown-menu';
import { Button } from '@/components/ui/shadcn/button';

import { useTheme } from '@/themes/ThemeContext';
import { THEME_LIST } from '@/themes/themes';
import type { Theme } from '@/themes/types';

import './ThemeSelector.css';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { themeId, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`theme-selector-trigger ${className}`}
        >
          <Palette className="w-4 h-4 mr-1.5" />
          Themes
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="theme-selector-dropdown"
      >
        <DropdownMenuLabel className="theme-dropdown-label">
          Choose Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {THEME_LIST.map((theme) => (
          <ThemeMenuItem
            key={theme.id}
            theme={theme}
            isSelected={theme.id === themeId}
            onSelect={() => setTheme(theme.id)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Individual theme menu item
interface ThemeMenuItemProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeMenuItem: React.FC<ThemeMenuItemProps> = ({
  theme,
  isSelected,
  onSelect,
}) => {
  return (
    <DropdownMenuItem
      onClick={onSelect}
      className={`theme-menu-item ${isSelected ? 'selected' : ''}`}
    >
      {/* Color Preview Swatches */}
      <div className="theme-preview">
        <div
          className="theme-swatch bg-swatch"
          style={{ backgroundColor: theme.preview.bg }}
        />
        <div
          className="theme-swatch accent-swatch"
          style={{ backgroundColor: theme.preview.accent }}
        />
        <div
          className="theme-swatch text-swatch"
          style={{ backgroundColor: theme.preview.text }}
        />
      </div>

      {/* Theme Info */}
      <div className="theme-info">
        <span className="theme-name">{theme.name}</span>
        <span className="theme-description">{theme.description}</span>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="theme-selected-indicator"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}
    </DropdownMenuItem>
  );
};

export default ThemeSelector;
