# CLAUDE.md

Also follow the general engineering rules in CLAUDE_ENGINEERING.md.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: fps-site

Static site for **FPS Girls** — a women's esports community covering CS2, R6S, Tarkov Arena, Valorant, and Apex Legends. No build step.

- `index.html` — the production landing page (plain HTML/CSS + small vanilla-JS i18n): header with avatar and EN/RU language switcher (English default, choice saved to localStorage, translations in the inline `I18N` object), hero banner image, game badges, feature list, Faceit hub CTA, social links. Responsive: mobile card layout below 900px, wide (~1080px) grid layout above.
- `leaderboard.html` — women's FACEIT ranking (plain HTML/CSS + vanilla JS, same design tokens/i18n pattern as index). Fetches **same-origin `world.json`** (relative URL) and renders a top-3 podium + full table (ELO, level, winrate, K/D, matches) with CS2/R6 tabs, nickname search, EN/RU. Screenshot-friendly for Telegram posts; linked from `index.html` via a secondary CTA. `?data=` query overrides the source for testing. No external API / no Railway / no CORS. (An earlier attempt fetched the bot's Railway `/api/world`, but Railway public networking would not route — switched to a static file refreshed on GitHub. The bot still keeps its own `/world` data internally for Discord commands.)
- `world.json` — the ranking data the page reads. Committed to the repo so the page works immediately; refreshed daily by a GitHub Action. Currently ~127 players (CS2), R6 has only ~3 so its tab auto-hides.
- `scripts/build-world.mjs` — Node (no deps, global fetch) collector: writes `world.json`. Needs env `FACEIT_API_KEY` (+ optional `FACEIT_HUB_ID`). Run locally: `FACEIT_API_KEY=… node scripts/build-world.mjs`. **The hub contains men too** — club admins mark verified girls with hub roles `FPS Girls CS` / `FPS Girls R6` / `FPS Girls Valorant`, so the collector reads `GET /hubs/{id}/roles`, keeps only members holding one of those roles (127 of 347), and aborts rather than publishing an unfiltered roster if no such role is found. Per CS2 player it stores elo/level/region + lifetime `winRate`, `kd`, `matches`, `wins`, `entry` (Entry Rate), `clutch` ((1v1+1v2)/rounds), `util` (Utility Damage per Round), `sniper` (Sniper Kill Rate), `hs` (Avg Headshots %). The page derives 0–100 indices client-side: stability, aggression=entry, survival=clutch, grenade=util, awp=sniper, headshot=hs. NOTE: FACEIT exposes no knife or grenade-KILL data at any level (lifetime, segments, or per-match) — the "nade master" column uses utility DAMAGE instead. Desktop widens `.page` to 1200px (≥1024px) to fit all ~13 columns without horizontal scroll; index columns hide on mobile unless actively sorted.
- `.github/workflows/update-world.yml` — runs the collector daily (cron 03:17 UTC) and on manual dispatch, commits `world.json` if changed. Requires repo secret **`FACEIT_API_KEY`** (Settings → Secrets and variables → Actions). Note: the workflow uses a FACEIT server-side key via encrypted secret; the produced `world.json` holds only public data (nicknames, ELO, country).
- `telegram-feed.html` — legacy Telegram channel feed mockup (React 18 + Babel standalone via CDN, all inline): `CS2MatchCard`, `R6SPatchCard`, `TournamentCard` components, shared `Badge`/`Divider`/`ActionBar` primitives, design tokens in the `C` object.

## Deployment

Live at **https://fpsgirls.com/** via GitHub Pages:

- Repo: `oxidizer05/fps-site`, Pages serves branch `main`, root. Custom domain set via `CNAME` file (do not delete it).
- DNS is on **Cloudflare**, proxied (orange cloud): 4× A `@ → 185.199.108-111.153`, CNAME `www → oxidizer05.github.io`. TLS is terminated by Cloudflare.
- Deploying = push to `main`; Pages rebuilds in ~1 minute. Technical URL: https://oxidizer05.github.io/fps-site/
- Before Feb 2026 the domain pointed to a Tilda site (behind DDoS-Guard); it was switched to GitHub Pages on 2026-07-18.

## Dev Server

Defined in `.claude/launch.json`, served via `npx serve` on port **3456**. Use the `preview_start` tool with name `fps-site` to launch it.

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
- `assets/hero-banner.jpg` — header banner (generated with GPT Image 2, 1600px web version)
- `assets/hub-team.jpg` — team photo above the Faceit CTA (same origin)
- `assets/hero-banner.png`, `assets/hub-team.png` — full-res originals, not referenced by the site (kept for social media reuse)
