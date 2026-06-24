import { useI18n } from "../i18n";

// Admin navigation tabs (Projects / Analytics / Settings).
export default function AdminTabs({ tab, onTab }) {
  const { t } = useI18n();
  const tabs = [
    ["projects", t("tabProjects")],
    ["analytics", t("tabAnalytics")],
    ["settings", t("tabSettings")],
  ];
  return (
    <div className="wrap" style={{ paddingTop: 8 }}>
      <div className="tabs">
        {tabs.map(([k, label]) => (
          <button key={k} className={"tab" + (tab === k ? " tab-active" : "")} onClick={() => onTab(k)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
