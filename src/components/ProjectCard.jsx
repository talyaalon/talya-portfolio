import { useI18n } from "../i18n";
import { loc } from "../utils/localized";
import { track } from "../lib/analytics";
import { Check, Star, Link, Play, GitHub, Image } from "./Icons";
import { preferWebp } from "../utils/screenshot";

// One project, rendered in the editorial "CV card" style: a text body on one
// side and a screenshot panel on the other, hung off the timeline spine.
export default function ProjectCard({ project, isAdmin, onOpen, onEdit, onDelete }) {
  const { t, lang } = useI18n();
  const name = loc(project, "name", lang);
  const meta = loc(project, "meta", lang);
  const role = loc(project, "role", lang);
  const short = loc(project, "short", lang);
  const result = loc(project, "result", lang);
  const impact = loc(project, "impact", lang);
  const demo = loc(project, "demo", lang);

  // /shots/<name>-desktop.png ships with a matching <name>-mobile.png; when the
  // stored screenshot follows that naming, the panel renders a laptop+phone
  // mockup showing both captures. Any other URL renders as a single image.
  const mobileShot =
    project.screenshot && project.screenshot.includes("-desktop.")
      ? project.screenshot.replace("-desktop.", "-mobile.")
      : null;

  const open = () => onOpen(project);
  const clickLink = (e) => {
    e.stopPropagation();
    track("click", project.id);
  };

  // The old heuristic tested the whole result line for /place|award|פרס|מקום/,
  // so "replaced", "marketplace" and "במקום" all earned a prize star. An award
  // is now an explicit status rather than something guessed from prose.
  const isAward = project.status === "award";
  const hasAnyLink = project.link || demo || project.repo;
  // An unrecognised status renders nothing rather than defaulting to
  // "Archived" — mislabelling a live project is worse than omitting the tag.
  const statusTag = statusKey(project.status);
  const statusLabel = statusTag ? t(statusTag) : "";

  return (
    <article className="proj">
      <div className="dot" aria-hidden="true" />
      <div className="card">
        <div className="card-body">
          {(meta || statusLabel) && (
            <div className="proj-meta" dir="auto">
              {meta}
              {meta && statusLabel ? " · " : ""}
              {statusLabel}
            </div>
          )}

          <h3 dir="auto">
            {/* No aria-label here: it would replace the heading's accessible
                name, so heading navigation would announce the instruction
                instead of the project. The visible text is the name. */}
            <button className="card-title" onClick={open}>
              {name}
            </button>
          </h3>

          {role && (
            <div className="proj-role" dir="auto">
              <span className="role-key">{t("roleLabel")}</span> {role}
            </div>
          )}

          <p dir="auto">{short}</p>

          {(project.tools || []).length > 0 && (
            <div className="chips">
              {project.tools.map((tool) => (
                <span className="chip" key={tool}>
                  {tool}
                </span>
              ))}
            </div>
          )}

          {result && (
            <div className="result" dir="auto">
              {isAward ? <Star aria-hidden="true" /> : <Check aria-hidden="true" />}
              <span>{result}</span>
            </div>
          )}

          {impact && (
            <p className="proj-impact" dir="auto">
              {impact}
            </p>
          )}

          <div className="plinks">
            {project.link && (
              <a className="plink" href={project.link} target="_blank" rel="noopener noreferrer" onClick={clickLink}>
                <Link aria-hidden="true" /> <span>{t("cardViewLive")}</span>
              </a>
            )}
            {demo && (
              <a className="plink soft" href={demo} target="_blank" rel="noopener noreferrer" onClick={clickLink}>
                <Play aria-hidden="true" /> <span>{t("cardWatchDemo")}</span>
              </a>
            )}
            {project.repo && (
              <a className="plink soft" href={project.repo} target="_blank" rel="noopener noreferrer" onClick={clickLink}>
                <GitHub aria-hidden="true" /> GitHub
              </a>
            )}
            <button className="plink" onClick={open}>
              {t("cardReadme")}
            </button>
            {!hasAnyLink && (
              <span className="plink soft" style={{ cursor: "default" }}>
                {t("cardInternal")}
              </span>
            )}
          </div>

          {isAdmin && (
            <div className="mini-actions">
              <button className="mini" onClick={() => onEdit(project)}>
                {t("edit")}
              </button>
              <button className="mini danger" onClick={() => onDelete(project)}>
                {t("delete")}
              </button>
            </div>
          )}
        </div>

        {project.screenshot || project.logo ? (
          <button className="shot" onClick={open} aria-label={t("cardOpenAria") + name}>
            {mobileShot ? (
              <span className="devices">
                <span className="dev-laptop">
                  <span className="dev-bar" aria-hidden="true"><i /><i /><i /></span>
                  <img
                    {...preferWebp(project.screenshot)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="1200"
                    height="750"
                  />
                </span>
                <span className="dev-phone">
                  <span className="dev-notch" aria-hidden="true" />
                  <img
                    {...preferWebp(mobileShot)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="478"
                    height="1030"
                  />
                </span>
              </span>
            ) : (
              <img
                {...preferWebp(project.screenshot || project.logo)}
                alt=""
                loading="lazy"
                decoding="async"
                width="1200"
                height="750"
              />
            )}
          </button>
        ) : (
          <div className="shot shot-empty" aria-hidden="true">
            <Image />
            <span>{t("cardScreenshot")}</span>
          </div>
        )}
      </div>
    </article>
  );
}

function statusKey(status) {
  if (status === "production") return "statusProduction";
  if (status === "prototype") return "statusPrototype";
  if (status === "award") return "statusAward";
  if (status === "archived") return "statusArchived";
  return null;
}
