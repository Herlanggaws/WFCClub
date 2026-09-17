# WFC Community App (Frontend MVP)

Mobile-first Next.js app for the WFC community. Auth via **Supabase** (email/password); community data still mock + Zustand/`localStorage`.

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

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: production origin (e.g. `https://wfc-club.vercel.app`)
- Redirect URLs: production `/**` + `http://localhost:3000/**`

Prefer **Confirm email** off for local MVP so signup goes straight to onboarding.

## What’s included

- Auth (signup / login / logout / change + forgot + reset password) — Supabase `AuthService`
- Onboarding (name → role → interests → intent) after signup
- Home — today’s WFC sessions
- Session detail — join / leave
- Create WFC session
- People directory + search
- Person & own profile
- Events list + RSVP

## Auth flows (cara tes)

### Signup → onboarding → home
1. Buka `/signup`
2. Isi email + password (≥8 karakter) + konfirmasi
3. Lanjut onboarding profil
4. Masuk `/home`

### Login ulang (returning user)
1. Di Profile → **Keluar**
2. Masuk lagi di `/login` dengan email/password yang sama
3. Langsung ke `/home` (onboarding tidak diulang; profil & join/RSVP tetap di localStorage)

### Forgot / reset password
1. Dari `/login` → **Lupa password?**
2. Submit email → layar “cek email”
3. Buka link di email Supabase (redirect ke `/reset-password`)
4. Set password baru
5. Login dengan password baru

### Ubah password (sudah login)
1. Profile → **Ubah password**
2. Isi password saat ini + password baru + konfirmasi
3. Setelah sukses, kembali ke profile
4. Keluar → login ulang dengan password baru

### Reset demo
Profile → **Reset demo** clears the active user’s local data bucket and signs out of Supabase. It does **not** delete the Auth user in the Supabase dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Zustand (persisted client state for community data)
- Supabase Auth (`lib/auth/supabase-auth.ts`); mock adapter kept at `lib/auth/mock-auth.ts`

## Notes

- UI copy campuran Bahasa Indonesia / English lowercase brand voice
- Shell is capped at ~430px for future Capacitor / native wrap
- Session vs onboarding dipisah: logout tidak menghapus profil lokal
