import { useI18n, CONTACT, CV } from "../i18n";
import Reveal from "./Reveal";
import { Mail, WhatsApp, LinkedIn, GitHub, Download } from "./Icons";

export default function Contact() {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();
  const cvHref = CV[lang];

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
              <a className="btn btn-ghost" href={cvHref} download>
                <Download aria-hidden="true" /> <span>{t("btnCv")}</span>
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
