import { COLORS } from "../styles";
import { letterLogo } from "../utils/logo";

// A single project card in the grid. Whole card is a button (a11y).
export default function ProjectCard({ project, index, isAdmin, onOpen, onEdit, onDelete }) {
  const logo = project.logo || letterLogo((project.name || "?")[0], COLORS.accent);
  return (
    <article className="reveal" style={{ animationDelay: `${0.05 * index}s` }}>
      <button className="card" onClick={() => onOpen(project)} aria-label={`צפייה בפרויקט ${project.name}`}>
        <div className="card-logo">
          <img src={logo} alt="" />
        </div>
        <h3 className="display" style={{ fontSize: 25, margin: "16px 0 6px" }}>
          {project.name}
        </h3>
        <p
          style={{
            fontFamily: "'Assistant',sans-serif",
            color: COLORS.muted,
            fontSize: 15,
            lineHeight: 1.5,
            minHeight: 44,
          }}
        >
          {project.short}
        </p>
        <div className="chips">
          {(project.tools || []).slice(0, 3).map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="card-foot">
          <span
            style={{
              fontFamily: "'Assistant',sans-serif",
              fontSize: 13,
              color: COLORS.accentDeep,
              fontWeight: 600,
            }}
          >
            צפייה בפרויקט ←
          </span>
          {isAdmin && (
            <span style={{ display: "flex", gap: 8 }}>
              <span
                className="mini"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.stopPropagation(), onEdit(project))}
              >
                עריכה
              </span>
              <span
                className="mini danger"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.stopPropagation(), onDelete(project))}
              >
                מחיקה
              </span>
            </span>
          )}
        </div>
      </button>
    </article>
  );
}
