import { useState } from "react";
import { styles, COLORS } from "./styles";
import { adminConfigError, ADMIN_EMAIL_DOMAIN } from "./lib/supabaseClient";
import { useI18n } from "./i18n";
import { useAuth } from "./hooks/useAuth";
import { useProjectsAdmin } from "./hooks/useProjectsAdmin";
import { useSiteSettingsAdmin } from "./hooks/useSiteSettingsAdmin";
import { blankProject } from "./lib/projectRow";

import AdminLogin from "./components/AdminLogin";
import AdminTabs from "./components/AdminTabs";
import Analytics from "./components/Analytics";
import CvPanel from "./components/CvPanel";
import Projects from "./components/Projects";
import ProjectForm from "./components/ProjectForm";
import Modal from "./components/Modal";
import { Loader, ErrorState, Banner } from "./components/Feedback";

// The admin app, served at /admin from its own entry point (admin.html).
// Nothing here is imported by src/App.jsx — that separation is what keeps the
// editor, the analytics screen and every password string out of the bundle a
// visitor downloads.
export default function AdminApp() {
  const { dir, t } = useI18n();
  const { isAdmin, isImpostor, loading: authLoading, error: authError, signIn, signOut } = useAuth();

  return (
    <div dir={dir} style={{ minHeight: "100vh", background: COLORS.cream, color: COLORS.inkSoft }}>
      <style>{styles}</style>
      <AdminNav isAdmin={isAdmin} onLogout={signOut} />
      <main>
        {authLoading ? (
          <Section>
            <Loader />
          </Section>
        ) : isAdmin ? (
          <AdminPanes />
        ) : (
          <Section narrow>
            <AdminLogin
              signIn={signIn}
              configError={adminConfigError}
              notOwner={isImpostor}
              onSignOut={signOut}
              emailDomain={ADMIN_EMAIL_DOMAIN}
            />
            {/* /admin is a public URL, so the banner stays generic; the
                Supabase detail goes to the console for the owner. */}
            {authError && (
              <div style={{ marginTop: 16 }}>
                <Banner kind="error">{t("loginAuthUnavailable")}</Banner>
              </div>
            )}
          </Section>
        )}
      </main>
    </div>
  );
}

function AdminPanes() {
  const { t } = useI18n();
  const { projects, error, missingColumns, reload, saveProject, deleteProject, uploadLogo } =
    useProjectsAdmin();
  const [tab, setTab] = useState("projects");
  const [editing, setEditing] = useState(null);

  const onDelete = async (proj) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteProject(proj.id);
    } catch (e) {
      window.alert(t("deleteFailed") + (e?.message || ""));
    }
  };

  if (projects === null && !error) {
    return (
      <Section>
        <Loader />
      </Section>
    );
  }

  if (error && error !== "missing-config") {
    return (
      <Section>
        <ErrorState message={t("adminLoadFailed") + error} onRetry={reload} />
      </Section>
    );
  }

  return (
    <>
      <AdminTabs tab={tab} onTab={setTab} />

      {/* The public site degrades quietly when the database is behind; the
          owner should not have to notice it by accident. */}
      {missingColumns.length > 0 && (
        <div className="wrap" style={{ paddingTop: 12 }}>
          <Banner kind="error">
            {t("adminNeedsMigration")} <span dir="ltr">{missingColumns.join(", ")}</span>
          </Banner>
        </div>
      )}
      {tab === "cv" ? (
        <Section>
          <CvPane />
        </Section>
      ) : tab === "analytics" ? (
        <Section>
          <Analytics projects={projects} />
        </Section>
      ) : (
        <Projects
          projects={projects}
          isAdmin
          onOpen={setEditing}
          onEdit={setEditing}
          onDelete={onDelete}
          onAdd={() => setEditing(blankProject())}
        />
      )}

      {editing && (
        <Modal
          onClose={() => setEditing(null)}
          wide
          labelledBy="project-form-title"
          confirmClose={t("formDiscard")}
        >
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
    </>
  );
}

// The CV lives in its own pane so its query runs when the tab is opened, and
// not on every visit to the projects screen.
function CvPane() {
  const { settings, error, needsMigration, uploadCv, removeCv } = useSiteSettingsAdmin();
  return (
    <CvPanel
      settings={settings}
      error={error}
      needsMigration={needsMigration}
      onUpload={uploadCv}
      onRemove={removeCv}
    />
  );
}

function AdminNav({ isAdmin, onLogout }) {
  const { t } = useI18n();
  return (
    <nav className="nav" aria-label={t("navLabel")}>
      <div className="wrap">
        <div className="brand">
          {t("brandFirst")} <b>{t("brandLast")}</b>
        </div>
        <div className="navlinks">
          <a className="pill" href="/">
            {t("backToSite")}
          </a>
          {isAdmin && (
            <>
              <span className="pill solid">{t("adminMode")}</span>
              <button className="pill" onClick={onLogout}>
                {t("logout")}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Section({ children, narrow }) {
  return (
    <section className="section">
      <div className="wrap" style={narrow ? { maxWidth: 460 } : undefined}>
        {children}
      </div>
    </section>
  );
}
