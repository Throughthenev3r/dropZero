import { shortenUrl } from "../services/shortenService.js";
import { json, parseBody } from "./http.js";

export async function handler(event) {
  try {
    const { url } = parseBody(event);
    const result = await shortenUrl(url);
    return json(201, result);
  } catch (error) {
    return json(400, { error: error.message });
  }
}
