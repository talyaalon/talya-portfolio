-- ============================================================
--  Additive migration. Adds only; drops and alters nothing.
--  Run in the Supabase dashboard: SQL Editor -> New query -> Run.
--  Safe to re-run.
-- ============================================================

-- ---------- 1. Bilingual demo links ----------
--
--  schema.sql declared a single `demo_url`, but the app has read and written
--  `demo_url_en` / `demo_url_he` for some time. On any database created from
--  schema.sql, every project save failed with PGRST204.
--
--  The old column is intentionally KEPT: dropping it would lose whatever is
--  stored there today. It is copied into the English side if that is empty.

alter table public.projects add column if not exists demo_url_en text;
alter table public.projects add column if not exists demo_url_he text;

update public.projects
   set demo_url_en = demo_url
 where demo_url is not null
   and (demo_url_en is null or demo_url_en = '');

-- ---------- 2. What a recruiter actually reads a project card for ----------
--
--  "What was your role" and "what was the outcome" are the two questions asked
--  about every portfolio project, and neither had anywhere to live. `status`
--  also replaces a regex over `result_*` that awarded a prize star to any text
--  containing "replaced", "marketplace" or "במקום".

alter table public.projects add column if not exists role_en   text;
alter table public.projects add column if not exists role_he   text;
alter table public.projects add column if not exists impact_en text;
alter table public.projects add column if not exists impact_he text;
alter table public.projects add column if not exists status    text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_status_check'
  ) then
    alter table public.projects
      add constraint projects_status_check
      check (status is null or status in ('production','prototype','archived','award'));
  end if;
end $$;

-- ---------- 3. Language-neutral device labels ----------
--
--  netlify/functions/track.js used to write the Hebrew words "מובייל",
--  "טאבלט" and "מחשב" straight into the database, baking one language into
--  stored data. It now writes tokens; this backfills the existing rows.

update public.analytics_events set device = 'mobile'  where device = 'מובייל';
update public.analytics_events set device = 'tablet'  where device = 'טאבלט';
update public.analytics_events set device = 'desktop' where device = 'מחשב';
update public.analytics_events set device = null      where device = 'לא ידוע';

-- ---------- 4. Verify ----------
--
--   select column_name from information_schema.columns
--    where table_schema='public' and table_name='projects'
--    order by column_name;
--
--  Expect role_en, role_he, impact_en, impact_he, status,
--  demo_url_en and demo_url_he to all be present.
