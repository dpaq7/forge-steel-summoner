import * as React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Info,
  Swords,
  Tent,
  Plus,
  Download,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';
import { ThemeSelector } from '@/components/theme';

import type { Hero } from '@/types/hero';

interface DashboardHeaderProps {
  hero: Hero | null;
  isInCombat: boolean;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onRespite: () => void;
  onManageCharacters: () => void;
  onCreateCharacter: () => void;
  onShowAbout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  hero,
  isInCombat,
  onStartCombat,
  onEndCombat,
  onRespite,
  onManageCharacters,
  onCreateCharacter,
  onShowAbout,
}) => {
  const classDisplayName = hero?.heroClass
    ? hero.heroClass.charAt(0).toUpperCase() + hero.heroClass.slice(1)
    : '';

  return (
    <header className="dashboard-header">
      {/* Left: Logo + Character */}
      <div className="dashboard-header-left">
        <motion.h1
          className="dashboard-logo"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Mettle
        </motion.h1>

        {hero && (
          <>
            <div className="dashboard-separator" />

            {/* Character Info */}
            <div className="dashboard-character">
              {hero.portraitUrl ? (
                <img
                  src={hero.portraitUrl}
                  alt={hero.name}
                  className="dashboard-avatar"
                />
              ) : (
                <div className="dashboard-avatar dashboard-avatar-fallback">
                  {hero.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="dashboard-character-info">
                <span className="dashboard-character-name">{hero.name}</span>
                <div className="dashboard-character-meta">
                  <Badge variant="outline" className="dashboard-badge level">
                    Lv {hero.level}
                  </Badge>
                  <Badge variant="secondary" className="dashboard-badge class">
                    {classDisplayName}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="dashboard-header-right">
        {/* Combat Toggle */}
        {hero && (
          <Tooltip>
            <TooltipTrigger asChild>
              {isInCombat ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onEndCombat}
                  className="dashboard-combat-btn active"
                >
                  <Swords className="w-4 h-4" />
                  <span>End Combat</span>
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onStartCombat}
                  className="dashboard-combat-btn draw-steel"
                >
                  <Swords className="w-4 h-4" />
                  <span>Draw Steel!</span>
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isInCombat ? 'End the current combat' : 'Begin combat encounter'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Respite */}
        {hero && !isInCombat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRespite}
                className="dashboard-icon-btn respite"
              >
                <Tent className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Take a Respite</TooltipContent>
          </Tooltip>
        )}

        <div className="dashboard-separator" />

        {/* Characters Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="dashboard-icon-btn">
                  <Users className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Characters</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="dropdown-fantasy">
            <DropdownMenuItem onClick={onManageCharacters}>
              <Users className="w-4 h-4 mr-2" />
              Manage Characters
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateCharacter}>
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Selector */}
        <ThemeSelector />

        {/* About */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowAbout}
              className="dashboard-icon-btn"
            >
              <Info className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">About Mettle</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};

export default DashboardHeader;
