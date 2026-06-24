import { useI18n, CONTACT } from "../i18n";
import Reveal from "./Reveal";
import { Mail, WhatsApp, LinkedIn, GitHub } from "./Icons";

export default function Contact() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <section className="section" id="contact">
      <Reveal className="wrap">
        <div className="contact">
          <h2>{t("secContact")}</h2>
          <p dir="auto">{t("contactText")}</p>
          <div className="actions">
            <a className="btn btn-primary" href={`mailto:${CONTACT.email}`}>
              <Mail /> <span>{CONTACT.email}</span>
            </a>
            <a className="btn btn-ghost" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <WhatsApp /> <span>WhatsApp</span>
            </a>
            <a className="btn btn-ghost" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedIn /> LinkedIn
            </a>
            <a className="btn btn-ghost" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              <GitHub /> GitHub
            </a>
          </div>
        </div>
        <footer>
          <span dir="auto">{t("contactLocation")}</span> · <span className="ltr">{CONTACT.phone}</span> · © {year} {t("siteName")}
        </footer>
      </Reveal>
    </section>
  );
}
