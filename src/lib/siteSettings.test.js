import { describe, expect, it } from "vitest";
import { CV_KEYS, cvUrl, fromSettingsRows } from "./siteSettings";

// ============================================================
//  Site-wide settings that are not project content: today, the CV.
//
//  Kept pure for the same reason as projectRow.js — it can be tested without a
//  browser or a database, and both entries (public site and admin) share one
//  definition of what a settings row means.
// ============================================================

const row = (key, value) => ({ key, value });

describe("fromSettingsRows", () => {
  it("reads the CV of each language from its own row", () => {
    const s = fromSettingsRows([
      row(CV_KEYS.en, "https://cdn.test/cv-en.pdf"),
      row(CV_KEYS.he, "https://cdn.test/cv-he.pdf"),
    ]);
    expect(s.cvEn).toBe("https://cdn.test/cv-en.pdf");
    expect(s.cvHe).toBe("https://cdn.test/cv-he.pdf");
  });

  it("treats an empty table as 'nothing uploaded yet' rather than an error", () => {
    expect(fromSettingsRows([])).toEqual({ cvEn: "", cvHe: "" });
  });

  it("normalises a null value to empty, the same as a row that is not there", () => {
    expect(fromSettingsRows([row(CV_KEYS.en, null)]).cvEn).toBe("");
  });

  it("ignores keys it does not know, so a future setting cannot break the site", () => {
    expect(fromSettingsRows([row("theme_colour", "pink")])).toEqual({ cvEn: "", cvHe: "" });
  });

  // A shape that is not a list of rows is a bug in the caller, not a missing
  // value, and quietly returning "no CV" would hide it.
  it("throws on anything that is not a list of rows", () => {
    expect(() => fromSettingsRows(null)).toThrow(TypeError);
    expect(() => fromSettingsRows({ cvEn: "x" })).toThrow(TypeError);
  });
});

describe("cvUrl", () => {
  const both = { cvEn: "https://cdn.test/cv-en.pdf", cvHe: "https://cdn.test/cv-he.pdf" };

  it("gives each language its own file", () => {
    expect(cvUrl(both, "en")).toBe(both.cvEn);
    expect(cvUrl(both, "he")).toBe(both.cvHe);
  });

  // One CV is better than none: a visitor reading Hebrew still gets something
  // to forward when only the English file has been uploaded.
  it("falls back to the other language when only one file exists", () => {
    expect(cvUrl({ cvEn: both.cvEn, cvHe: "" }, "he")).toBe(both.cvEn);
    expect(cvUrl({ cvEn: "", cvHe: both.cvHe }, "en")).toBe(both.cvHe);
  });

  // The button is rendered only when this returns something. Better no button
  // than a button that 404s in front of a hiring manager.
  it("returns nothing when no CV has been uploaded", () => {
    expect(cvUrl({ cvEn: "", cvHe: "" }, "en")).toBe("");
  });
});
