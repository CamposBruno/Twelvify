import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5173";

/**
 * Mock SSE response from /api/playground.
 * Simulates the backend streaming simplified text in chunks.
 */
function mockPlaygroundSSE(
  chunks: string[],
  options?: { status?: number; errorMidStream?: boolean; rateLimit?: boolean }
) {
  const status = options?.status ?? 200;
  const rateLimit = options?.rateLimit ?? false;

  return (route: import("@playwright/test").Route) => {
    if (rateLimit) {
      return route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "rate_limit_exceeded",
          message:
            "Whoa, slow down! The AI needs a breather. Try again in a moment.",
          retryAfterSeconds: 30,
        }),
      });
    }

    const lines: string[] = [];
    for (const chunk of chunks) {
      lines.push(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    if (options?.errorMidStream) {
      lines.push(
        `data: ${JSON.stringify({ error: "ai_error", message: "Something went wrong. Give it another go?" })}\n\n`
      );
    } else {
      lines.push(`data: ${JSON.stringify({ done: true })}\n\n`);
    }

    return route.fulfill({
      status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      body: lines.join(""),
    });
  };
}

test.describe("Phase 06: Playground Interactivity", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("playground section renders with heading and highlighted words in idle state", async ({
    page,
  }) => {
    const section = page.locator("#try-it");
    await expect(section).toBeVisible();

    // Heading
    await expect(section.locator("h2")).toContainText("Is this even English?");

    // Subtitle
    await expect(
      section.locator("text=Click the button and watch the magic happen")
    ).toBeVisible();

    // Highlighted words in original text
    const textArea = section.locator(".border-dashed");
    await expect(textArea).toContainText("superfluous");
    await expect(textArea).toContainText("sesquipedalian");
    await expect(textArea).toContainText("intellectual vertigo");

    // Highlighted spans exist (bg-primary/20 classes)
    const highlights = textArea.locator("span.border-b-4");
    await expect(highlights).toHaveCount(3);

    // FIX THIS MESS button visible and enabled
    const button = section.locator("button", { hasText: "FIX THIS MESS" });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test("nav PLAYGROUND link scrolls to #try-it section", async ({ page }) => {
    // Click the PLAYGROUND nav link
    await page.locator('nav a[href="#try-it"]').click();
    await page.waitForTimeout(1000);

    const section = page.locator("#try-it");
    await expect(section).toBeInViewport();
  });

  test("clicking FIX THIS MESS triggers SSE fetch and shows typing animation", async ({
    page,
  }) => {
    // Mock the API endpoint with chunked response
    await page.route("**/api/playground", mockPlaygroundSSE(["Simple ", "words ", "are ", "better."]));

    const section = page.locator("#try-it");
    const button = section.locator("button");

    // Click button
    await button.click();

    // Button should show FIXING... during loading
    await expect(button).toContainText(/FIXING|FIXED/);

    // Wait for typing animation to complete (4 chunks * ~35ms per char)
    await page.waitForTimeout(4000);

    // After completion: text area should contain the simplified text
    const textArea = section.locator(".border-dashed p");
    await expect(textArea).toContainText("Simple words are better.");

    // Button should show FIXED! and be disabled
    await expect(button).toContainText("FIXED!");
    await expect(button).toBeDisabled();
  });

  test("button is disabled after successful run (one-shot lock)", async ({
    page,
  }) => {
    await page.route("**/api/playground", mockPlaygroundSSE(["Done."]));

    const section = page.locator("#try-it");
    const button = section.locator("button");

    await button.click();
    await page.waitForTimeout(2000);

    // Button disabled
    await expect(button).toBeDisabled();
    await expect(button).toContainText("FIXED!");

    // Highlighted spans should be gone (replaced by plain text)
    const highlights = section.locator(".border-dashed span.border-b-4");
    await expect(highlights).toHaveCount(0);
  });

  test("legend updates after demo completes", async ({ page }) => {
    await page.route("**/api/playground", mockPlaygroundSSE(["Simplified."]));

    const section = page.locator("#try-it");
    const complexLabel = section.getByText("COMPLEX ORIGINAL");
    const simplifiedLabel = section.getByText("SIMPLIFIED VERSION");

    // Before click: COMPLEX ORIGINAL is active (primary colored), SIMPLIFIED is dimmed (slate)
    await expect(complexLabel).toHaveClass(/text-primary/);
    await expect(simplifiedLabel).toHaveClass(/text-slate-400/);

    // Click and wait
    await section.locator("button").click();
    await page.waitForTimeout(2000);

    // After completion: COMPLEX ORIGINAL struck through and dimmed, SIMPLIFIED is active
    await expect(complexLabel).toHaveClass(/line-through/);
    await expect(simplifiedLabel).toHaveClass(/text-primary/);
    await expect(simplifiedLabel).toHaveClass(/font-black/);
  });

  test("toast appears on 429 rate limit and auto-dismisses", async ({
    page,
  }) => {
    await page.route("**/api/playground", mockPlaygroundSSE([], { rateLimit: true }));

    const section = page.locator("#try-it");
    const button = section.locator("button", { hasText: "FIX THIS MESS" });

    await button.click();

    // Toast should appear with rate limit message
    const toast = section.locator("text=Whoa, slow down");
    await expect(toast).toBeVisible({ timeout: 3000 });

    // Button should return to idle state (not disabled)
    await expect(button).toContainText("FIX THIS MESS");
    await expect(button).toBeEnabled();

    // Toast dismiss button works
    const dismissBtn = section.locator("button", { hasText: "✕" });
    await dismissBtn.click();
    await expect(toast).not.toBeVisible();
  });

  test("mid-stream error preserves typed text and shows toast", async ({
    page,
  }) => {
    await page.route(
      "**/api/playground",
      mockPlaygroundSSE(["Partial text "], { errorMidStream: true })
    );

    const section = page.locator("#try-it");
    await section.locator("button").click();

    await page.waitForTimeout(3000);

    // Partial text should be preserved
    const textArea = section.locator(".border-dashed p");
    await expect(textArea).toContainText("Partial text");

    // Error toast visible
    const toast = section.locator("text=Something went wrong");
    await expect(toast).toBeVisible({ timeout: 3000 });

    // Button disabled (one-shot even on error)
    await expect(section.locator("button").first()).toBeDisabled();
  });

  test("blinking cursor visible during typing", async ({ page }) => {
    // Use a longer chunk so we can catch the cursor mid-animation
    await page.route(
      "**/api/playground",
      mockPlaygroundSSE(["This is a longer sentence to give time to see the cursor blinking."])
    );

    const section = page.locator("#try-it");
    await section.locator("button").click();

    // Wait a moment for typing to start
    await page.waitForTimeout(500);

    // Cursor should be visible (animate-pulse span with |)
    const cursor = section.locator("span.animate-pulse");
    await expect(cursor).toBeVisible({ timeout: 3000 });
    await expect(cursor).toContainText("|");
  });

  test("full page screenshot with playground section", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE);
    await page.waitForTimeout(500);

    // Scroll to playground section
    await page.locator("#try-it").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: "test-results/phase06-playground-idle.png",
      fullPage: false,
    });
  });
});
