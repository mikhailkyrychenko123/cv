const TIME_ZONE = "Europe/Kyiv";
const ONLINE_WINDOW_SECONDS = 10 * 60;
const KEEP_DAYS = 35;

function kyivDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function previousDay(day) {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet({ env }) {
  if (!env.LEADS_DB) return json({ error: "Visitor statistics are not configured." }, 503);

  const today = kyivDate();
  const yesterday = previousDay(today);
  const cutoff = Math.floor(Date.now() / 1000) - ONLINE_WINDOW_SECONDS;
  const [daily, online] = await Promise.all([
    env.LEADS_DB.prepare(
      "SELECT day, visits, unique_visitors FROM visitor_daily WHERE day IN (?, ?)"
    ).bind(today, yesterday).all(),
    env.LEADS_DB.prepare(
      "SELECT COUNT(*) AS count FROM visitor_presence WHERE last_seen_at >= ?"
    ).bind(cutoff).first(),
  ]);

  const byDay = new Map((daily.results || []).map((row) => [row.day, row]));
  const format = (day) => {
    const row = byDay.get(day);
    return {
      visits: Number(row?.visits || 0),
      uniqueVisitors: Number(row?.unique_visitors || 0),
    };
  };
  return json({ today: format(today), yesterday: format(yesterday), onlineNow: Number(online?.count || 0) });
}

export async function onRequestPost({ request, env }) {
  if (!env.LEADS_DB) return json({ error: "Visitor statistics are not configured." }, 503);

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return json({ error: "Request origin is not allowed." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Expected a JSON request." }, 415);
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 1024) return json({ error: "Request is too large." }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }
  if (!body || !["view", "heartbeat"].includes(body.type) ||
      typeof body.visitorId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.visitorId)) {
    return json({ error: "Invalid visitor event." }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const activeHash = await sha256(`active:${body.visitorId.toLowerCase()}`);
  const statements = [
    env.LEADS_DB.prepare(
      "INSERT INTO visitor_presence (visitor_hash, last_seen_at) VALUES (?, ?) ON CONFLICT(visitor_hash) DO UPDATE SET last_seen_at = excluded.last_seen_at"
    ).bind(activeHash, now),
    env.LEADS_DB.prepare("DELETE FROM visitor_presence WHERE last_seen_at < ?").bind(now - 24 * 60 * 60),
  ];

  if (body.type === "view") {
    const today = kyivDate(new Date(now * 1000));
    const dailyHash = await sha256(`${today}:${body.visitorId.toLowerCase()}`);
    statements.unshift(
      env.LEADS_DB.prepare(
        "INSERT INTO visitor_daily (day, visits, unique_visitors) VALUES (?, 1, 0) ON CONFLICT(day) DO UPDATE SET visits = visits + 1"
      ).bind(today),
      env.LEADS_DB.prepare(
        "INSERT OR IGNORE INTO visitor_daily_seen (day, visitor_hash) VALUES (?, ?)"
      ).bind(today, dailyHash),
    );
    const oldestDay = new Date(now * 1000);
    oldestDay.setUTCDate(oldestDay.getUTCDate() - KEEP_DAYS);
    const retentionCutoff = kyivDate(oldestDay);
    statements.push(
      env.LEADS_DB.prepare("DELETE FROM visitor_daily WHERE day < ?").bind(retentionCutoff),
    );
  }

  await env.LEADS_DB.batch(statements);
  return json({ ok: true });
}
