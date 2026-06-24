import { deleteLink } from "../services/linkStore.js";

export async function remove(req, res) {
  try {
    const { code } = req.params;
    const deleted = await deleteLink(code);
    if (!deleted) {
      return res.status(404).json({ error: "URL not found" });
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}