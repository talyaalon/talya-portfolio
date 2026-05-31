-- ============================================================
--  Talya Portfolio — Supabase schema, security & seed.
--  Run this once in the Supabase dashboard:  SQL Editor → New query → Run.
--  Safe to re-run (uses IF NOT EXISTS / ON CONFLICT / drops policies first).
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  short       text not null,
  tools       text[] not null default '{}',
  link        text,
  logo_url    text,
  readme      text not null default '',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
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

-- ---------- Seed: the 3 demo projects (only if the table is empty) ----------

insert into public.projects (name, short, tools, link, readme, position)
select * from (values
  (
    'TaskFlow',
    'אפליקציית ניהול משימות עם גרירה חכמה ולוחות צוות',
    array['React','Node.js','MongoDB'],
    'https://example.com',
    E'TaskFlow היא אפליקציית ניהול משימות מבוססת לוחות (Kanban) המאפשרת לארגן משימות בעמודות, לגרור אותן בין שלבים, ולשתף לוחות עם חברי צוות בזמן אמת.\n\nמה הפרויקט עושה:\n• יצירת לוחות ומשימות עם תיוג ותאריכי יעד\n• גרירה ושחרור בין עמודות\n• הרשאות צוות וסנכרון בזמן אמת\n\nאתגרים שפתרתי:\nבניית סנכרון חי בין מספר משתמשים, וניהול state מורכב בצד הלקוח.',
    0
  ),
  (
    'ColorPal',
    'מחולל פלטות צבעים נגישות למעצבים',
    array['JavaScript','CSS','Canvas API'],
    'https://example.com',
    E'ColorPal הוא כלי המייצר פלטות צבעים הרמוניות ובודק את הניגודיות שלהן לפי תקני נגישות (WCAG).\n\nמה הפרויקט עושה:\n• מחולל פלטות אקראיות והרמוניות\n• בדיקת ניגודיות אוטומטית\n• ייצוא ל-CSS / Tailwind\n\nכלים: לוגיקת הצבעים נכתבה ב-JavaScript טהור עם Canvas API.',
    1
  ),
  (
    'BudgetBee',
    'מעקב הוצאות חודשי עם גרפים והתראות',
    array['React','Firebase','Recharts'],
    'https://example.com',
    E'BudgetBee עוזרת לעקוב אחר הוצאות חודשיות, לקטלג אותן ולראות איפה הכסף הולך.\n\nמה הפרויקט עושה:\n• הזנת הוצאות וקטגוריות\n• גרפים חודשיים והתראות חריגה מתקציב\n• אחסון בענן עם Firebase\n\nכלים: React לממשק, Firebase לנתונים, Recharts לוויזואליזציה.',
    2
  )
) as v(name, short, tools, link, readme, position)
where not exists (select 1 from public.projects);
