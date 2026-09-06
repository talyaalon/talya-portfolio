import { useI18n } from "../i18n";
import { pick } from "../utils/localized";
import Reveal from "./Reveal";

// The five parts every case study is told in, in this order. Keeping them in
// one array rather than five hand-written blocks is what guarantees all three
// case studies have the same shape - which is the whole reason the page can
// be skimmed by reading only the labels.
const PARTS = [
  ["context", "csContext"],
  ["problem", "csProblem"],
  ["constraints", "csConstraints"],
  ["decision", "csDecision"],
  ["outcome", "csOutcome"],
];

// One case study: a numbered heading and the five labelled parts.
//
// The <section> carries the id the sticky nav links to, and scroll-margin-top
// in CSS keeps the heading clear of the sticky site nav when you land on it.
export default function CaseStudySection({ study }) {
  const { t, lang } = useI18n();

  return (
    <section className="cs-case" id={study.id} aria-labelledby={`${study.id}-title`}>
      <Reveal>
        <header className="cs-case-head">
          <span className="cs-case-num" aria-hidden="true">
            {study.number}
          </span>
          <h3 id={`${study.id}-title`} className="cs-case-title" dir="auto">
            {pick(study.title, lang)}
          </h3>
        </header>

        <div className="cs-parts">
          {PARTS.map(([key, labelKey]) => {
            const body = study[key];
            // A case study missing one of its five parts is a content bug.
            // Rendering four parts under five labels would look deliberate.
            if (!body) {
              throw new Error(`CaseStudySection: "${study.id}" has no "${key}" section.`);
            }
            return (
              <div className="cs-part" key={key}>
                {/* The label is a heading, not a styled span: it is how the
                    page is navigated with a screen reader, and how "skim the
                    labels" works for someone who is not looking at it. */}
                <h4 className="cs-part-label">{t(labelKey)}</h4>
                <p className="cs-part-body" dir="auto">
                  {pick(body, lang)}
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

export { PARTS };
