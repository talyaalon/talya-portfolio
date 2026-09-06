import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./i18n";
import ErrorBoundary from "./components/ErrorBoundary";
import { readBootDataFromDocument } from "./lib/bootData";

// Public entry. Note what is NOT here: no auth, no admin strings, no editor.
// See src/admin.jsx for the admin entry.

// Before the first render, not during it: the hooks read this in their
// useState initialisers, so it has to be in place by the time React runs.
readBootDataFromDocument();

// createRoot, not hydrateRoot, even though the markup is prerendered.
//
// Hydration would have to agree with the server render, and this page cannot
// promise that: the language comes from localStorage during render, so every
// Hebrew reader would mismatch on the first paint and get a console full of
// hydration errors. React replaces the prerendered markup instead. The point
// of prerendering here is the HTML a crawler downloads, not saving the client
// a render - and with the boot data above, what replaces it is identical.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </I18nProvider>
  </React.StrictMode>
);
