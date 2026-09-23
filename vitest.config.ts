import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    /**
     * Component tests only. The Playwright specs under `src/test/e2e` are
     * `.spec.ts`, which the default pattern would otherwise hand to vitest.
     */
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
