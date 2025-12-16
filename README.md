# Mettle

> A comprehensive character manager for [Draw Steel](https://mcdm.gg/DrawSteel) TTRPG by MCDM Productions.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Version](https://img.shields.io/badge/version-0.3.5-green.svg)]()

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

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| [Sass/SCSS](https://sass-lang.com/) | 1.94 | CSS preprocessor |
| CSS Custom Properties | - | Design tokens & theming |
| [Google Fonts](https://fonts.google.com/) | - | Typography (Cinzel, Source Sans 3) |

### Desktop Application
| Technology | Version | Purpose |
|------------|---------|---------|
| [Tauri](https://tauri.app/) | 2.9 | Native desktop wrapper |
| [Rust](https://www.rust-lang.org/) | 1.77+ | Tauri backend runtime |

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
- **Context API**: State management via React Context (HeroContext, CombatContext, ThemeContext)
- **Custom Hooks**: Reusable logic (useSquads, useEssence, useConditions, etc.)
- **CSS Architecture**: BEM-inspired naming with CSS custom properties for theming
- **Offline-First**: Full functionality without internet after initial load
- **Type Safety**: Strict TypeScript with comprehensive interface definitions

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
│   └── ui/              # Base UI elements
├── context/             # React Context providers
├── data/                # Static game data & class definitions
├── hooks/               # Custom React hooks
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

# Code Quality
npm run lint         # Run ESLint
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

- **v0.3.5** - Class progression system, stamina/dying fixes, UI improvements
- **v0.3.4** - Class ability widgets, legal attribution modal, theme fixes
- **v0.3.3** - Standardize hero class system, rename context to HeroContext
- **v0.3.0** - Mettle: Full Draw Steel support for all 10 classes
- **v0.2.x** - Forge Steel Summoner: Summoner-focused character manager
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
