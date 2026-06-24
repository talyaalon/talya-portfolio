import { useCallback, useEffect, useState } from "react";
import { supabase, isConfigured, STORAGE_BUCKET } from "../lib/supabaseClient";

// Maps a DB row to the shape the UI uses. Content is bilingual: each text
// field has an English (*_en) and a Hebrew (*_he) value.
const fromRow = (r) => ({
  id: r.id,
  nameEn: r.name_en || "",
  nameHe: r.name_he || "",
  metaEn: r.meta_en || "",
  metaHe: r.meta_he || "",
  shortEn: r.short_en || "",
  shortHe: r.short_he || "",
  readmeEn: r.readme_en || "",
  readmeHe: r.readme_he || "",
  resultEn: r.result_en || "",
  resultHe: r.result_he || "",
  tools: r.tools || [],
  link: r.link || "",
  repo: r.repo_url || "",
  demo: r.demo_url || "",
  screenshot: r.screenshot_url || "",
  logo: r.logo_url || "",
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
      const clean = (s) => (s || "").trim();
      const row = {
        name_en: clean(proj.nameEn) || null,
        name_he: clean(proj.nameHe) || null,
        meta_en: clean(proj.metaEn) || null,
        meta_he: clean(proj.metaHe) || null,
        short_en: clean(proj.shortEn) || null,
        short_he: clean(proj.shortHe) || null,
        readme_en: proj.readmeEn || null,
        readme_he: proj.readmeHe || null,
        result_en: clean(proj.resultEn) || null,
        result_he: clean(proj.resultHe) || null,
        tools: proj.tools,
        link: clean(proj.link) || null,
        repo_url: clean(proj.repo) || null,
        demo_url: clean(proj.demo) || null,
        logo_url: proj.logo || null,
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
