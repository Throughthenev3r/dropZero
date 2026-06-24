import "dotenv/config";
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { ensureTables } from "../src/db/dynamodb.js";
import {
  deleteLink,
  findByCode,
  getStats,
  hasCode,
  incrementClicks,
  logClick,
  save,
} from "../src/services/linkStore.js";

function uniqueCode() {
  return `t${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

before(async () => {
  await ensureTables();
});

describe("linkStore", () => {
  it("save, findByCode, and hasCode", async () => {
    const code = uniqueCode();
    await save(code, "https://example.com");

    assert.equal(await findByCode(code), "https://example.com");
    assert.equal(await hasCode(code), true);

    assert.equal(await deleteLink(code), true);
    assert.equal(await hasCode(code), false);
  });

  it("hasCode returns false for missing code", async () => {
    assert.equal(await hasCode("missing-code"), false);
    assert.equal(await findByCode("missing-code"), null);
  });

  it("incrementClicks runs without error after save", async () => {
    const code = uniqueCode();
    await save(code, "https://example.com");
    await incrementClicks(code);
    await incrementClicks(code);
    assert.equal(await findByCode(code), "https://example.com");
    await deleteLink(code);
  });

  it("getStats returns zeros when there are no click events", async () => {
    const code = uniqueCode();
    await save(code, "https://example.com");

    const stats = await getStats(code);
    assert.equal(stats.clicks, 0);
    assert.equal(stats.uniqueVisitors, 0);
    assert.equal(stats.lastClickedAt, null);
    assert.deepEqual(stats.clicksByDay, []);

    await deleteLink(code);
  });

  it("logClick and getStats track clicks and unique visitors", async () => {
    const code = uniqueCode();
    await save(code, "https://example.com");

    await logClick(code, "visitor-a");
    await sleep(5);
    await logClick(code, "visitor-a");
    await sleep(5);
    await logClick(code, "visitor-b");

    const stats = await getStats(code);
    assert.equal(stats.clicks, 3);
    assert.equal(stats.uniqueVisitors, 2);
    assert.ok(stats.lastClickedAt);
    assert.equal(stats.clicksByDay.length, 1);
    assert.equal(stats.clicksByDay[0].count, 3);

    await deleteLink(code);
    assert.equal(await hasCode(code), false);
    assert.equal((await getStats(code)).clicks, 0);
  });

  it("deleteLink returns false for missing code", async () => {
    assert.equal(await deleteLink("missing-code"), false);
  });
});
