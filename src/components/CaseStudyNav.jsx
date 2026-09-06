import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

// Sticky in-page navigation for the case study.
//
// It is a plain list of anchors, so it works with no JavaScript at all - the
// page is prerendered and the links are real fragment links. The only thing
// JavaScript adds is highlighting the section you are currently in, and if
// that never runs the nav is still completely usable.
//
// Below the desktop breakpoint it is not sticky and sits inline above the
// content: a sticky sidebar on a phone is a sticky bar taking a third of the
// screen. See .cs-nav in src/styles.js.
export default function CaseStudyNav({ sections }) {
  const { t } = useI18n();
  const [active, setActive] = useState(null);

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (!targets.length) return;

    // rootMargin pulls the detection line up near the top of the viewport, so
    // the highlighted entry is the section you are reading rather than
    // whichever one happens to be tallest on screen.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -60% 0px", threshold: 0 }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav className="cs-nav" aria-label={t("csOnThisPage")}>
      <h2 className="cs-nav-title">{t("csOnThisPage")}</h2>
      <ol className="cs-nav-list">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              className={"cs-nav-link" + (active === s.id ? " is-active" : "")}
              href={`#${s.id}`}
              // aria-current marks the section for a screen reader as well as
              // for the eye. Without it the highlight is colour only.
              aria-current={active === s.id ? "true" : undefined}
            >
              {s.number && (
                <span className="cs-nav-num" aria-hidden="true">
                  {s.number}
                </span>
              )}
              {/* Titles arrive already resolved to the current language: the
                  page picks them once, so this stays a dumb list. */}
              <span dir="auto">{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
