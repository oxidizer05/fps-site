// Собирает мировой женский рейтинг с FACEIT и пишет world.json в корень сайта.
//
// ВАЖНО: в хабе FPS Girls есть и парни — участниц-девушек администрация
// отмечает ролями «FPS Girls CS / R6 / Valorant». Поэтому в рейтинг попадают
// ТОЛЬКО обладатели такой роли (роль — свойство человека, поэтому годится
// любая из них), а не все участники хаба.
//
// Запускается GitHub Action по расписанию; ключ берётся из секрета
// FACEIT_API_KEY. Локально: FACEIT_API_KEY=... node scripts/build-world.mjs
//
// Формат совпадает с тем, что раньше отдавал бот по /api/world, — страница
// leaderboard.html читает его без изменений.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.FACEIT_API_KEY;
if (!KEY) {
  console.error("Ошибка: не задан FACEIT_API_KEY");
  process.exit(1);
}

const HUB_ID = process.env.FACEIT_HUB_ID || "cd91474f-b1d0-412e-b210-6332dd7833fa";
const GAMES = { cs2: "CS2", rainbow_6: "R6 Siege" };
const CONCURRENCY = 4;
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "world.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function faceitGet(p, tries = 4) {
  for (let i = 0; i < tries; i++) {
    let res;
    try {
      res = await fetch("https://open.faceit.com/data/v4" + p, {
        headers: { Authorization: "Bearer " + KEY },
      });
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(1500 * (i + 1));
      continue;
    }
    if (res.ok) return res.json();
    if (res.status === 404) return null;
    if (res.status === 429) {
      await sleep(2000 * (i + 1));
      continue;
    }
    if (i === tries - 1) throw new Error(`FACEIT ${res.status} на ${p}`);
    await sleep(1000 * (i + 1));
  }
  return null;
}

// Роли хаба, которыми администрация отмечает проверенных девушек
async function fetchGirlRoleIds() {
  const res = await faceitGet(`/hubs/${HUB_ID}/roles?offset=0&limit=50`);
  const items = res?.items ?? [];
  const girls = items.filter((r) => /^fps girls/i.test(r.name ?? ""));
  if (!girls.length) {
    // Лучше упасть, чем опубликовать рейтинг со всем хабом (там есть парни)
    throw new Error(
      `в хабе не найдено ни одной роли вида "FPS Girls …" (есть: ${items.map((r) => r.name).join(", ")})`,
    );
  }
  console.log(`Роли проверенных девушек: ${girls.map((r) => r.name).join(", ")}`);
  return new Set(girls.map((r) => r.role_id));
}

async function fetchHubMembers() {
  const members = [];
  for (let offset = 0; offset < 5000; offset += 50) {
    const page = await faceitGet(`/hubs/${HUB_ID}/members?offset=${offset}&limit=50`);
    const items = page?.items ?? [];
    for (const it of items) {
      members.push({ playerId: it.user_id, nickname: it.nickname, roles: it.roles ?? [] });
    }
    if (items.length < 50) break;
    await sleep(300);
  }
  return members;
}

async function fetchPlayer(playerId) {
  const p = await faceitGet(`/players/${playerId}`);
  if (!p) return null;
  const games = {};
  for (const g of Object.keys(GAMES)) {
    if (!p.games?.[g]) continue;
    games[g] = {
      elo: p.games[g].faceit_elo ?? null,
      level: p.games[g].skill_level ?? null,
      region: p.games[g].region ?? null,
    };
  }
  // Карьерная стата CS2 (winrate / K/D / матчи / победы) — как в старой таблице
  if (games.cs2) {
    try {
      const lt = (await faceitGet(`/players/${playerId}/stats/cs2`))?.lifetime;
      if (lt) {
        games.cs2.matches = lt["Matches"] != null ? Number(lt["Matches"]) : null;
        games.cs2.winRate = lt["Win Rate %"] != null ? Number(lt["Win Rate %"]) : null;
        games.cs2.kd = lt["Average K/D Ratio"] != null ? Number(lt["Average K/D Ratio"]) : null;
        games.cs2.wins = lt["Wins"] != null ? Number(lt["Wins"]) : null;
        // Стиль игры: entry = доля раундов с входом в первую дуэль (активность);
        // clutch = клатч-ситуации (1v1+1v2) на раунд — как часто остаётся
        // последней живой (осторожность/выживаемость).
        games.cs2.entry = lt["Entry Rate"] != null ? Number(lt["Entry Rate"]) : null;
        const rounds = Number(lt["Total Rounds with extended stats"]) || 0;
        const clutches = (Number(lt["Total 1v1 Count"]) || 0) + (Number(lt["Total 1v2 Count"]) || 0);
        games.cs2.clutch = rounds ? clutches / rounds : null;
        // «Мастера»: urон гранатами/раунд, доля килов снайперкой, % в голову.
        // Ножа и убийств гранатами в API нет — это ближайшие доступные.
        games.cs2.util = lt["Utility Damage per Round"] != null ? Number(lt["Utility Damage per Round"]) : null;
        games.cs2.sniper = lt["Sniper Kill Rate"] != null ? Number(lt["Sniper Kill Rate"]) : null;
        games.cs2.hs = lt["Average Headshots %"] != null ? Number(lt["Average Headshots %"]) : null;
      }
    } catch {
      // стата опциональна
    }
  }
  return { nickname: p.nickname, country: p.country ?? null, games };
}

function rowsFor(players, game) {
  return Object.values(players)
    .map((p) => {
      const g = p.games?.[game];
      if (!g?.elo) return null;
      return {
        nickname: p.nickname,
        country: p.country,
        elo: g.elo,
        level: g.level,
        winRate: g.winRate ?? null,
        kd: g.kd ?? null,
        matches: g.matches ?? null,
        wins: g.wins ?? null,
        entry: g.entry ?? null,
        clutch: g.clutch ?? null,
        util: g.util ?? null,
        sniper: g.sniper ?? null,
        hs: g.hs ?? null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.elo - a.elo)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

async function main() {
  const girlRoleIds = await fetchGirlRoleIds();
  const allMembers = await fetchHubMembers();
  const members = allMembers.filter((m) => m.roles.some((id) => girlRoleIds.has(id)));
  console.log(
    `В хабе ${allMembers.length} участников, из них проверенных девушек: ${members.length} (остальные не учитываются).`,
  );
  if (!members.length) throw new Error("после фильтра по ролям не осталось игроков");

  const players = {};
  const queue = [...members];
  let failed = 0;
  const worker = async () => {
    while (queue.length) {
      const m = queue.shift();
      try {
        const p = await fetchPlayer(m.playerId);
        if (p) players[m.playerId] = p;
      } catch (err) {
        failed++;
        if (failed <= 5) console.error("skip", m.nickname, err.message);
      }
      await sleep(400);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const payload = {
    updatedAt: Date.now(),
    total: Object.keys(players).length,
    games: { cs2: rowsFor(players, "cs2"), rainbow_6: rowsFor(players, "rainbow_6") },
  };

  if (!payload.games.cs2.length && !payload.games.rainbow_6.length) {
    console.error("Пустой результат — не перезаписываю world.json");
    process.exit(1);
  }

  await fs.writeFile(OUT, JSON.stringify(payload, null, 2));
  console.log(
    `world.json записан: ${payload.total} игроков (CS2 ${payload.games.cs2.length}, R6 ${payload.games.rainbow_6.length}, ошибок ${failed}).`,
  );
}

main().catch((err) => {
  console.error("Сбой сборки:", err.message);
  process.exit(1);
});
