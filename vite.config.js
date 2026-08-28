import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// "type": "module" in package.json means this file is ESM, where __dirname
// does not exist.
const root = dirname(fileURLToPath(import.meta.url));

// Two separate entry points, built as two independent bundles:
//
//   index.html  → the public portfolio.  Read-only: it fetches projects and
//                 renders them. It imports no auth code, no editor, and no
//                 admin strings, so none of that reaches a visitor.
//   admin.html  → the admin app at /admin. Login, project editor, analytics.
//
// This split is the reason the public bundle contains no password UI. Keep it:
// importing anything from AdminApp into App would silently undo it. The check
// is scripted — `npm run verify:bundle`.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        admin: resolve(root, "admin.html"),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
