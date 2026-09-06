-- ============================================================
--  Additive migration. Adds only; drops and alters nothing.
--  Run in the Supabase dashboard: SQL Editor -> New query -> Run.
--  Safe to re-run.
-- ============================================================

-- ---------- A stable name for a project, usable in a URL ----------
--
--  Some projects now have a full case study on their own page - the first is
--  J-Cafe at /projects/j-cafe. The long-form content of that page lives in
--  the repository (src/content/jcafe.js), because it is structured writing
--  that is prerendered at build time, not a field an editor fills in. The
--  project's CARD on the home page still comes from this table.
--
--  So the two halves have to be joined, and the join needs a key that does
--  not change. The alternatives were both worse:
--
--    - Matching on name_en. The name is edited from /admin, and the day it is
--      changed the card silently stops linking to its case study. Nothing
--      would look broken.
--    - Matching on the row's uuid, hardcoded in the repository. Stable, but
--      it means the code cannot be understood without querying the database,
--      and restoring from a backup that regenerates ids breaks it.
--
--  `slug` is nullable and defaults to null: a project without one is a
--  project with no case study, which is every project today and most
--  projects forever. It is NOT a fallback hiding a missing value - null and
--  "no case study page" are the same statement.

alter table public.projects
  add column if not exists slug text;

-- Two projects sharing a slug would both claim the same URL, and which one
-- rendered as the featured card would depend on row order. Partial, so the
-- many rows with a null slug are unaffected.
create unique index if not exists projects_slug_key
  on public.projects (slug)
  where slug is not null;

-- ---------- Set the one that exists today ----------
--
--  Matched on BOTH the English name and the fact that no other row already
--  claims the slug, so re-running cannot move it onto a different project.
--  If your J-Cafe row is named differently, change the name here to match -
--  check first with:
--
--    select id, name_en, name_he, slug, position from public.projects order by position;

update public.projects
   set slug = 'j-cafe'
 where name_en ilike '%j-cafe%'
   and slug is distinct from 'j-cafe'
   and not exists (select 1 from public.projects p where p.slug = 'j-cafe');

-- ---------- Verify ----------
--
--   select name_en, slug from public.projects where slug is not null;
--
--  Expect exactly one row, J-Cafe Online, with slug = 'j-cafe'. If you get no
--  rows, the update above matched nothing - set it by hand:
--
--   update public.projects set slug = 'j-cafe' where id = '<the id>';
