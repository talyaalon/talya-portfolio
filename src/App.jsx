import { useEffect, useRef, useState } from "react";
import { styles, COLORS } from "./styles";
import { isConfigured } from "./lib/supabaseClient";
import { track } from "./lib/analytics";
import { useI18n } from "./i18n";
import { useAuth } from "./hooks/useAuth";
import { useProjects } from "./hooks/useProjects";

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import AdminTabs from "./components/AdminTabs";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import ProjectModal from "./components/ProjectModal";
import ProjectForm from "./components/ProjectForm";
import Login from "./components/Login";
import Modal from "./components/Modal";
import { Loader, ErrorState } from "./components/Feedback";

export default function App() {
  const { t } = useI18n();
  const { session, isAdmin, loading: authLoading, signIn, signOut } = useAuth();
  const { projects, error, reload, saveProject, deleteProject, uploadLogo } = useProjects();

  const [tab, setTab] = useState("projects"); // projects | analytics | settings
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

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

  const onDelete = async (proj) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteProject(proj.id);
    } catch (e) {
      window.alert(t("deleteFailed") + (e?.message || ""));
    }
  };

  const onLogout = async () => {
    await signOut();
    setTab("projects");
  };

  // ---- not configured (missing .env) ----
  if (!isConfigured) {
    return (
      <Shell isAdmin={false}>
        <Hero />
        <section className="section">
          <div className="wrap">
            <div className="note">
              <strong>{t("notConnectedTitle")}</strong>
              <br />
              {t("notConnectedBody")}
            </div>
          </div>
        </section>
      </Shell>
    );
  }

  const loading = authLoading || projects === null;
  const showAdminPane = isAdmin && (tab === "analytics" || tab === "settings");

  return (
    <Shell isAdmin={isAdmin} onLoginClick={() => setLoginOpen(true)} onLogout={onLogout}>
      <Hero />

      {isAdmin && <AdminTabs tab={tab} onTab={setTab} />}

      {loading ? (
        <section className="section">
          <div className="wrap">
            <Loader />
          </div>
        </section>
      ) : error && error !== "missing-config" ? (
        <section className="section">
          <div className="wrap">
            <ErrorState message={t("projLoadFailed") + error} onRetry={reload} />
          </div>
        </section>
      ) : showAdminPane ? (
        <section className="section">
          <div className="wrap">
            {tab === "analytics" ? <Analytics projects={projects} /> : <Settings email={session?.user?.email} />}
          </div>
        </section>
      ) : (
        <>
          <About />
          <Projects
            projects={projects}
            isAdmin={isAdmin}
            onOpen={openProject}
            onEdit={setEditing}
            onDelete={onDelete}
            onAdd={() => setEditing(blankProject())}
          />
          <Skills />
          <Contact />
        </>
      )}

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}

      {editing && (
        <Modal onClose={() => setEditing(null)} wide>
          <ProjectForm
            project={editing}
            uploadLogo={uploadLogo}
            onCancel={() => setEditing(null)}
            onSave={async (proj) => {
              await saveProject(proj);
              setEditing(null);
            }}
          />
        </Modal>
      )}

      {loginOpen && (
        <Modal onClose={() => setLoginOpen(false)}>
          <Login
            signIn={signIn}
            onSuccess={() => {
              setLoginOpen(false);
              setTab("projects");
            }}
          />
        </Modal>
      )}
    </Shell>
  );
}

// Page shell: injects fonts/CSS, sets dir from language, renders the nav.
function Shell({ children, isAdmin, onLoginClick, onLogout }) {
  const { dir } = useI18n();
  return (
    <div dir={dir} style={{ minHeight: "100vh", background: COLORS.cream, color: COLORS.inkSoft }}>
      <style>{styles}</style>
      <Nav isAdmin={isAdmin} onLoginClick={onLoginClick} onLogout={onLogout} />
      <main>{children}</main>
    </div>
  );
}

function blankProject() {
  return {
    _isNew: true,
    id: null,
    nameEn: "", nameHe: "",
    metaEn: "", metaHe: "",
    shortEn: "", shortHe: "",
    readmeEn: "", readmeHe: "",
    resultEn: "", resultHe: "",
    tools: [],
    link: "", repo: "", demo: "",
    logo: "", screenshot: "",
  };
}
