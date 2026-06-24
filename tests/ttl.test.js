import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clickEventExpiresAt, linkExpiresAt } from "../src/utils/ttl.js";

describe("ttl", () => {
  it("linkExpiresAt is in the future", () => {
    const now = Math.floor(Date.now() / 1000);
    const expires = linkExpiresAt();
    assert.ok(expires > now);
    assert.ok(expires <= now + 31 * 86400);
  });

  it("clickEventExpiresAt is after link TTL by default", () => {
    const link = linkExpiresAt();
    const event = clickEventExpiresAt();
    assert.ok(event >= link);
  });
});
