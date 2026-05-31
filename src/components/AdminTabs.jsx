// Admin navigation tabs + "add project" button.
const TABS = [
  ["projects", "פרויקטים"],
  ["analytics", "נתוני צפייה"],
  ["settings", "הגדרות"],
];

export default function AdminTabs({ tab, onTab, onAdd }) {
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px" }}>
      <div className="tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={"tab" + (tab === k ? " tab-active" : "")} onClick={() => onTab(k)}>
            {label}
          </button>
        ))}
        {tab === "projects" && (
          <button className="primary-btn" style={{ marginRight: "auto" }} onClick={onAdd}>
            + הוסף פרויקט
          </button>
        )}
      </div>
    </div>
  );
}
