import { getStats, hasCode } from "../services/linkStore.js";
import { getPathParam, json } from "./http.js";

export async function handler(event) {
  try {
    const code = getPathParam(event, "code");
    if (!(await hasCode(code))) {
      return json(404, { error: "URL not found" });
    }

    const data = await getStats(code);
    return json(200, { code, ...data });
  } catch {
    return json(500, { error: "Internal server error" });
  }
}
