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
