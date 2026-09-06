import { describe, expect, it } from "vitest";
import {
  fromRow,
  toRow,
  blankProject,
  isValidUrl,
  invalidUrlFields,
  SchemaMismatchError,
  REQUIRED_COLUMNS,
  CORE_COLUMNS,
  MIGRATION_001_COLUMNS,
  MIGRATION_002_COLUMNS,
  MIGRATION_003_COLUMNS,
  MIGRATION_005_COLUMNS,
  pendingMigration,
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

  it("throws instead of silently blanking a field when a CORE column is missing", () => {
    // A missing core column means the row is not what this code understands.
    // Turning it into "" is how the demo_url schema drift stayed invisible.
    const row = dbRow();
    delete row.name_en;
    delete row.short_he;

    expect(() => fromRow(row)).toThrow(SchemaMismatchError);
    try {
      fromRow(row);
    } catch (e) {
      expect(e.missing).toEqual(["name_en", "short_he"]);
      expect(e.message).toMatch(/name_en/);
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

describe("an unmigrated database", () => {
  // The live database has not run migration 001 yet. The public site must keep
  // working against it: throwing here would replace the portfolio with an
  // error message the moment this build went out.
  function legacyRow(overrides = {}) {
    const row = {};
    for (const col of CORE_COLUMNS) row[col] = null;
    return { ...row, id: "abc", tools: [], position: 0, demo_url: "https://legacy.test", ...overrides };
  }

  it("renders rows that predate role/impact/status without throwing", () => {
    const p = fromRow(legacyRow({ name_en: "Air Manage" }));
    expect(p.nameEn).toBe("Air Manage");
    expect(p.roleEn).toBe("");
    expect(p.impactEn).toBe("");
    expect(p.status).toBe("");
  });

  it("falls back to the legacy demo_url column", () => {
    expect(fromRow(legacyRow()).demoEn).toBe("https://legacy.test");
  });

  it("reports exactly which columns the migrations still owe", () => {
    expect(pendingMigration(legacyRow())).toEqual([
      ...MIGRATION_001_COLUMNS,
      ...MIGRATION_002_COLUMNS,
      ...MIGRATION_003_COLUMNS,
      ...MIGRATION_005_COLUMNS,
    ]);
    const migrated = {};
    for (const c of [
      ...CORE_COLUMNS,
      ...MIGRATION_001_COLUMNS,
      ...MIGRATION_002_COLUMNS,
      ...MIGRATION_003_COLUMNS,
      ...MIGRATION_005_COLUMNS,
    ]) {
      migrated[c] = null;
    }
    expect(pendingMigration(migrated)).toEqual([]);
  });

  it("still throws when a CORE column is absent", () => {
    const row = legacyRow();
    delete row.name_en;
    expect(() => fromRow(row)).toThrow(SchemaMismatchError);
  });

  it("omits unmigrated columns from a write instead of failing the whole save", () => {
    const row = toRow(
      { ...blankProject(), nameEn: "X", roleEn: "Sole dev" },
      ["name_en", "short_en", "tools", "position"]
    );
    expect(Object.keys(row).sort()).toEqual(["name_en", "position", "short_en", "tools"]);
    expect(row).not.toHaveProperty("role_en");
  });
});

describe("a private repository", () => {
  it("carries the flag in both directions", () => {
    const p = fromRow(dbRow({ repo_url: "https://github.com/company/jcafe", repo_private: true }));
    expect(p.repo).toBe("https://github.com/company/jcafe");
    expect(p.repoPrivate).toBe(true);
    expect(toRow({ ...blankProject(), repoPrivate: true }).repo_private).toBe(true);
  });

  it("treats a null or absent column as public rather than throwing", () => {
    // repo_private arrives null from a row written before the column existed,
    // and is absent entirely from a database that has not run migration 002.
    expect(fromRow(dbRow({ repo_private: null })).repoPrivate).toBe(false);
    const row = dbRow();
    delete row.repo_private;
    expect(fromRow(row).repoPrivate).toBe(false);
  });

  it("a database that stopped after 001 owes every column added since", () => {
    const row = {};
    for (const c of [...CORE_COLUMNS, ...MIGRATION_001_COLUMNS]) row[c] = null;
    expect(pendingMigration(row)).toEqual([
      ...MIGRATION_002_COLUMNS,
      ...MIGRATION_003_COLUMNS,
      ...MIGRATION_005_COLUMNS,
    ]);
  });
});

describe("an embedded presentation", () => {
  it("carries the embed URL in both directions", () => {
    const url = "https://www.canva.com/design/A/B/view";
    expect(fromRow(dbRow({ embed_url: url })).embedUrl).toBe(url);
    expect(toRow({ ...blankProject(), embedUrl: url }).embed_url).toBe(url);
  });

  it("degrades to empty on a database that has not run migration 003", () => {
    const row = dbRow();
    delete row.embed_url;
    expect(fromRow(row).embedUrl).toBe("");
    expect(pendingMigration(row)).toEqual(MIGRATION_003_COLUMNS);
  });

  it("validates the embed URL like every other link the form accepts", () => {
    expect(invalidUrlFields({ ...blankProject(), embedUrl: "canva.com/x" })).toEqual(["embedUrl"]);
  });
});
