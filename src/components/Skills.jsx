import { useI18n } from "../i18n";
import Reveal from "./Reveal";

export default function Skills() {
  const { t } = useI18n();
  const groups = [
    { title: t("skillFrontend"), chips: ["React", "Next.js", "JavaScript", "HTML", "CSS"] },
    { title: t("skillBackend"), chips: ["Node.js", "REST APIs", "PostgreSQL", "SQL", "Supabase"] },
    { title: t("skillTools"), chips: ["Git", "Vercel", "Netlify", "Render", "Firebase", "Stripe", "ODOO"] },
    { title: t("skillAI"), chips: ["Claude Code", "AI pair-programming", t("skillAIChip")] },
  ];
  return (
    <section className="section" id="skills">
      <div className="wrap">
        <Reveal>
          <div className="sec-label">
            <span className="num">03</span>
            <h2>{t("secSkills")}</h2>
            <span className="rule" />
          </div>
        </Reveal>
        <Reveal className="skills">
          {groups.map((g) => (
            <div className="skillcard" key={g.title}>
              <h4 dir="auto">{g.title}</h4>
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
