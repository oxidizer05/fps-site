// Счётчик посетителей fpsgirls.com на Cloudflare Worker + KV.
//
// Считает анонимно: браузер присылает случайный id (vid) из localStorage,
// сам сайт шлёт «визит» не чаще одного раза в день на браузер. Никаких
// персональных данных, cookie и внешних сервисов.
//
// Метрики:
//   total    — сколько всего разных людей заходило
//   frequent — сколько «частых» (зашли в 3+ разных дня)
//
// KV-ключи: v:<vid> — в скольких днях был этот посетитель (считаем максимум
// до 3, дальше не пишем — экономим лимит записей KV); total и freq —
// агрегаты. После того как посетитель стал «частым», записи по нему
// прекращаются, поэтому расход бесплатного лимита KV минимальный.
//
// Настройка: см. cloudflare-worker/README.md. KV-биндинг должен называться COUNTER.

const FREQUENT_AT = 3; // сколько дней-визитов = «часто заходит»

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

export default {
  async fetch(request, env) {
    const KV = env.COUNTER;
    const url = new URL(request.url);

    const readCounts = async () => ({
      total: parseInt(await KV.get("total")) || 0,
      frequent: parseInt(await KV.get("freq")) || 0,
    });

    // Регистрируем визит только на /hit; всё остальное — просто отдаём числа.
    if (request.method === "GET" && url.pathname.endsWith("/hit")) {
      const vid = (url.searchParams.get("vid") || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
      if (!vid) return json(await readCounts());

      const vk = "v:" + vid;
      const days = parseInt(await KV.get(vk)) || 0;

      // Уже «частый» — больше ничего не пишем, лишь возвращаем текущие числа.
      if (days >= FREQUENT_AT) return json(await readCounts());

      const next = days + 1;
      await KV.put(vk, String(next));

      let counts = await readCounts();
      if (next === 1) {
        counts.total += 1;
        await KV.put("total", String(counts.total));
      }
      if (next === FREQUENT_AT) {
        counts.frequent += 1;
        await KV.put("freq", String(counts.frequent));
      }
      return json(counts);
    }

    return json(await readCounts());
  },
};
