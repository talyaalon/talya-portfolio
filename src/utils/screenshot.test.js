import { describe, expect, it } from "vitest";
import { webpVariant, preferWebp, mobileVariant } from "./screenshot";

describe("webpVariant", () => {
  it("maps a local screenshot to its webp sibling", () => {
    expect(webpVariant("/screenshots/air-manage.png")).toBe("/screenshots/air-manage.webp");
    expect(webpVariant("/screenshots/nlp-cert.jpg")).toBe("/screenshots/nlp-cert.webp");
  });

  it("leaves remote URLs alone — there is no webp sibling to guess at", () => {
    expect(webpVariant("https://cdn.supabase.co/logos/x.png")).toBeNull();
    expect(webpVariant("/portrait.jpg")).toBeNull();
    expect(webpVariant(null)).toBeNull();
  });
});

describe("preferWebp", () => {
  it("falls back to the stored URL exactly once", () => {
    const { src, onError } = preferWebp("/screenshots/air-manage.png");
    expect(src).toBe("/screenshots/air-manage.webp");

    const el = { dataset: {}, src: "" };
    onError({ currentTarget: el });
    expect(el.src).toBe("/screenshots/air-manage.png");

    el.src = "sentinel";
    onError({ currentTarget: el });
    expect(el.src).toBe("sentinel"); // no loop
  });

  it("passes a remote URL through untouched", () => {
    expect(preferWebp("https://cdn.test/a.png")).toEqual({
      src: "https://cdn.test/a.png",
      onError: undefined,
    });
  });
});

describe("the /shots/ directory the database actually references", () => {
  it("maps desktop and mobile captures to webp", () => {
    expect(webpVariant("/shots/jcafe-desktop.png")).toBe("/shots/jcafe-desktop.webp");
    expect(webpVariant("/shots/jcafe-mobile.png")).toBe("/shots/jcafe-mobile.webp");
    expect(webpVariant("/shots/airmanage.png")).toBe("/shots/airmanage.webp");
  });

  it("still falls back to the stored .png if the webp is absent", () => {
    const { src, onError } = preferWebp("/shots/hgorer-desktop.png");
    expect(src).toBe("/shots/hgorer-desktop.webp");
    const el = { dataset: {}, src: "" };
    onError({ currentTarget: el });
    expect(el.src).toBe("/shots/hgorer-desktop.png");
  });
});

describe("mobileVariant — which phone capture belongs to a desktop capture", () => {
  it("maps a -desktop capture to its -mobile sibling", () => {
    expect(mobileVariant("/shots/jcafe-desktop.png")).toBe("/shots/jcafe-mobile.png");
    expect(mobileVariant("/shots/bom-desktop.png")).toBe("/shots/bom-mobile.png");
  });

  // The regression this exists for: Air Manage's row was written before the
  // -desktop/-mobile convention and stores a bare name, so the card rendered a
  // laptop on its own while /shots/airmanage-mobile.png sat there unused.
  it("maps a bare capture name to its -mobile sibling too", () => {
    expect(mobileVariant("/shots/airmanage.png")).toBe("/shots/airmanage-mobile.png");
    expect(mobileVariant("/screenshots/nlp-cert.jpg")).toBe("/screenshots/nlp-cert-mobile.jpg");
  });

  it("does not turn a -mobile capture into a sibling of itself", () => {
    expect(mobileVariant("/shots/jcafe-mobile.png")).toBeNull();
  });

  it("leaves anything that is not a local capture alone", () => {
    expect(mobileVariant("https://cdn.supabase.co/logos/x.png")).toBeNull();
    expect(mobileVariant("")).toBeNull();
    expect(mobileVariant(null)).toBeNull();
  });
});
