// ============================================================
//  Build-time data, handed to the first render.
//
//  The site is prerendered at build time (scripts/prerender.mjs), which means
//  the HTML a crawler downloads already contains the projects. The browser
//  then mounts React over it. Without this module the client's first render
//  would start from `null` - a spinner - and replace the fully rendered
//  markup with a loading state before the fetch came back. The reader would
//  watch the page empty itself.
//
//  So the same rows the prerender used are embedded in the HTML as a JSON
//  data block, and the hooks start from them. The runtime fetch still runs
//  and still wins: the embedded copy is only as fresh as the last deploy, and
//  the site is edited from /admin between deploys.
//
//  It is a <script type="application/json"> rather than an assignment to
//  window: a JSON data block is not executed, so it needs no CSP script-src
//  exception, and nothing inside it can run.
// ============================================================

export const BOOT_DATA_ID = "__portfolio_boot__";

const EMPTY = { projects: null, settings: null };

let boot = EMPTY;

// Called by the prerender entry (server) and by main.jsx (browser).
export function setBootData(data) {
  boot = {
    projects: Array.isArray(data?.projects) ? data.projects : null,
    settings: Array.isArray(data?.settings) ? data.settings : null,
  };
}

// `null` means "nothing was prerendered" - the dev server, or a build that
// skipped the step. It is a real state, not a missing value: the hooks fall
// back to their ordinary loading path and fetch. An EMPTY ARRAY is a
// different thing and is preserved, because "the database returned no rows"
// is an answer.
export function bootProjects() {
  return boot.projects;
}

export function bootSettings() {
  return boot.settings;
}

export function resetBootData() {
  boot = EMPTY;
}

// Reads the data block the prerender wrote into the page.
//
// A block that is absent is normal (see above). A block that is present but
// unparseable is a build that produced corrupt output, and saying so costs
// nothing - the page still works, it just fetches like it used to.
export function readBootDataFromDocument(doc = document) {
  const el = doc.getElementById(BOOT_DATA_ID);
  if (!el) return false;
  try {
    setBootData(JSON.parse(el.textContent));
    return true;
  } catch (e) {
    console.error(`boot data in #${BOOT_DATA_ID} could not be parsed:`, e);
    return false;
  }
}

// The JSON escape for "<", spelled without a literal backslash in the source
// so that no editor, patch or shell quoting step can silently halve it. A
// build that emitted a bare "<" would still look correct until a project
// description happened to contain one.
const ESCAPED_LT = String.fromCharCode(92) + "u003c";

// Serialises the payload for embedding in HTML.
//
// "</script>" inside a JSON string would close the surrounding tag early and
// the rest of the data would be parsed as markup. Escaping "<" prevents that,
// and the escape is valid JSON, so JSON.parse returns the original text.
export function serializeBootData(data) {
  return JSON.stringify(data).split("<").join(ESCAPED_LT);
}
