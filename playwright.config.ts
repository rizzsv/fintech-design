import { defineConfig, devices } from "@playwright/test";

/**
 * The app serves on 3002 (`npm run dev` and `npm run start` both pass `-p 3002`).
 * 3000 belongs to the API, so the previous `baseURL` pointed every spec at the
 * backend.
 */
const PORT = 3002;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./src/test/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  /**
   * Starting the app here means `npm run e2e` is self-contained rather than
   * silently testing whatever happens to be listening on the port.
   */
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // The width the desktop layouts are designed against.
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
