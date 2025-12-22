# Mettle

> A comprehensive character manager for [Draw Steel](https://mcdm.gg/DrawSteel) TTRPG by MCDM Productions.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Version](https://img.shields.io/badge/version-0.5.0_Beta-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-76_passing-success.svg)]()
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.9-FFC131?logo=tauri&logoColor=white)](https://tauri.app/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

## Features

- **All 10 Hero Classes**: Full support for Censor, Conduit, Elementalist, Fury, Null, Shadow, Summoner, Tactician, Talent, and Troubadour
- **Character Creation**: Step-by-step wizard for ancestry, culture, career, and class selection
- **Combat Tracker**: Stamina, conditions, heroic resources, and action economy
- **Class-Specific Views**: Specialized interfaces for each class's unique mechanics
- **Minion Management**: Full squad and portfolio system for Summoners
- **Progression Tracking**: Level-up flow with feature unlocks and ability choices
- **Theme System**: Multiple color themes with class-specific defaults
- **Offline Support**: Works entirely offline after initial load
- **Import/Export**: Save and share characters as JSON files
- **Desktop App**: Optional native desktop application via Tauri

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 19.2 | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type-safe JavaScript |
| [Vite](https://vitejs.dev/) | 7.2 | Build tool & dev server |

### UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| [shadcn/ui](https://ui.shadcn.com/) | - | Component library |
| [Radix UI](https://www.radix-ui.com/) | 1.x | Accessible primitives |
| [Motion](https://motion.dev/) | 12.18 | Animation library |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1 | Utility-first CSS |
| [Lucide React](https://lucide.dev/) | 0.513 | Icon library |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| [Sass/SCSS](https://sass-lang.com/) | 1.94 | CSS preprocessor |
| CSS Custom Properties | - | Design tokens & theming |
| [Google Fonts](https://fonts.google.com/) | - | Typography (Cinzel, Source Sans 3) |
| [class-variance-authority](https://cva.style/) | 0.7 | Component variant styling |

### Desktop Application
| Technology | Version | Purpose |
|------------|---------|---------|
| [Tauri](https://tauri.app/) | 2.9 | Native desktop wrapper |
| [Rust](https://www.rust-lang.org/) | 1.77+ | Tauri backend runtime |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| [Vitest](https://vitest.dev/) | 3.2 | Unit testing framework |
| [React Testing Library](https://testing-library.com/) | 16.3 | Component testing |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| [ESLint](https://eslint.org/) | 9.39 | Code linting |
| [TypeScript-ESLint](https://typescript-eslint.io/) | 8.46 | TS-specific linting rules |

### Data & Storage
| Technology | Purpose |
|------------|---------|
| localStorage | Client-side data persistence |
| JSON | Character import/export format |

### Architecture Highlights

- **Component-Based**: Modular React components organized by feature
- **shadcn/ui Integration**: Accessible, customizable UI components with fantasy theming
- **Context API**: State management via React Context (HeroContext, CombatContext, ThemeContext)
- **Custom Hooks**: Reusable logic (useSquads, useEssence, useConditions, etc.)
- **CSS Architecture**: BEM-inspired naming with CSS custom properties for theming
- **Offline-First**: Full functionality without internet after initial load
- **Type Safety**: Strict TypeScript with comprehensive interface definitions

### shadcn/ui Components

Custom fantasy-themed variants built on Radix UI primitives:

| Component | Variants | Usage |
|-----------|----------|-------|
| Button | `heroic`, `combat`, `chamfered`, `diamond`, `hexagon` | Actions throughout app |
| Dialog | `fantasy`, `scroll` | Modals (LevelUp, CharacterManager, ItemSelector) |
| Select | `fantasy` | Dropdowns (theme, equipment slots) |
| Input/Textarea | `fantasy` | Form fields |
| Tabs | `line`, `enclosed`, `soft` | Navigation (abilities, inventory) |
| Badge | `tier1`, `tier2`, `tier3`, `keyword` | Status indicators |
| DropdownMenu | `fantasy` | Context menus (theme selector) |
| AlertDialog | `fantasy` | Confirmations (respite, delete) |
| Tooltip | - | Help text |
| ScrollArea | - | Scrollable containers |

### Project Structure

```
src/
├── components/          # React components by feature
│   ├── abilities/       # Abilities tab components
│   ├── character/       # Character sheet components
│   ├── classDetails/    # Class-specific views (Null, Talent, etc.)
│   ├── combat/          # Combat management
│   ├── creation/        # Character creator
│   ├── inventory/       # Equipment & items
│   ├── shared/          # Reusable UI components
│   └── ui/
│       └── shadcn/      # shadcn/ui components (Button, Dialog, etc.)
├── context/             # React Context providers
├── data/                # Static game data & class definitions
├── hooks/               # Custom React hooks
├── styles/              # Global styles & theme variables
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Scripts

```bash
# Development
npm run dev          # Start Vite dev server

# Production
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build

# Desktop App
npm run tauri:dev    # Run Tauri in development
npm run tauri:build  # Build native desktop app

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Installation

### Pre-built App (macOS)

Download the latest `.dmg` from the Releases page. Works on both Intel and Apple Silicon Macs.

### Development

Requires Node.js 18+ and npm 9+. Rust toolchain required for Tauri builds.

```bash
# Clone the repository
git clone https://github.com/dpaq7/mettle.git
cd mettle

# Install dependencies
npm install

# Start development server
npm run dev

# Or run with Tauri (desktop)
npm run tauri:dev
```

### Building

```bash
# Web build
npm run build

# Desktop build (requires Rust)
npm run tauri build -- --target universal-apple-darwin
```

## Version History

### v0.5.0 Beta (Current)
Ship-ready release with test infrastructure and major refactoring:
- **Test Infrastructure**: Vitest + React Testing Library with 76 passing tests
- **Error Boundaries**: Crash protection for critical components
- **Debounced Auto-save**: Optimized character persistence (500ms delay)
- **Production Logger**: Environment-aware logging with scoped contexts
- **Custom Hooks**: Extracted reusable logic (useDiceRolling, useTurnTracking, useConditionManagement, useCharacterManagement)
- **Step Components**: Modular character creation flow
- **All Class Panels Complete**: Functional mechanics for all 10 classes (Judgment Actions, Prayer, Strain, Mark Effects, etc.)

### Previous Releases
- **v0.4.93** - Add Rapid-Fire kit, remove unofficial kits
- **v0.4.92** - Ancestry point-buy trait selection system
- **v0.4.91** - Data structure updates and UI improvements
- **v0.4.9** - Fix skills display in Character tab
- **v0.4.8** - Character creator UX improvements
- **v0.4.7** - Summoner combat improvements, Crimson Veil theme
- **v0.4.6** - Summoner fixture mechanics, minion card improvements
- **v0.4.5** - Combat tracker enhancements
- **v0.4.4** - Condition end types, 5 color themes, pinnable stats
- **v0.4.0** - Complete shadcn/ui migration with fantasy theming
- **v0.3.x** - Class progression, ability widgets, hero class system
- **v0.3.0** - Full Draw Steel support for all 10 classes
- **v0.2.x** - Forge Steel Summoner
- **v0.1.x** - Initial development

## Attribution

**Mettle** is a fork of [Forge Steel](https://github.com/andyaiken/forgesteel), originally created by [Andy Aiken](https://github.com/andyaiken). We gratefully acknowledge Andy's foundational work that made this project possible.

## Legal

**Mettle** is an independent product published under the [DRAW STEEL Creator License](https://www.mcdmproductions.com/draw-steel-creator-license) and is not affiliated with MCDM Productions, LLC.

**DRAW STEEL** © 2024 MCDM Productions, LLC.

For more information about Draw Steel, visit [MCDM Productions](https://www.mcdmproductions.com).

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

This is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

### Third-Party Acknowledgments

- **Forge Steel** by Andy Aiken - Original codebase ([GPL v3 License](https://github.com/andyaiken/forgesteel/blob/main/LICENSE))
- **Draw Steel** by MCDM Productions - Game content ([Creator License](https://www.mcdmproductions.com/draw-steel-creator-license))
