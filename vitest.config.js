import { defineConfig } from "vitest/config";

export default defineConfig({
  // The automatic JSX runtime, so test files do not need to import React.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx}", "netlify/**/*.test.js"],
  },
});
