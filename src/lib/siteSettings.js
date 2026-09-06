// ============================================================
//  Site-wide settings that are not project content.
//
//  Today that is one thing: the CV. It is a file the owner replaces from time
//  to time, so it cannot live in the repository as a constant — it is uploaded
//  from the admin area, stored in Supabase Storage, and its public URL is kept
//  in `public.site_settings` (supabase/migrations/004-site-settings.sql).
//
//  Kept pure and dependency-free for the same reason as projectRow.js: it is
//  unit-testable without a browser or a database, and the public site and the
//  admin share one definition of what a settings row means.
//
//  The table is key/value on purpose. A settings table with one column per
//  setting needs a migration — and a deploy — for every new one; the site can
//  ignore a key it does not know, which is what makes adding one safe.
// ============================================================

// One row per language. A recruiter reading Hebrew should get the Hebrew CV.
export const CV_KEYS = { en: "cv_url_en", he: "cv_url_he" };

const clean = (s) => String(s ?? "").trim();

// Null and empty string both mean "not uploaded yet", which is a normal state
// and renders no button at all. A shape that is not a list of rows is
// something else — a caller bug — and returning "no CV" would bury it.
export function fromSettingsRows(rows) {
  if (!Array.isArray(rows)) {
    throw new TypeError(`site settings: expected an array of rows, got ${typeof rows}`);
  }
  const byKey = new Map(rows.map((r) => [r?.key, r?.value]));
  return {
    cvEn: clean(byKey.get(CV_KEYS.en)),
    cvHe: clean(byKey.get(CV_KEYS.he)),
  };
}

// The CV to offer a visitor reading `lang`.
//
// Falling back to the other language is deliberate and is NOT a default value
// hiding a missing one: both files are the same document, and one CV is worth
// more to a visitor than no button. When neither exists this returns "" and
// the caller renders nothing — better no button than a button that 404s in
// front of a hiring manager.
export function cvUrl(settings, lang) {
  const mine = lang === "he" ? settings.cvHe : settings.cvEn;
  const other = lang === "he" ? settings.cvEn : settings.cvHe;
  return clean(mine) || clean(other);
}

export const EMPTY_SETTINGS = { cvEn: "", cvHe: "" };

// ============================================================
//  The static CV at /cv.pdf.
//
//  A second, deliberately dumber mechanism alongside the uploaded one above:
//  a file committed to the repository at a fixed address, so /cv.pdf is
//  something that can be written on an application or in an email signature
//  and keeps working.
//
//  The value is decided at BUILD time by scripts/cv-status.mjs and injected
//  by vite.config.js. It is "" while public/cv.pdf is still the placeholder
//  the repository ships, which is what stops a recruiter opening a one-page
//  file that says "placeholder" - the same failure the comment on cvUrl warns
//  about. Committing the real PDF over it turns the link on with no code
//  change.
//
//  The typeof guard is for environments where the define does not run - the
//  unit tests, which exercise these functions directly.
// ============================================================
export const STATIC_CV =
  typeof __STATIC_CV_PATH__ === "string" ? __STATIC_CV_PATH__ : "";

// The CV link to render, or "" for no button at all.
//
// The uploaded file wins: it is the one that can be replaced without a
// deploy, so it is the more current of the two by construction. This is a
// documented order of preference between two real sources, not a default
// standing in for a missing value - when neither exists the answer is still
// "no button".
export function cvHref(settings, lang, staticCv = STATIC_CV) {
  return cvUrl(settings ?? EMPTY_SETTINGS, lang) || staticCv;
}
