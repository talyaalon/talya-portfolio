// ============================================================
//  Is public/cv.pdf a real CV yet?
//
//  There are two CV mechanisms on this site, and they are not rivals:
//
//    1. site_settings.cv_url_* - uploaded from /admin, one file per language,
//       replaceable without a deploy. This is the preferred one and stays the
//       first choice everywhere.
//    2. public/cv.pdf - committed to the repo and served at a fixed URL, so
//       the link works even before anything is uploaded, and so /cv.pdf is a
//       stable address to put on a CV, in a signature or in an application.
//
//  The repository ships a PLACEHOLDER at that path. Linking it unconditionally
//  would mean a recruiter clicking "Download CV" and getting a one-page file
//  that says "placeholder" - which is the failure the existing code already
//  warns about ("better no button than a button that 404s in front of a
//  hiring manager", src/lib/siteSettings.js).
//
//  So the link is decided at BUILD time by looking at the file: while it is
//  still the placeholder the static link does not exist, and the moment the
//  real PDF is committed over it the link appears with no code change.
// ============================================================

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// The URL the site uses. It is a plain file in public/, so Netlify serves it
// with no redirect rule.
export const CV_PUBLIC_PATH = "/cv.pdf";

export const CV_FILE = join("public", "cv.pdf");

// Written into the placeholder PDF as a document-level comment. A real CV
// exported from Word, Pages, Docs or LaTeX will not contain it.
export const PLACEHOLDER_MARKER = "PLACEHOLDER-CV-DO-NOT-PUBLISH";

// `true` only when the file exists AND is not the placeholder.
export function hasRealCv(root = process.cwd()) {
  const file = join(root, CV_FILE);
  if (!existsSync(file)) {
    console.warn(`  ! ${CV_FILE} is missing - the static CV link will not be rendered.`);
    return false;
  }

  // latin1, not utf8: a PDF is binary, and decoding it as UTF-8 would replace
  // invalid sequences with U+FFFD and could eat the marker. latin1 maps every
  // byte to a character, so an ASCII marker always survives intact.
  const bytes = readFileSync(file, "latin1");

  if (bytes.includes(PLACEHOLDER_MARKER)) {
    console.warn(
      `  ! ${CV_FILE} is still the placeholder - the static CV link will not be\n` +
        `    rendered. Replace the file with the real PDF and redeploy.`
    );
    return false;
  }

  if (!bytes.startsWith("%PDF-")) {
    // Not a fallback: refusing to link a file that is not a PDF is the whole
    // job of this function, and staying quiet about it is how it would ship.
    console.warn(`  ! ${CV_FILE} does not begin with %PDF- and will not be linked.`);
    return false;
  }

  return true;
}
