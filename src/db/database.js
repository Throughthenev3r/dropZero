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
export default db;