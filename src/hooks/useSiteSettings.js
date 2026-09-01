import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSiteSettings, isConfigured } from "../lib/publicApi";
import { EMPTY_SETTINGS, fromSettingsRows } from "../lib/siteSettings";

// Site settings for the PUBLIC site — the CV, today.
//
// Same shape and the same guards as useProjectsRead: plain REST (never the
// Supabase SDK, which would pull its auth module into the visitor bundle), and
// a request id so two overlapping loads cannot leave the older answer on
// screen.
//
// `settings` is null while loading. The caller needs to tell "still loading"
// apart from "no CV": rendering the page as if there were no CV and then
// popping a button in shifts the layout under the reader's eyes.
//
// Two components on the page ask for this (the hero and the contact section),
// and they would otherwise fetch the same two rows twice. The request is
// shared at module level instead: the second caller joins the one already in
// flight, and a reload from either clears it for both.
let cached = null;
let inFlight = null;

function loadRows({ force } = {}) {
  if (force) {
    cached = null;
    inFlight = null;
  }
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = fetchSiteSettings().then(
      (rows) => {
        cached = rows;
        inFlight = null;
        return rows;
      },
      (e) => {
        // Not cached: a failure must not become permanent for the session.
        inFlight = null;
        throw e;
      }
    );
  }
  return inFlight;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  const requestId = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(async ({ force } = {}) => {
    if (!isConfigured) {
      setError("missing-config");
      setSettings(EMPTY_SETTINGS);
      return;
    }

    const id = ++requestId.current;
    setError(null);

    try {
      const rows = await loadRows({ force });
      if (!alive.current || id !== requestId.current) return; // superseded
      setSettings(fromSettingsRows(rows));
    } catch (e) {
      if (!alive.current || id !== requestId.current) return;
      // The CV is one button on an otherwise complete page, so a failure here
      // hides the button rather than taking the hero down. It is not silent:
      // publicApi has already logged the status, and the reason is kept here.
      console.error("site settings unavailable:", e);
      setError(e?.message || String(e));
      setSettings(EMPTY_SETTINGS);
    }
  }, []);

  useEffect(() => {
    // Fetching on mount is the intended use of an effect: the data lives in an
    // external system, and `load` guards its own setState calls.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const reload = useCallback(() => load({ force: true }), [load]);

  return { settings, error, reload };
}
