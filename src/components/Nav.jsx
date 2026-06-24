import { useI18n } from "../i18n";

export default function Nav({ isAdmin, onLoginClick, onLogout }) {
  const { t, toggle } = useI18n();
  return (
    <nav className="nav">
      <div className="wrap">
        <div className="brand">
          {t("brandFirst")} <b>{t("brandLast")}</b>
        </div>
        <div className="navlinks">
          <a className="nl" href="#about">{t("navAbout")}</a>
          <a className="nl" href="#work">{t("navProjects")}</a>
          <a className="nl" href="#skills">{t("navSkills")}</a>
          <a className="nl" href="#contact">{t("navContact")}</a>
          <button className="pill" onClick={toggle}>{t("langSwitch")}</button>
          {/* Admin login button removed on purpose — admins enter via the
              secret "#admin" link, which opens the login dialog. */}
          {isAdmin && (
            <>
              <span className="pill solid">{t("adminMode")}</span>
              <button className="pill" onClick={onLogout}>{t("logout")}</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
