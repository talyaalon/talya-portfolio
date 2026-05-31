import { useCallback, useEffect, useState } from "react";
import { supabase, isConfigured, STORAGE_BUCKET } from "../lib/supabaseClient";

// Maps a DB row to the shape the UI uses (logo_url → logo).
const fromRow = (r) => ({
  id: r.id,
  name: r.name,
  short: r.short,
  tools: r.tools || [],
  link: r.link || "",
  logo: r.logo_url || "",
  readme: r.readme || "",
  position: r.position ?? 0,
});

// Reads projects (public), and exposes admin-only create/update/delete.
// Read is open to everyone via RLS; writes require an authenticated session.
export function useProjects() {
  const [projects, setProjects] = useState(null); // null = loading
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!isConfigured) {
      setError("missing-config");
      setProjects([]);
      return;
    }
    setError(null);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setProjects([]);
      return;
    }
    setProjects(data.map(fromRow));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Upload a logo Blob to Storage, return its public URL.
  const uploadLogo = useCallback(async (blob, projectId) => {
    const path = `${projectId}-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const saveProject = useCallback(
    async (proj) => {
      const row = {
        name: proj.name.trim(),
        short: proj.short.trim(),
        tools: proj.tools,
        link: proj.link.trim() || null,
        logo_url: proj.logo || null,
        readme: proj.readme,
      };
      if (proj.id && !proj._isNew) {
        const { error } = await supabase.from("projects").update(row).eq("id", proj.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert(row);
        if (error) throw error;
      }
      await load();
    },
    [load]
  );

  const deleteProject = useCallback(
    async (id) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      await load();
    },
    [load]
  );

  return { projects, error, reload: load, saveProject, deleteProject, uploadLogo };
}
