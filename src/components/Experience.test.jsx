import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Experience from "./Experience";
import { I18nProvider } from "../i18n";
import { EXPERIENCE, EDUCATION, AWARDS, LANGUAGES, formatPeriod } from "../content/resume";

function renderAt(lang) {
  localStorage.setItem("talya:lang", lang);
  return render(
    <I18nProvider>
      <Experience />
    </I18nProvider>
  );
}

describe("Experience", () => {
  it("shows the employer, title and dates a recruiter screens on", () => {
    renderAt("en");
    expect(screen.getByRole("heading", { name: /Full Stack Developer & Operations Coordinator/ })).toBeInTheDocument();
    expect(screen.getByText(/The Kosher Place/)).toBeInTheDocument();
    expect(screen.getByText("March 2025 – Present")).toBeInTheDocument();
  });

  it("shows education, the award and languages", () => {
    renderAt("en");
    expect(screen.getByText("B.Sc. in Software Engineering")).toBeInTheDocument();
    expect(screen.getByText(/Lev Academic Center/)).toBeInTheDocument();
    expect(screen.getByText(/2nd place, Outstanding Projects Competition/)).toBeInTheDocument();
    expect(screen.getByText(/Hebrew — native/)).toBeInTheDocument();
  });

  it("renders in Hebrew too", () => {
    renderAt("he");
    expect(screen.getByText(/מפתחת Full Stack ורכזת תפעול/)).toBeInTheDocument();
    expect(screen.getByText("מרץ 2025 – היום")).toBeInTheDocument();
    expect(screen.getByText(/המרכז האקדמי לב/)).toBeInTheDocument();
  });
});

describe("resume data", () => {
  // Everything on the page is a claim made to an employer. Each one must exist
  // in both languages, or a Hebrew reader silently sees an English-only gap.
  it("has both languages for every bullet, degree, award and language", () => {
    for (const role of EXPERIENCE) {
      expect(role.title.en && role.title.he).toBeTruthy();
      expect(role.location.en && role.location.he).toBeTruthy();
      for (const b of role.bullets) expect(b.en && b.he).toBeTruthy();
    }
    for (const e of EDUCATION) expect(e.degree.en && e.degree.he && e.institution.en && e.institution.he).toBeTruthy();
    for (const a of AWARDS) expect(a.title.en && a.title.he && a.detail.en && a.detail.he).toBeTruthy();
    for (const l of LANGUAGES) expect(l.en && l.he).toBeTruthy();
  });

  it("formats an open-ended period as Present", () => {
    expect(formatPeriod("2025-03", null, "en", "Present")).toBe("March 2025 – Present");
    expect(formatPeriod("2020", "2024", "en", "Present")).toBe("2020 – 2024");
  });
});
