// ============================================================
//  The join between a project row (database) and its case study (repository).
//
//  A project's card comes from `projects`; the long-form page comes from
//  src/content/. `slug` is the key, added by
//  supabase/migrations/005-project-slug.sql.
//
//  Kept separate from the content module so a component can ask "does this
//  project have a case study?" without importing the case study text - and
//  pure, so it is testable without a browser.
// ============================================================

import { CASE_STUDY_PAGES } from "../content/jcafe";

// The URL a case study lives at. One place, because it appears in the card
// link, the sticky nav, the sitemap and the Netlify rewrite, and a mismatch
// between any two of them is a dead link.
export function caseStudyPath(slug) {
  return `/projects/${slug}`;
}

// The case study for a project, or null when it has none.
//
// null is the ordinary answer, not a failure: most projects are a card and
// nothing more. A slug that is set but has no content in the repository is a
// different thing - somebody typed a slug into /admin that no page matches -
// and it returns null too, so the card renders without a link into a 404
// rather than promising a page that is not there.
export function caseStudyFor(project) {
  const slug = project?.slug;
  if (!slug) return null;
  return CASE_STUDY_PAGES[slug] ?? null;
}

export function hasCaseStudy(project) {
  return caseStudyFor(project) !== null;
}

// Puts the project that has a case study first, keeping everything else in
// the order the database gave.
//
// Deliberately not left to the `position` column: the featured card is a
// different SHAPE, not just a different place in the list, and a card that is
// twice the size of the others has to be the one at the top. Tying that to a
// number an editor can change from /admin would mean the layout breaks the
// first time somebody reorders the list.
export function featuredFirst(projects) {
  const featured = projects.filter(hasCaseStudy);
  const rest = projects.filter((p) => !hasCaseStudy(p));
  return [...featured, ...rest];
}
