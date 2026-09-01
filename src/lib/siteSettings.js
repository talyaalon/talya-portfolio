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
