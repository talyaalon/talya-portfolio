-- ============================================================
--  One-off (2026-08-31): mark the company repositories as private.
--
--  J-Cafe, Air Manage and BOM are internal company code, so the portfolio
--  should say the code exists on GitHub without offering a link. The URL is
--  NOT deleted -- it stays in repo_url for the owner and simply stops being
--  rendered, which is the whole reason repo_private exists.
--
--  Requires supabase/migrations/002-repo-private.sql first.
--  Run in the Supabase dashboard: SQL Editor -> New query -> Run.
--
--  !! Run it against the LIVE project: tfygatzkuvvubqszzlzu.
--     The URL in .env (oftamxbxbyekhqmdmvli) is a dead project and no longer
--     resolves; the deployed site reads tfygatzkuvvubqszzlzu.
--
--  Matched by id, not by name: the ids below were read from the live database
--  on 2026-08-31, so there is no pattern here that can catch a project you
--  did not mean. Safe to re-run, and reversible -- `set repo_private = false`
--  puts any row back.
-- ============================================================

-- ---------- Step 1: look first ----------

select id, name_en, repo_url, repo_private
from public.projects
where id in (
  'a538e6b7-e054-44fd-9897-a8004bda6729',  -- J-Cafe - Multi-Branch eCommerce Platform
  '1fc9edaf-fa3b-494b-bd62-0d3c6efbe22f',  -- Air Manage
  'd8ee9be3-9d47-4578-a530-360f570c5187'   -- BOM System - Recipe & Pricing Management
)
order by position;

-- ---------- Step 2: mark them ----------
--
--  `returning` prints the rows it actually changed. Expect three.

update public.projects
   set repo_private = true
 where id in (
   'a538e6b7-e054-44fd-9897-a8004bda6729',  -- J-Cafe
   '1fc9edaf-fa3b-494b-bd62-0d3c6efbe22f',  -- Air Manage
   'd8ee9be3-9d47-4578-a530-360f570c5187'   -- BOM System
 )
returning id, name_en, repo_url, repo_private;

-- Deliberately NOT included: Sensitive Data Detection & Encryption
-- (4fbb3f99-d1be-47d6-a09a-7b4c95561f51). Its repo stays a public link
-- because nobody asked for it to be hidden.

-- ---------- Step 3: confirm ----------
--
--   select name_en, repo_url, repo_private from public.projects order by position;
--
--  Expect repo_private = true on exactly those three rows.
--
--  From now on this is a checkbox in /admin ("Private repository", directly
--  under the GitHub link field) -- no SQL needed for the next one.
--
--  NOTE, and it matters: this hides the LINK, not the CODE. On 2026-08-31
--  github.com/talyaalon/jcafe-web and github.com/talyaalon/BOM-SYSTEM both
--  still answered 200 to a signed-out request -- they are public repositories
--  that anyone who knows the URL can still read. maintenance-app (Air Manage)
--  answered 404, i.e. it is already private. To make the other two genuinely
--  private, flip them on GitHub: repo -> Settings -> General -> Danger Zone
--  -> Change repository visibility -> Private.
