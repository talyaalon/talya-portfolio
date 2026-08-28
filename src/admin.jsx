import React from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./AdminApp";
import { I18nProvider } from "./i18n";
import { ADMIN_TRANSLATIONS } from "./i18n.admin";
import ErrorBoundary from "./components/ErrorBoundary";

// Entry point for /admin. The admin-only strings are passed in here rather
// than living in i18n.jsx, so they are bundled with this entry alone and
// never ship to a visitor.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider extra={ADMIN_TRANSLATIONS}>
      <ErrorBoundary>
        <AdminApp />
      </ErrorBoundary>
    </I18nProvider>
  </React.StrictMode>
);
