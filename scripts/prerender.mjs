// ============================================================
//  Static pre-rendering, run after `vite build`.
//
//  The problem it solves: this is a client-rendered Vite app, so the built
//  index.html contained an empty <div id="root"> and one line of <noscript>
//  text. Google, LinkedIn's unfurler and every recruiter tool that does not
//  execute JavaScript saw a portfolio with no projects on it.
//
//  What it does:
//    1. reads the projects and site settings from Supabase, ONCE, at build
//       time (the same PostgREST endpoints the browser uses);
//    2. renders each page to HTML with the SSR bundle Vite just built;
//    3. writes that HTML into <div id="root">, and the rows it used into a
//       <script type="application/json"> block beside it.
//
//  The block is what stops the page flickering: without it the browser's
//  first render would start from "still loading" and replace a complete page
//  with a spinner. See src/lib/bootData.js.
//
//  Staleness is real and intended: the embedded copy is as old as the last
//  deploy, and projects are edited from /admin at any time. The page still
//  fetches on mount and the fresh answer wins, so a visitor sees current
//  data; only a crawler that does not run JavaScript sees the build's copy.
//
//  If Supabase cannot be reached, this FAILS THE BUILD. The alternative is
//  publishing an empty portfolio that looks fine in a browser and is blank to
//  everything else - which is the exact bug this file exists to fix, and it
//  would come back silently.
// ============================================================

import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BOOT_DATA_ID, serializeBootData } from "../src/lib/bootData.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(root, "dist");
const SSR_BUNDLE = join(root, "dist-ssr", "prerender.js");

// Netlify puts build variables in the environment directly. Locally they are
// in .env, which Node does not read on its own - this is not Vite, and
// nothing has loaded them yet.
try {
  process.loadEnvFile(join(root, ".env"));
} catch {
  // No .env: expected on CI and on Netlify, where the values are already set.
}

function fail(message, detail) {
  console.error(`\n✗ prerender: ${message}\n`);
  if (detail) console.error(detail + "\n");
  process.exit(1);
}

// ---------- 1. the data ----------

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function fetchTable(path, { optional = false } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
    },
  });

  // A table that has not been migrated yet answers 404 for the whole
  // relation. The running site already treats that as "no settings" rather
  // than an error, and the prerender has to agree with it - otherwise the
  // build fails on a state the site is designed to tolerate.
  if (res.status === 404 && optional) {
    console.warn(`  ! ${path} returned 404 - treating as empty (unmigrated table)`);
    return [];
  }

  if (!res.ok) {
    fail(`${path} returned ${res.status}`, await res.text().catch(() => ""));
  }
  return res.json();
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  fail(
    "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required to prerender.",
    "They are the same values the browser bundle is built with. Set them in\n" +
      ".env locally, or in the Netlify build environment."
  );
}

console.log("Prerendering…");

let projects, settings;
try {
  // The same ordering the app asks for, so the prerendered list and the
  // fetched one are in the same order and nothing visibly reshuffles.
  projects = await fetchTable("projects?select=*&order=position.asc,created_at.desc");
  settings = await fetchTable("site_settings?select=key,value", { optional: true });
} catch (e) {
  fail("could not reach Supabase.", String(e?.stack || e));
}

if (!Array.isArray(projects)) fail(`projects did not come back as a list (got ${typeof projects}).`);
console.log(`  ${projects.length} project(s), ${settings.length} setting(s) from Supabase.`);

// An empty portfolio is almost certainly a misconfigured build (wrong project
// ref, RLS change) rather than a real state, and it produces exactly the blank
// page this script exists to prevent. Better to stop than to publish it.
if (projects.length === 0) {
  fail(
    "the projects table returned no rows.",
    "That would publish the empty page this script exists to prevent.\n" +
      "Check VITE_SUPABASE_URL points at the right project and that the\n" +
      "projects_public_read policy is still in place."
  );
}

// ---------- 2. the renderer ----------

if (!existsSync(SSR_BUNDLE)) {
  fail(`${SSR_BUNDLE} not found.`, "Run `npm run build:ssr` first (npm run build does both).");
}

const { render, PAGES } = await import(pathToFileURL(SSR_BUNDLE).href);

// ---------- 3. write the pages ----------

const ROOT_DIV = '<div id="root"></div>';
const bootJson = serializeBootData({ projects, settings });

let written = 0;
for (const page of Object.keys(PAGES)) {
  const file = join(DIST, page);
  if (!existsSync(file)) {
    fail(`dist/${page} not found.`, "The Vite entry for this page did not build - check vite.config.js.");
  }

  const html = readFileSync(file, "utf8");
  if (!html.includes(ROOT_DIV)) {
    fail(
      `dist/${page} does not contain ${ROOT_DIV}.`,
      "The prerendered markup has nowhere to go. If the mount point was\n" +
        "renamed, rename it here too."
    );
  }

  const markup = render(page, { projects, settings });

  // Asserting on the OUTPUT, not on the absence of an exception. A render
  // that throws is caught by the build; a render that quietly produces an
  // empty string is what would put the original bug back.
  if (typeof markup !== "string" || markup.length < 1000) {
    fail(
      `dist/${page} rendered ${typeof markup === "string" ? `only ${markup.length} characters` : typeof markup}.`,
      typeof markup === "string" ? markup : undefined
    );
  }

  const out = html.replace(
    ROOT_DIV,
    `<div id="root">${markup}</div>\n` +
      `    <script type="application/json" id="${BOOT_DATA_ID}">${bootJson}</script>`
  );

  writeFileSync(file, out, "utf8");
  console.log(`  ✓ dist/${page} (${(markup.length / 1024).toFixed(1)} KB of markup)`);
  written++;
}

// The SSR bundle is a build artefact of this step and must not be published:
// it is server code, and `publish = "dist"` would not ship it anyway, but a
// stale copy on the next run would silently render yesterday's components.
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });

console.log(`✓ Prerendered ${written} page(s).`);
