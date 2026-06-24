import { hasCode, getStats } from "../services/linkStore.js";

export async function stats(req, res) {
  try {
    const { code } = req.params;
    if (!(await hasCode(code))) {
      return res.status(404).json({ error: "URL not found" });
    }
    const data = await getStats(code);
    res.json({ code, ...data });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}