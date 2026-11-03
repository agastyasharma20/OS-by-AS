import { defineConfig } from "@playwright/test";

/**
 * Runs against a running stack (`make dev`). BASE_URL defaults to the compose web service.
 * PLAYWRIGHT_CHROMIUM_PATH lets machines with a preinstalled Chromium skip `playwright install`.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    launchOptions: { executablePath },
  },
  projects: [
    {
      name: "mobile-390",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
  ],
});
