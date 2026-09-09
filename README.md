# Warframe Command Center

A mobile-friendly Warframe progression command center built around a daily 6–10 hour planning standard.

## What the MVP does

- Daily planner with persistent checkboxes and phase navigation
- Dashboard with live session progress
- Canonical account-state editor
- Entrati Standing tracker
- Polarity-aware Fulmin Endo Spend Queue
- Exact capacity breakpoint / rearrangement map
- Arsenal checkpoint rules for new gear
- Local screenshot intake + preview + session notes
- JSON export/import so account state is portable
- Responsive layout designed to work well on phone, tablet, and desktop
- Static deployment: no server required for the MVP

## Current seeded account state

- MR5
- Neptune unlocked
- Tyl Regor defeated
- Neptune Junction completed
- Next main objective: The Second Dream
- Entrati Rank 2 Acquaintance: 31,100 / 44,000
- Panzer Vulpaphyla gilding is an active power project
- Wisp + Fulmin are the current main combat package

## Planner operating standard

Every major planner should begin with Pre-Flight Arsenal optimization and an Endo Spend Queue. Any proposed fusion must account for current rank, drain, total capacity, slot polarity, matching discounts, mismatch penalties, elemental ordering, and the exact rearrangement needed when a capacity breakpoint is crossed.

If exact capacity or polarity is unknown, the app/model should instruct the player to bank Endo and capture the Upgrade screen instead of guessing.

## Run locally

This is a static app. Open `index.html` through any static HTTP server.

For example with Python:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy on GitHub Pages

The repository is already structured for static GitHub Pages hosting. In the repository settings, enable **Pages** and choose the `main` branch / repository root as the deployment source.

## Data model

State is stored in the browser under `warframe-command-center-v1`. Use **Export State** to download a JSON backup and **Import State** to restore it.

The reset-session control intentionally clears planner checks and the intake log but preserves canonical account state.

## Screenshot / AI roadmap

The MVP does **not** pretend to OCR or understand screenshots. It can preview them locally and attach a note to the session log.

The next major version should add a secure AI backend so screenshots can be analyzed for:

- owned mods and ranks
- capacity and polarities
- Endo / Credit balance
- weapon / frame / companion state
- Standing screens
- quest / Junction requirements

That backend should return structured state updates which the planner can audit before changing builds or spending resources.

## Planned architecture

1. Static/mobile-first command center UI
2. Structured account-state schema
3. Planner engine driven by account state
4. Mod/capacity solver
5. Screenshot analysis API
6. Current-data verification layer for Wiki / event / market-sensitive facts
7. Optional account login + cloud sync

Warframe and related names are property of Digital Extremes. This project is an independent planning tool and does not attempt to reproduce the game UI pixel-for-pixel.
