import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { COLORS } from "../styles";
import { letterLogo } from "../utils/logo";
import { Loader, ErrorState } from "./Feedback";
import { useI18n } from "../i18n";

// Reads this month's events from Supabase (authenticated/admin only) and
// builds a monthly summary: site views, per-project opens & clicks, and
// the referral sources + estimated countries that visitors came from.
export default function Analytics({ projects }) {
  const { t } = useI18n();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    setEvents(null);
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_type, project_id, referrer, country, city, device, created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) setError(error.message);
    else setEvents(data);
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    if (!events) return null;
    const opens = {};
    const clicks = {};
    const sources = {};
    const countries = {};
    let views = 0;
    for (const e of events) {
      if (e.event_type === "view") views++;
      if (e.event_type === "open" && e.project_id) opens[e.project_id] = (opens[e.project_id] || 0) + 1;
      if (e.event_type === "click" && e.project_id) clicks[e.project_id] = (clicks[e.project_id] || 0) + 1;
      const src = sourceLabel(e.referrer, t("anDirect"));
      sources[src] = (sources[src] || 0) + 1;
      const c = e.country || t("anUnknown");
      countries[c] = (countries[c] || 0) + 1;
    }
    return {
      views,
      opens,
      clicks,
      totalOpens: Object.values(opens).reduce((a, b) => a + b, 0),
      totalClicks: Object.values(clicks).reduce((a, b) => a + b, 0),
      topSources: topN(sources, 6),
      topCountries: topN(countries, 6),
    };
  }, [events, t]);

  if (error) return <ErrorState message={t("anLoadFailed") + error} onRetry={load} />;
  if (!summary) return <Loader label={t("loadingData")} />;

  const stat = (label, value) => (
    <div className="stat">
      <div className="stat-num display">{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );

  return (
    <div>
      <p style={{ fontFamily: "'Assistant',sans-serif", color: COLORS.muted, fontSize: 14, margin: "0 0 16px" }}>
        {t("anMonthSummary")}
      </p>

      <div className="stats">
        {stat(t("anViewsMonth"), summary.views)}
        {stat(t("anOpens"), summary.totalOpens)}
        {stat(t("anClicks"), summary.totalClicks)}
      </div>

      <h3 className="display" style={{ fontSize: 24, margin: "34px 0 12px" }}>
        {t("anByProject")}
      </h3>
      <div className="table">
        <div className="trow thead">
          <span>{t("anColProject")}</span>
          <span>{t("anColOpens")}</span>
          <span>{t("anColClicks")}</span>
        </div>
        {projects.map((p) => (
          <div className="trow" key={p.id}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={p.logo || letterLogo((p.name || "?")[0], COLORS.accent)}
                alt=""
                style={{ width: 26, height: 26, borderRadius: 7 }}
              />
              {p.name}
            </span>
            <span>{summary.opens[p.id] || 0}</span>
            <span>{summary.clicks[p.id] || 0}</span>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="trow">
            <span style={{ color: COLORS.muted }}>{t("anNoProjects")}</span>
            <span />
            <span />
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginTop: 34 }}>
        <SourceList title={t("anSources")} rows={summary.topSources} empty={t("anNoData")} />
        <SourceList title={t("anCountries")} rows={summary.topCountries} empty={t("anNoData")} />
      </div>

      <div className="note">{t("anInfoNote")}</div>
    </div>
  );
}

function SourceList({ title, rows, empty }) {
  return (
    <div>
      <h3 className="display" style={{ fontSize: 20, margin: "0 0 12px" }}>
        {title}
      </h3>
      <div className="table">
        {rows.length === 0 && (
          <div className="trow" style={{ gridTemplateColumns: "1fr" }}>
            <span style={{ color: COLORS.muted }}>{empty}</span>
          </div>
        )}
        {rows.map(([label, count]) => (
          <div className="trow" style={{ gridTemplateColumns: "2fr 1fr" }} key={label}>
            <span dir="auto">{label}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// "https://www.google.com/search?q=…" → "google.com"; empty referrer → the direct label.
function sourceLabel(referrer, directLabel) {
  if (!referrer) return directLabel;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

function topN(obj, n) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}
