import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5173";

test.describe("Phase 05: Static Sections Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("nav renders with logo, section links, and CTA", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Logo text
    await expect(nav.locator("text=Twelveify").first()).toBeVisible();

    // Bike icon
    await expect(nav.locator("text=pedal_bike")).toBeVisible();

    // Section links (desktop)
    await expect(nav.locator('a[href="#how-it-works"]')).toBeVisible();
    await expect(nav.locator('a[href="#features"]')).toBeVisible();
    await expect(nav.locator('a[href="#try-it"]')).toBeVisible();

    // CTA button
    await expect(nav.locator("text=ADD TO CHROME")).toBeVisible();
  });

  test("nav is sticky", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toHaveCSS("position", "sticky");
  });

  test("nav links hidden on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // Section links should be hidden
    const linksContainer = page.locator("nav .hidden.md\\:flex");
    await expect(linksContainer).toBeHidden();
    // CTA still visible
    await expect(page.locator("nav >> text=ADD TO CHROME")).toBeVisible();
  });

  test("hero section renders correctly", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Badge
    await expect(page.locator("text=NOW IN THE WEB STORE (DUH)")).toBeVisible();

    // H1 with key text
    await expect(page.locator("h1")).toContainText("Stop pretending you");
    await expect(page.locator("h1")).toContainText("understand");
    await expect(page.locator("h1")).toContainText("jargon");

    // CTA buttons
    await expect(page.locator("text=Install Twelveify")).toBeVisible();
    await expect(page.locator("text=View Demo")).toBeVisible();

    // View Demo links to #try-it
    const demoLink = page.locator('a[href="#try-it"]').first();
    await expect(demoLink).toBeVisible();

    // Social proof
    await expect(page.locator("text=JOINED BY 10K+ DAILY READERS")).toBeVisible();
  });

  test("hero browser mockup hidden on mobile, visible on desktop", async ({ page }) => {
    // Desktop - mockup visible
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE);
    const mockupDesktop = page.locator("header .hidden.lg\\:block");
    await expect(mockupDesktop).toBeVisible();

    // Mobile - mockup hidden
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE);
    const mockupMobile = page.locator("header .hidden.lg\\:block");
    await expect(mockupMobile).toBeHidden();
  });

  test("how-it-works section renders with 3 cards", async ({ page }) => {
    const section = page.locator("#how-it-works");
    await expect(section).toBeVisible();

    // Section heading
    await expect(section.locator("h2")).toContainText("Don't Look Dumb");

    // Three step cards
    await expect(section.locator("text=01.")).toBeVisible();
    await expect(section.locator("text=02.")).toBeVisible();
    await expect(section.locator("text=03.")).toBeVisible();

    await expect(section.locator("h3", { hasText: "Highlight" })).toBeVisible();
    await expect(section.locator("h3", { hasText: "Click Wand" })).toBeVisible();
    await expect(section.locator("h3", { hasText: "Read Simplified" })).toBeVisible();
  });

  test("playground placeholder exists with correct id", async ({ page }) => {
    const section = page.locator("#try-it");
    await expect(section).toBeVisible();
  });

  test("features section renders with 3 features", async ({ page }) => {
    const section = page.locator("#features");
    await expect(section).toBeVisible();

    // Feature heading
    await expect(section.locator("h2")).toContainText("not even there");

    // Three feature items
    await expect(section.locator("h4", { hasText: "In-page Replacement" })).toBeVisible();
    await expect(section.locator("h4", { hasText: "Privacy by Design" })).toBeVisible();
    await expect(section.locator("h4", { hasText: "Native Feel" })).toBeVisible();

    // Material icons
    await expect(section.locator("text=swap_horiz")).toBeVisible();
    await expect(section.locator("text=shield_with_heart")).toBeVisible();
    await expect(section.locator("text=palette")).toBeVisible();
  });

  test("CTA section renders with paper-tear and buttons", async ({ page }) => {
    // CTA heading
    await expect(page.locator("text=Ready to stop feeling like a toddler")).toBeVisible();

    // Badge
    await expect(page.locator("text=Free to use — Forever")).toBeVisible();

    // Buttons
    const ctaSection = page.locator(".paper-tear");
    await expect(ctaSection).toBeVisible();
    await expect(ctaSection.locator("text=ADD TO CHROME")).toBeVisible();
    await expect(ctaSection.locator("text=LEARN MORE")).toBeVisible();
  });

  test("footer renders with logo, columns, and social links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Logo
    await expect(footer.getByText("Twelveify", { exact: true })).toBeVisible();

    // Link columns
    await expect(footer.locator("h5", { hasText: "Product" })).toBeVisible();
    await expect(footer.locator("h5", { hasText: "Resources" })).toBeVisible();
    await expect(footer.locator("h5", { hasText: "Legal" })).toBeVisible();

    // Social links
    await expect(footer.locator("text=Twitter")).toBeVisible();
    await expect(footer.locator("text=GitHub")).toBeVisible();
    await expect(footer.locator("text=Discord")).toBeVisible();

    // Copyright
    await expect(footer.locator("text=Deal with it")).toBeVisible();
  });

  test("smooth scroll navigation works", async ({ page }) => {
    // Click HOW IT WORKS link
    await page.locator('nav a[href="#how-it-works"]').click();
    // Wait for scroll
    await page.waitForTimeout(1000);

    // Check that how-it-works section is in viewport
    const section = page.locator("#how-it-works");
    await expect(section).toBeInViewport();
  });

  test("SEO meta tags present in page", async ({ page }) => {
    // OG tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toContain("Twelvify");

    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute("content");
    expect(ogDesc).toBeTruthy();

    // Twitter card
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(twitterCard).toBe("summary_large_image");

    // Canonical
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("twelvify.com");
  });

  test("full page screenshot for visual review", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE);
    await page.waitForTimeout(500);
    await page.screenshot({ path: "test-results/phase05-desktop.png", fullPage: true });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE);
    await page.waitForTimeout(500);
    await page.screenshot({ path: "test-results/phase05-mobile.png", fullPage: true });
  });
});
