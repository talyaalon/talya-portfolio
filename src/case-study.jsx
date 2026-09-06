import React from "react";
import { createRoot } from "react-dom/client";
import CaseStudy from "./pages/CaseStudy";
import { I18nProvider } from "./i18n";
import ErrorBoundary from "./components/ErrorBoundary";
import { readBootDataFromDocument } from "./lib/bootData";

// Client entry for the J-Cafe case study at /projects/j-cafe.
//
// Like src/main.jsx and unlike src/admin.jsx: public, read-only, and it
// imports nothing admin-side. `npm run verify:bundle` scans this entry too.
//
// The page's content is in src/content/, so unlike the home page there is no
// data to seed - the call below is here for the document title and language
// handling that share the same path, and it costs nothing when the block is
// absent.
readBootDataFromDocument();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider titleKey="csDocTitle" descriptionKey="csDocDescription">
      <ErrorBoundary>
        <CaseStudy slug="j-cafe" />
      </ErrorBoundary>
    </I18nProvider>
  </React.StrictMode>
);
