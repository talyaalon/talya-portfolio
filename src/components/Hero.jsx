import { useState } from "react";
import { useI18n, CONTACT } from "../i18n";
import { Mail, LinkedIn, GitHub } from "./Icons";

export default function Hero() {
  const { t } = useI18n();
  const [imgOk, setImgOk] = useState(true);
  return (
    <header className="hero">
      <div className="wrap">
        <div>
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1 dir="auto">{t("siteName")}</h1>
          <div className="role" dir="auto">{t("heroRole")}</div>
          <p className="lede" dir="auto">{t("heroLede")}</p>
          <div className="actions">
            <a className="btn btn-primary" href={`mailto:${CONTACT.email}`}>
              <Mail />
              <span>{t("btnEmail")}</span>
            </a>
            <a className="btn btn-ghost" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedIn /> LinkedIn
            </a>
            <a className="btn btn-ghost" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              <GitHub /> GitHub
            </a>
          </div>
        </div>
        <div className="portrait">
          {imgOk ? (
            <img src="/portrait.jpg" alt={t("siteName")} onError={() => setImgOk(false)} />
          ) : (
            <div className="mono">{t("siteName").trim()[0]}</div>
          )}
        </div>
      </div>
    </header>
  );
}
