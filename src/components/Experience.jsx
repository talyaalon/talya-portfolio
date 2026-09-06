import { useI18n } from "../i18n";
import Reveal from "./Reveal";
import { EXPERIENCE, EDUCATION, AWARDS, LANGUAGES, formatPeriod } from "../content/resume";

// Work history, education, recognition and languages.
//
// The project cards say what was built; this says who employed her, when, and
// what she was responsible for — the questions a project card cannot answer
// and that a recruiter screens on first.
export default function Experience() {
  const { t, lang } = useI18n();

  return (
    <section className="section" id="experience">
      <div className="wrap">
        <Reveal>
          <div className="sec-label">
            <span className="num" aria-hidden="true">
              02
            </span>
            <h2>{t("secExperience")}</h2>
            <span className="rule" aria-hidden="true" />
          </div>
        </Reveal>

        {EXPERIENCE.map((role) => (
          <Reveal key={role.id}>
            <article className="role">
              <div className="role-when" dir="auto">
                {formatPeriod(role.from, role.to, lang, t("present"))}
              </div>
              <div className="role-body">
                <h3 dir="auto">{role.title[lang]}</h3>
                <div className="role-where" dir="auto">
                  {role.company} <span aria-hidden="true">·</span> {role.location[lang]}
                </div>
                <ul className="role-points">
                  {role.bullets.map((b, i) => (
                    <li key={i} dir="auto">
                      {b[lang]}
                    </li>
                  ))}
                </ul>
                <div className="chips">
                  {role.stack.map((tech) => (
                    <span className="chip" key={tech}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}

        <Reveal className="facts">
          <div className="factcard">
            <h3>{t("secEducation")}</h3>
            {EDUCATION.map((e) => (
              <div key={e.id} dir="auto">
                <strong>{e.degree[lang]}</strong>
                <div className="fact-sub">
                  {e.institution[lang]} <span aria-hidden="true">·</span> {e.from}-{e.to}
                </div>
              </div>
            ))}
          </div>

          <div className="factcard">
            <h3>{t("secAwards")}</h3>
            {AWARDS.map((a) => (
              <div key={a.id} dir="auto">
                <strong>
                  {a.title[lang]} <span aria-hidden="true">·</span> {a.year}
                </strong>
                <div className="fact-sub">{a.detail[lang]}</div>
              </div>
            ))}
          </div>

          <div className="factcard">
            <h3>{t("secLanguages")}</h3>
            <ul className="fact-list">
              {LANGUAGES.map((l) => (
                <li key={l.en} dir="auto">
                  {l[lang]}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
