import { useState } from "react";
import { useI18n, CONTACT } from "../i18n";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { cvHref, STATIC_CV } from "../lib/siteSettings";
import { Mail, LinkedIn, GitHub, FileText } from "./Icons";

export default function Hero() {
  const { t, lang } = useI18n();
  const [imgOk, setImgOk] = useState(true);

  // Two sources for the CV, in order: the file uploaded from the admin area
  // (replaceable without a deploy, so it wins) and /cv.pdf committed to the
  // repository.
  //
  // The uploaded one arrives a moment after the page does, so `null` is
  // "still loading" and is NOT the same as "no CV" - treating it as no CV
  // would style the email button as the primary action and then restyle it
  // under the reader's eyes. When a static CV exists there is nothing to wait
  // for: the button renders immediately and its href is swapped silently if
  // an uploaded file turns out to be there.
  const { settings } = useSiteSettings();
  const cvPending = settings === null && !STATIC_CV;
  const cvLink = cvPending ? "" : cvHref(settings, lang);

  return (
    <header className="hero">
      <div className="wrap">
        <div>
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1 dir="auto">{t("siteName")}</h1>
          <p className="role" dir="auto">{t("heroRole")}</p>
          <p className="lede" dir="auto">{t("heroLede")}</p>
          <div className="actions">
            {/* Opened for reading, not downloaded: a recruiter skims it in a
                tab first, and a forced download is a file to delete later. */}
            {cvLink && (
              <a className="btn btn-primary" href={cvLink} target="_blank" rel="noopener noreferrer">
                <FileText aria-hidden="true" />
                <span>{t("btnCv")}</span>
              </a>
            )}
            <a
              className={cvLink || cvPending ? "btn btn-ghost" : "btn btn-primary"}
              href={`mailto:${CONTACT.email}`}
            >
              <Mail aria-hidden="true" />
              <span>{t("btnEmail")}</span>
            </a>
            <a className="btn btn-ghost" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedIn aria-hidden="true" /> LinkedIn
            </a>
            <a className="btn btn-ghost" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              <GitHub aria-hidden="true" /> GitHub
            </a>
          </div>
        </div>
        <div className="portrait">
          {imgOk ? (
            <img
              src="/portrait.jpg"
              alt={t("siteName")}
              width="342"
              height="488"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="mono" aria-hidden="true">{t("siteName").trim()[0]}</div>
          )}
        </div>
      </div>
    </header>
  );
}
