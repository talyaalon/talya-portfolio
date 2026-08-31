# Talya Israel — Portfolio

Bilingual (English / Hebrew, LTR + RTL) portfolio site. Projects are stored in
Supabase and edited through a separate admin app; the public site is read-only.

**Live:** https://talya-portfolio.netlify.app

```
React 18 · Vite 8 · Supabase (Postgres + Auth + Storage) · Netlify (static + Functions v2)
```

## Architecture

The build has **two entry points**, and the separation is load-bearing:

| Entry        | Serves            | Contains                                        |
| ------------ | ----------------- | ----------------------------------------------- |
| `index.html` | the public site   | project list, rendered read-only. No auth code.  |
| `admin.html` | `/admin`          | sign-in, project editor, analytics.              |

The public site reads projects over plain PostgREST (`src/lib/publicApi.js`)
rather than the Supabase SDK. That is deliberate: importing the SDK pulls its
auth module — and every password string in it — into the bundle that every
visitor downloads. The admin app uses the real SDK, because it needs sessions,
uploads and writes.

`npm run verify:bundle` asserts this after each build and fails if admin
vocabulary appears in a public chunk. It runs in CI. If you ever import
something admin-side from `src/App.jsx`, that check is what will tell you.

```
src/
  main.jsx            public entry      → App.jsx
  admin.jsx           admin entry       → AdminApp.jsx
  i18n.jsx            public strings    (shipped to everyone)
  i18n.admin.js       admin strings     (admin bundle only)
  lib/
    publicApi.js      read-only REST, no SDK
    supabaseClient.js SDK — admin only
    projectRow.js     row <-> UI mapping, pure and unit-tested
  hooks/
    useProjectsRead.js   public: list projects
    useProjectsAdmin.js  admin: + create / update / delete / upload
    useAuth.js           admin only
```

## Security model

Two independent boundaries, because the UI one is not a boundary at all:

1. **Row Level Security** decides what the database will do. `supabase/policies-owner-only.sql`
   restricts every write to the site owner via `public.is_site_owner()`. The
   owner's uuid is not in this repo — it lives in `public.site_owners`, a table
   with RLS enabled and no policies, so it cannot be read through the API.
2. **`VITE_ADMIN_USER_ID`** decides what the admin UI renders. Any other signed-in
   account is treated as an ordinary visitor.

Sign-up must be **off** in the Supabase dashboard (Authentication → Providers →
Email). "Authenticated" in Supabase means any row in `auth.users`, so with
sign-up on, a stranger can create one.

There is no change-password screen in the app. Passwords are changed from the
Supabase dashboard, which re-authenticates properly.

## Local setup

```bash
npm install
cp .env.example .env     # then fill it in — see the comments in that file
npm run dev              # http://localhost:5173, admin at /admin
```

Database, in order:

```
supabase/schema.sql                    tables, indexes, storage bucket
supabase/migrations/001-project-fields.sql   additive: role, impact, status, bilingual demo links
supabase/migrations/002-repo-private.sql     additive: repo_private (a repo that exists but is closed)
supabase/policies-owner-only.sql       owner-only writes  (run last)
```

One-off scripts, each with a "look before you act" step first:
`supabase/cleanup-demo-projects.sql` removes the placeholder projects that
older versions of `schema.sql` seeded; `supabase/mark-private-repos.sql`
flags the company repositories; `supabase/delete-kosher-place.sql` removes
one retired project.

Analytics only records events when `/api/track` exists, i.e. under
`netlify dev` or in production — not under plain `vite dev`.

## Scripts

| Command                  | What it does                                              |
| ------------------------ | --------------------------------------------------------- |
| `npm run dev`            | Vite dev server                                            |
| `npm run build`          | production build of both entries                           |
| `npm test`               | Vitest (unit + component)                                  |
| `npm run lint`           | ESLint                                                     |
| `npm run format`         | Prettier                                                   |
| `npm run verify:bundle`  | asserts no admin code in the public bundle (needs a build) |
| `npm run verify`         | lint + test + build + bundle check — what CI runs           |

## Deployment

Netlify builds from `main`. `netlify.toml` maps `/admin` to `admin.html`
**above** the SPA catch-all — the order matters, or the catch-all swallows it.

These must be set in the Netlify UI:

```
VITE_SUPABASE_URL              VITE_ADMIN_USER_ID
VITE_SUPABASE_ANON_KEY         VITE_ADMIN_EMAIL_DOMAIN
SUPABASE_URL                   ALLOWED_ORIGINS
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is secret and server-side only — it must never
appear in a `VITE_` variable, since those are compiled into the browser bundle.

## Images

`public/screenshots/` holds both the original PNG/JPG files and `.webp`
conversions (4.4 MB → 440 KB). Screenshot URLs live in the database and still
point at the originals, so `src/utils/screenshot.js` requests the `.webp` and
falls back to the stored file if it is missing. Once every row is confirmed to
have a `.webp` sibling, the originals can be deleted and that helper dropped.
