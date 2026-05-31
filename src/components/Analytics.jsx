import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { COLORS } from "../styles";
import { letterLogo } from "../utils/logo";
import { Loader, ErrorState } from "./Feedback";

// Reads this month's events from Supabase (authenticated/admin only) and
// builds a monthly summary: site views, per-project opens & clicks, and
// the referral sources + estimated countries that visitors came from.
export default function Analytics({ projects }) {
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
      const src = sourceLabel(e.referrer);
      sources[src] = (sources[src] || 0) + 1;
      const c = e.country || "לא ידוע";
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
  }, [events]);

  if (error) return <ErrorState message={"טעינת הנתונים נכשלה: " + error} onRetry={load} />;
  if (!summary) return <Loader label="טוען נתונים…" />;

  const stat = (label, value) => (
    <div className="stat">
      <div className="stat-num display">{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );

  return (
    <div>
      <p style={{ fontFamily: "'Assistant',sans-serif", color: COLORS.muted, fontSize: 14, margin: "0 0 16px" }}>
        סיכום עבור החודש הנוכחי.
      </p>

      <div className="stats">
        {stat("צפיות באתר החודש", summary.views)}
        {stat("פתיחות כרטיסיות", summary.totalOpens)}
        {stat("קליקים על קישורים", summary.totalClicks)}
      </div>

      <h3 className="display" style={{ fontSize: 24, margin: "34px 0 12px" }}>
        לפי פרויקט
      </h3>
      <div className="table">
        <div className="trow thead">
          <span>פרויקט</span>
          <span>פתיחות</span>
          <span>קליקים לקישור</span>
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
            <span style={{ color: COLORS.muted }}>אין פרויקטים עדיין</span>
            <span />
            <span />
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginTop: 34 }}>
        <SourceList title="מאיפה הגיעו (Referrer)" rows={summary.topSources} empty="אין נתונים עדיין" />
        <SourceList title="מדינות (משוער לפי IP)" rows={summary.topCountries} empty="אין נתונים עדיין" />
      </div>

      <div className="note">
        <strong>על איסוף הנתונים:</strong> הנתונים כאן אמיתיים ונאספים בצד-שרת. נאסף מה שאפשר באופן אנונימי —
        מאיפה הגיע המבקר (referrer), מדינה/עיר משוערת לפי כתובת ה-IP, סוג המכשיר, והתאריך.
        <u> כתובת המייל של מבקר אנונימי אינה חשופה לאף אתר בדפדפן — לכן היא לא נאספת ולא מוצגת.</u>
      </div>
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
            <span>{label}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// "https://www.google.com/search?q=…" → "google.com"; empty referrer → "כניסה ישירה".
function sourceLabel(referrer) {
  if (!referrer) return "כניסה ישירה";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "אחר";
  }
}

function topN(obj, n) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}
