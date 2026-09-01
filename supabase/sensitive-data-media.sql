-- ============================================================
--  One-off (2026-09-01): give "Sensitive Data Detection & Encryption" its
--  video and its presentation.
--
--  That project is the only one on the site with no media at all -- no
--  screenshot, no logo, no live link -- so its card renders the grey
--  "No screenshot" panel. After this it shows the deck live inside the laptop
--  frame, with a button for the video and a button for the deck.
--
--  Requires supabase/migrations/003-embed-url.sql first.
--  Run in the Supabase dashboard: SQL Editor -> New query -> Run.
--
--  !! The LIVE project is tfygatzkuvvubqszzlzu.
--
--  Matched by id, read from the live database. Reversible: set the three
--  columns back to null and the card returns to exactly what it shows today.
-- ============================================================

-- ---------- Step 1: look first ----------

select id, name_en, demo_url_en, demo_url_he, embed_url, screenshot_url
from public.projects
where id = '4fbb3f99-d1be-47d6-a09a-7b4c95561f51';

-- ---------- Step 2: set the two links ----------
--
--  The utm tail from the share dialog is dropped on purpose: it is
--  share-tracking, not addressing, and canva.js discards it anyway.
--
--  Only the English demo column is set. loc() in src/utils/localized.js falls
--  back to the other language when one side is empty, so a Hebrew visitor
--  gets the same video without storing the URL twice.

update public.projects
   set demo_url_en = 'https://www.canva.com/design/DAHIlXt6qHo/KdKer3C_SbbbIzBy8WcpAA/watch',
       embed_url   = 'https://www.canva.com/design/DAHIlZS0X2s/RHLvNjN8vUfCFCgN5_IOlA/view'
 where id = '4fbb3f99-d1be-47d6-a09a-7b4c95561f51'
returning name_en, demo_url_en, embed_url;

-- ---------- Step 3: confirm ----------
--
--   select name_en, demo_url_en, embed_url from public.projects order by position;
--
--  Both links were checked signed-out on 2026-09-01: each returns 200, and
--  the ?embed form carries no X-Frame-Options and no frame-ancestors, i.e.
--  Canva permits framing them.
