import { findByCode, incrementClicks, logClick } from "../services/linkStore.js";
import { hashVisitor } from "../utils/hashVisitor.js";

export async function redirect(req, res) {
  try {
    const { code } = req.params;
    const url = await findByCode(code);
    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }
    await incrementClicks(code);
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const visitorHash = hashVisitor(ip);
    await logClick(code, visitorHash);
    res.redirect(url);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}