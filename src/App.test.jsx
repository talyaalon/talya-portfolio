import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { I18nProvider, TRANSLATIONS } from "./i18n";
import { REQUIRED_COLUMNS } from "./lib/projectRow";

// A row shaped exactly like the migrated database returns.
function dbRow(overrides = {}) {
  const row = {};
  for (const col of REQUIRED_COLUMNS) row[col] = null;
  return {
    ...row,
    id: "p1",
    name_en: "Air Manage",
    name_he: "אייר מנג'",
    short_en: "Maintenance platform",
    short_he: "פלטפורמת תחזוקה",
    tools: ["React"],
    position: 0,
    ...overrides,
  };
}

function mockFetch(rows, settingsRows = []) {
  return vi.fn(async (url) => {
    if (String(url).includes("/rest/v1/projects")) {
      return { ok: true, status: 200, json: async () => rows, text: async () => "" };
    }
    // The hero and the contact section read the CV from here. An empty table
    // is the normal state until one is uploaded, and must stay a page with no
    // CV button rather than a page with an error on it.
    if (String(url).includes("/rest/v1/site_settings")) {
      return { ok: true, status: 200, json: async () => settingsRows, text: async () => "" };
    }
    return { ok: true, status: 204, json: async () => ({}), text: async () => "" };
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// The public site was refactored heavily (admin split out, SDK removed, i18n
// re-keyed). i18n's t() THROWS on a missing key in dev, so a stale key anywhere
// takes the whole page down — exactly the regression this guards.
describe("public site renders", () => {
  it("renders the full page in English without throwing", async () => {
    global.fetch = mockFetch([dbRow()]);

    render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Talya Israel" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Air Manage")).toBeInTheDocument());

    for (const name of ["About", "Selected Projects", "Skills"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("renders in Hebrew with dir=rtl", async () => {
    localStorage.setItem("talya:lang", "he");
    global.fetch = mockFetch([dbRow()]);

    const { container } = render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );

    expect(await screen.findByRole("heading", { level: 1, name: "טליה ישראל" })).toBeInTheDocument();
    expect(container.querySelector("[dir=rtl]")).toBeTruthy();
    expect(document.documentElement.lang).toBe("he");
  });

  it("exposes a contentinfo landmark outside <main>", async () => {
    global.fetch = mockFetch([dbRow()]);
    const { container } = render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );
    await screen.findByRole("heading", { level: 1 });

    // <footer> only maps to contentinfo when it is NOT inside main/section, so
    // assert the nesting directly — the role query alone would pass either way.
    const footer = container.querySelector("footer.site-footer");
    expect(footer).toBeTruthy();
    expect(footer.closest("main")).toBeNull();
    expect(footer.closest("section")).toBeNull();
  });

  it("shows a neutral message when projects cannot be loaded", async () => {
    global.fetch = vi.fn(async () => ({ ok: false, status: 500, text: async () => "boom" }));

    render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );

    // Never developer instructions or raw database text at a recruiter.
    expect(await screen.findByText(TRANSLATIONS.en.projLoadFailed)).toBeInTheDocument();
    expect(screen.queryByText(/\.env/)).toBeNull();
    expect(screen.queryByText(/boom/)).toBeNull();
  });

  it("renders no admin controls for a visitor", async () => {
    global.fetch = mockFetch([dbRow()]);
    render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );
    await screen.findByRole("heading", { level: 1 });

    expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /add project/i })).toBeNull();
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });

  it("does not label an unknown status as Archived", async () => {
    global.fetch = mockFetch([dbRow({ status: "something-new" })]);
    render(
      <I18nProvider>
        <App />
      </I18nProvider>
    );
    await screen.findByText("Air Manage");
    expect(screen.queryByText(/Archived/)).toBeNull();
  });
});

describe("i18n key parity", () => {
  it("defines the same keys in both languages", () => {
    const en = Object.keys(TRANSLATIONS.en).sort();
    const he = Object.keys(TRANSLATIONS.he).sort();
    expect(he).toEqual(en);
  });
});
