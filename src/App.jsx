import { useEffect, useRef, useState } from "react";
import { styles, noScriptStyles, COLORS } from "./styles";
import { isConfigured } from "./lib/publicApi";
import { track } from "./lib/analytics";
import { useI18n } from "./i18n";
import { useProjectsRead } from "./hooks/useProjectsRead";

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import ProjectModal from "./components/ProjectModal";
import BackToTop from "./components/BackToTop";
import SiteFooter from "./components/SiteFooter";
import { Loader, ErrorState } from "./components/Feedback";

// The PUBLIC site. Read-only by construction: it never imports useAuth, the
// project editor, the analytics screen, or any admin string. The admin app is
// a separate entry (src/AdminApp.jsx) served at /admin.
//
// Do not import anything admin-related here — `npm run verify:bundle` fails
// the build if admin vocabulary appears in the visitor bundle.
export default function App() {
  const { t } = useI18n();
  const { projects, error, reload } = useProjectsRead();
  const [selected, setSelected] = useState(null);

  const viewSent = useRef(false);
  useEffect(() => {
    if (!viewSent.current) {
      viewSent.current = true;
      track("view");
    }
  }, []);

  const openProject = (proj) => {
    setSelected(proj);
    track("open", proj.id);
  };

  const loading = projects === null;

  // A misconfigured deploy used to show visitors "create a .env file from
  // .env.example" — developer instructions on a portfolio. Now it degrades to
  // the rest of the page with one neutral line where the projects would be.
  const unavailable = !isConfigured || (error && error !== "missing-config");

  return (
    <Shell>
      <Hero />
      <About />
      <Experience />

      {loading ? (
        <section className="section">
          <div className="wrap">
            <Loader />
          </div>
        </section>
      ) : unavailable ? (
        <section className="section" id="work">
          <div className="wrap">
            <ErrorState message={t("projLoadFailed")} onRetry={isConfigured ? reload : null} />
          </div>
        </section>
      ) : (
        <Projects projects={projects} onOpen={openProject} />
      )}

      <Skills />
      <Contact />

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      <BackToTop />
    </Shell>
  );
}

// Page shell: injects CSS, sets dir from language, renders the nav.
function Shell({ children }) {
  const { dir, t } = useI18n();
  return (
    <div dir={dir} style={{ minHeight: "100vh", background: COLORS.cream, color: COLORS.inkSoft }}>
      <PageStyles />
      <a className="skip-link" href="#main">
        {t("skipToContent")}
      </a>
      <Nav />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}

// The stylesheet, plus the override a reader without JavaScript needs.
//
// Two things here are deliberate and easy to undo by accident:
//
// 1. dangerouslySetInnerHTML, not `<style>{styles}</style>`. React escapes an
//    element's text children, and a <style> body is raw text to the HTML
//    parser, so a "&gt;" it wrote would never be decoded back. On the client
//    that never showed, because React sets textContent instead of parsing
//    markup; it only appears once the page is rendered to a string at build
//    time, and then it appears as a stylesheet with broken selectors.
//
// 2. The <noscript> override. .reveal starts at opacity:0 and is only cleared
//    by an IntersectionObserver, and the stylesheet lives inside the React
//    tree - so prerendered HTML carries the rule that hides itself, and a
//    reader with JavaScript off would get a styled, complete, invisible page.
//    It is set as raw text rather than as a child element on purpose: a
//    <style> element created through the DOM applies even inside <noscript>,
//    which would disable the animation for everyone else.
export function PageStyles() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <noscript dangerouslySetInnerHTML={{ __html: noScriptStyles }} />
    </>
  );
}
