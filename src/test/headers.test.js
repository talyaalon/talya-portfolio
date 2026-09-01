import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { canvaEmbed } from "../utils/canva";

// ============================================================
//  The site's own security headers, checked against what the app renders.
//
//  ProjectCard frames a Canva deck and opens a Canva recording in an iframe.
//  A Content-Security-Policy that does not name those hosts blocks both — and
//  nothing in the app can detect it: a frame refused by CSP still fires `load`,
//  so the card cannot fall back and the visitor gets the browser's error page
//  inside the laptop frame with nothing to explain it.
//
//  This is invisible in development. `public/_headers` is a Netlify file; the
//  Vite dev server does not apply it, so the deck plays locally and is dead in
//  production. Hence a test rather than a manual check.
// ============================================================

const HEADERS = // Vitest runs from the project root; the file is read from disk rather
// than imported so the test sees exactly what Netlify will serve.
readFileSync(resolve(process.cwd(), "public/_headers"), "utf8");

// The hosts canvaEmbed() is actually willing to hand back — asked of the
// function itself, so the two can never drift apart.
const FRAMED_HOSTS = ["canva.com", "www.canva.com"].filter((host) =>
  canvaEmbed(`https://${host}/design/AAA/BBB/view`)
);

// The CSP that applies to the whole site (the `/*` block).
function csp() {
  const line = HEADERS.split(/\r?\n/).find((l) => /^\s*Content-Security-Policy:/i.test(l));
  if (!line) throw new Error("public/_headers has no Content-Security-Policy line");
  return line.replace(/^\s*Content-Security-Policy:\s*/i, "").trim();
}

function directives() {
  return new Map(
    csp()
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...sources] = d.split(/\s+/);
        return [name.toLowerCase(), sources];
      })
  );
}

// frame-src falls back to child-src, which falls back to default-src (CSP 3).
// Omitting frame-src is therefore not "unset" — it inherits `default-src 'self'`
// and blocks every third-party frame.
function effectiveFrameSrc() {
  const d = directives();
  return d.get("frame-src") ?? d.get("child-src") ?? d.get("default-src") ?? null;
}

describe("Content-Security-Policy", () => {
  it("names at least one source for frames instead of inheriting default-src", () => {
    expect(directives().has("frame-src")).toBe(true);
  });

  it.each(FRAMED_HOSTS)("allows framing %s, which the app embeds", (host) => {
    expect(effectiveFrameSrc()).toContain(`https://${host}`);
  });

  it("still refuses to frame anything else", () => {
    const sources = effectiveFrameSrc() ?? [];
    expect(sources).not.toContain("*");
    expect(sources).not.toContain("https:");
  });
});

describe("clickjacking protection is not weakened by any of this", () => {
  // frame-src is about what THIS page may embed. These two are the opposite
  // direction — who may embed this page — and must stay shut.
  it("keeps frame-ancestors 'none'", () => {
    expect(directives().get("frame-ancestors")).toEqual(["'none'"]);
  });

  it("keeps X-Frame-Options: DENY", () => {
    expect(HEADERS).toMatch(/^\s*X-Frame-Options:\s*DENY\s*$/im);
  });
});
