import { save, hasCode } from "./linkStore.js";
import { generateCode } from "../utils/generateCode.js";

export function shortenUrl(url) {
  function isValidUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }
  
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL. Use http:// or https://");
  }

  let code;
  do {
    code = generateCode();
  } while (hasCode(code));

  save(code, url);

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  return {
    code,
    shortUrl: `${baseUrl}/${code}`,
  };
}         