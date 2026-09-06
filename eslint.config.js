import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/**", "node_modules/**", "talya-portfolio.jsx"] },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      // __STATIC_CV_PATH__ is substituted at build time by vite.config.js
      // (see scripts/cv-status.mjs); it is not a runtime global.
      globals: { ...globals.browser, ...globals.es2021, __STATIC_CV_PATH__: "readonly" },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // The automatic JSX runtime means React need not be in scope.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "smart"],
    },
  },

  // Netlify Functions run on the server, not in a browser.
  {
    files: ["netlify/**/*.js", "scripts/**/*.mjs"],
    languageOptions: { globals: { ...globals.node } },
  },

  // Tests get the Vitest globals.
  {
    files: ["**/*.test.{js,jsx}", "src/test/**"],
    languageOptions: { globals: { ...globals.node, ...globals.browser, vi: "readonly", describe: "readonly", it: "readonly", expect: "readonly", beforeEach: "readonly", afterEach: "readonly" } },
  },
];
