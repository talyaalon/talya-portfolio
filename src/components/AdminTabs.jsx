import { useI18n } from "../i18n";

// Admin navigation tabs + "add project" button.
export default function AdminTabs({ tab, onTab, onAdd }) {
  const { t } = useI18n();
  const tabs = [
    ["projects", t("tabProjects")],
    ["analytics", t("tabAnalytics")],
    ["settings", t("tabSettings")],
  ];
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px" }}>
      <div className="tabs">
        {tabs.map(([k, label]) => (
          <button key={k} className={"tab" + (tab === k ? " tab-active" : "")} onClick={() => onTab(k)}>
            {label}
          </button>
        ))}
        {tab === "projects" && (
          <button className="primary-btn" style={{ marginInlineStart: "auto" }} onClick={onAdd}>
            {t("addProject")}
          </button>
        )}
      </div>
    </div>
  );
}
