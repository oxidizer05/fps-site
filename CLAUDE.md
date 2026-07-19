# CLAUDE.md

Also follow the general engineering rules in CLAUDE_ENGINEERING.md.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: fps-site

Static site for **FPS Girls** — a women's esports community covering CS2, R6S, Tarkov Arena, Valorant, and Apex Legends. No build step.

- `index.html` — the production landing page (plain HTML/CSS + small vanilla-JS i18n): header with avatar and EN/RU language switcher (English default, choice saved to localStorage, translations in the inline `I18N` object), hero banner image, game badges, feature list, Faceit hub CTA, social links. Responsive: mobile card layout below 900px, wide (~1080px) grid layout above.
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
