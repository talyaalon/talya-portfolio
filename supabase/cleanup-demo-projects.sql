-- ============================================================
--  One-off cleanup: remove the placeholder projects that older versions of
--  schema.sql seeded ("TaskFlow", "ColorPal", "BudgetBee", all linking to
--  https://example.com).
--
--  Run in the Supabase dashboard: SQL Editor → New query → Run.
--  Inspect before you delete — step 1 shows you exactly what step 2 removes.
-- ============================================================

-- ---------- Step 1: look first ----------

select id, name_en, link, position, created_at
from public.projects
where name_en in ('TaskFlow', 'ColorPal', 'BudgetBee')
   or link like '%example.com%'
order by position;

-- Also worth a glance — the full list, so you can confirm nothing else is a
-- leftover and that your real projects are all present:
--
--   select id, name_en, name_he, link, position from public.projects order by position;


-- ---------- Step 2: delete, once step 1 shows only the placeholders ----------
--
--  Matched on BOTH the name and the example.com link, so a real project that
--  happens to share a name is not caught.

-- delete from public.projects
-- where name_en in ('TaskFlow', 'ColorPal', 'BudgetBee')
--   and link like '%example.com%';


-- ---------- Step 3: confirm ----------
--
--   select count(*) from public.projects where link like '%example.com%';   -- expect 0
