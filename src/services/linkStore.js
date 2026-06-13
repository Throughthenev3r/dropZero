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
