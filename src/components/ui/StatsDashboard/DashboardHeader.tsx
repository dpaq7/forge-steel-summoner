import * as React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Info,
  Swords,
  Tent,
  Download,
  Upload,
  UserPlus,
  FolderOpen,
  Copy,
  ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/shadcn/dropdown-menu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/shadcn/tooltip';
import { ThemeSelector } from '@/components/theme';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

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
  // Additional handlers for full menu functionality
  onImportCharacter?: () => void;
  onExportCharacter?: () => void;
  onDuplicateCharacter?: () => void;
  // Portrait upload
  onPortraitChange?: (portraitUrl: string | null) => void;
}

// Format subclass name (capitalize words, handle hyphens)
const formatSubclassName = (subclass: string): string => {
  return subclass
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  hero,
  isInCombat,
  onStartCombat,
  onEndCombat,
  onRespite,
  onManageCharacters,
  onCreateCharacter,
  onShowAbout,
  onImportCharacter,
  onExportCharacter,
  onDuplicateCharacter,
  onPortraitChange,
}) => {
  const classDisplayName = hero?.heroClass
    ? hero.heroClass.charAt(0).toUpperCase() + hero.heroClass.slice(1)
    : '';

  const subclassDisplayName = hero?.subclass
    ? formatSubclassName(hero.subclass)
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
              {/* Clickable Avatar with Portrait Upload */}
              {onPortraitChange ? (
                <AvatarUpload
                  currentPortrait={hero.portraitUrl}
                  characterName={hero.name}
                  onPortraitChange={onPortraitChange}
                  size="md"
                />
              ) : hero.portraitUrl ? (
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
                  {subclassDisplayName && (
                    <Badge
                      variant="secondary"
                      className="dashboard-badge subclass"
                      data-class={hero.heroClass}
                    >
                      {subclassDisplayName}
                    </Badge>
                  )}
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
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="dashboard-characters-btn"
            >
              <Users className="w-4 h-4" />
              <span className="dashboard-btn-text">Characters</span>
              <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="dropdown-fantasy characters-dropdown"
          >
            {/* Current Character Section - only show when hero exists */}
            {hero && (
              <>
                <DropdownMenuLabel className="dropdown-section-label">
                  Current Character
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={onExportCharacter}
                  disabled={!onExportCharacter}
                  className="dropdown-item"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export {hero.name}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onDuplicateCharacter}
                  disabled={!onDuplicateCharacter}
                  className="dropdown-item"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Character
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </>
            )}

            {/* Character Management Section */}
            <DropdownMenuLabel className="dropdown-section-label">
              Character Management
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={onManageCharacters}
              className="dropdown-item"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Manage All Characters
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onCreateCharacter}
              className="dropdown-item"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create New Character
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onImportCharacter}
              disabled={!onImportCharacter}
              className="dropdown-item"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Character
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
