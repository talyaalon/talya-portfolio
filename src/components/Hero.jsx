import { useState } from "react";
import { useI18n, CONTACT, CV } from "../i18n";
import { Mail, LinkedIn, GitHub, Download } from "./Icons";

export default function Hero() {
  const { t, lang } = useI18n();
  const [imgOk, setImgOk] = useState(true);
  const cvHref = CV[lang];

  return (
    <header className="hero">
      <div className="wrap">
        <div>
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1 dir="auto">{t("siteName")}</h1>
          <p className="role" dir="auto">{t("heroRole")}</p>
          <p className="lede" dir="auto">{t("heroLede")}</p>
          <div className="actions">
            {cvHref && (
              <a className="btn btn-primary" href={cvHref} download>
                <Download aria-hidden="true" />
                <span>{t("btnCv")}</span>
              </a>
            )}
            <a className={cvHref ? "btn btn-ghost" : "btn btn-primary"} href={`mailto:${CONTACT.email}`}>
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
