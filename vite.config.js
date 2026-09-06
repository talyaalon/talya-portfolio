import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { hasRealCv, CV_PUBLIC_PATH } from "./scripts/cv-status.mjs";

// "type": "module" in package.json means this file is ESM, where __dirname
// does not exist.
const root = dirname(fileURLToPath(import.meta.url));

// Three separate entry points, built as independent bundles:
//
//   index.html            → the public portfolio.  Read-only: it fetches
//                           projects and renders them. It imports no auth
//                           code, no editor and no admin strings, so none of
//                           that reaches a visitor.
//   projects/j-cafe.html  → the J-Cafe case study. Its own page rather than a
//                           modal, so it has a URL a recruiter can be sent
//                           and a crawler can index. Shares the public
//                           components and stylesheet; adds no router.
//   admin.html            → the admin app at /admin. Login, project editor,
//                           analytics.
//
// The public/admin split is the reason the public bundles contain no password
// UI. Keep it: importing anything from AdminApp into App or CaseStudy would
// silently undo it. The check is scripted — `npm run verify:bundle`, which
// scans every public entry listed here.
//
// `isSsrBuild` is the same config being reused by `vite build --ssr` for the
// prerender step (see scripts/prerender.mjs). That build has exactly one
// input — the server entry — so the multi-page input map must not apply, or
// Rollup would try to bundle three HTML files for Node.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  define: {
    // Whether public/cv.pdf is a real CV or still the committed placeholder,
    // decided at build time. The hero links to it only when it is real: a
    // button that opens a file saying "placeholder" in front of a hiring
    // manager is the failure src/lib/siteSettings.js already warns about.
    // Replacing the file is all it takes to turn the link on.
    __STATIC_CV_PATH__: JSON.stringify(hasRealCv(root) ? CV_PUBLIC_PATH : ""),
  },
  build: isSsrBuild
    ? {}
    : {
        rollupOptions: {
          input: {
            main: resolve(root, "index.html"),
            jcafe: resolve(root, "projects/j-cafe.html"),
            admin: resolve(root, "admin.html"),
          },
        },
      },
  server: {
    port: 5173,
    open: true,
  },
}));
