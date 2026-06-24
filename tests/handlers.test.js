import "dotenv/config";
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { ensureTables } from "../src/db/dynamodb.js";
import { handler as deleteHandler } from "../src/handlers/delete.js";
import { handler as healthHandler } from "../src/handlers/health.js";
import { getClientIp, parseBody } from "../src/handlers/http.js";
import { handler as redirectHandler } from "../src/handlers/redirect.js";
import { handler as shortenHandler } from "../src/handlers/shorten.js";
import { handler as statsHandler } from "../src/handlers/stats.js";

before(async () => {
  await ensureTables();
});

describe("handler http helpers", () => {
  it("parseBody reads JSON body from API Gateway event", () => {
    const body = parseBody({
      body: JSON.stringify({ url: "https://example.com" }),
    });
    assert.deepEqual(body, { url: "https://example.com" });
  });

  it("getClientIp prefers x-forwarded-for header", () => {
    const ip = getClientIp({
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    assert.equal(ip, "203.0.113.1");
  });
});

describe("lambda handlers", () => {
  it("health returns ok", async () => {
    const response = await healthHandler();
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { ok: true });
  });

  it("shorten, redirect, stats, and delete work end-to-end", async () => {
    const created = await shortenHandler({
      body: JSON.stringify({ url: "https://example.com" }),
    });
    assert.equal(created.statusCode, 201);

    const { code } = JSON.parse(created.body);

    const missing = await redirectHandler({
      pathParameters: { code: "missing-code" },
    });
    assert.equal(missing.statusCode, 404);

    const redirected = await redirectHandler({
      pathParameters: { code },
      headers: { "x-forwarded-for": "203.0.113.9" },
    });
    assert.equal(redirected.statusCode, 302);
    assert.equal(redirected.headers.Location, "https://example.com");

    const stats = await statsHandler({
      pathParameters: { code },
    });
    assert.equal(stats.statusCode, 200);
    const statsBody = JSON.parse(stats.body);
    assert.equal(statsBody.code, code);
    assert.ok(statsBody.clicks >= 1);

    const removed = await deleteHandler({
      pathParameters: { code },
    });
    assert.equal(removed.statusCode, 204);

    const afterDelete = await statsHandler({
      pathParameters: { code },
    });
    assert.equal(afterDelete.statusCode, 404);
  });
});
