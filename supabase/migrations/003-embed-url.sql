-- ============================================================
--  Additive migration. Adds only; drops and alters nothing.
--  Run in the Supabase dashboard: SQL Editor -> New query -> Run.
--  Safe to re-run.
--
--  !! The LIVE project is tfygatzkuvvubqszzlzu. The URL in .env
--     (oftamxbxbyekhqmdmvli) is a dead project and no longer resolves.
-- ============================================================

-- ---------- Something live where a screenshot used to be ----------
--
--  `screenshot_url` holds a still capture, and the laptop frame renders it as
--  an <img>. A deck is not a capture: the point of it is that a visitor can
--  page through it. Putting a share link in screenshot_url would have been
--  read as an image URL by preferWebp/mobileVariant and produced a broken
--  frame, so this is its own column rather than an overloaded one.
--
--  What goes in: a Canva share link, /view for a deck or /watch for a
--  recording. src/utils/canva.js converts it to its ?embed form and REFUSES
--  anything else -- an /edit link included, since framing that would hand a
--  visitor the editor. A URL it does not recognise renders no embed at all
--  rather than an iframe that would sit blank forever.
--
--  Nullable with no default: a project without a deck is the normal case, and
--  an unmigrated database degrades to "" (see MIGRATION_003_COLUMNS in
--  src/lib/projectRow.js) instead of taking the public site down.

alter table public.projects
  add column if not exists embed_url text;

-- ---------- Verify ----------
--
--   select name_en, embed_url from public.projects order by position;
