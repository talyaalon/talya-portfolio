import { useI18n } from "../i18n";
import Reveal from "./Reveal";
import ProjectCard from "./ProjectCard";
import { Banner } from "./Feedback";

// The "Selected Projects" section: a vertical timeline of project cards.
export default function Projects({ projects, isAdmin, onOpen, onEdit, onDelete, onAdd }) {
  const { t } = useI18n();
  return (
    <section className="section" id="work">
      <div className="wrap">
        <Reveal>
          <div className="sec-label">
            <span className="num">02</span>
            <h2>{t("secProjects")}</h2>
            <span className="rule" />
            {isAdmin && (
              <button className="primary-btn" onClick={onAdd}>{t("addProject")}</button>
            )}
          </div>
        </Reveal>

        {projects.length === 0 && (
          <Banner kind="info">{isAdmin ? t("emptyAdmin") : t("emptyClient")}</Banner>
        )}

        <div className="projects">
          <div className="spine" />
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
              <ProjectCard
                project={p}
                isAdmin={isAdmin}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
