-- ============================================================
--  Talya Portfolio — Supabase schema, security & seed.
--  Run this once in the Supabase dashboard:  SQL Editor → New query → Run.
--  Safe to re-run (uses IF NOT EXISTS / ON CONFLICT / drops policies first).
--  Content is bilingual: every text field has an English (*_en) and a
--  Hebrew (*_he) value; the UI shows the one matching the chosen language.
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  name_en       text,
  name_he       text,
  meta_en       text,   -- context line, e.g. "Company · 2025"
  meta_he       text,
  short_en      text,
  short_he      text,
  readme_en     text,
  readme_he     text,
  result_en     text,   -- highlight line, e.g. "Live in production"
  result_he     text,
  tools         text[] not null default '{}',
  link          text,   -- live site URL
  repo_url      text,   -- GitHub / repository URL
  demo_url      text,   -- demo / video URL
  screenshot_url text,  -- optional screenshot
  logo_url      text,
  position      int  not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null check (event_type in ('view','open','click')),
  project_id  uuid references public.projects(id) on delete set null,
  referrer    text,
  country     text,
  city        text,
  device      text,
  created_at  timestamptz not null default now()
);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_project_idx on public.analytics_events (project_id);

-- ---------- Row Level Security ----------

alter table public.projects        enable row level security;
alter table public.analytics_events enable row level security;

-- projects: anyone can READ; only logged-in admin can write.
drop policy if exists "projects_public_read"  on public.projects;
drop policy if exists "projects_admin_insert"  on public.projects;
drop policy if exists "projects_admin_update"  on public.projects;
drop policy if exists "projects_admin_delete"  on public.projects;

create policy "projects_public_read"  on public.projects
  for select using (true);
create policy "projects_admin_insert" on public.projects
  for insert to authenticated with check (true);
create policy "projects_admin_update" on public.projects
  for update to authenticated using (true) with check (true);
create policy "projects_admin_delete" on public.projects
  for delete to authenticated using (true);

-- analytics_events: NO client write policy on purpose — inserts happen only
-- from the Netlify Function using the service_role key (which bypasses RLS).
-- Only the logged-in admin may READ them.
drop policy if exists "analytics_admin_read" on public.analytics_events;
create policy "analytics_admin_read" on public.analytics_events
  for select to authenticated using (true);

-- ---------- Storage bucket for logos ----------

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do update set public = true;

drop policy if exists "logos_public_read"   on storage.objects;
drop policy if exists "logos_admin_insert"  on storage.objects;
drop policy if exists "logos_admin_update"  on storage.objects;
drop policy if exists "logos_admin_delete"  on storage.objects;

create policy "logos_public_read" on storage.objects
  for select using (bucket_id = 'logos');
create policy "logos_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'logos');
create policy "logos_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'logos');
create policy "logos_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'logos');

-- ---------- Seed ----------
--
--  Deliberately none. This file used to insert three placeholder projects
--  ("TaskFlow", "ColorPal", "BudgetBee") pointing at https://example.com,
--  guarded by `where not exists (select 1 from public.projects)`. That guard
--  only protects a table that is already populated, so re-creating the
--  database put fake demo content back onto a live portfolio.
--
--  Real projects are added through the admin UI at /admin.

-- ---------- Security ----------
--
--  The write policies above are superseded by policies-owner-only.sql, which
--  restricts every write to the site owner. Run that file after this one.
