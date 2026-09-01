import { useI18n } from "../i18n";

// Admin navigation tabs. The old "Settings" tab held a change-password form;
// it was removed on purpose. Passwords are changed in the Supabase dashboard
// (Authentication -> Users), which re-authenticates properly and keeps the
// wording out of this codebase entirely.
export default function AdminTabs({ tab, onTab }) {
  const { t } = useI18n();
  const tabs = [
    ["projects", t("tabProjects")],
    ["cv", t("tabCv")],
    ["analytics", t("tabAnalytics")],
  ];
  return (
    <div className="wrap" style={{ paddingTop: 8 }}>
      <div className="tabs" role="tablist">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            className={"tab" + (tab === k ? " tab-active" : "")}
            onClick={() => onTab(k)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
