import { hasCode, getStats } from "../services/linkStore.js";

export function stats(req, res) {
  try {
    const { code } = req.params;
    if (!hasCode(code)) {
      return res.status(404).json({ error: "URL not found" });
    }
    const data = getStats(code);
    res.json({ code, ...data });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export default stats;