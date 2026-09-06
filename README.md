# Talya Israel — Portfolio

Bilingual (English / Hebrew, LTR + RTL) portfolio site. Projects are stored in
Supabase and edited through a separate admin app; the public site is read-only.

**Live:** https://talya-portfolio.netlify.app

```
React 18 · Vite 8 · Supabase (Postgres + Auth + Storage) · Netlify (static + Functions v2)
```

## Architecture

The build has **three entry points**, and the separation is load-bearing:

| Entry                  | Serves              | Contains                                        |
| ---------------------- | ------------------- | ----------------------------------------------- |
| `index.html`           | the public site     | project list, rendered read-only. No auth code.  |
| `projects/j-cafe.html` | `/projects/j-cafe`  | the J-Cafe case study. Public, read-only.        |
| `admin.html`           | `/admin`            | sign-in, project editor, CV upload, analytics.   |

There is deliberately **no router**. For a handful of pages, one real HTML file
per page is smaller, is pre-rendered by the same build step, and gives a link
that works wherever it is pasted. A new page is a Vite input, a rewrite in
`netlify.toml` above the catch-all, and an entry in `PAGES` — see below.

## Pre-rendering

`npm run build` runs three steps:

```
vite build                              the client bundles
vite build --ssr src/prerender.jsx      the same components, bundled for Node
node scripts/prerender.mjs              fetch -> render -> inject into dist/
```

Before this, the built `index.html` was an empty `<div id="root">` and a line
of `<noscript>` text: Google, LinkedIn's unfurler and every recruiter tool that
does not execute JavaScript saw a portfolio with no projects in it. It now
ships ~44 KB of real markup per page.

Three details are easy to undo by accident:

- The rows used at build time are embedded beside the markup as a JSON data
  block, and the hooks start from them (`src/lib/bootData.js`). Without it the
  browser's first render would begin at "still loading" and blank the complete
  page it was handed.
- The stylesheet is set with `dangerouslySetInnerHTML`. React escapes text
  children, and a `<style>` body is raw text to the HTML parser, so an escaped
  `>` would never decode back. This is invisible on the client and only
  appears once the page is rendered to a string.
- `.reveal` starts at `opacity:0` and is cleared by an IntersectionObserver, so
  prerendered HTML carries the rule that hides itself. A `<noscript>` block
  overrides it — otherwise the page is complete in the markup and invisible on
  screen without JavaScript.

Still `createRoot`, not `hydrateRoot`: the language is read from `localStorage`
during render, so hydration would mismatch for every Hebrew reader.

**If Supabase cannot be reached, or returns no rows, the build fails** rather
than publishing the empty page this exists to prevent. A failed Netlify build
leaves the previous deploy serving.

The embedded copy is only as fresh as the last deploy, while projects are
edited from `/admin` at any time. The page still fetches on mount and the fresh
answer wins, so only a crawler that runs no JavaScript sees the build's copy.

## Case studies

A project's **card** comes from the database; its **case study page** comes
from `src/content/` — structured long-form writing, pre-rendered, with no
database round-trip to wait for. `slug` joins the two
(`supabase/migrations/005-project-slug.sql`), and a project that has one is
rendered as the large featured card at the top of the list.

Adding a second case study is a content change plus a Vite input: write
`src/content/<name>.js`, register it in `CASE_STUDY_PAGES`, add the HTML entry,
the `PAGES` entry, the rewrite and the sitemap line.

### Screenshots on a case study page

`src/content/jcafe.js` ships its screenshot slots with `src: null` on purpose.
The screenshots are of a live production admin area showing **real customer
names, emails and phone numbers**. Redact them in the image file itself — paint
the pixels out, not a CSS blur or a crop — before committing. A committed image
stays in the git history and the CDN cache after a later commit deletes it.

## The CV

Two mechanisms, in order of preference:

1. **Uploaded from `/admin`** into `site_settings` — replaceable without a
   deploy, so it wins.
2. **`public/cv.pdf`** — committed, served at a fixed address, so `/cv.pdf` is
   something that can be written on an application.

