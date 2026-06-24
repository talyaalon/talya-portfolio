import { useI18n } from "../i18n";
import { loc } from "../utils/localized";
import { track } from "../lib/analytics";
import { Check, Star, Link, Play, GitHub, Image } from "./Icons";

// One project, rendered in the editorial "CV card" style: a text body on one
// side and a screenshot panel on the other, hung off the timeline spine.
export default function ProjectCard({ project, isAdmin, onOpen, onEdit, onDelete }) {
  const { t, lang } = useI18n();
  const name = loc(project, "name", lang);
  const meta = loc(project, "meta", lang);
  const short = loc(project, "short", lang);
  const result = loc(project, "result", lang);
  const demo = loc(project, "demo", lang);

  const open = () => onOpen(project);
  const clickLink = (e) => {
    e.stopPropagation();
    track("click", project.id);
  };

  const isAward = /place|מקום|award|פרס/i.test(result);
  const hasAnyLink = project.link || demo || project.repo;

  return (
    <div className="proj">
      <div className="dot" />
      <div className="card">
        <div className="card-body">
          {meta && <div className="proj-meta" dir="auto">{meta}</div>}
          <h3 dir="auto" style={{ cursor: "pointer" }} onClick={open}>{name}</h3>
          <p dir="auto">{short}</p>

          {(project.tools || []).length > 0 && (
            <div className="chips">
              {project.tools.map((tool) => (
                <span className="chip" key={tool}>{tool}</span>
              ))}
            </div>
          )}

          {result && (
            <div className="result" dir="auto">
              {isAward ? <Star /> : <Check />}
              <span>{result}</span>
            </div>
          )}

          <div className="plinks">
            {project.link && (
              <a className="plink" href={project.link} target="_blank" rel="noopener noreferrer" onClick={clickLink}>
                <Link /> <span>{t("cardViewLive")}</span>
              </a>
            )}
            {demo && (
              <a className="plink soft" href={demo} target="_blank" rel="noopener noreferrer" onClick={clickLink}>
                <Play /> <span>{t("cardWatchDemo")}</span>
              </a>
            )}
            {project.repo && (
              <a className="plink soft" href={project.repo} target="_blank" rel="noopener noreferrer" onClick={clickLink}>
                <GitHub /> GitHub
              </a>
            )}
            <button className="plink" onClick={open}>{t("cardReadme")}</button>
            {!hasAnyLink && (
              <span className="plink soft" style={{ cursor: "default" }}>{t("cardInternal")}</span>
            )}
          </div>

          {isAdmin && (
            <div className="mini-actions">
              <button className="mini" onClick={() => onEdit(project)}>{t("edit")}</button>
              <button className="mini danger" onClick={() => onDelete(project)}>{t("delete")}</button>
            </div>
          )}
        </div>

        <div className="shot" onClick={open} title={name}>
          {project.screenshot ? (
            <img src={project.screenshot} alt={name} />
          ) : project.logo ? (
            <img src={project.logo} alt={name} />
          ) : (
            <>
              <Image />
              <span>{t("cardScreenshot")}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
