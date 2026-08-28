import { describe, expect, it } from "vitest";
import { deviceFromUA, cleanReferrer } from "./track.js";

describe("deviceFromUA", () => {
  it("returns language-neutral tokens, not Hebrew words", () => {
    // These used to be written into analytics_events.device as "מובייל" etc.,
    // baking one language into stored data.
    expect(deviceFromUA("iPhone; CPU iPhone OS 17_0 like Mac OS X")).toBe("mobile");
    expect(deviceFromUA("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet");
    expect(deviceFromUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });

  it("returns null rather than a made-up label when the UA is absent", () => {
    expect(deviceFromUA("")).toBeNull();
    expect(deviceFromUA(undefined)).toBeNull();
  });

  it("prefers tablet over mobile for an Android tablet", () => {
    expect(deviceFromUA("Mozilla/5.0 (Linux; Android 13; Tablet)")).toBe("tablet");
  });
});

describe("cleanReferrer", () => {
  it("strips query strings, which can carry identifying parameters", () => {
    expect(cleanReferrer("https://www.google.com/search?q=talya+israel")).toBe(
      "https://www.google.com/search"
    );
  });

  it("returns null for an empty referrer", () => {
    expect(cleanReferrer("")).toBeNull();
    expect(cleanReferrer(null)).toBeNull();
  });

  it("truncates junk instead of throwing", () => {
    expect(cleanReferrer("x".repeat(500))).toHaveLength(300);
  });
});
