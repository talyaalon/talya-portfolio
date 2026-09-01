import { useId } from "react";
import Modal from "./Modal";
import { COLORS } from "../styles";
import { useI18n } from "../i18n";
import { loc } from "../utils/localized";
import { track } from "../lib/analytics";
import { Link, GitHub, Lock, Slides, Play, Check, Star } from "./Icons";
import { preferWebp } from "../utils/screenshot";

// Full project detail: name, context, role, tools, result, README and links.
//
// This used to render no image at all, so tapping a screenshot opened a
// dialog that showed everything except the screenshot the visitor tapped.
export default function ProjectModal({ project, onClose }) {
  const { t, lang } = useI18n();
  const titleId = useId();

  const name = loc(project, "name", lang);
  const meta = loc(project, "meta", lang);
  const role = loc(project, "role", lang);
  const short = loc(project, "short", lang);
  const result = loc(project, "result", lang);
  const impact = loc(project, "impact", lang);
  const readme = loc(project, "readme", lang);
  const demo = loc(project, "demo", lang);

  const onLink = () => track("click", project.id);
  const isAward = project.status === "award";
  const shot = project.screenshot || project.logo;

  return (
    <Modal onClose={onClose} wide labelledBy={titleId}>
      {meta && (
        <div className="proj-meta" dir="auto">
          {meta}
        </div>
      )}
      <h2
        id={titleId}
        className="h-display"
        style={{ fontSize: 30, margin: "2px 0 6px", color: COLORS.ink, fontWeight: 800 }}
        dir="auto"
      >
        {name}
      </h2>

      {role && (
        <div className="proj-role" dir="auto">
          <span className="role-key">{t("roleLabel")}</span> {role}
        </div>
      )}

      <p dir="auto" style={{ color: COLORS.inkSoft, margin: "8px 0 0" }}>
        {short}
      </p>

      {shot && (
        <a className="modal-shot" href={shot} target="_blank" rel="noopener noreferrer">
          <img {...preferWebp(shot)} alt={t("modalScreenshot") + name} loading="lazy" decoding="async" />
        </a>
      )}

      {(project.tools || []).length > 0 && (
        <div className="chips" style={{ marginTop: 16 }}>
          {project.tools.map((tool) => (
            <span className="chip" key={tool}>
              {tool}
            </span>
          ))}
        </div>
      )}

      {result && (
        <div className="result" dir="auto" style={{ marginTop: 16 }}>
          {isAward ? <Star aria-hidden="true" /> : <Check aria-hidden="true" />}
          <span>{result}</span>
        </div>
      )}

      {impact && (
        <p className="proj-impact" dir="auto">
          {impact}
        </p>
      )}

      {readme && (
        <>
          <h3 className="modal-sub">{t("modalReadme")}</h3>
          <p dir="auto" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: COLORS.ink }}>
            {readme}
          </p>
        </>
      )}

      {(project.link || project.repo || project.repoPrivate || demo || project.embedUrl) && (
        <div className="plinks" style={{ marginTop: 22 }}>
          {project.link && (
            <a className="plink" href={project.link} target="_blank" rel="noopener noreferrer" onClick={onLink}>
              <Link aria-hidden="true" /> <span>{t("cardViewLive")}</span>
            </a>
          )}
          {demo && (
            <a className="plink soft" href={demo} target="_blank" rel="noopener noreferrer" onClick={onLink}>
              <Play aria-hidden="true" /> <span>{t("cardWatchDemo")}</span>
            </a>
          )}
          {/* The modal links out rather than opening a second overlay on top of
              itself; the card is where an embed opens in place. */}
          {project.embedUrl && (
            <a className="plink soft" href={project.embedUrl} target="_blank" rel="noopener noreferrer" onClick={onLink}>
              <Slides aria-hidden="true" /> <span>{t("cardPresentation")}</span>
            </a>
          )}
          {project.repoPrivate ? (
            <span className="plink locked">
              <Lock aria-hidden="true" /> <span>{t("cardRepoPrivate")}</span>
            </span>
          ) : (
            project.repo && (
              <a className="plink soft" href={project.repo} target="_blank" rel="noopener noreferrer" onClick={onLink}>
                <GitHub aria-hidden="true" /> GitHub
              </a>
            )
          )}
        </div>
      )}

      {/* The modal has the room the card does not, so the badge gets its
          sentence here rather than living only in a title attribute a touch
          screen never shows. */}
      {project.repoPrivate && (
        <p dir="auto" style={{ fontSize: 13.5, color: COLORS.inkSoft, margin: "12px 0 0" }}>
          {t("cardRepoPrivateHint")}
        </p>
      )}
    </Modal>
  );
}
