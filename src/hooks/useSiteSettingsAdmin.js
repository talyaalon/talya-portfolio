import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, STORAGE_BUCKET } from "../lib/supabaseClient";
import { CV_KEYS, EMPTY_SETTINGS, fromSettingsRows } from "../lib/siteSettings";

// Read + write for site settings. Imported only by the admin entry, so the
// Storage upload and the write path never reach the public bundle.
//
// As with projects, this is a convenience boundary and not a security one:
// Row Level Security (supabase/migrations/004-site-settings.sql) is what
// refuses these writes to anyone who is not the owner.

// One object per language, always the same path. Overwriting it keeps a single
// CV per language in the bucket instead of a pile of dated files nobody
// deletes — and it means "remove" has exactly one object to remove.
const cvPath = (lang) => `cv/talya-israel-cv-${lang}.pdf`;

// 8 MB. A CV is a page or two; anything this size is a scan that should be
// compressed, and Storage would reject it further down with a worse message.
export const MAX_CV_BYTES = 8 * 1024 * 1024;

// Postgres "relation does not exist" / PostgREST "table not found in schema
// cache". Both mean one thing: migration 004 has not been run yet. That is a
// fixable state with a name, not a mysterious failure.
function isMissingTable(error) {
  if (error?.code === "42P01" || error?.code === "PGRST205") return true;
  // Older PostgREST versions answer with a message and no dedicated code.
  return /schema cache|does not exist/i.test(error?.message || "");
}

export function useSiteSettingsAdmin() {
  const [settings, setSettings] = useState(null); // null = still loading
  const [error, setError] = useState(null);
  const [needsMigration, setNeedsMigration] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase.from("site_settings").select("key,value");
    if (!alive.current) return;
    if (err) {
      // Say which of the two it is. "Run the migration" and "something went
      // wrong" call for completely different actions from the owner.
      setNeedsMigration(isMissingTable(err));
      setError(isMissingTable(err) ? null : err.message || String(err));
      setSettings(EMPTY_SETTINGS);
      return;
    }
    setNeedsMigration(false);
    setError(null);
    setSettings(fromSettingsRows(data ?? []));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  // Upload one language's CV and record its public URL.
  //
  // The URL carries a `?v=` stamp because the path never changes: Storage
  // serves public objects through a CDN, and without a new URL a visitor could
  // be handed the previous PDF from cache for hours after a replacement.
  const uploadCv = useCallback(
    async (file, lang) => {
      const path = cvPath(lang);
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: "application/pdf", upsert: true });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;

      const { error: rowErr } = await supabase
        .from("site_settings")
        .upsert({ key: CV_KEYS[lang], value: url, updated_at: new Date().toISOString() });
      if (rowErr) throw rowErr;

      await reload();
      return url;
    },
    [reload]
  );

  // Take one language's CV off the site: the row first, because that is what
  // the public site reads, then the file itself so an old CV is not left
  // sitting on a public URL.
  const removeCv = useCallback(
    async (lang) => {
      const { error: rowErr } = await supabase
        .from("site_settings")
        .delete()
        .eq("key", CV_KEYS[lang]);
      if (rowErr) throw rowErr;

      const { error: objErr } = await supabase.storage.from(STORAGE_BUCKET).remove([cvPath(lang)]);
      await reload();
      // The button is already gone from the site at this point. The leftover
      // file is reported rather than swallowed — it is still downloadable by
      // anyone who kept the link.
      if (objErr) throw objErr;
    },
    [reload]
  );

  return { settings, error, needsMigration, reload, uploadCv, removeCv };
}
