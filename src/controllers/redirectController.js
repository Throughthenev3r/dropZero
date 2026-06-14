import { findByCode, incrementClicks, logClick } from "../services/linkStore.js";
import { hashVisitor } from "../utils/hashVisitor.js";

export function redirect(req, res){
    try {
        const { code } = req.params;
        const url = findByCode(code);
        if (!url) {
            return res.status(404).json({ error: "URL not found" });
        }
        incrementClicks(code);
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const visitorHash = hashVisitor(ip);
        logClick(code, visitorHash);
        res.redirect(url);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export default redirect;