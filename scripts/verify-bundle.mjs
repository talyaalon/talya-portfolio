// ============================================================
//  Acceptance test for the public/admin split.
//
//  The whole point of building admin.html as a separate Vite entry is that a
//  visitor never downloads the admin app — not its editor, not its analytics
//  screen, and not one word of its password vocabulary.
//
//  That guarantee is easy to undo by accident: a single `import` from App.jsx
//  into anything admin-side pulls the lot back into the public chunk, and
//  nothing about the page would look wrong. So it is asserted here, against
//  the built output, and wired into `npm run verify`.
//
//  Run after `npm run build`.
// ============================================================

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const ASSETS = join(DIST, "assets");

// Markers that only OUR admin code can produce.
//
// NB: a bare "password" is useless as a signal — react-dom ships an internal
// table of input types that includes `password:!0`, and it is in every build.
// These strings are admin UI copy and SDK method names instead, all of which
// survive minification because they are string literals or property keys.
const FORBIDDEN = [
  // admin UI copy (Hebrew never appears in a vendor bundle)
  "סיסמה",
  "כניסת מנהל",
  "שם משתמש",
  "Admin sign-in",
  "Wrong username or password",
  // admin i18n keys — object property names survive minification
  "loginUsername",
  "loginEnter",
  "formSaveFailed",
  "anViewsMonth",
  // Supabase auth SDK: the public site uses plain REST and must not pull this in
  "signInWithPassword",
  "refreshSession",
  // the old "secret" entry point
  "#admin",
];

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

let html;
try {
  html = readFileSync(join(DIST, "index.html"), "utf8");
} catch {
  fail(`${DIST}/index.html not found — run \`npm run build\` first.`);
}

// Collect every JS chunk the PUBLIC entry actually pulls in, following the
// module graph through <script> and <link rel=modulepreload>.
const referenced = new Set();
for (const m of html.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)) referenced.add(m[1]);

if (referenced.size === 0) fail("No JS assets referenced from dist/index.html — the check would pass vacuously.");

// Chunks can import other chunks; walk transitively.
const allAssets = readdirSync(ASSETS);
let added = true;
while (added) {
  added = false;
  for (const name of [...referenced]) {
    let code;
    try {
      code = readFileSync(join(ASSETS, name), "utf8");
    } catch {
      continue;
    }
    for (const m of code.matchAll(/["'`]\.\/([^"'`]+\.js)["'`]/g)) {
      if (allAssets.includes(m[1]) && !referenced.has(m[1])) {
        referenced.add(m[1]);
        added = true;
      }
    }
  }
}

const problems = [];
let scanned = 0;
let publicBytes = 0;

for (const name of referenced) {
  const path = join(ASSETS, name);
  let code;
  try {
    code = readFileSync(path, "utf8");
  } catch {
    continue;
  }
  scanned++;
  publicBytes += statSync(path).size;

  for (const word of FORBIDDEN) {
    if (code.includes(word)) {
      problems.push(`  "${word}" found in public chunk assets/${name}`);
    }
  }
}

// Sanity check the other direction: the admin bundle must exist and must
// contain the admin app, otherwise the split silently produced nothing.
let adminHtml;
try {
  adminHtml = readFileSync(join(DIST, "admin.html"), "utf8");
} catch {
  fail("dist/admin.html not found — the admin entry did not build.");
}
const adminChunks = [...adminHtml.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)].map((m) => m[1]);
const adminHasLogin = adminChunks.some((n) => {
  try {
    return readFileSync(join(ASSETS, n), "utf8").includes("signInWithPassword");
  } catch {
    return false;
  }
});
if (!adminHasLogin) {
  problems.push("  the admin bundle does not contain the sign-in code — check src/admin.jsx");
}

console.log(`Public entry: ${scanned} chunk(s), ${(publicBytes / 1024).toFixed(1)} KB uncompressed.`);

if (problems.length) {
  console.error("\n✗ Admin code leaked into the public bundle:\n");
  console.error(problems.join("\n"));
  console.error("\nThe public site must not import anything from AdminApp, useAuth, or i18n.admin.js.\n");
  process.exit(1);
}

console.log("✓ No admin or password vocabulary in the public bundle.");
console.log("✓ Admin bundle built and self-contained.");
