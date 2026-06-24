import { shortenUrl } from "../services/shortenService.js";

export async function shorten(req, res) {
  try {
    const { url } = req.body;
    const result = await shortenUrl(url);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
