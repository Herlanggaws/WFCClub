"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthButton,
  AuthErrorBanner,
  AuthField,
  AuthLink,
  AuthShell,
} from "@/components/AuthForm";
import { AuthError, auth } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import { useAppStore } from "@/lib/store/app-store";

export default function SignupPage() {
  const router = useRouter();
  const applySession = useAppStore((s) => s.applySession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    setLoading(true);

    try {
      const session = await auth.signUp({ email, password });
      await applySession(session);
      router.replace("/onboarding");
    } catch (err) {
      if (err instanceof AuthError && err.code === "check_email") {
        setNeedsEmailConfirm(true);
        return;
      }
      const message =
        err instanceof AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Gagal daftar. Coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (needsEmailConfirm) {
    return (
      <AuthShell
        title="cek email"
        subtitle={`Kami kirim link konfirmasi ke ${email.trim().toLowerCase()}. Setelah diklik, masuk lewat halaman login.`}
        footer={
          <>
            Sudah konfirmasi? <AuthLink href="/login">Masuk</AuthLink>
          </>
        }
      >
        <Link
          href="/login"
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-accent px-10 py-3.5 text-[17px] font-bold lowercase text-white"
        >
          ke login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="buat akun"
      subtitle="Daftar dulu, baru isi profil komunitas."
      footer={
        <>
          Sudah punya akun? <AuthLink href="/login">Masuk</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthErrorBanner message={error} />
        <AuthField
          label="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="kamu@email.com"
          autoComplete="email"
          autoFocus
        />
        <AuthField
          label="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={`minimal ${MIN_PASSWORD_LENGTH} karakter`}
          autoComplete="new-password"
        />
        <AuthField
          label="konfirmasi password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="ulangi password"
          autoComplete="new-password"
        />
        <AuthButton
          loading={loading}
          disabled={!email.trim() || !password || !confirmPassword}
        >
          daftar
        </AuthButton>
      </form>
    </AuthShell>
  );
}
