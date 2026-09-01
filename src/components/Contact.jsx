import { useI18n, CONTACT } from "../i18n";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { cvUrl } from "../lib/siteSettings";
import Reveal from "./Reveal";
import { Mail, WhatsApp, LinkedIn, GitHub, FileText } from "./Icons";

export default function Contact() {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();
  // The same file as the hero's button, from the same single request — see
  // src/hooks/useSiteSettings.js.
  const { settings } = useSiteSettings();
  const cvHref = settings ? cvUrl(settings, lang) : "";

  return (
    <section className="section" id="contact">
      <Reveal className="wrap">
        <div className="contact">
          <h2>{t("secContact")}</h2>
          <p dir="auto">{t("contactText")}</p>
          <div className="actions">
            <a className="btn btn-primary" href={`mailto:${CONTACT.email}`}>
              <Mail aria-hidden="true" /> <span className="ltr">{CONTACT.email}</span>
            </a>
            {cvHref && (
              <a className="btn btn-ghost" href={cvHref} target="_blank" rel="noopener noreferrer">
                <FileText aria-hidden="true" /> <span>{t("btnCv")}</span>
              </a>
            )}
            <a className="btn btn-ghost" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <WhatsApp aria-hidden="true" /> <span>WhatsApp</span>
            </a>
            <a className="btn btn-ghost" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedIn aria-hidden="true" /> LinkedIn
            </a>
            <a className="btn btn-ghost" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              <GitHub aria-hidden="true" /> GitHub
            </a>
          </div>
        </div>
      </Reveal>

    </section>
  );
}
