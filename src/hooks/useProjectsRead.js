import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProjects, isConfigured } from "../lib/publicApi";
import { fromRow } from "../lib/projectRow";

// Read-only project list, used by the PUBLIC site.
//
// Deliberately goes through lib/publicApi (plain REST) rather than the
// Supabase SDK: the SDK would pull its auth module — and every password
// string in it — into the bundle every visitor downloads.
export function useProjectsRead() {
  const [projects, setProjects] = useState(null); // null = still loading
  const [error, setError] = useState(null);

  // Guards against two overlapping loads resolving out of order and leaving
  // the older response on screen.
  const requestId = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!isConfigured) {
      setError("missing-config");
      setProjects([]);
      return;
    }

    const id = ++requestId.current;
    setError(null);

    try {
      const rows = await fetchProjects();
      if (!alive.current || id !== requestId.current) return; // superseded
      setProjects(rows.map(fromRow));
    } catch (e) {
      if (!alive.current || id !== requestId.current) return;
      setError(e?.message || String(e));
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    // Fetching the list on mount is the intended use of an effect here: the
    // data lives in an external system, and `load` guards its own setState
    // calls against unmount and against superseded requests.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { projects, error, reload: load };
}
