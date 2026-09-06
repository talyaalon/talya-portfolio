import { describe, expect, it } from "vitest";
import { CASE_STUDIES, CASE_STUDY_PAGES, JCAFE, METRICS, SHOTS, SLUG } from "./jcafe";
import { PARTS } from "../components/CaseStudySection";

// The same contract src/components/Experience.test.jsx asserts for the CV
// content: a fact missing in one language is not a display quirk, it silently
// shows a Hebrew reader an English-only gap. Here it would also throw, since
// pick() refuses to render an empty pair - so this catches it at the point
// where the fix is obvious rather than at the point where the page dies.
function bothLanguages(pair, where) {
  expect(pair, `${where}: missing`).toBeTruthy();
  expect(pair.en?.trim(), `${where}: no English`).toBeTruthy();
  expect(pair.he?.trim(), `${where}: no Hebrew`).toBeTruthy();
}

describe("J-Cafe case study content", () => {
  it("is bilingual everywhere it is rendered", () => {
    bothLanguages(JCAFE.summary, "summary");
    bothLanguages(JCAFE.role, "role");
    bothLanguages(JCAFE.overview, "overview");
  });

  it("gives all three case studies all five sections, in both languages", () => {
    expect(CASE_STUDIES).toHaveLength(3);

    for (const study of CASE_STUDIES) {
      bothLanguages(study.title, `${study.id}: title`);
      // Driven off the component's own list, so adding a sixth section there
      // cannot leave the content behind.
      for (const [key] of PARTS) {
        bothLanguages(study[key], `${study.id}: ${key}`);
      }
    }
  });

  it("keeps the three case studies on one project, not three", () => {
    // They are three problems inside one system. Splitting them into separate
    // projects would misrepresent the work as three smaller things.
    expect(Object.keys(CASE_STUDY_PAGES)).toEqual([SLUG]);
    expect(JCAFE.caseStudies).toBe(CASE_STUDIES);
  });
});

describe("metrics", () => {
  it("states the scope of every single number", () => {
    // The rule this file exists to keep: a bare "483 orders" reads as the
    // whole chain over the whole year. MetricsStrip throws without it, and
    // this is where the omission is cheap to notice.
    for (const m of METRICS) {
      bothLanguages(m.label, `${m.id}: label`);
      bothLanguages(m.scope, `${m.id}: scope`);
      expect(String(m.value).trim(), `${m.id}: value`).toBeTruthy();
    }
  });

  it("measures the single-branch quarter it says it does", () => {
    const orders = METRICS.find((m) => m.id === "orders");
    expect(orders.value).toBe("483");
    expect(orders.scope.en).toBe("one branch, Jun-Aug 2025");
    // 2026 would be a quarter that has not happened for most of the site's
    // life; the figures are from 2025.
    for (const m of METRICS) expect(m.scope.en).not.toContain("2026");
  });

  it("shows a subset on the home page card, all of them on the page", () => {
    expect(JCAFE.cardMetrics.length).toBeLessThan(METRICS.length);
    for (const m of JCAFE.cardMetrics) expect(METRICS).toContain(m);
  });
});

describe("screenshot slots", () => {
  it("ships with no images, so nothing unredacted can go out by accident", () => {
    // The screenshots are of a live admin area showing real customer names,
    // emails and phone numbers. The slots stay empty until someone redacts
    // and adds one deliberately.
    for (const shot of SHOTS) {
      expect(shot.src, `${shot.id} has an image committed - was it redacted?`).toBeNull();
    }
  });

  it("has alt text and a caption in both languages, and a fixed aspect ratio", () => {
    for (const shot of SHOTS) {
      bothLanguages(shot.alt, `${shot.id}: alt`);
      bothLanguages(shot.caption, `${shot.id}: caption`);
      // Reserved up front so dropping a file in later does not reflow the page.
      expect(shot.aspect, `${shot.id}: aspect`).toMatch(/^\d+\s*\/\s*\d+$/);
    }
  });
});

describe("house style", () => {
  it("uses short hyphens, never em or en dashes, in rendered text", () => {
    const texts = [];
    const walk = (v) => {
      if (typeof v === "string") texts.push(v);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk({ CASE_STUDIES, METRICS, SHOTS, summary: JCAFE.summary, role: JCAFE.role, overview: JCAFE.overview });

    for (const text of texts) {
      expect(text, `contains a long dash: ${text.slice(0, 60)}`).not.toMatch(/[–—]/);
    }
  });

  it("avoids marketing vocabulary", () => {
    const banned = /\b(passionate|cutting.edge|seamless|leveraging|synergy|world.class)\b/i;
    const walk = (v) => {
      if (typeof v === "string") expect(v, `marketing language: ${v.slice(0, 60)}`).not.toMatch(banned);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk({ CASE_STUDIES, summary: JCAFE.summary, role: JCAFE.role, overview: JCAFE.overview });
  });
});
