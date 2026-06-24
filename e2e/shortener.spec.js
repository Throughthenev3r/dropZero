import { test, expect } from "@playwright/test";

test("health returns ok", async ({ request }) => {
  const response = await request.get("/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
});

test("shorten url and redirect to original", async ({ page, request }) => {
  const response = await request.post("/api/shorten", {
    data: { url: "https://google.com" },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.shortUrl).toBeTruthy();
  expect(body.code).toBeTruthy();

  await page.goto(body.shortUrl);

  await expect(page).toHaveURL(/google\.com/);
  const del = await request.delete(`/api/links/${body.code}`);
  expect(del.status()).toBe(204);
});


test("stats returns clicks after redirect", async ({ page, request }) => {
  const create = await request.post("/api/shorten", {
    data: { url: "https://google.com" },
  });
  expect(create.status()).toBe(201);
  const { code, shortUrl } = await create.json();
  await page.goto(shortUrl);
  await expect(page).toHaveURL(/google\.com/);
  const stats = await request.get(`/api/stats/${code}`);
  expect(stats.status()).toBe(200);
  
  const data = await stats.json();
  expect(data.clicks).toBeGreaterThanOrEqual(1);
  expect(data.uniqueVisitors).toBeGreaterThanOrEqual(1);
  const del = await request.delete(`/api/links/${code}`);
  expect(del.status()).toBe(204);
});