import { findByCode, incrementClicks } from "../services/linkStore.js";

export function redirect(req, res){
    try {
        const { code } = req.params;
        const url = findByCode(code);
        if (!url) {
            return res.status(404).json({ error: "URL not found" });
        }
        incrementClicks(code);
        res.redirect(url);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export default redirect;