import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import CaseStudy from "./CaseStudy";
import { I18nProvider, TRANSLATIONS } from "../i18n";
import { CASE_STUDIES, METRICS } from "../content/jcafe";

function show(lang = "en") {
  if (lang === "he") localStorage.setItem("talya:lang", "he");
  return render(
    <I18nProvider titleKey="csDocTitle" descriptionKey="csDocDescription">
      <CaseStudy slug="j-cafe" />
    </I18nProvider>
  );
}

describe("the J-Cafe case study page", () => {
  it("leads with the project, its one-line summary and the role", () => {
    show();

    expect(screen.getByRole("heading", { level: 1, name: "J-Cafe Online" })).toBeInTheDocument();
    expect(screen.getByText(/multi-branch bilingual ordering and delivery platform/)).toBeInTheDocument();
    expect(screen.getByText(/Sole developer/)).toBeInTheDocument();
  });

  it("shows every metric with the scope it was measured over", () => {
    show();

    for (const m of METRICS) {
      expect(screen.getByText(m.value)).toBeInTheDocument();
      // The scope line is the point: a number without it is a claim nobody
      // can check. Several metrics share a scope, so getAllByText.
      expect(screen.getAllByText(m.scope.en).length).toBeGreaterThan(0);
    }
    expect(screen.getByText("one branch, Jun-Aug 2025")).toBeInTheDocument();
  });

  it("renders all three case studies on this one page", () => {
    show();

    // Not three separate project pages: they are one system.
    for (const study of CASE_STUDIES) {
      expect(screen.getByRole("heading", { name: study.title.en })).toBeInTheDocument();
    }
  });

  it("gives each case study the same five labelled sections", () => {
    show();

    for (const study of CASE_STUDIES) {
      const section = document.getElementById(study.id);
      expect(section, `no section for ${study.id}`).toBeTruthy();

      const scope = within(section);
      for (const label of ["Context", "Problem", "Constraints", "Decision", "Outcome"]) {
        expect(scope.getByRole("heading", { name: label })).toBeInTheDocument();
      }
      // And the body text under them, not just the labels.
      expect(scope.getByText(study.outcome.en)).toBeInTheDocument();
    }
  });

  it("offers a sticky nav that links to every section", () => {
    show();

    const nav = screen.getByRole("navigation", { name: "On this page" });
    const links = within(nav).getAllByRole("link");
    const hrefs = links.map((a) => a.getAttribute("href"));

    expect(hrefs).toContain("#overview");
    for (const study of CASE_STUDIES) expect(hrefs).toContain(`#${study.id}`);
    expect(hrefs).toContain("#screens");

    // Every target actually exists - an anchor to nothing is a dead link that
    // looks alive.
    for (const href of hrefs) {
      expect(document.getElementById(href.slice(1)), `no target for ${href}`).toBeTruthy();
    }
  });

  it("links back to the projects list rather than relying on history", () => {
    show();
    // Reached from a search result or a pasted link as often as from the home
    // page, where a back button would have nowhere to go.
    expect(screen.getByRole("link", { name: /Back to all projects/ })).toHaveAttribute("href", "/#work");
  });

  it("points the site nav at the home page, not at fragments that are not here", () => {
    show();
    const siteNav = screen.getByRole("navigation", { name: "Main" });
    for (const link of within(siteNav).getAllByRole("link")) {
      const href = link.getAttribute("href");
      expect(href.startsWith("/"), `${href} would scroll to nothing on this page`).toBe(true);
    }
  });

  it("reserves the screenshot slots without shipping an image", () => {
    show();

    // Three empty frames, each with its caption. They stay empty until
    // someone redacts a real screenshot and adds it deliberately.
    expect(screen.getAllByText("Screenshot to follow")).toHaveLength(3);
    expect(screen.getByText(/Manager dashboard/)).toBeInTheDocument();
    expect(document.querySelectorAll(".cs-shot-frame img")).toHaveLength(0);
  });

  it("renders in Hebrew too", () => {
    show("he");

    // The heading specifically: the title also appears in the sticky nav,
    // which is correct and is what makes a bare getByText ambiguous.
    expect(screen.getByRole("heading", { name: CASE_STUDIES[0].title.he })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: TRANSLATIONS.he.csOverview })).toBeInTheDocument();
    expect(screen.getByText("סניף אחד, יוני-אוגוסט 2025")).toBeInTheDocument();
    expect(document.querySelector("[dir=rtl]")).toBeTruthy();
  });

  it("refuses a slug it has no content for, rather than rendering an empty page", () => {
    expect(() =>
      render(
        <I18nProvider>
          <CaseStudy slug="does-not-exist" />
        </I18nProvider>
      )
    ).toThrow(/no content for slug/);
  });
});
