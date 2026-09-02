# CLAUDE.md

Also follow the general engineering rules in CLAUDE_ENGINEERING.md.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: fps-site

Static site for **FPS Girls** — a women's esports community covering CS2, R6S, Tarkov Arena, Valorant, and Apex Legends. No build step.

## FPS Girls ecosystem (managed together)

This site is one of three linked FPS Girls projects; the owner runs them together.
- **This site** — `fps-site` (this repo) → fpsgirls.com (GitHub Pages + Cloudflare).
- **Discord bot** — `../fps-girls-discord-bot` (repo `oxidizer05/fps-girls-discord-bot`, Node, Railway): moderation, onboarding, FACEIT `/world`, feeds. Its `/world` uses the **same FACEIT hub + "FPS Girls" role filter** as this site's leaderboard (`scripts/build-world.mjs`).
- **Telegram news bot** — `../fps-girls-bot` (repo `oxidizer05/fps-girls-bot`, Python, Railway) — unrelated code, same community/brand.

Shared brand: `#CE61DF`, Montserrat, dark theme. Owner is a coding beginner — explain simply, commit `fix/feat/chore`, never commit secrets.

- `index.html` — the production landing page (plain HTML/CSS + small vanilla-JS i18n): header with avatar and EN/RU language switcher (English default, choice saved to localStorage, translations in the inline `I18N` object), hero banner image, game badges, feature list, three CTAs (Faceit hub → Discord → ranking, with a "how to join" link under the Discord one), social links (Discord first). Responsive: mobile card layout below 900px, wide (~1080px) grid layout above.
- `join.html` — the funnel page (`/join`, same tokens/i18n pattern, no build step). Two tracks selected by a pair of cards and deep-linkable as `join.html#player` / `#coach` (also `?track=`): **player** (girl who wants into the ranking) and **coach/captain** (looking for players). Steps, hint and FAQ live in the inline `CONTENT` object per language and are rendered by `renderSteps()` / `renderFaq()`; static labels are in `I18N`. The player track mirrors the real community flow — Discord invite → rules gate → roles in `#start-here` → girl verification ("Роль девушки" button, moderator review) → join the FACEIT hub → **a club admin grants the `FPS Girls CS/R6/Valorant` hub role, which is what the ranking collector filters on**. Keep these steps in sync with the Discord bot's onboarding (`../fps-girls-discord-bot`, its CLAUDE.md sections 8–11) — if the bot's buttons or channels are renamed, this page lies.
- **Discord invite** `https://discord.gg/jMmutFF` is hardcoded in three files (`index.html`, `leaderboard.html`, `join.html`), each marked with a comment. If the invite ever changes, grep for `discord.gg` and replace all three.
- `leaderboard.html` — women's FACEIT ranking (plain HTML/CSS + vanilla JS, same design tokens/i18n pattern as index). Fetches **same-origin `world.json`** (relative URL) and renders a top-3 podium + full table (ELO, level, winrate, K/D, matches) with CS2/R6 tabs, nickname search, EN/RU. Screenshot-friendly for Telegram posts; linked from `index.html` via a secondary CTA. Below the table sits the `.join` block ("Want to be in this ranking?") with buttons to `join.html#player`, `join.html#coach` and the Discord invite — the page used to be a dead end. `?data=` query overrides the source for testing. No external API / no Railway / no CORS. (An earlier attempt fetched the bot's Railway `/api/world`, but Railway public networking would not route — switched to a static file refreshed on GitHub. The bot still keeps its own `/world` data internally for Discord commands.)
- `tournaments.html` + `videos.json` — the tournaments/videos page (`/tournaments`): game tabs, and inside each game the sections **Турниры / Ивенты / Интервью**. Data is hand-curated in `videos.json` (YouTube video `id`, optional `list` for playlists, `category`, `title`); thumbnails come from `i.ytimg.com/vi/<id>/hqdefault.jpg`, so no API key is needed. Games with no videos are not rendered at all. Reached from the landing's «Женские турниры» card.
- **Landing layout (31.07.2026)**: the CTA buttons sit right under the hero, above everything else — before that the first button started at y=938 on mobile and y=1609 on desktop, i.e. below the fold. The banner is a cropped strip (`max-height` + `object-fit: cover`), and on ≥900px the three buttons form a row. All three are now visible without scrolling down to 667px-tall screens. Don't push content above the buttons again.
- **«Поиск игроков» opens a game sheet**, and every game button links to `join.html?game=…` — the Telegram chat links are deliberately NOT on the site: the Discord bot DMs them only after girl verification. The site cannot pass the chosen game into Discord (invites carry no parameters), so the real choice is the game role picked in Discord.
- `support.html` + `donations.json` — страница сбора на турнир (`/support`, та же схема токенов/i18n, без сборки). Шкала цели рисуется по `tiers` (промежуточная цель отмечена риской на полосе), донатеры складываются по имени и выводятся подиумом ТОП-3 + списком. **Данные ведутся вручную**: у CloudTips нет открытого API, а обновлять итог нужно редко. Приём денег — CloudTips (Т-Банк): ссылка лежит в `donations.json` → `link`, менять её только там. Комиссия 5-7%, но в форме есть галочка компенсации донатером — поэтому в тексте страницы просим её поставить.
- **Кнопка поддержки в рейтинге** (02.09.2026): рядом с ником может стоять 💜 со ссылкой на площадку поддержки. Данные — `GET /api/support-links` у бота (`supporters.json`, ключ — `playerId`), грузятся отдельно и необязательно: бот молчит — кнопок просто нет. **Только по инициативе самой девушки**: она добавляет ссылку командой `/support link` в Discord (нужны роль `FPS Girls` + привязанный FACEIT + подтверждение 18+) и убирает `/support remove`. Сайт денег не принимает и реквизитов не хранит; в боте белый список площадок (Boosty, CloudTips, DonationAlerts, Donatty, Ko-fi и др.) — номера карт и телефонов не принимаются, чтобы личные данные не попали на публичную страницу. Сколько кому задонатили — **не показываем**: иначе рейтинг мастерства превращается в конкурс популярности.
- `hltv.json` — hand-curated map of FACEIT `player_id` → HLTV profile (`{id, slug}`), rendered as the **HLTV column** in the ranking. Keyed by player_id because nicknames change; the page fetches this file separately from `world.json`, so adding a link shows up immediately with no rebuild. **There is no automated source**: HLTV has no public API and blocks scraping, and Liquipedia's CS infobox doesn't store HLTV ids (checked on AverOna, Juliano, Ant1ka). Найденные профили ищутся вручную через поиск (`site:hltv.org <ник>`) — у большинства участниц профиля нет, он только у тех, кто играл официальные турниры.
- `world.json` — the ranking data the page reads. Rows carry `playerId` (FACEIT id, stable across nickname changes) — that's the join key for `hltv.json`. Committed to the repo so the page works immediately; refreshed daily by a GitHub Action. Currently ~127 players (CS2), R6 has only ~3 so its tab auto-hides.
- `scripts/build-world.mjs` — Node (no deps, global fetch) collector: writes `world.json`. Needs env `FACEIT_API_KEY` (+ optional `FACEIT_HUB_ID`). Run locally: `FACEIT_API_KEY=… node scripts/build-world.mjs`. **The hub contains men too** — club admins mark verified girls with hub roles `FPS Girls CS` / `FPS Girls R6` / `FPS Girls Valorant`, so the collector reads `GET /hubs/{id}/roles`, keeps only members holding one of those roles (127 of 347), and aborts rather than publishing an unfiltered roster if no such role is found. Per CS2 player it stores elo/level/region + lifetime `winRate`, `kd`, `matches`, `wins`, `entry` (Entry Rate), `clutch` ((1v1+1v2)/rounds), `util` (Utility Damage per Round), `sniper` (Sniper Kill Rate), `hs` (Avg Headshots %). The page derives 0–100 indices client-side: stability, aggression=entry, survival=clutch, grenade=util, awp=sniper, headshot=hs. NOTE: FACEIT exposes no knife or grenade-KILL data at any level (lifetime, segments, or per-match) — the "nade master" column uses utility DAMAGE instead. Desktop widens `.page` to 1200px (≥1024px) to fit all ~13 columns without horizontal scroll; index columns hide on mobile unless actively sorted.
- `.github/workflows/update-world.yml` — runs the collector daily (cron 03:17 UTC) and on manual dispatch, commits `world.json` if changed. Requires repo secret **`FACEIT_API_KEY`** (Settings → Secrets and variables → Actions). Note: the workflow uses a FACEIT server-side key via encrypted secret; the produced `world.json` holds only public data (nicknames, ELO, country).
- Visitor counter (footer of `index.html` + `leaderboard.html`): shows total unique visitors and "frequent" (visited on 3+ distinct days). Backed by `cloudflare-worker/counter.js` (Worker + KV) served at same-origin `/api/counter` — see `cloudflare-worker/README.md` for the one-time Cloudflare setup (KV namespace bound as `COUNTER`, route `fpsgirls.com/api/counter*`). Anonymous: a random `fpsg_vid` in localStorage, one "visit" per day per browser (page gates via `fpsg_lastday`). Degrades silently — the footer line stays hidden if the Worker isn't reachable, so local preview / downtime just don't show it. Numbers are approximate (KV isn't atomic).
- `cloudflare-worker/` — the visitor-counter Worker and its setup README. Not part of the static site; deployed separately in Cloudflare.
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
- `favicon.ico` (16/32/48) + `assets/favicon-32.png`, `assets/apple-touch-icon.png` (180), `assets/favicon-192.png` — иконка сайта: белое «FPS» на `#0D0D0D` и пурпурная полоса с «GIRLS», то есть миниатюра логотипа. Отрисована из шрифтов Montserrat (Black для «FPS», Light для «GIRLS») через PIL и уменьшена с 512 px, поэтому края чистые. **На мелких размерах (ico, 32) «GIRLS» намеренно не рисуется** — в 32 px мелкий текст превращается в грязь; сам `assets/logo.jpg` как favicon не годится по той же причине. Ссылки на иконку вставлены во все `*.html` сразу после `</title>` вместе с `theme-color`.
- `assets/logo.jpg` — channel avatar
- `assets/hero-banner.jpg` — header banner (generated with GPT Image 2, 1600px web version)
- `assets/hub-team.jpg` — team photo above the Faceit CTA (same origin)
- `assets/hero-banner.png`, `assets/hub-team.png` — full-res originals, not referenced by the site (kept for social media reuse)
