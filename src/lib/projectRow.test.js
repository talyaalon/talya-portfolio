import { describe, expect, it } from "vitest";
import {
  fromRow,
  toRow,
  blankProject,
  isValidUrl,
  invalidUrlFields,
  SchemaMismatchError,
  REQUIRED_COLUMNS,
} from "./projectRow";

// A row exactly as the migrated database returns it.
function dbRow(overrides = {}) {
  const row = {};
  for (const col of REQUIRED_COLUMNS) row[col] = null;
  return { ...row, id: "abc", tools: [], position: 0, ...overrides };
}

describe("fromRow", () => {
  it("maps bilingual demo links from the columns the app actually writes", () => {
    // The regression: schema.sql declared a single `demo_url` while the app
    // read demo_url_en / demo_url_he, so every demo link silently vanished.
    const p = fromRow(dbRow({ demo_url_en: "https://en.example.com", demo_url_he: "https://he.example.com" }));
    expect(p.demoEn).toBe("https://en.example.com");
    expect(p.demoHe).toBe("https://he.example.com");
  });

  it("throws instead of silently blanking a field when a column is missing", () => {
    const row = dbRow();
    delete row.demo_url_en;
    delete row.impact_he;

    expect(() => fromRow(row)).toThrow(SchemaMismatchError);
    try {
      fromRow(row);
    } catch (e) {
      expect(e.missing).toEqual(["impact_he", "demo_url_en"].sort((a, b) => REQUIRED_COLUMNS.indexOf(a) - REQUIRED_COLUMNS.indexOf(b)));
      expect(e.message).toMatch(/demo_url_en/);
    }
  });

  it("normalises null text to an empty string but keeps zero as a number", () => {
    const p = fromRow(dbRow({ name_en: null, position: 0 }));
    expect(p.nameEn).toBe("");
    expect(p.position).toBe(0);
  });

  it("carries role, impact and status through", () => {
    const p = fromRow(dbRow({ role_en: "Sole developer", impact_en: "12 branches live", status: "production" }));
    expect(p.roleEn).toBe("Sole developer");
    expect(p.impactEn).toBe("12 branches live");
    expect(p.status).toBe("production");
  });
});

describe("toRow", () => {
  it("persists screenshot and position, which used to be dropped on save", () => {
    const row = toRow({ ...blankProject(), screenshot: "https://x.test/s.png", position: 3 });
    expect(row.screenshot_url).toBe("https://x.test/s.png");
    expect(row.position).toBe(3);
  });

  it("writes the bilingual demo columns", () => {
    const row = toRow({ ...blankProject(), demoEn: "https://a.test", demoHe: "https://b.test" });
    expect(row.demo_url_en).toBe("https://a.test");
    expect(row.demo_url_he).toBe("https://b.test");
  });

  it("turns blank text into null rather than empty strings", () => {
    const row = toRow({ ...blankProject(), nameEn: "   " });
    expect(row.name_en).toBeNull();
  });

  it("rejects an unknown status rather than storing it", () => {
    expect(toRow({ ...blankProject(), status: "totally-made-up" }).status).toBeNull();
    expect(toRow({ ...blankProject(), status: "production" }).status).toBe("production");
  });

  it("round-trips through fromRow without losing a field", () => {
    const original = {
      ...blankProject(),
      nameEn: "Air Manage", roleEn: "Sole developer", impactEn: "12 branches",
      demoEn: "https://a.test", screenshot: "https://s.test/x.png",
      status: "production", position: 2, tools: ["React"],
    };
    const back = fromRow({ ...dbRow(), ...toRow(original), id: "abc" });
    expect(back.nameEn).toBe("Air Manage");
    expect(back.roleEn).toBe("Sole developer");
    expect(back.impactEn).toBe("12 branches");
    expect(back.demoEn).toBe("https://a.test");
    expect(back.screenshot).toBe("https://s.test/x.png");
    expect(back.status).toBe("production");
    expect(back.position).toBe(2);
  });
});

describe("isValidUrl", () => {
  it("accepts empty (the fields are optional)", () => {
    expect(isValidUrl("")).toBe(true);
    expect(isValidUrl(null)).toBe(true);
  });

  it("rejects a scheme-less link, which would resolve as a relative path", () => {
    expect(isValidUrl("example.com")).toBe(false);
    expect(isValidUrl("/projects/x")).toBe(false);
  });

  it("rejects javascript: URLs", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });

  it("accepts http and https", () => {
    expect(isValidUrl("https://example.com/a?b=1")).toBe(true);
    expect(isValidUrl("http://localhost:5173")).toBe(true);
  });

  it("names every bad field so the form can explain itself", () => {
    const bad = invalidUrlFields({ ...blankProject(), link: "example.com", repo: "https://ok.test" });
    expect(bad).toEqual(["link"]);
  });
});
