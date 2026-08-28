import { useCallback } from "react";
import { supabase, STORAGE_BUCKET } from "../lib/supabaseClient";
import { toRow, invalidUrlFields, MIGRATION_001_COLUMNS } from "../lib/projectRow";
import { useProjectsRead } from "./useProjectsRead";

// Read + write. Imported only by the admin entry, so the mutation code and
// the storage upload never reach the public bundle.
//
// This is a convenience boundary, not a security one: the real boundary is
// Row Level Security (supabase/policies-owner-only.sql), which refuses these
// writes for anyone who is not the owner.
export function useProjectsAdmin() {
  const { projects, error, missingColumns, reload } = useProjectsRead();

  // Upload a logo Blob to Storage, return its public URL.
  const uploadLogo = useCallback(async (blob, projectId) => {
    const path = `${projectId}-${Date.now()}.jpg`;
    const { error: err } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (err) throw err;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const saveProject = useCallback(
    async (proj) => {
      const bad = invalidUrlFields(proj);
      if (bad.length) {
        const e = new Error(`invalid-url:${bad.join(",")}`);
        e.fields = bad;
        throw e;
      }

      // Against an unmigrated database, write only the columns it has rather
      // than failing the whole save on an unknown column.
      const writable = missingColumns.length
        ? Object.keys(toRow(proj)).filter((c) => !missingColumns.includes(c))
        : null;
      const row = toRow(proj, writable);
      if (proj.id && !proj._isNew) {
        const { error: err } = await supabase.from("projects").update(row).eq("id", proj.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("projects").insert(row);
        if (err) throw err;
      }
      await reload();
    },
    [reload, missingColumns]
  );

  const deleteProject = useCallback(
    async (id) => {
      const { error: err } = await supabase.from("projects").delete().eq("id", id);
      if (err) throw err;
      await reload();
    },
    [reload]
  );

  return { projects, error, missingColumns, reload, saveProject, deleteProject, uploadLogo };
}
