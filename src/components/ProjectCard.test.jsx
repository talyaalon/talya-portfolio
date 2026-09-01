import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import ProjectCard from "./ProjectCard";
import { I18nProvider } from "../i18n";

function card(overrides = {}) {
  const project = {
    id: "p1",
    nameEn: "Air Manage",
    nameHe: "אייר מנג'",
    shortEn: "Maintenance platform",
    shortHe: "פלטפורמת תחזוקה",
    tools: [],
    screenshot: "",
    logo: "",
    ...overrides,
  };
  render(
    <I18nProvider>
      <ProjectCard project={project} isAdmin={false} onOpen={() => {}} onEdit={() => {}} onDelete={() => {}} />
    </I18nProvider>
  );
}

const phone = () => document.querySelector(".dev-phone img");
const laptop = () => document.querySelector(".dev-laptop img");

describe("ProjectCard device mockup", () => {
  it("pairs a -desktop capture with its -mobile sibling", () => {
    card({ screenshot: "/shots/jcafe-desktop.png" });
    expect(laptop()).toHaveAttribute("src", "/shots/jcafe-desktop.webp");
    expect(phone()).toHaveAttribute("src", "/shots/jcafe-mobile.webp");
  });

  // The regression: this row stores a bare name because it predates the
  // -desktop/-mobile convention, and the card used to render a laptop alone
  // while /shots/airmanage-mobile.png sat in the same directory unused.
  it("pairs a bare capture name with its -mobile sibling too", () => {
    card({ screenshot: "/shots/airmanage.png" });
    expect(laptop()).toHaveAttribute("src", "/shots/airmanage.webp");
    expect(phone()).toHaveAttribute("src", "/shots/airmanage-mobile.webp");
  });

  it("drops the phone when the mobile capture does not exist", () => {
    card({ screenshot: "/shots/nomobile.png" });
    const img = phone();
    expect(img).toBeTruthy();

    fireEvent.error(img); // .webp missing -> preferWebp falls back to .png
    expect(phone()).toHaveAttribute("src", "/shots/nomobile-mobile.png");

    fireEvent.error(phone()); // .png missing too -> there is no phone capture
    expect(phone()).toBeNull();
    expect(laptop()).toBeTruthy(); // the laptop is untouched
  });

  it("renders no devices at all for a project with only a logo", () => {
    card({ logo: "https://cdn.test/logo.png" });
    expect(document.querySelector(".devices")).toBeNull();
    // the logo still renders, just as a single image rather than a device
    expect(document.querySelector(".shot img")).toHaveAttribute("src", "https://cdn.test/logo.png");
  });
});

// A repo that belongs to the company is not a link — it is a fact about the
// project. The card says the code lives on GitHub and stops there: no href,
// and the private URL never reaches the page a visitor can read.
describe("ProjectCard private repository", () => {
  const ghLink = () => document.querySelector('.plinks a[href*="github.com"]');
  const badge = () => document.querySelector(".plink.locked");

  it("still links a public repo", () => {
    card({ repo: "https://github.com/talyaalon/portfolio" });
    expect(ghLink()).toHaveAttribute("href", "https://github.com/talyaalon/portfolio");
    expect(badge()).toBeNull();
  });

  it("replaces the link with a locked badge when the repo is private", () => {
    card({ repo: "https://github.com/company/jcafe-internal", repoPrivate: true });
    expect(ghLink()).toBeNull();
    expect(badge()).toBeTruthy();
    expect(badge().tagName).toBe("SPAN"); // not an anchor, not a button
    expect(badge().textContent).toMatch(/GitHub/);
    // The whole point: the private URL is not in the document at all.
    expect(document.body.innerHTML).not.toContain("jcafe-internal");
  });

  it("says the repo exists even when no URL is stored for it", () => {
    card({ repo: "", repoPrivate: true });
    expect(badge()).toBeTruthy();
  });

  it("says nothing about GitHub for a project with no repo at all", () => {
    card({ repo: "" });
    expect(badge()).toBeNull();
    expect(ghLink()).toBeNull();
  });
});

// The presentation lives in the laptop screen instead of a screenshot, and the
// video and the deck both open large without leaving the portfolio.
describe("ProjectCard Canva embeds", () => {
  const DECK =
    "https://www.canva.com/design/DAHIlZS0X2s/RHLvNjN8vUfCFCgN5_IOlA/view?utm_medium=link2";
  const VIDEO =
    "https://www.canva.com/design/DAHIlXt6qHo/KdKer3C_SbbbIzBy8WcpAA/watch?utm_medium=link2";

  const frame = () => document.querySelector(".dev-laptop iframe");
  const lightbox = () => document.querySelector(".shot-lightbox .lb-embed");

  it("puts the deck in the laptop screen instead of the empty-screenshot panel", () => {
    card({ embedUrl: DECK });
    expect(document.querySelector(".shot-empty")).toBeNull();
    expect(frame()).toHaveAttribute(
      "src",
      "https://www.canva.com/design/DAHIlZS0X2s/RHLvNjN8vUfCFCgN5_IOlA/view?embed"
    );
    // no phone: there is no mobile capture to pair with an embed
    expect(document.querySelector(".dev-phone")).toBeNull();
  });

  it("opens the deck large when the laptop is clicked", () => {
    card({ embedUrl: DECK });
    expect(lightbox()).toBeNull();
    fireEvent.click(document.querySelector(".dev-laptop"));
    expect(lightbox()).toHaveAttribute(
      "src",
      "https://www.canva.com/design/DAHIlZS0X2s/RHLvNjN8vUfCFCgN5_IOlA/view?embed"
    );
  });

  it("gives the deck its own button, for the phone where the frame is tiny", () => {
    card({ embedUrl: DECK });
    const btn = [...document.querySelectorAll(".plinks button")].find((b) =>
      b.className.includes("soft")
    );
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(lightbox()).toBeTruthy();
  });

  it("opens an embeddable video in the page rather than a new tab", () => {
    card({ demoEn: VIDEO, demoHe: VIDEO });
    // it is a button, not an anchor: nothing navigates away
    expect(document.querySelector('.plinks a[href*="canva.com"]')).toBeNull();
    const btn = [...document.querySelectorAll(".plinks button")].find((b) =>
      b.textContent.trim()
    );
    fireEvent.click(btn);
    expect(lightbox()).toHaveAttribute(
      "src",
      "https://www.canva.com/design/DAHIlXt6qHo/KdKer3C_SbbbIzBy8WcpAA/watch?embed"
    );
  });

  // The demo field is generic. A link that cannot be framed must keep behaving
  // exactly as it does today rather than opening an iframe that stays blank.
  it("still opens a non-embeddable demo link in a new tab", () => {
    card({ demoEn: "https://youtu.be/abc123", demoHe: "https://youtu.be/abc123" });
    const a = document.querySelector('.plinks a[href="https://youtu.be/abc123"]');
    expect(a).toHaveAttribute("target", "_blank");
  });
});
