import { describe, expect, it } from "vitest";
import { caseStudyFor, caseStudyPath, featuredFirst, hasCaseStudy } from "./caseStudies";
import { SLUG } from "../content/jcafe";

const withSlug = (id, slug) => ({ id, slug });

describe("joining a project row to its case study", () => {
  it("finds the case study for the project that has one", () => {
    const study = caseStudyFor(withSlug("p1", SLUG));
    expect(study).toBeTruthy();
    expect(study.slug).toBe(SLUG);
  });

  it("answers null for a project with no slug, which is most of them", () => {
    // The ordinary case, not a failure.
    expect(caseStudyFor(withSlug("p2", ""))).toBeNull();
    expect(caseStudyFor({ id: "p3" })).toBeNull();
    expect(caseStudyFor(undefined)).toBeNull();
  });

  it("answers null for a slug with no page behind it", () => {
    // Somebody typed a slug into /admin that no content matches. The card
    // renders with no link rather than promising a page that 404s.
    expect(caseStudyFor(withSlug("p4", "not-a-page"))).toBeNull();
    expect(hasCaseStudy(withSlug("p4", "not-a-page"))).toBe(false);
  });

  it("builds the path the rest of the site agrees on", () => {
    // The canonical URL, the sitemap entry and the Netlify rewrite all use
    // this exact shape; a mismatch between any two of them is a dead link.
    expect(caseStudyPath(SLUG)).toBe("/projects/j-cafe");
  });
});

describe("ordering the card list", () => {
  it("puts the project with a case study first", () => {
    const rows = [withSlug("a", ""), withSlug("b", SLUG), withSlug("c", "")];
    expect(featuredFirst(rows).map((p) => p.id)).toEqual(["b", "a", "c"]);
  });

  it("leaves the order of everything else exactly as the database gave it", () => {
    const rows = [withSlug("a", ""), withSlug("b", ""), withSlug("c", "")];
    expect(featuredFirst(rows).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("copes with a list that has no featured project at all", () => {
    // The state on a database that has not run migration 005 yet: no slugs,
    // so no featured card, and the page still renders its projects.
    const rows = [{ id: "a" }, { id: "b" }];
    expect(featuredFirst(rows)).toHaveLength(2);
    expect(rows.some(hasCaseStudy)).toBe(false);
  });

  it("does not drop or duplicate anything", () => {
    const rows = [withSlug("a", ""), withSlug("b", SLUG), withSlug("c", "")];
    const out = featuredFirst(rows);
    expect(out).toHaveLength(rows.length);
    expect(new Set(out.map((p) => p.id))).toEqual(new Set(["a", "b", "c"]));
  });
});