The repository ships a **placeholder** at `public/cv.pdf`, and the build
detects it (`scripts/cv-status.mjs`) and renders no static link while it is
still there — a button that opens a file saying "placeholder" in front of a
hiring manager is worse than no button. Committing the real PDF over it turns
the link on with no code change; the build prints a warning until then.

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
    siteSettings.js   settings row <-> UI mapping (the CV), pure and unit-tested
  hooks/
    useProjectsRead.js      public: list projects
    useProjectsAdmin.js     admin: + create / update / delete / upload
    useSiteSettings.js      public: the CV behind the hero button
    useSiteSettingsAdmin.js admin: upload / remove the CV
    useAuth.js              admin only
```

The CV is uploaded from `/admin`, not committed: the file lands in the `logos`
Storage bucket under `cv/`, and its public URL is recorded in `site_settings`.
One file per language; when only one exists, every visitor is given that one,
and when neither does, no button is rendered at all.

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
supabase/migrations/003-embed-url.sql        additive: embed_url (a live Canva deck in the device frame)
supabase/policies-owner-only.sql       owner-only writes
supabase/migrations/004-site-settings.sql    additive: site_settings (the CV, uploaded from /admin)
                                             run AFTER the policies file — its own
                                             policies call is_site_owner()
supabase/migrations/005-project-slug.sql     additive: slug (joins a project to its case study page)
```

One-off scripts, each with a "look before you act" step first:
`supabase/cleanup-demo-projects.sql` removes the placeholder projects that
older versions of `schema.sql` seeded; `supabase/mark-private-repos.sql`
flags the company repositories; `supabase/delete-kosher-place.sql` removes
one retired project; `supabase/sensitive-data-media.sql` attaches a video and
a deck to the one project that had no media.

Analytics only records events when `/api/track` exists, i.e. under
`netlify dev` or in production — not under plain `vite dev`.

## Scripts

| Command                  | What it does                                              |
| ------------------------ | --------------------------------------------------------- |
| `npm run dev`            | Vite dev server                                            |
| `npm run build`          | client build + SSR build + pre-render (all three)          |
| `npm run build:client`   | the browser bundles only                                   |
| `npm run build:ssr`      | the Node bundle the pre-render step imports                 |
| `npm run prerender`      | fetch, render and inject (needs a build first)              |
| `npm test`               | Vitest (unit + component)                                  |
| `npm run lint`           | ESLint                                                     |
| `npm run format`         | Prettier                                                   |
| `npm run verify:bundle`  | asserts no admin code in the public bundle (needs a build) |
| `npm run verify`         | lint + test + full build + bundle check                     |

CI runs the same steps except the pre-render, which needs Supabase
credentials CI does not have and should not be given. Pre-rendering is
still covered on every run by `src/prerender.test.jsx`, which renders both
pages against fixture rows and asserts on the markup. Netlify runs the full
build, and a failure there leaves the previous deploy serving.

## Deployment

Netlify builds from `main`. `netlify.toml` maps `/admin` to `admin.html` and
`/projects/j-cafe` to its built file, both **above** the SPA catch-all — the
order matters, or the catch-all swallows them.

The Supabase variables are needed at BUILD time now, not just in the browser:
the pre-render step reads the projects with them, and the build fails without.

These must be set in the Netlify UI:

```
VITE_SUPABASE_URL              VITE_ADMIN_USER_ID
VITE_SUPABASE_ANON_KEY         VITE_ADMIN_EMAIL_DOMAIN
SUPABASE_URL                   ALLOWED_ORIGINS
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is secret and server-side only — it must never
appear in a `VITE_` variable, since those are compiled into the browser bundle.

`public/_headers` carries the security headers, and **Netlify applies it, the
dev server does not** — anything it forbids works locally and breaks in
production. Its `frame-src` is what lets a project card frame a Canva deck; a
frame the CSP refuses still fires `load`, so nothing in the app can notice it
and fall back. `src/test/headers.test.js` checks the two against each other
instead.

## Images

`public/screenshots/` holds both the original PNG/JPG files and `.webp`
conversions (4.4 MB → 440 KB). Screenshot URLs live in the database and still
point at the originals, so `src/utils/screenshot.js` requests the `.webp` and
falls back to the stored file if it is missing. Once every row is confirmed to
have a `.webp` sibling, the originals can be deleted and that helper dropped.
