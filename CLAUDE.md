# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: fps-site

Static Telegram channel feed mockup for **FPS Girls** — a women's esports channel covering CS2, R6S, and Tarkov. Single `index.html`, no build step.

## Dev Server

Defined in `fps-site/.claude/launch.json`, served via `npx serve` on port **3456**. Use the `preview_start` tool with name `fps-site` to launch it.

## Architecture

`fps-site/index.html` — the entire app. React 18 + Babel standalone (CDN), all logic inline. No external component files are loaded at runtime.

Three post card components, each self-contained:
- `CS2MatchCard` — match result with score, stats row, collapsible action bar
- `R6SPatchCard` — patch notes with BUFF/NERF/FIX badges and expand toggle
- `TournamentCard` — leaderboard with progress bars and prize info

Shared primitives: `Badge`, `Divider`, `ActionBar`. Design tokens in the `C` object at the top of the script.

## Design Tokens

```js
accent:       '#CE61DF'   // purple — primary brand color
accentGlow:   'rgba(206,97,223,0.30)'
accentSubtle: 'rgba(206,97,223,0.12)'
bg:           '#0D0D0D'
surface:      '#111111'   // card background
border:       'rgba(255,255,255,0.08)'
borderAccent: 'rgba(206,97,223,0.40)'  // hover state border
gray1:        '#969696'   // body text / labels
```

Font: **Montserrat** (local, `fonts/`), weights 200–900 all available.

## Assets

- `fonts/Montserrat-{weight}.ttf` — full family, referenced via `@font-face`
- `assets/logo.jpg` — channel avatar
