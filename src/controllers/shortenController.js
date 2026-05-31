import { shortenUrl } from "../services/shortenService.js";

export function shorten (req, res){
    try {
        const { url } = req.body;
        const result = shortenUrl(url);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
