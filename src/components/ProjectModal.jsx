import Modal from "./Modal";
import { COLORS } from "../styles";
import { useI18n } from "../i18n";
import { loc } from "../utils/localized";
import { track } from "../lib/analytics";
import { Link, GitHub, Play } from "./Icons";

// Full project detail: name, context, tools, result, README and links.
export default function ProjectModal({ project, onClose }) {
  const { t, lang } = useI18n();
  const name = loc(project, "name", lang);
  const meta = loc(project, "meta", lang);
  const short = loc(project, "short", lang);
  const result = loc(project, "result", lang);
  const readme = loc(project, "readme", lang);

  const onLink = () => track("click", project.id);

  return (
    <Modal onClose={onClose} wide>
      {meta && <div className="proj-meta" dir="auto">{meta}</div>}
      <h2 className="display" style={{ fontSize: 30, margin: "2px 0 6px", color: COLORS.ink, fontWeight: 800 }} dir="auto">
        {name}
      </h2>
      <p dir="auto" style={{ color: COLORS.inkSoft, margin: 0 }}>{short}</p>

      {(project.tools || []).length > 0 && (
        <div className="chips" style={{ marginTop: 16 }}>
          {project.tools.map((tool) => (
            <span className="chip" key={tool}>{tool}</span>
          ))}
        </div>
      )}

      {result && (
        <div className="result" dir="auto" style={{ marginTop: 16 }}>
          <span>★ {result}</span>
        </div>
      )}

      {readme && (
        <>
          <h4 style={{ color: COLORS.tanDeep, margin: "22px 0 10px", fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase" }}>
            {t("modalReadme")}
          </h4>
          <p dir="auto" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: COLORS.ink }}>
            {readme}
          </p>
        </>
      )}

      {(project.link || project.repo || project.demo) && (
        <div className="plinks" style={{ marginTop: 22 }}>
          {project.link && (
            <a className="plink" href={project.link} target="_blank" rel="noopener noreferrer" onClick={onLink}>
              <Link /> <span>{t("cardViewLive")}</span>
            </a>
          )}
          {project.demo && (
            <a className="plink soft" href={project.demo} target="_blank" rel="noopener noreferrer" onClick={onLink}>
              <Play /> <span>{t("cardWatchDemo")}</span>
            </a>
          )}
          {project.repo && (
            <a className="plink soft" href={project.repo} target="_blank" rel="noopener noreferrer" onClick={onLink}>
              <GitHub /> GitHub
            </a>
          )}
        </div>
      )}
    </Modal>
  );
}
