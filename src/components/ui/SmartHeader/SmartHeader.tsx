import * as React from 'react';
import { useState, useCallback, useEffect, cloneElement, isValidElement } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Info,
  Swords,
  Tent,
  Plus,
  Download,
  Upload,
  Maximize2,
  Minimize2,
} from 'lucide-react';

import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { Separator } from '@/components/ui/shadcn/separator';

import { ThemeSelector } from '@/components/theme';
import { HeaderQuickStats } from './HeaderQuickStats';

import type { SmartHeaderProps } from './types';
import './SmartHeader.css';

// Animation variants - typed for motion/react
const smartHeaderVariants = {
  visible: {
    height: 'auto' as const,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  },
  hidden: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  },
};

const fullPanelVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  },
  visible: {
    height: 'auto' as const,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  },
};

const combatBadgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 25 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const SmartHeader: React.FC<SmartHeaderProps> = ({
  hero,
  isInCombat,
  onStartCombat,
  onEndCombat,
  onRespite,
  onManageCharacters,
  onCreateCharacter,
  onShowAbout,
  onLevelUp,
  onResourceChange,
  onCatchBreath,
  onStaminaChange,
  onRecoveriesChange,
  onVictoriesChange,
  onSurgesChange,
  children,
  resourceConfig,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('headerExpanded');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('headerExpanded', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + Shift + H
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        toggleExpand();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleExpand]);

  // Calculate stamina percentage for visual effects
  const staminaPercent = hero ? (hero.stamina.current / hero.stamina.max) * 100 : 100;
  const isLowHealth = staminaPercent < 25;

  // Get class display name
  const classDisplayName = hero?.heroClass
    ? hero.heroClass.charAt(0).toUpperCase() + hero.heroClass.slice(1)
    : '';

  // Clone children and inject props (for CharacterStatsPanel)
  // Note: onMinimize is NOT passed - minimize button is in the header bar
  const childrenWithProps =
    children && isValidElement(children)
      ? cloneElement(children, { onLevelUp } as any)
      : children;

  return (
    <TooltipProvider delayDuration={300}>
      <header className={`smart-header-container ${isInCombat ? 'combat-mode' : ''}`}>
        {/* === COLLAPSED: Smart Header Row === */}
        <AnimatePresence initial={false}>
          {!isExpanded && (
            <motion.div
              className={`smart-header ${isLowHealth && hero ? 'low-health' : ''}`}
              variants={smartHeaderVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="header-row">
                {/* Left Section: Logo + Character Info */}
                <div className="header-left">
                  <motion.h1
                    className="app-logo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Mettle
                  </motion.h1>

                  {hero && (
                    <>
                      <Separator orientation="vertical" className="header-separator" />

                      {/* Character Avatar & Name */}
                      <div className="character-quick">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.button
                              className="avatar-button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={toggleExpand}
                            >
                              {hero.portraitUrl ? (
                                <img
                                  src={hero.portraitUrl}
                                  alt={hero.name}
                                  className="header-avatar"
                                />
                              ) : (
                                <div className="header-avatar header-avatar-fallback">
                                  {hero.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            Click to expand full stats
                          </TooltipContent>
                        </Tooltip>

                        <div className="character-info">
                          <span className="character-name">{hero.name}</span>
                          <div className="character-meta">
                            <Badge variant="outline" size="sm" className="level-badge">
                              Lv {hero.level}
                            </Badge>
                            <Badge variant="secondary" size="sm" className="class-badge">
                              {classDisplayName}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Center Section: Quick Stats */}
                {hero && (
                  <div className="header-center">
                    <HeaderQuickStats
                      stamina={hero.stamina}
                      recoveries={hero.recoveries}
                      recoveryValue={hero.recoveries.value}
                      heroicResource={{
                        current: hero.heroicResource?.current ?? 0,
                        name: resourceConfig.name,
                        abbreviation: resourceConfig.abbreviation,
                        color: resourceConfig.color,
                        minValue: resourceConfig.minValue,
                      }}
                      surges={hero.surges}
                      victories={hero.victories}
                      isInCombat={isInCombat}
                      heroClass={hero.heroClass}
                      onResourceChange={onResourceChange}
                      onCatchBreath={onCatchBreath}
                      onVictoriesChange={onVictoriesChange}
                      onStaminaChange={onStaminaChange}
                    />

                    {/* Combat Status Badge */}
                    <AnimatePresence mode="wait">
                      {isInCombat && (
                        <motion.div
                          variants={combatBadgeVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          <Badge variant="destructive" className="combat-badge">
                            <Swords className="w-3 h-3 mr-1" />
                            COMBAT
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Right Section: Actions */}
                <div className="header-right">
                  {/* Combat Toggle - "Draw Steel!" */}
                  {hero && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {isInCombat ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={onEndCombat}
                            className="header-action-btn combat-btn"
                          >
                            <Swords className="w-4 h-4" />
                            <span>End Combat</span>
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={onStartCombat}
                            className="header-action-btn combat-btn draw-steel"
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

                  {/* Respite Button */}
                  {hero && !isInCombat && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onRespite}
                          className="header-icon-btn respite-btn"
                        >
                          <Tent className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Take a Respite</TooltipContent>
                    </Tooltip>
                  )}

                  <Separator orientation="vertical" className="header-separator" />

                  {/* Characters Dropdown */}
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="header-action-btn">
                            <Users className="w-4 h-4" />
                            <span>Characters</span>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Manage Characters</TooltipContent>
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

                  {/* About Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={onShowAbout} className="header-action-btn">
                        <Info className="w-4 h-4" />
                        <span>About</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">About Mettle</TooltipContent>
                  </Tooltip>

                  {/* Expand Button (only when hero exists) */}
                  {hero && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleExpand}
                          className="expand-toggle"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Expand Full Stats</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === EXPANDED: Full Stats Panel === */}
        <AnimatePresence initial={false}>
          {isExpanded && hero && (
            <motion.div
              className="full-stats-panel"
              variants={fullPanelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Minimal header bar - Logo, character info, utility buttons only */}
              {/* NO combat/respite buttons - they exist in CharacterStatsPanel */}
              <div className="expanded-header-bar">
                <h1 className="app-logo">Mettle</h1>

                <div className="expanded-header-center">
                  <span className="expanded-character-name">{hero.name}</span>
                  <Badge variant="outline" size="sm" className="level-badge">
                    Lv {hero.level}
                  </Badge>
                  <Badge variant="secondary" size="sm" className="class-badge">
                    {classDisplayName}
                  </Badge>

                  {isInCombat && (
                    <Badge variant="destructive" className="combat-badge">
                      <Swords className="w-3 h-3 mr-1" />
                      COMBAT
                    </Badge>
                  )}
                </div>

                {/* Utility actions only - NO combat/respite */}
                <div className="expanded-header-actions">
                  {/* Characters Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="header-icon-btn" aria-label="Characters menu">
                        <Users className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
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

                  <ThemeSelector />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onShowAbout}
                        className="header-icon-btn"
                        aria-label="About"
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">About Mettle</TooltipContent>
                  </Tooltip>

                  {/* Minimize Button - same position as expand button in collapsed state */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleExpand}
                        className="expand-toggle"
                        aria-label="Minimize header"
                      >
                        <Minimize2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Minimize to Smart Header</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Full Character Stats Panel */}
              <div className="full-stats-content">
                {childrenWithProps}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === NO HERO: Just show header row with limited actions === */}
        {!hero && !isExpanded && (
          <div className="header-row">
            <div className="header-left">
              <motion.h1
                className="app-logo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mettle
              </motion.h1>
            </div>

            <div className="header-right">
              {/* Characters Dropdown */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="header-action-btn">
                        <Users className="w-4 h-4" />
                        <span>Characters</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Manage Characters</TooltipContent>
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

              {/* About Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onShowAbout} className="header-action-btn">
                    <Info className="w-4 h-4" />
                    <span>About</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">About Mettle</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </header>
    </TooltipProvider>
  );
};

export default SmartHeader;
