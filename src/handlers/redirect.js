import { findByCode, incrementClicks, logClick } from "../services/linkStore.js";
import { hashVisitor } from "../utils/hashVisitor.js";
import { getClientIp, getPathParam, json, redirect } from "./http.js";

export async function handler(event) {
  try {
    const code = getPathParam(event, "code");
    const url = await findByCode(code);
    if (!url) {
      return json(404, { error: "URL not found" });
    }

    await incrementClicks(code);
    const visitorHash = hashVisitor(getClientIp(event));
    await logClick(code, visitorHash);

    return redirect(url);
  } catch {
    return json(500, { error: "Internal server error" });
  }
}
