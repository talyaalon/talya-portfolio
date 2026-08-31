-- ============================================================
--  Additive migration. Adds only; drops and alters nothing.
--  Run in the Supabase dashboard: SQL Editor -> New query -> Run.
--  Safe to re-run.
-- ============================================================

-- ---------- A repository that exists but is not public ----------
--
--  Some projects are company code: the repository is real and it is on
--  GitHub, but nobody outside the company can open it. Until now a project
--  had only two states -- `repo_url` set (render a link) or `repo_url` empty
--  (say nothing) -- so the only way to express "private" was to delete the
--  URL. That threw the URL away AND told the reader nothing.
--
--  This column adds the third state. The URL stays in the database for the
--  owner; the public card renders a locked "GitHub - Private repo" badge and
--  no href at all, so the address never reaches the public HTML.
--
--  Defaults to false: every project that exists today keeps behaving exactly
--  as it does now, and an unmigrated database degrades to "public" rather
--  than to a guess (see MIGRATION_002_COLUMNS in src/lib/projectRow.js).

alter table public.projects
  add column if not exists repo_private boolean not null default false;

-- ---------- Verify ----------
--
--   select name_en, repo_url, repo_private from public.projects order by position;
--
--  Expect repo_private to be present and false on every row.
