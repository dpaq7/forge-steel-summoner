# Forge Steel Summoner

A desktop companion app for **Draw Steel** Summoner class characters. Built with React, TypeScript, and Tauri for native macOS support.

## Features

- **Character Creation & Management** - Create and manage Summoner heroes
- **Portfolio System** - Elemental, Demon, and Undead minion portfolios
- **Combat Tracker** - Track minions, conditions, and stamina in combat
- **Power Rolls** - 2d10 power roll system with edge/bane support
- **Magic Items** - Equip items with automatic stat bonus tracking
- **Projects** - Track crafting and research projects
- **Inventory** - Equipment slots with visual bonus indicators

## Installation

### Pre-built App (macOS)

Download the latest `.dmg` from the Releases page. Works on both Intel and Apple Silicon Macs.

### Development

Requires Node.js and Rust toolchain.

```bash
# Install dependencies
npm install

# Run in development
npm run tauri:dev

# Build for production
npm run tauri build -- --target universal-apple-darwin
```

## Attribution

This project is a fork of [Forge Steel](https://github.com/andyaiken/forgesteel) by Andy Aiken, adapted specifically for the Summoner class with a native desktop experience via Tauri.

**Draw Steel** is a tabletop roleplaying game by MCDM Productions.

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

This is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
