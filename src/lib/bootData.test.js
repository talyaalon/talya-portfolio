import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import {
  BOOT_DATA_ID,
  bootProjects,
  bootSettings,
  readBootDataFromDocument,
  resetBootData,
  serializeBootData,
  setBootData,
} from "./bootData";

beforeEach(() => {
  resetBootData();
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("serializeBootData", () => {
  it("escapes < so a project description cannot close the script tag", () => {
    const json = serializeBootData({ projects: [{ short_en: "</script><img onerror=alert(1)>" }] });

    // The whole point: no raw "<" survives, so the block cannot be broken out
    // of no matter what an admin types into a project field.
    expect(json).not.toContain("<");
    expect(json).toContain("\\u003c");
  });

  it("round-trips the original text back through JSON.parse", () => {
    const data = { projects: [{ short_en: "a < b </script> c", name_he: "ג'יי-קפה" }], settings: [] };
    expect(JSON.parse(serializeBootData(data))).toEqual(data);
  });

  // The escape is spelled with String.fromCharCode in the source precisely
  // because a halved backslash is invisible until a "<" shows up in real
  // content. This asserts the escape is a real backslash sequence.
  it("emits a backslash-u escape, not a bare character", () => {
    const json = serializeBootData({ projects: [{ a: "<" }] });
    expect(json).toContain(String.fromCharCode(92) + "u003c");
  });
});

describe("reading the block out of the page", () => {
  function plant(text) {
    const el = document.createElement("script");
    el.type = "application/json";
    el.id = BOOT_DATA_ID;
    el.textContent = text;
    document.body.appendChild(el);
  }

  it("loads projects and settings the prerender embedded", () => {
    plant(JSON.stringify({ projects: [{ id: "p1" }], settings: [{ key: "cv_url_en" }] }));

    expect(readBootDataFromDocument(document)).toBe(true);
    expect(bootProjects()).toEqual([{ id: "p1" }]);
    expect(bootSettings()).toEqual([{ key: "cv_url_en" }]);
  });

  it("reports nothing prerendered when the block is absent", () => {
    // The dev server and the tests: a real state, not a failure.
    expect(readBootDataFromDocument(document)).toBe(false);
    expect(bootProjects()).toBeNull();
  });

  it("says so loudly when the block is present but corrupt", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    plant("{not json");

    expect(readBootDataFromDocument(document)).toBe(false);
    expect(bootProjects()).toBeNull(); // falls back to fetching, not to junk
    expect(spy).toHaveBeenCalled();
  });
});

describe("setBootData", () => {
  it("keeps an empty list, which means the database answered with no rows", () => {
    setBootData({ projects: [], settings: [] });
    // Distinct from null: null means "not prerendered, go and fetch".
    expect(bootProjects()).toEqual([]);
    expect(bootProjects()).not.toBeNull();
  });

  it("treats a non-list as nothing prerendered rather than trusting it", () => {
    setBootData({ projects: "oops", settings: undefined });
    expect(bootProjects()).toBeNull();
    expect(bootSettings()).toBeNull();
  });
});
