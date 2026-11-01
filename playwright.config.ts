// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);

// One build, two servers: the deck as it ships, and the same deck locked.
export const LOCKED_URL = `http://localhost:${port + 1}`;
export const TEST_PASSCODE = "correct-horse-battery";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
    headless: true,
  },
  webServer: {
    command:
      `npm run build && (DECK_PASSCODE=${TEST_PASSCODE} npx next start -p ${port + 1} & ` +
      `npx next start -p ${port})`,
    url: `http://localhost:${port}/api/deck-version`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { args: ["--mute-audio"] },
      },
    },
    // Off by default. ALL_BROWSERS=1 adds these, muted and headless like Chromium.
    ...(process.env.ALL_BROWSERS
      ? [
          {
            name: "firefox",
            use: {
              ...devices["Desktop Firefox"],
              launchOptions: { firefoxUserPrefs: { "media.volume_scale": "0.0" } },
            },
          },
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
        ]
      : []),
  ],
});
