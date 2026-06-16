import { deleteLink } from "../services/linkStore.js";

export function remove(req, res) {
  try {
    const { code } = req.params;
    const deleted = deleteLink(code);
    if (!deleted) {
      return res.status(404).json({ error: "URL not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
export default remove;