import { describe, expect, it, beforeEach } from "vitest";
import { render, PAGES } from "./prerender";
import { REQUIRED_COLUMNS } from "./lib/projectRow";
import { resetBootData } from "./lib/bootData";

// ============================================================
//  The acceptance test for pre-rendering.
//
//  The bug this guards: the built index.html used to be an empty
//  <div id="root"> plus a line of <noscript> text, so Google, LinkedIn's
//  unfurler and any recruiter tool that does not run JavaScript saw a
//  portfolio with no projects on it. Nothing about the page looked wrong in a
//  browser, which is why it survived.
//
//  It asserts on the CONTENT of the markup, not on the render not throwing:
//  a render that quietly returns a loading spinner would satisfy "did not
//  throw" and put the whole bug straight back.
// ============================================================

function dbRow(over = {}) {
  const row = {};
  for (const col of REQUIRED_COLUMNS) row[col] = null;
  return { ...row, id: "p1", tools: [], position: 0, ...over };
}

const PROJECTS = [
  dbRow({
    id: "p1",
    name_en: "J-Cafe Online",
    name_he: "ג'יי-קפה אונליין",
    short_en: "A multi-branch bilingual ordering and delivery platform.",
    short_he: "פלטפורמת הזמנות ומשלוחים רב-סניפית.",
    result_en: "Live in production across 6 branches",
    status: "production",
    tools: ["Next.js 16", "Supabase"],
  }),
  dbRow({ id: "p2", name_en: "Air Manage", short_en: "Maintenance and asset platform.", position: 1 }),
];

beforeEach(() => {
  resetBootData();
});

describe("prerendered home page", () => {
  const html = () => render("index.html", { projects: PROJECTS, settings: [] });

  it("contains the project names, summaries and tools as real text", () => {
    const out = html();

    expect(out).toContain("J-Cafe Online");
    expect(out).toContain("A multi-branch bilingual ordering and delivery platform.");
    expect(out).toContain("Live in production across 6 branches");
    expect(out).toContain("Next.js 16");
    expect(out).toContain("Air Manage");
  });

  it("renders the rest of the page a recruiter is there to read", () => {
    const out = html();

    for (const text of ["Talya Israel", "Selected Projects", "About", "Skills", "Experience"]) {
      expect(out).toContain(text);
    }
  });

  it("renders the projects, not the loading state", () => {
    const out = html();

    // The failure mode that would look like success: effects do not run
    // during a server render, so a component left to fetch its own data
    // prerenders its spinner. The boot data is what prevents that.
    expect(out).not.toContain('class="spinner"');
    expect(out).not.toContain('role="status"');
    expect(out).not.toContain("Projects could not be loaded");
  });

  it("ships the stylesheet as raw CSS, not as escaped entities", () => {
    const out = html();

    // React escapes text children, and a <style> body is raw text to the HTML
    // parser - so an escaped ">" would never be decoded back and the selector
    // would be dead. Only visible once the page is rendered to a string.
    //
    // Scoped to the style element on purpose: entities in the BODY are
    // correct and expected ("Backend &amp; Data"). It is only inside CSS that
    // they are a bug.
    const css = out.match(/<style>([^]*?)<\/style>/)?.[1];
    expect(css).toBeTruthy();
    expect(css).toContain(".reveal{opacity:0");
    expect(css).not.toContain("&gt;");
    expect(css).not.toContain("&amp;");
    expect(css).not.toContain("&quot;");
  });

  it("overrides the reveal animation for readers without JavaScript", () => {
    const out = html();

    // .reveal starts at opacity:0 and is cleared by an IntersectionObserver.
    // Without this the prerendered page is complete in the markup and
    // completely invisible on screen.
    expect(out).toContain("<noscript>");
    expect(out).toMatch(/<noscript>[^]*opacity:1 !important/);
  });

  it("produces a substantial page rather than a shell", () => {
    // A blunt guard on the thing that actually regressed: size.
    expect(html().length).toBeGreaterThan(10000);
  });
});

describe("the page registry", () => {
  it("refuses to render a page it does not know, instead of writing nothing", () => {
    expect(() => render("nope.html", { projects: PROJECTS, settings: [] })).toThrow(/no page registered/);
  });

  it("does not prerender the admin app", () => {
    // It is behind a sign-in and marked noindex; rendering an editor into
    // static HTML would be pure leak with no reader.
    expect(Object.keys(PAGES)).not.toContain("admin.html");
  });
});

describe("prerendered case study page", () => {
  const html = () => render("projects/j-cafe.html", { projects: PROJECTS, settings: [] });

  it("contains the case study prose, not just the headings", () => {
    const out = html();

    expect(out).toContain("Making the server the source of truth for branch identity");
    expect(out).toContain("Integrating with systems I do not control");
    expect(out).toContain("Measuring the funnel instead of guessing at it");
    // Body text, since a page of headings would pass a heading-only check.
    expect(out).toContain("Cross-branch leakage eliminated");
    expect(out).toContain("authorize-and-capture");
  });

  it("contains every metric with its scope", () => {
    const out = html();

    expect(out).toContain("483");
    expect(out).toContain("one branch, Jun-Aug 2025");
    expect(out).toContain("฿1,878");
  });

  it("repeats the five section labels for all three case studies", () => {
    const out = html();

    for (const label of ["Context", "Problem", "Constraints", "Decision", "Outcome"]) {
      const count = out.split(`>${label}</h4>`).length - 1;
      expect(count, `"${label}" appears ${count} times, expected 3`).toBe(3);
    }
  });

  it("does not need the database - its content is in the repository", () => {
    // Rendered with no projects at all: the case study is repository content,
    // so a database outage cannot empty this page.
    const out = render("projects/j-cafe.html", { projects: [], settings: [] });
    expect(out).toContain("Making the server the source of truth for branch identity");
  });
});
