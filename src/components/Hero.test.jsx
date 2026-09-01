import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "./Hero";
import { I18nProvider } from "../i18n";

// The CV is uploaded from the admin area and its URL is read from the
// database, so the hook is mocked here rather than the network: this file is
// about what the hero renders for each answer, in both languages.
const settings = vi.hoisted(() => ({ value: null }));
vi.mock("../hooks/useSiteSettings", () => ({
  useSiteSettings: () => ({ settings: settings.value, error: null, reload: () => {} }),
}));

const EN = "https://cdn.test/talya-cv-en.pdf";
const HE = "https://cdn.test/talya-cv-he.pdf";

function show(value, lang = "en") {
  settings.value = value;
  localStorage.setItem("talya:lang", lang);
  return render(
    <I18nProvider>
      <Hero />
    </I18nProvider>
  );
}

const cvLink = () => document.querySelector('a[href$=".pdf"]');

beforeEach(() => {
  localStorage.clear();
  settings.value = null;
});

describe("the CV button", () => {
  it("is not rendered before the settings have loaded", () => {
    show(null);
    expect(cvLink()).toBeNull();
  });

  // Better no button than a button that 404s in front of a hiring manager.
  it("is not rendered when no CV has been uploaded", () => {
    show({ cvEn: "", cvHe: "" });
    expect(cvLink()).toBeNull();
    // With nothing to download, the email button is the primary call to action.
    expect(screen.getByRole("link", { name: /Email me/ })).toHaveClass("btn-primary");
  });

  it("opens the CV for viewing in a new tab instead of downloading it", () => {
    show({ cvEn: EN, cvHe: "" });
    const link = cvLink();
    expect(link).toHaveAttribute("href", EN);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).not.toHaveAttribute("download");
    expect(link).toHaveTextContent("View CV");
  });

  it("gives a Hebrew reader the Hebrew file", () => {
    show({ cvEn: EN, cvHe: HE }, "he");
    expect(cvLink()).toHaveAttribute("href", HE);
    expect(cvLink()).toHaveTextContent("צפייה בקורות החיים");
  });

  // One CV is worth more than none: uploading only one file still gives every
  // visitor something to forward.
  it("falls back to the other language when only one file exists", () => {
    show({ cvEn: EN, cvHe: "" }, "he");
    expect(cvLink()).toHaveAttribute("href", EN);
  });

  it("takes over as the primary call to action when it exists", () => {
    show({ cvEn: EN, cvHe: "" });
    expect(cvLink()).toHaveClass("btn-primary");
    expect(screen.getByRole("link", { name: /Email me/ })).toHaveClass("btn-ghost");
  });
});
