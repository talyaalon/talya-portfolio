import { useI18n } from "../i18n";
import Reveal from "./Reveal";

export default function About() {
  const { t } = useI18n();
  return (
    <section className="section" id="about">
      <Reveal className="wrap">
        <div className="sec-label">
          <span className="num" aria-hidden="true">01</span>
          <h2>{t("secAbout")}</h2>
          <span className="rule" aria-hidden="true" />
        </div>
        <p className="about-text" dir="auto">{t("aboutText")}</p>
      </Reveal>
    </section>
  );
}
