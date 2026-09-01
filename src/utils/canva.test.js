import { describe, expect, it } from "vitest";
import { canvaEmbed } from "./canva";

// The share links Canva hands out carry a tail of utm parameters and come in
// two shapes: /view for a deck and /watch for a recording. Both embed, and
// each has to keep its own player — a recording turned into /view loses the
// video, a deck turned into /watch is not what the owner linked.
describe("canvaEmbed", () => {
  const deck =
    "https://www.canva.com/design/DAHIlZS0X2s/RHLvNjN8vUfCFCgN5_IOlA/view?utm_content=DAHIlZS0X2s&utm_campaign=designshare&utm_medium=link2";
  const video =
    "https://www.canva.com/design/DAHIlXt6qHo/KdKer3C_SbbbIzBy8WcpAA/watch?utm_content=DAHIlXt6qHo&utm_medium=link2";

  it("turns a shared deck link into its embed form and drops the utm tail", () => {
    expect(canvaEmbed(deck)).toBe(
      "https://www.canva.com/design/DAHIlZS0X2s/RHLvNjN8vUfCFCgN5_IOlA/view?embed"
    );
  });

  it("keeps a recording on /watch instead of flattening it to /view", () => {
    expect(canvaEmbed(video)).toBe(
      "https://www.canva.com/design/DAHIlXt6qHo/KdKer3C_SbbbIzBy8WcpAA/watch?embed"
    );
  });

  it("is idempotent, so a link already in embed form survives a round trip", () => {
    const once = canvaEmbed(deck);
    expect(canvaEmbed(once)).toBe(once);
  });

  it("refuses an /edit link — that one would hand a visitor the editor", () => {
    expect(
      canvaEmbed("https://www.canva.com/design/DAHIlZS0X2s/RHLvNjN8vUfCFCgN5_IOlA/edit")
    ).toBeNull();
  });

  // Returning null is the point: the caller renders a plain link instead of an
  // embed, rather than an iframe pointed at something that will never load.
  it("returns null for anything that is not a Canva design link", () => {
    expect(canvaEmbed("https://www.youtube.com/watch?v=abc")).toBeNull();
    expect(canvaEmbed("https://www.canva.com/")).toBeNull();
    expect(canvaEmbed("https://www.canva.com/design/DAHIlZS0X2s")).toBeNull();
    expect(canvaEmbed("https://evil.test/canva.com/design/a/b/view")).toBeNull();
    expect(canvaEmbed("javascript:alert(1)")).toBeNull();
    expect(canvaEmbed("")).toBeNull();
    expect(canvaEmbed(null)).toBeNull();
    expect(canvaEmbed(undefined)).toBeNull();
  });

  it("requires https, because an http frame is blocked as mixed content anyway", () => {
    expect(
      canvaEmbed("http://www.canva.com/design/DAHIlZS0X2s/RHLvNjN8vUfCFCgN5_IOlA/view")
    ).toBeNull();
  });

  it("accepts the bare canva.com host as well as www", () => {
    expect(canvaEmbed("https://canva.com/design/AAA/BBB/view")).toBe(
      "https://canva.com/design/AAA/BBB/view?embed"
    );
  });
});
