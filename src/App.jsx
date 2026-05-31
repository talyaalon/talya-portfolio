import { useEffect, useRef, useState } from "react";
import { styles, COLORS } from "./styles";
import { isConfigured } from "./lib/supabaseClient";
import { track } from "./lib/analytics";
import { useI18n } from "./i18n";
import { useAuth } from "./hooks/useAuth";
import { useProjects } from "./hooks/useProjects";

import Header from "./components/Header";
import AdminTabs from "./components/AdminTabs";
import ProjectCard from "./components/ProjectCard";
import ProjectModal from "./components/ProjectModal";
import ProjectForm from "./components/ProjectForm";
import Login from "./components/Login";
import Settings from "./components/Settings";
import Analytics from "./components/Analytics";
import Modal from "./components/Modal";
import { Loader, ErrorState, Banner } from "./components/Feedback";

export default function App() {
  const { t } = useI18n();
  const { session, isAdmin, loading: authLoading, signIn, signOut } = useAuth();
  const { projects, error, reload, saveProject, deleteProject, uploadLogo } = useProjects();

  const [tab, setTab] = useState("projects"); // projects | analytics | settings
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  // Count one site view per load (server-side records the details).
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

  const clickLink = (proj) => {
    track("click", proj.id);
    if (proj.link) window.open(proj.link, "_blank", "noopener");
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

  // ---- not configured yet (missing .env) ----
  if (!isConfigured) {
    return (
      <Shell isAdmin={false}>
        <div className="note" style={{ marginTop: 0 }}>
          <strong>{t("notConnectedTitle")}</strong>
          <br />
          {t("notConnectedBody")}
        </div>
      </Shell>
    );
  }

  const showAdminBody = isAdmin && (tab === "analytics" || tab === "settings");

  return (
    <Shell
      isAdmin={isAdmin}
      onLoginClick={() => setLoginOpen(true)}
      onLogout={onLogout}
      adminTabs={isAdmin && <AdminTabs tab={tab} onTab={setTab} onAdd={() => setEditing(blankProject())} />}
    >
      {authLoading || projects === null ? (
        <Loader />
      ) : error === "missing-config" ? null : error ? (
        <ErrorState message={t("projLoadFailed") + error} onRetry={reload} />
      ) : showAdminBody && tab === "analytics" ? (
        <Analytics projects={projects} />
      ) : showAdminBody && tab === "settings" ? (
        <Settings email={session?.user?.email} />
      ) : (
        <>
          {projects.length === 0 && (
            <Banner kind="info">{isAdmin ? t("emptyAdmin") : t("emptyClient")}</Banner>
          )}
          <div className="grid">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                isAdmin={isAdmin}
                onOpen={openProject}
                onEdit={setEditing}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* project detail */}
      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} onLinkClick={clickLink} />
      )}

      {/* add / edit */}
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

      {/* login */}
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

// Page shell: fonts, background, header, optional admin tabs, main slot.
// dir follows the selected language (rtl for Hebrew, ltr for English).
function Shell({ children, isAdmin, onLoginClick, onLogout, adminTabs }) {
  const { dir } = useI18n();
  return (
    <div dir={dir} style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.ink }}>
      <style>{styles}</style>
      <Header isAdmin={isAdmin} onLoginClick={onLoginClick} onLogout={onLogout} />
      {adminTabs}
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 28px 80px" }}>{children}</main>
    </div>
  );
}

function blankProject() {
  return { _isNew: true, id: null, name: "", short: "", tools: [], link: "", logo: "", readme: "" };
}
