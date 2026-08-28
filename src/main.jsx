import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./i18n";
import ErrorBoundary from "./components/ErrorBoundary";

// Public entry. Note what is NOT here: no auth, no admin strings, no editor.
// See src/admin.jsx for the admin entry.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </I18nProvider>
  </React.StrictMode>
);
