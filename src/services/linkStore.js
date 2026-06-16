import db from "../db/database.js";

export function save(code, url) {
  db.prepare("INSERT INTO links (code, original_url) VALUES (?, ?)").run(code, url);
}

export function findByCode(code) {
  const row = db.prepare("SELECT original_url FROM links WHERE code = ?").get(code);
  return row?.original_url ?? null;
}

export function hasCode(code) {
  const row = db.prepare("SELECT code FROM links WHERE code = ?").get(code);
  return row !== undefined;
}

export function incrementClicks(code) {
  db.prepare("UPDATE links SET clicks = clicks + 1, last_clicked_at = datetime('now', 'localtime') WHERE code = ?").run(code);
}

export function logClick(code, visitorHash) {
  db.prepare(
    "INSERT INTO click_events (code, visitor_hash) VALUES (?, ?)"
  ).run(code, visitorHash);
}

export function getStats(code) {
  const totals = db.prepare(`
    SELECT
      COUNT(*) AS clicks,
      COUNT(DISTINCT visitor_hash) AS uniqueVisitors,
      MAX(clicked_at) AS lastClickedAt
    FROM click_events
    WHERE code = ?
  `).get(code);

  const byDay = db.prepare(`
    SELECT date(clicked_at) AS day, COUNT(*) AS count
    FROM click_events
    WHERE code = ?
    GROUP BY date(clicked_at)
    ORDER BY day DESC
  `).all(code);

  return {
    clicks: totals?.clicks ?? 0,
    uniqueVisitors: totals?.uniqueVisitors ?? 0,
    lastClickedAt: totals?.lastClickedAt ?? null,
    clicksByDay: byDay,
  };
}

export function deleteLink(code) {
  db.prepare("DELETE FROM click_events WHERE code = ?").run(code);
  const result = db.prepare("DELETE FROM links WHERE code = ?").run(code);
  return result.changes > 0;
}