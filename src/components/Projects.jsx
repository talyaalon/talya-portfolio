import { useI18n } from "../i18n";
import Reveal from "./Reveal";
import ProjectCard from "./ProjectCard";
import { Banner } from "./Feedback";
import { featuredFirst, hasCaseStudy } from "../lib/caseStudies";

// The "Selected Projects" section: a vertical timeline of project cards.
// Shared by the public site (read-only) and the admin app (isAdmin).
//
// A project with a case study is rendered as the FEATURED card: first in the
// list, wider, and carrying its headline metrics. See lib/caseStudies.js for
// why the ordering is not left to the `position` column.
export default function Projects({ projects, isAdmin, onOpen, onEdit, onDelete, onAdd }) {
  const { t } = useI18n();
  const ordered = featuredFirst(projects);
  return (
    <section className="section" id="work">
      <div className="wrap">
        <Reveal>
          <div className="sec-label">
            <span className="num" aria-hidden="true">
              03
            </span>
            <h2>{t("secProjects")}</h2>
            <span className="rule" aria-hidden="true" />
            {isAdmin && (
              <button className="primary-btn" onClick={onAdd}>
                {t("addProject")}
              </button>
            )}
          </div>
        </Reveal>

        {projects.length === 0 && <Banner kind="info">{isAdmin ? t("emptyAdmin") : t("emptyClient")}</Banner>}

        <div className="projects">
          <div className="spine" aria-hidden="true" />
          {ordered.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
              <ProjectCard
                project={p}
                featured={hasCaseStudy(p)}
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
