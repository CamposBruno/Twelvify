import { test, expect } from "@playwright/test";

test("browser launches and can navigate", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page).toHaveTitle(/Example Domain/);
});
