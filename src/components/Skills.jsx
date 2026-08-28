import { useI18n } from "../i18n";
import Reveal from "./Reveal";

export default function Skills() {
  const { t } = useI18n();
  const groups = [
    { key: "fe", title: t("skillFrontend"), chips: ["React", "Next.js", "JavaScript", "HTML", "CSS"] },
    { key: "be", title: t("skillBackend"), chips: ["Node.js", "REST APIs", "PostgreSQL", "SQL", "Supabase"] },
    { key: "tools", title: t("skillTools"), chips: ["Git", "Vercel", "Netlify", "Render", "Firebase", "Stripe", "Odoo"] },
    // Framed as engineering capability rather than "the code was generated",
    // which is how a tooling-first label reads to a hiring manager.
    { key: "ai", title: t("skillAI"), chips: ["Claude Code", "Prompt engineering", t("skillAIChip")] },
  ];
  return (
    <section className="section" id="skills">
      <div className="wrap">
        <Reveal>
          <div className="sec-label">
            <span className="num" aria-hidden="true">03</span>
            <h2>{t("secSkills")}</h2>
            <span className="rule" aria-hidden="true" />
          </div>
        </Reveal>
        <Reveal className="skills">
          {groups.map((g) => (
            <div className="skillcard" key={g.key}>
              {/* h3, not h4: the section heading is an h2, and skipping a
                  level breaks the document outline for screen readers. */}
              <h3 dir="auto">{g.title}</h3>
              <div className="chips">
                {g.chips.map((ch) => (
                  <span className="chip" key={ch} dir="auto">{ch}</span>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
