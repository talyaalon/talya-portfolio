-- ============================================================
--  Talya Portfolio — Supabase schema, security & seed.
--  Run this once in the Supabase dashboard:  SQL Editor → New query → Run.
--  Safe to re-run (uses IF NOT EXISTS / ON CONFLICT / drops policies first).
--  Content is bilingual: every text field has an English (*_en) and a
--  Hebrew (*_he) value; the UI shows the one matching the chosen language.
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name_en     text,
  name_he     text,
  short_en    text,
  short_he    text,
  readme_en   text,
  readme_he   text,
  tools       text[] not null default '{}',
  link        text,
  logo_url    text,
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

insert into public.projects (name_en, name_he, short_en, short_he, readme_en, readme_he, tools, link, position)
select * from (values
  (
    'TaskFlow', 'TaskFlow',
    'A task-management app with smart drag-and-drop and team boards',
    'אפליקציית ניהול משימות עם גרירה חכמה ולוחות צוות',
    E'TaskFlow is a Kanban-based task management app that lets you organize tasks into columns, drag them between stages, and share boards with teammates in real time.\n\nWhat it does:\n• Create boards and tasks with tags and due dates\n• Drag and drop between columns\n• Team permissions and real-time sync\n\nChallenges I solved:\nBuilding live sync between multiple users, and managing complex client-side state.',
    E'TaskFlow היא אפליקציית ניהול משימות מבוססת לוחות (Kanban) המאפשרת לארגן משימות בעמודות, לגרור אותן בין שלבים, ולשתף לוחות עם חברי צוות בזמן אמת.\n\nמה הפרויקט עושה:\n• יצירת לוחות ומשימות עם תיוג ותאריכי יעד\n• גרירה ושחרור בין עמודות\n• הרשאות צוות וסנכרון בזמן אמת\n\nאתגרים שפתרתי:\nבניית סנכרון חי בין מספר משתמשים, וניהול state מורכב בצד הלקוח.',
    array['React','Node.js','MongoDB'], 'https://example.com', 0
  ),
  (
    'ColorPal', 'ColorPal',
    'Accessible color-palette generator for designers',
    'מחולל פלטות צבעים נגישות למעצבים',
    E'ColorPal is a tool that generates harmonious color palettes and checks their contrast against accessibility standards (WCAG).\n\nWhat it does:\n• Random and harmonious palette generator\n• Automatic contrast checking\n• Export to CSS / Tailwind\n\nTools: the color logic was written in pure JavaScript with the Canvas API.',
    E'ColorPal הוא כלי המייצר פלטות צבעים הרמוניות ובודק את הניגודיות שלהן לפי תקני נגישות (WCAG).\n\nמה הפרויקט עושה:\n• מחולל פלטות אקראיות והרמוניות\n• בדיקת ניגודיות אוטומטית\n• ייצוא ל-CSS / Tailwind\n\nכלים: לוגיקת הצבעים נכתבה ב-JavaScript טהור עם Canvas API.',
    array['JavaScript','CSS','Canvas API'], 'https://example.com', 1
  ),
  (
    'BudgetBee', 'BudgetBee',
    'Monthly expense tracker with charts and alerts',
    'מעקב הוצאות חודשי עם גרפים והתראות',
    E'BudgetBee helps track monthly expenses, categorize them, and see where the money goes.\n\nWhat it does:\n• Enter expenses and categories\n• Monthly charts and over-budget alerts\n• Cloud storage with Firebase\n\nTools: React for the UI, Firebase for data, Recharts for visualization.',
    E'BudgetBee עוזרת לעקוב אחר הוצאות חודשיות, לקטלג אותן ולראות איפה הכסף הולך.\n\nמה הפרויקט עושה:\n• הזנת הוצאות וקטגוריות\n• גרפים חודשיים והתראות חריגה מתקציב\n• אחסון בענן עם Firebase\n\nכלים: React לממשק, Firebase לנתונים, Recharts לוויזואליזציה.',
    array['React','Firebase','Recharts'], 'https://example.com', 2
  )
) as v(name_en, name_he, short_en, short_he, readme_en, readme_he, tools, link, position)
where not exists (select 1 from public.projects);
