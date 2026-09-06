import { useI18n } from "../i18n";
import { pick } from "../utils/localized";

// A row of measured numbers: large numeral, small caption, and the scope the
// number was measured over.
//
// The scope line is not optional and is not styling. "483 orders" on its own
// reads as the whole chain over the whole year; it is one branch over one
// quarter. A metric whose scope is missing is a claim the reader cannot check,
// so this throws rather than quietly rendering the bare number.
export default function MetricsStrip({ metrics, className = "" }) {
  const { lang } = useI18n();

  return (
    <dl className={`stats cs-metrics ${className}`.trim()}>
      {metrics.map((m) => {
        if (!m.scope) {
          throw new Error(`MetricsStrip: metric "${m.id}" has no scope. Every number must state what it was measured over.`);
        }
        return (
          <div className="stat" key={m.id}>
            <dt className="stat-num h-display" dir="ltr">
              {m.value}
            </dt>
            <dd className="stat-lbl" dir="auto">
              {pick(m.label, lang)}
              <span className="stat-scope">{pick(m.scope, lang)}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
