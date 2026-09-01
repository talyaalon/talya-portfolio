import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n";
import { loc } from "../utils/localized";
import { track } from "../lib/analytics";
import { Check, Star, Link, Play, GitHub, Lock, Slides, Image } from "./Icons";
import { preferWebp, mobileVariant } from "../utils/screenshot";
import { canvaEmbed } from "../utils/canva";

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

  // A local capture ships with a matching <name>-mobile sibling; when that
  // sibling loads, the panel renders a laptop+phone mockup showing both.
  // mobileVariant only names the candidate — it cannot know the file is there,
  // so a capture that fails to load collapses the panel back to the laptop
  // alone rather than leaving an empty phone on the card.
  const mobileShot = mobileVariant(project.screenshot);
  // Remember WHICH capture was missing rather than a bare boolean, so pointing
  // the card at a different project clears the flag on its own — no effect, and
  // no stale "missing" carried over from the previous capture.
  const [missingShot, setMissingShot] = useState(null);
  const phoneMissing = missingShot === mobileShot;
  const phoneImg = mobileShot ? preferWebp(mobileShot) : null;

  // A Canva deck shown live in the laptop frame, and a recording opened from
  // the links row. Either is null when the stored URL is not something that
  // can be framed, and the card falls back to its ordinary behaviour instead
  // of rendering an iframe that would never load.
  const deckEmbed = canvaEmbed(project.embedUrl);
  const demoEmbed = canvaEmbed(demo);

  const open = () => onOpen(project);
  const clickLink = (e) => {
    e.stopPropagation();
    track("click", project.id);
  };
  // Clicking a device frame opens that capture in a floating lightbox.
  // { src, mobile } | { src, kind:"embed", href }
  const [lightbox, setLightbox] = useState(null);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  // Opening an embed counts as a click on the project, the same as following
  // the link would have.
  //
  // `href` is the link as the owner stored it, kept beside the embed URL: a
  // frame the browser refuses fires `load` exactly like one that worked, so
  // nothing here can notice a blank frame and react to it. The way out is
  // offered up front instead.
  const openEmbed = (src, href) => (e) => {
    e.stopPropagation();
    track("click", project.id);
    setLightbox({ src, href, kind: "embed" });
  };

  // The old heuristic tested the whole result line for /place|award|פרס|מקום/,
  // so "replaced", "marketplace" and "במקום" all earned a prize star. An award
  // is now an explicit status rather than something guessed from prose.
  const isAward = project.status === "award";
  // A private repo fills the links row with its own badge, so the card is not
  // link-less and should not also fall back to the "Internal system" note.
  const hasAnyLink = project.link || demo || project.repo || project.repoPrivate || deckEmbed;
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
            {demo &&
              (demoEmbed ? (
                <button type="button" className="plink soft" onClick={openEmbed(demoEmbed, demo)}>
                  <Play aria-hidden="true" /> <span>{t("cardWatchDemo")}</span>
                </button>
              ) : (
                <a className="plink soft" href={demo} target="_blank" rel="noopener noreferrer" onClick={clickLink}>
                  <Play aria-hidden="true" /> <span>{t("cardWatchDemo")}</span>
                </a>
              ))}
            {/* The frame carries the deck on a wide screen; on a phone it is
                small enough that a plain button is how anyone finds it. */}
            {deckEmbed && (
              <button type="button" className="plink soft" onClick={openEmbed(deckEmbed, project.embedUrl)}>
                <Slides aria-hidden="true" /> <span>{t("cardPresentation")}</span>
              </button>
            )}
            {/* The private branch comes first and does not fall through to the
                link: a company repo must never render an href, so the URL the
                admin keeps for herself stays out of the public HTML. */}
            {project.repoPrivate ? (
              <span className="plink locked" title={t("cardRepoPrivateHint")}>
                <Lock aria-hidden="true" /> <span>{t("cardRepoPrivate")}</span>
              </span>
            ) : (
              project.repo && (
                <a className="plink soft" href={project.repo} target="_blank" rel="noopener noreferrer" onClick={clickLink}>
                  <GitHub aria-hidden="true" /> GitHub
                </a>
              )
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

        {deckEmbed ? (
          <div className="shot">
            <span className="devices">
              <button
                type="button"
                className="dev-laptop"
                aria-label={t("cardOpenAria") + name}
                onClick={openEmbed(deckEmbed, project.embedUrl)}
              >
                <span className="dev-bar" aria-hidden="true"><i /><i /><i /></span>
                {/* The preview is deliberately inert: pointer-events are off in
                    CSS and it is out of the tab order, so a click always opens
                    the full-size view instead of poking at a tiny slide. */}
                <span className="dev-screen is-embed">
                  <iframe src={deckEmbed} title={name} loading="lazy" tabIndex={-1} aria-hidden="true" />
                </span>
              </button>
            </span>
          </div>
        ) : project.screenshot ? (
          <div className="shot">
            <span className="devices">
              <button
                type="button"
                className="dev-laptop"
                aria-label={t("cardOpenAria") + name}
                onClick={(e) => { e.stopPropagation(); setLightbox({ src: project.screenshot, mobile: false }); }}
              >
                <span className="dev-bar" aria-hidden="true"><i /><i /><i /></span>
                <span className="dev-screen">
                  <img {...preferWebp(project.screenshot)} alt="" loading="lazy" decoding="async" />
                </span>
              </button>
              {mobileShot && !phoneMissing && (
                <button
                  type="button"
                  className="dev-phone"
                  aria-label={t("cardOpenAria") + name}
                  onClick={(e) => { e.stopPropagation(); setLightbox({ src: mobileShot, mobile: true }); }}
                >
                  <span className="dev-notch" aria-hidden="true" />
                  <span className="dev-screen">
                    <img
                      {...phoneImg}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        // preferWebp swaps the .webp for the stored URL once;
                        // only when that also fails is the capture really absent.
                        const exhausted =
                          !phoneImg.onError || e.currentTarget.dataset.fellBack === "1";
                        phoneImg.onError?.(e);
                        if (exhausted) setMissingShot(mobileShot);
                      }}
                    />
                  </span>
                </button>
              )}
            </span>
          </div>
        ) : project.logo ? (
          <button className="shot" onClick={open} aria-label={t("cardOpenAria") + name}>
            <img
              {...preferWebp(project.logo)}
              alt=""
              loading="lazy"
              decoding="async"
              width="1200"
              height="750"
            />
          </button>
        ) : (
          <div className="shot shot-empty" aria-hidden="true">
            <Image />
            <span>{t("cardScreenshot")}</span>
          </div>
        )}
        {lightbox && createPortal(
          <div className="shot-lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
            <button type="button" className="lightbox-close" aria-label="Close" onClick={() => setLightbox(null)}>✕</button>
            {lightbox.href && (
              <a
                className="lightbox-open"
                href={lightbox.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {t("cardOpenInCanva")}
              </a>
            )}
            {lightbox.kind === "embed" ? (
              <iframe
                className="lb-embed"
                src={lightbox.src}
                title={name}
                allow="fullscreen; autoplay"
                allowFullScreen
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                {...preferWebp(lightbox.src)}
                alt={name}
                className={lightbox.mobile ? "lb-mobile" : "lb-desktop"}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>,
          document.body
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
