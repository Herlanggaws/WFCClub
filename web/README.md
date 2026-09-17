# WFC Community App (Frontend MVP)

Mobile-first Next.js app for the WFC community. Fully frontend — mock auth + mock data + `localStorage`, no backend.

## Quick start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What’s included

- Auth (signup / login / logout / change + forgot + reset password) — mock `AuthService`
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
3. Langsung ke `/home` (onboarding tidak diulang; profil & join/RSVP tetap)

### Forgot / reset password
1. Dari `/login` → **Lupa password?**
2. Submit email → layar “cek email”
3. Pakai **demo reset link** di layar itu (karena tidak ada email sungguhan)
4. Set password baru di `/reset-password`
5. Login dengan password baru

### Ubah password (sudah login)
1. Profile → **Ubah password**
2. Isi password saat ini + password baru + konfirmasi
3. Setelah sukses, kembali ke profile
4. Keluar → login ulang dengan password baru

### Reset demo
Profile → **Reset demo** menghapus bucket data user aktif + session (debug). Akun credential di `wfc-auth-v1` ikut ter-sign-out; untuk wipe total clear localStorage keys `wfc-auth-v1` dan `wfc-app-v3`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Zustand (persisted client state)
- Mock auth adapter di `lib/auth` (siap diganti provider nanti)

## Notes

- UI copy campuran Bahasa Indonesia / English lowercase brand voice
- Shell is capped at ~430px for future Capacitor / native wrap
- Session vs onboarding dipisah: logout tidak menghapus profil
