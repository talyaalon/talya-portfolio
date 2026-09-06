import { COLORS } from "../styles";
import { useI18n } from "../i18n";
import { pick } from "../utils/localized";
import { CASE_STUDY_PAGES } from "../content/jcafe";

import { PageStyles } from "../App";
import Nav from "../components/Nav";
import SiteFooter from "../components/SiteFooter";
import BackToTop from "../components/BackToTop";
import Reveal from "../components/Reveal";
import MetricsStrip from "../components/MetricsStrip";
import CaseStudySection from "../components/CaseStudySection";
import CaseStudyNav from "../components/CaseStudyNav";
import CaseStudyShot from "../components/CaseStudyShot";

// ============================================================
//  A project's case study, on its own URL.
//
//  This is a SEPARATE VITE ENTRY (projects/j-cafe.html), not a client route.
//  The site has no router and does not need one for a handful of pages: a
//  real HTML file per page is smaller, is prerendered by the same build step
//  as the home page, and gives a recruiter a link that works when it is
//  pasted anywhere. See vite.config.js and netlify.toml.
//
//  Content comes from src/content/, not the database - see that file for why.
//  Read-only and public, like App.jsx: it must never import anything
//  admin-side, and `npm run verify:bundle` scans this entry too.
// ============================================================
export default function CaseStudy({ slug }) {
  const { t, lang, dir } = useI18n();

  const page = CASE_STUDY_PAGES[slug];
  // A slug with no content is a build-time mistake, and an empty page shipped
  // to a recruiter is worse than a build that stops.
  if (!page) {
    throw new Error(
      `CaseStudy: no content for slug "${slug}" (have: ${Object.keys(CASE_STUDY_PAGES).join(", ")})`
    );
  }

  // The sticky nav's entries: the fixed sections plus one per case study.
  const sections = [
    { id: "overview", title: t("csOverview") },
    ...page.caseStudies.map((c) => ({ id: c.id, number: c.number, title: pick(c.title, lang) })),
    { id: "screens", title: t("csScreenshots") },
  ];

  return (
    <div dir={dir} style={{ minHeight: "100vh", background: COLORS.cream, color: COLORS.inkSoft }}>
      <PageStyles />
      <a className="skip-link" href="#main">
        {t("skipToContent")}
      </a>
      {/* base="/" - the nav's section links point at the home page, not at
          fragments that do not exist on this document. */}
      <Nav base="/" />

      <main id="main">
        <header className="cs-hero">
          <div className="wrap">
            {/* A real link, not a back button: this page is reached from a
                search result or a pasted link at least as often as from the
                home page, and history.back() would have nowhere to go. */}
            <nav className="cs-crumbs" aria-label={t("csBreadcrumb")}>
              <a href="/#work">{t("csBackHome")}</a>
            </nav>

            <h1 dir="auto">{page.name}</h1>
            <p className="cs-summary" dir="auto">
              {pick(page.summary, lang)}
            </p>

            <p className="cs-role" dir="auto">
              <span className="role-key">{t("roleLabel")}</span> {pick(page.role, lang)}
            </p>

            <div className="chips cs-stack" aria-label={t("csStack")}>
              {page.stack.map((tool) => (
                <span className="chip" key={tool} dir="ltr">
                  {tool}
                </span>
              ))}
            </div>

            <MetricsStrip metrics={page.metrics} />
          </div>
        </header>

        <div className="wrap cs-body">
          <CaseStudyNav sections={sections} />

          <div className="cs-content">
            <section className="cs-block" id="overview" aria-labelledby="overview-title">
              <Reveal>
                <h2 id="overview-title" className="cs-block-title">
                  {t("csOverview")}
                </h2>
                <p className="cs-lede" dir="auto">
                  {pick(page.overview, lang)}
                </p>
              </Reveal>
            </section>

            <section className="cs-block" aria-labelledby="cases-title">
              <Reveal>
                <h2 id="cases-title" className="cs-block-title">
                  {t("csCaseStudies")}
                </h2>
              </Reveal>
              {page.caseStudies.map((study) => (
                <CaseStudySection key={study.id} study={study} />
              ))}
            </section>

            <section className="cs-block" id="screens" aria-labelledby="screens-title">
              <Reveal>
                <h2 id="screens-title" className="cs-block-title">
                  {t("csScreenshots")}
                </h2>
                <div className="cs-shots">
                  {page.shots.map((shot) => (
                    <CaseStudyShot key={shot.id} shot={shot} />
                  ))}
                </div>
              </Reveal>
            </section>
          </div>
        </div>
      </main>

      <BackToTop />
      <SiteFooter />
    </div>
  );
}
