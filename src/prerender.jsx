// ============================================================
//  Server entry, used only at build time.
//
//  Vite builds this once with --ssr into a Node-runnable bundle, and
//  scripts/prerender.mjs imports it, renders each page to a string and writes
//  the result into the built HTML. Nothing here ships to a browser.
//
//  Why this exists: the site used to send <div id="root"></div> and a line of
//  <noscript> text. Every crawler, link unfurler and recruiter tool that does
//  not execute JavaScript saw a portfolio with no projects in it.
//
//  Only render() is exported. The data comes from the caller, because the
//  build is where the network call belongs - effects do not run during a
//  server render, so a component that fetches its own data would render its
//  loading state and prerender a spinner.
// ============================================================

import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { I18nProvider } from "./i18n";
import { setBootData } from "./lib/bootData";

// The pages that get prerendered, keyed by their built HTML file.
//
// admin.html is deliberately absent: it is behind a sign-in, it is marked
// noindex, and prerendering it would mean rendering an editor for nobody.
export const PAGES = {
  "index.html": () => <App />,
};

export function render(page, data) {
  const build = PAGES[page];
  if (!build) {
    throw new Error(`prerender: no page registered for "${page}" (have: ${Object.keys(PAGES).join(", ")})`);
  }

  // The hooks read this synchronously in their useState initialisers.
  setBootData(data);

  // No ErrorBoundary here on purpose. In the browser it turns a crash into a
  // "reload the page" message; at build time a crash must stop the build, not
  // be caught and written to disk as the finished page.
  return renderToStaticMarkup(<I18nProvider>{build()}</I18nProvider>);
}
