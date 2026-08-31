-- ============================================================
--  One-off (2026-08-31): remove "The Kosher Place - Operations App Suite"
--  from the portfolio, at the owner's request.
--
--  Run in the Supabase dashboard: SQL Editor -> New query -> Run.
--
--  !! Run it against the LIVE project: tfygatzkuvvubqszzlzu.
--     The URL in .env (oftamxbxbyekhqmdmvli) is a dead project and no longer
--     resolves; the deployed site reads tfygatzkuvvubqszzlzu.
--
--  Matched by id. That id was read from the live database on 2026-08-31 and
--  belongs to exactly this row -- position 2, no link, no repo, the card that
--  renders as "Internal system". A delete is not undoable, so step 1 shows
--  you the row and step 2 stays commented out until you have read it.
-- ============================================================

-- ---------- Step 1: look first ----------

select id, name_en, name_he, meta_en, link, repo_url, position, created_at
from public.projects
where id = '21a22143-e6db-432b-8ac3-e7e77d2dd0b4';

-- Expect one row: The Kosher Place - Operations App Suite.
-- If it returns nothing, the project was already removed -- stop here.

-- ---------- Step 2: delete ----------
--
--  Uncomment these three lines and run once step 1 has shown you the row.
--  `returning` prints what actually went, so a wrong delete is visible
--  immediately rather than being discovered later by its absence.

-- delete from public.projects
-- where id = '21a22143-e6db-432b-8ac3-e7e77d2dd0b4'
-- returning id, name_en, name_he;

-- ---------- Step 3: confirm ----------
--
--   select id, name_en, position from public.projects order by position;
--
--  Expect six projects, without The Kosher Place. The remaining `position`
--  values stay as they are (0,1,3,4,5,6) -- the list is ordered by position,
--  not by its exact numbers, so a gap changes nothing on the page.
--
--  Analytics rows that pointed at the project are NOT deleted: project_id is
--  declared `on delete set null`, so the visit counts stay in the dashboard
--  totals and simply stop being attributed to a project.
--
--  The same deletion is one click in /admin, if you would rather not run SQL.
