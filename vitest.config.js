import { defineConfig } from "vitest/config";

export default defineConfig({
  // The automatic JSX runtime, so test files do not need to import React.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    // Note: no netlify/** glob. Test files must not live in netlify/functions/,
    // because Netlify tries to deploy every file there as a function.
    include: ["src/**/*.test.{js,jsx}"],
  },
});
