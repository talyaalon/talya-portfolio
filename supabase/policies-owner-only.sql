-- ============================================================
--  Owner-only write policies.
--
--  Replaces the permissive policies created by schema.sql, which granted
--  insert/update/delete to the role `authenticated` with `using (true)`.
--  In Supabase, `authenticated` means ANY row in auth.users — not the site
--  owner. Combined with self-service sign-up (Supabase's default), that let
--  any stranger register and then edit or delete the portfolio.
--
--  After this file runs, every write is gated on public.is_site_owner().
--  Public read access to projects and to the logos bucket is unchanged.
--
--  Run once in the Supabase dashboard: SQL Editor → New query → Run.
--  Safe to re-run (drops each policy before creating it).
--
--  NOTE: the owner's user id is NOT stored in this file. This repository is
--  public, so the id lives in a table that RLS makes unreadable through the
--  API. See "Step 2" below — that INSERT is the only step you run by hand.
-- ============================================================


-- ---------- Step 1: who counts as the owner ----------

create table if not exists public.site_owners (
  user_id    uuid primary key,
  added_at   timestamptz not null default now()
);

-- RLS on, and deliberately NO policies: with RLS enabled and no policy, the
-- table is invisible to both anon and authenticated callers through PostgREST.
-- Only the service_role key (server-side) and the dashboard can read it.
alter table public.site_owners enable row level security;

-- security definer: runs as the function owner, so it can read site_owners
-- even though the calling user cannot.
create or replace function public.is_site_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.site_owners where user_id = auth.uid()
  );
$$;

revoke all on function public.is_site_owner() from public;
grant execute on function public.is_site_owner() to authenticated;


-- ---------- Step 2: register yourself as the owner ----------
--
--  Find your id first:
--      select id, email, created_at from auth.users order by created_at;
--
--  Then UNCOMMENT the statement below, paste your uuid, and run the file.
--
--  Forgetting this step does not fail silently: Step 7 at the end raises, and
--  because the SQL editor runs the file in a single transaction, everything
--  rolls back. You get an error message instead of a database where nobody —
--  including you — can write anything.

-- insert into public.site_owners (user_id)
-- values ('PASTE-YOUR-UUID-HERE'::uuid)
-- on conflict (user_id) do nothing;


-- ---------- Step 3: projects — public read, owner-only writes ----------

-- The public read policy from schema.sql stays exactly as it is; the site
-- must keep working for anonymous visitors.

drop policy if exists "projects_admin_insert"  on public.projects;
drop policy if exists "projects_admin_update"  on public.projects;
drop policy if exists "projects_admin_delete"  on public.projects;
drop policy if exists "projects_owner_insert"  on public.projects;
drop policy if exists "projects_owner_update"  on public.projects;
drop policy if exists "projects_owner_delete"  on public.projects;

create policy "projects_owner_insert" on public.projects
  for insert to authenticated
  with check (public.is_site_owner());

create policy "projects_owner_update" on public.projects
  for update to authenticated
  using (public.is_site_owner())
  with check (public.is_site_owner());

create policy "projects_owner_delete" on public.projects
  for delete to authenticated
  using (public.is_site_owner());


-- ---------- Step 4: analytics_events — owner-only read ----------
--
--  Writes stay service_role-only (the Netlify function), which bypasses RLS.
--  Previously ANY authenticated user could read every visitor's geo/referrer.

drop policy if exists "analytics_admin_read" on public.analytics_events;
drop policy if exists "analytics_owner_read" on public.analytics_events;

create policy "analytics_owner_read" on public.analytics_events
  for select to authenticated
  using (public.is_site_owner());


-- ---------- Step 5: logos bucket — public read, owner-only writes ----------

drop policy if exists "logos_admin_insert"  on storage.objects;
drop policy if exists "logos_admin_update"  on storage.objects;
drop policy if exists "logos_admin_delete"  on storage.objects;
drop policy if exists "logos_owner_insert"  on storage.objects;
drop policy if exists "logos_owner_update"  on storage.objects;
drop policy if exists "logos_owner_delete"  on storage.objects;

create policy "logos_owner_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'logos' and public.is_site_owner());

create policy "logos_owner_update" on storage.objects
  for update to authenticated
  using      (bucket_id = 'logos' and public.is_site_owner())
  with check (bucket_id = 'logos' and public.is_site_owner());

create policy "logos_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'logos' and public.is_site_owner());


-- ---------- Step 6: verify ----------
--
--  a) You are registered exactly once:
--         select count(*) from public.site_owners;              -- expect 1
--
--  b) Only you exist as a user (sign-up must be OFF in the dashboard):
--         select count(*) from auth.users;                      -- expect 1
--
--  c) No permissive policy survived — every row below should reference
--     is_site_owner(), and none should read plain `true`:
--         select tablename, policyname, cmd, qual, with_check
--         from pg_policies
--         where schemaname in ('public','storage')
--           and policyname not like '%public_read%'
--         order by tablename, policyname;
--
--  d) The real test — create a throwaway user (temporarily re-enabling
--     sign-up), log in as it, and confirm this is refused with 42501:
--         insert into public.projects (name_en) values ('should fail');
--     Then delete that user and turn sign-up back off.


-- ---------- Step 7: fail loudly if the lockdown would lock YOU out ----------
--
--  Running this file with an empty site_owners table produces a database where
--  nobody can write anything, and the admin UI cannot tell: it decides what to
--  render from VITE_ADMIN_USER_ID, not from this table. You would see "admin
--  mode", open the editor, and get a raw permission error on every Save.
--
--  So: refuse to finish in that state.

do $$
declare
  owners int;
begin
  select count(*) into owners from public.site_owners;
  if owners = 0 then
    raise exception
      'site_owners is empty: every write is now denied, including yours. Edit Step 2 of this file with your auth.users id and run it again.';
  end if;
end $$;

-- ---------- Step 8: assert no permissive policy survived ----------
--
--  Postgres OR-s permissive policies, so one leftover `using (true)` silently
--  undoes everything above. This catches that.

do $$
declare
  bad text;
begin
  select string_agg(schemaname || '.' || tablename || ' / ' || policyname, ', ')
    into bad
  from pg_policies
  where schemaname in ('public', 'storage')
    and cmd <> 'SELECT'
    and coalesce(qual, 'true') = 'true'
    and coalesce(with_check, 'true') = 'true';

  if bad is not null then
    raise exception 'Permissive write policies still present: %', bad;
  end if;
end $$;
