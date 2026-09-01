import { useState } from "react";
import { useI18n, CONTACT } from "../i18n";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { cvUrl } from "../lib/siteSettings";
import { Mail, LinkedIn, GitHub, FileText } from "./Icons";

export default function Hero() {
  const { t, lang } = useI18n();
  const [imgOk, setImgOk] = useState(true);

  // The CV is uploaded from the admin area, not shipped with the build, so it
  // arrives a moment after the page does. `null` is "still loading" and is not
  // the same as "no CV": treating it as no CV would style the email button as
  // the primary action and then restyle it under the reader's eyes.
  const { settings } = useSiteSettings();
  const cvPending = settings === null;
  const cvHref = cvPending ? "" : cvUrl(settings, lang);

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
            {cvHref && (
              <a className="btn btn-primary" href={cvHref} target="_blank" rel="noopener noreferrer">
                <FileText aria-hidden="true" />
                <span>{t("btnCv")}</span>
              </a>
            )}
            <a
              className={cvHref || cvPending ? "btn btn-ghost" : "btn btn-primary"}
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
