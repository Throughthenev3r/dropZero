import { json } from "./http.js";

export async function handler() {
  return json(200, { ok: true });
}
