import crypto from "crypto";

export function hashVisitor(ip) {
  return crypto
    .createHash("sha256")
    .update(ip || "unknown")
    .digest("hex")
    .slice(0, 16);
}