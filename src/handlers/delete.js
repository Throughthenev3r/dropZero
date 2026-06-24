import { deleteLink } from "../services/linkStore.js";
import { getPathParam, json, noContent } from "./http.js";

export async function handler(event) {
  try {
    const code = getPathParam(event, "code");
    const deleted = await deleteLink(code);
    if (!deleted) {
      return json(404, { error: "URL not found" });
    }

    return noContent();
  } catch {
    return json(500, { error: "Internal server error" });
  }
}
