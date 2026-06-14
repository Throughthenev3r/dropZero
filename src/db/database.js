import Database from "better-sqlite3";
const db = new Database("links.db");

db.exec(`
 CREATE TABLE IF NOT EXISTS links (
  code TEXT PRIMARY KEY,
  original_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  last_clicked_at TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
)
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS click_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    clicked_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

export default db;