-- ============================================================
--  Additive migration. Adds only; drops and alters nothing.
--  Run in the Supabase dashboard: SQL Editor -> New query -> Run.
--  Safe to re-run.
--
--  Requires policies-owner-only.sql to have run first: the write policies
--  below call public.is_site_owner(), which that file defines.
--
--  !! Run it against the LIVE project. See the note in 003-embed-url.sql.
-- ============================================================

-- ---------- Settings that are not project content ----------
--
--  The CV. It is a file the owner replaces from time to time, so it cannot be
--  a constant in the repository (it was: src/i18n.jsx held `CV = {en: null,
--  he: null}`, which meant the button never rendered and adding one needed a
--  developer and a deploy). It is now uploaded from the admin area to the
--  existing public `logos` bucket, and its public URL is kept here.
--
--  Key/value on purpose. A column per setting needs a migration -- and a
--  deploy -- for every new setting; the site ignores a key it does not know,
--  which is what makes adding one safe. Keys in use today:
--
--      cv_url_en   public URL of the English CV
--      cv_url_he   public URL of the Hebrew CV
--
--  Either may be absent. src/lib/siteSettings.js falls back to the other
--  language, and renders no button at all when neither is set -- better no
--  button than a button that 404s in front of a hiring manager.

create table if not exists public.site_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

-- ---------- Row Level Security ----------
--
--  Same shape as `projects`: the world reads, only the owner writes. Without
--  the write policies an authenticated stranger could not write either (RLS
--  denies by default), but nor could the owner -- so all four are stated.

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

drop policy if exists "site_settings_owner_insert" on public.site_settings;
create policy "site_settings_owner_insert" on public.site_settings
  for insert to authenticated
  with check (public.is_site_owner());

drop policy if exists "site_settings_owner_update" on public.site_settings;
create policy "site_settings_owner_update" on public.site_settings
  for update to authenticated
  using (public.is_site_owner())
  with check (public.is_site_owner());

drop policy if exists "site_settings_owner_delete" on public.site_settings;
create policy "site_settings_owner_delete" on public.site_settings
  for delete to authenticated
  using (public.is_site_owner());

-- Supabase grants these by default on new tables in `public`, but a project
-- whose default privileges were tightened would otherwise fail with a bare
-- "permission denied" that looks nothing like the RLS policies above.
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- ---------- Verify ----------
--
--  a) The table is there and readable:
--         select * from public.site_settings;
--
--  b) Exactly four policies, and every write one mentions is_site_owner():
--         select policyname, cmd, qual, with_check
--         from pg_policies
--         where schemaname = 'public' and tablename = 'site_settings';
--
--  c) After uploading a CV from /admin, one row per language appears:
--         select key, left(value, 60), updated_at from public.site_settings;
