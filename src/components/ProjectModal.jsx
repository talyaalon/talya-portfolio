import Modal from "./Modal";
import { COLORS } from "../styles";
import { letterLogo } from "../utils/logo";
import { useI18n } from "../i18n";

// Full-screen detail: logo, name, short line, all tool chips, README, link.
export default function ProjectModal({ project, onClose, onLinkClick }) {
  const { t } = useI18n();
  const logo = project.logo || letterLogo((project.name || "?")[0], COLORS.accent);
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <div className="card-logo" style={{ width: 64, height: 64, margin: 0 }}>
          <img src={logo} alt="" />
        </div>
        <div>
          <h2 className="display" style={{ fontSize: 34, margin: 0 }}>
            {project.name}
          </h2>
          <p dir="auto" style={{ fontFamily: "'Assistant',sans-serif", color: COLORS.muted, margin: "4px 0 0" }}>
            {project.short}
          </p>
        </div>
      </div>

      <div className="chips" style={{ marginTop: 18 }}>
        {(project.tools || []).map((tool) => (
          <span className="chip" key={tool}>
            {tool}
          </span>
        ))}
      </div>

      <div className="rule" style={{ margin: "22px 0" }} />

      <h4
        style={{
          fontFamily: "'Assistant',sans-serif",
          letterSpacing: ".5px",
          color: COLORS.accentDeep,
          margin: "0 0 10px",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {t("modalReadme")}
      </h4>
      <p
        dir="auto"
        style={{
          fontFamily: "'Assistant',sans-serif",
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: COLORS.ink,
        }}
      >
        {project.readme}
      </p>

      {project.link && (
        <button className="primary-btn" style={{ marginTop: 24 }} onClick={() => onLinkClick(project)}>
          {t("modalOpen")}
        </button>
      )}
    </Modal>
  );
}
