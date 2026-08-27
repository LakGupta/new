# Helios Queue — Amazfit Helios Strap Waitlist

A tiny web app for running a first-come, first-served waitlist when you resell Amazfit Helios straps.

- **Public page (`/`)** — people submit their Reddit username, WhatsApp number, and an optional note. They immediately see their queue number.
- **Admin page (`/admin`)** — password-protected queue manager where you can:
  - see everyone in the order they joined,
  - search by username / WhatsApp / note,
  - filter by status (waiting, contacted, sold, no-response, skipped),
  - open a WhatsApp chat with one tap,
  - mark people as contacted/sold/skipped/no-response and restore them,
  - edit details, delete entries, and add people manually.

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Postgres for storage (works with Neon, Supabase, or any Postgres provider)
- Local JSON file fallback when no database is configured (handy for previews)

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:

- Public waitlist: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (default local password is `test123` if you created `.env.local` with it; change it before going live)

Without a `DATABASE_URL`, data is saved to `.data/queue.json` in the project folder. This is only for local previews — use Postgres in production.

## Deploy to Vercel

1. Push this project to GitHub/GitLab.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import the repo.
3. Add a Postgres database:
   - In your Vercel project, go to **Storage → Create Database → Postgres** (Vercel will set this up with Neon), **or**
   - use any Postgres provider (Neon, Supabase, etc.) and add its connection string as an environment variable named `DATABASE_URL`.
4. Add the admin password environment variable:
   - Name: `ADMIN_PASSWORD`
   - Value: pick a strong password (this is the password for `/admin`).
5. Optional: add your WhatsApp group invite link:
   - Name: `WHATSAPP_GROUP_URL`
   - Value: e.g. `https://chat.whatsapp.com/xxxxx` (this shows a "Join WhatsApp group" button on the public page; leave it unset to hide the button).
6. Deploy. The app creates the `entries` table automatically on first use.

> If you use a Postgres provider that supplies a pooled connection string, use that as `DATABASE_URL`. `DATABASE_URL` and `POSTGRES_URL` are both accepted.

## How queue positions work

- Every person is assigned a permanent original position based on when they joined.
- The active queue position only counts people still in play (status `waiting` or `contacted`).
- If you skip someone or mark them sold, the next active person automatically moves up.
- Restore anyone back to `waiting` if they come back or you made a mistake.

## Project structure

```text
src/
  app/
    page.tsx                 # Public waitlist form
    admin/page.tsx           # Admin page
    api/
      entries/route.ts       # POST (public join) + GET (admin list)
      entries/[id]/route.ts  # PATCH + DELETE (admin)
      auth/login/route.ts    # Admin login
      auth/logout/route.ts
      auth/check/route.ts
  components/
    join-form.tsx            # Public submission form
    admin-app.tsx            # Admin queue UI
  lib/
    db.ts                    # Postgres + JSON fallback data layer
    auth.ts                  # Password + session cookie
    validation.ts            # Input validation + WhatsApp link helper
    types.ts                 # Queue statuses/types
```
