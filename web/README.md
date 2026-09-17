# WFC Community App

Mobile-first Next.js app for the WFC community. Auth + data via **Supabase**.

## Quick start

```bash
cd web
cp .env.local.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Env

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel (anon/publishable key) |

Do not put the Supabase secret key in `NEXT_PUBLIC_*` or the browser.

### Database

Apply the SQL migration once (Supabase SQL Editor or MCP):

[`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: production origin (e.g. `https://wfc-club.vercel.app`)
- Redirect URLs: production `/**` + `http://localhost:3000/**`

Prefer **Confirm email** off for MVP so signup goes straight to onboarding.

## What’s included

- Auth (signup / login / logout / change + forgot + reset password) — Supabase Auth
- Profiles + onboarding persisted in Supabase
- WFC sessions (create / join / leave)
- People directory from onboarded profiles
- Community events + RSVP

## Auth flows

### Signup → onboarding → home
1. `/signup` → email + password
2. Complete onboarding
3. `/home`

### Forgot / reset password
1. `/forgot-password` → email
2. Open link from Supabase email → `/reset-password`
3. Set new password → login

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Zustand (client UI state)
- Supabase Auth + Postgres (`lib/auth`, `lib/supabase`)

## Notes

- UI copy campuran Bahasa Indonesia / English lowercase brand voice
- Shell is capped at ~430px for future Capacitor / native wrap
- Community events start empty until inserted in Supabase (`community_events`)
