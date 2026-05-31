import { COLORS } from "../styles";
import { letterLogo } from "../utils/logo";
import { track } from "../lib/analytics";

// A single project card in the grid. Clicking the card opens the full detail
// view; the URL shown at the bottom is a direct link that opens the project
// itself in a new tab.
export default function ProjectCard({ project, index, isAdmin, onOpen, onEdit, onDelete }) {
  const logo = project.logo || letterLogo((project.name || "?")[0], COLORS.accent);
  const open = () => onOpen(project);

  return (
    <article className="reveal" style={{ animationDelay: `${0.05 * index}s` }}>
      <div
        className="card"
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
        aria-label={`צפייה בפרויקט ${project.name}`}
      >
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

        {/* Direct link to the live project/app — clickable straight from the card */}
        {project.link && (
          <a
            className="card-link"
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            title={project.link}
            onClick={(e) => {
              e.stopPropagation(); // don't also open the detail view
              track("click", project.id);
            }}
          >
            ↗ {prettyUrl(project.link)}
          </a>
        )}

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
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && (e.stopPropagation(), onEdit(project))
                }
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
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && (e.stopPropagation(), onDelete(project))
                }
              >
                מחיקה
              </span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// "https://www.example.com/app" → "example.com/app" (tidy, still a real link).
function prettyUrl(link) {
  try {
    const u = new URL(link);
    const path = u.pathname === "/" ? "" : u.pathname;
    return u.hostname.replace(/^www\./, "") + path;
  } catch {
    return link;
  }
}
