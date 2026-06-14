import { test, expect } from "@playwright/test";

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
});